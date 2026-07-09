import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Mic, Upload, Square, ArrowLeft, Volume2, AlertCircle, RotateCcw, ArrowRight, Lightbulb, Check } from "lucide-react";
import { toast } from "sonner";
import { SpeechMetrics } from "./SpeechMetrics";
import { AnalyzingOverlay } from "./AnalyzingOverlay";
import { AudioPlayer } from "./AudioPlayer";
import { analyzeAudio } from "../lib/speechiqService";
import type { AnalysisResult } from "../lib/analysisResult";

interface PracticeSessionProps {
  onNavigate: (page: string) => void;
  onBack: () => void;
  prompt?: string;
  promptLabel?: string;
}

const CANDIDATE_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg",
];

const RECORDING_SAMPLE_INTERVAL_MS = 80;
const IDEAL_MIN_SECONDS = 30;
const IDEAL_MAX_SECONDS = 60;
const DURATION_BAR_CAP_SECONDS = 90;

const cardClass = "bg-white border border-[#EAEAEF] rounded-[18px]";

function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return undefined;
  return CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

function extensionForMimeType(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "m4a";
  return "webm";
}

export function PracticeSession({ onNavigate, onBack, prompt, promptLabel }: PracticeSessionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [recordingWaveform, setRecordingWaveform] = useState<number[]>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const liveAudioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const playbackSource = uploadedFile ?? recordedBlob;

  const prompts = [
    "Describe your favorite childhood memory in detail.",
    "Explain a complex topic you're passionate about.",
    "Tell a story about a time you overcame a challenge.",
    "Describe your ideal day from start to finish.",
  ];

  const [currentPrompt] = useState(prompt ?? prompts[Math.floor(Math.random() * prompts.length)]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const stopLiveVisualizer = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    analyserRef.current = null;
    liveAudioContextRef.current?.close().catch(() => {});
    liveAudioContextRef.current = null;
  };

  // Samples one peak-amplitude value roughly every RECORDING_SAMPLE_INTERVAL_MS and
  // appends it to a growing array — this is what makes the waveform genuinely
  // scroll as the recording goes on (rendered right-aligned inside an
  // overflow-hidden strip, so new bars appear on the right and old ones are
  // clipped off the left automatically, no manual scroll math needed).
  const startLiveVisualizer = (stream: MediaStream) => {
    const AudioContextCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const ctx = new AudioContextCtor();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    liveAudioContextRef.current = ctx;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.fftSize);
    let lastSampleTime = 0;
    const draw = (now: number) => {
      if (now - lastSampleTime >= RECORDING_SAMPLE_INTERVAL_MS) {
        lastSampleTime = now;
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
          const deviation = Math.abs(data[i] - 128) / 128;
          if (deviation > peak) peak = deviation;
        }
        setRecordingWaveform((prev) => [...prev, peak]);
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    return () => {
      stopLiveVisualizer();
      mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    setError(null);
    setRecordingWaveform([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = pickSupportedMimeType();
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
        setRecordedBlob(blob);
        setUploadedFile(null);
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      };

      mediaRecorder.start();
      startLiveVisualizer(stream);
      setIsRecording(true);
      setRecordingTime(0);
      toast.success("Recording started!");
    } catch (error) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    stopLiveVisualizer();
    setIsRecording(false);
    setHasRecording(true);
    toast.success("Recording saved!");
  };

  const applyUploadedFile = (file: File) => {
    setUploadedFile(file);
    setRecordedBlob(null);
    setHasRecording(true);
    setError(null);
    toast.success("Audio file uploaded!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyUploadedFile(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyUploadedFile(file);
  };

  const analyzeRecording = async () => {
    const source = uploadedFile ?? recordedBlob;
    if (!source) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const filename = uploadedFile
        ? uploadedFile.name
        : `recording.${extensionForMimeType(recordedBlob!.type)}`;
      const result = await analyzeAudio(source, filename);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      setShowMetrics(true);
      toast.success("Analysis complete! +50 XP");
    } catch (err) {
      setIsAnalyzing(false);
      setError(`Analysis failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const resetSession = () => {
    setShowMetrics(false);
    setHasRecording(false);
    setRecordingTime(0);
    setAnalysisResult(null);
    setRecordedBlob(null);
    setUploadedFile(null);
    setError(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const recordingWaveformMax = Math.max(...recordingWaveform, 1e-6);
  const durationBarWidth = Math.min(100, (recordingTime / DURATION_BAR_CAP_SECONDS) * 100);
  const durationLabel =
    recordingTime < IDEAL_MIN_SECONDS
      ? `Building up… aim for ${IDEAL_MIN_SECONDS}-${IDEAL_MAX_SECONDS}s`
      : recordingTime <= IDEAL_MAX_SECONDS
      ? "Great length — nice and clear"
      : "Consider wrapping up soon";
  const durationBarColor =
    recordingTime < IDEAL_MIN_SECONDS ? "#9333EA" : recordingTime <= IDEAL_MAX_SECONDS ? "#16A34A" : "#F59E0B";

  if (showMetrics && analysisResult) {
    return (
      <SpeechMetrics
        analysis={analysisResult}
        audioSource={playbackSource}
        onBack={() => onNavigate("home")}
        onRetry={resetSession}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-[#17161B] tracking-[-0.01em]"
    >
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[#71707B] hover:text-[#17161B] transition-colors text-sm font-medium py-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to practice modes
      </button>

      {/* Practice prompt */}
      <div className="flex gap-4 items-start bg-[#FAF8FE] border border-[#EBE3FB] rounded-2xl px-6 py-[22px] mt-3">
        <div
          className="w-11 h-11 rounded-xl text-white flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#A855F7,#3B82F6)" }}
        >
          <Volume2 className="w-[21px] h-[21px]" />
        </div>
        <div>
          <div className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#9333EA]">
            {promptLabel ?? "Your practice prompt"}
          </div>
          <div className="text-[17px] leading-[1.5] font-medium mt-1.5">{currentPrompt}</div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Recorder */}
      <div className={`${cardClass} px-7 py-[34px] mt-4`}>
        <h3 className="text-base font-semibold text-center">Record your speech</h3>

        {isRecording && (
          <div className="mt-[26px] flex flex-col items-center gap-[22px]">
            <div className="inline-flex items-center gap-2.5 bg-[#FEECEF] border border-[#FAD1DA] rounded-full px-4 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
              <span className="text-[17px] font-semibold text-[#BE123C] font-['Geist_Mono',monospace]">
                {formatTime(recordingTime)}
              </span>
            </div>

            {/* Live audio-reactive waveform — scrolls right-to-left as the recording
                grows, normalized against the loudest moment so far. */}
            <div className="w-full h-[76px] overflow-hidden">
              <div className="flex items-center justify-end gap-[3px] h-full">
                {recordingWaveform.map((level, i) => (
                  <div
                    key={i}
                    className="w-[5px] rounded-[3px] shrink-0"
                    style={{
                      height: `${Math.max(8, (level / recordingWaveformMax) * 100)}%`,
                      background: "linear-gradient(to top,#9333EA,#EF4444)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="w-full max-w-[340px]">
              <div className="h-1.5 bg-[#F3F3F7] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{ width: `${durationBarWidth}%`, background: durationBarColor }}
                />
              </div>
              <p className="text-center text-xs font-medium text-[#71707B] mt-2.5">{durationLabel}</p>
            </div>

            <div className="relative w-32 h-32">
              <motion.div
                className="absolute inset-0 rounded-full bg-[#FBA5B8]"
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-[#FBA5B8]"
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
              />
              <button
                onClick={stopRecording}
                className="relative w-32 h-32 rounded-full text-white flex items-center justify-center transition-transform hover:scale-[1.06] active:scale-[0.96]"
                style={{ background: "linear-gradient(135deg,#F43F5E,#BE123C)", boxShadow: "0 16px 34px -10px rgba(190,18,60,0.5)" }}
              >
                <Square className="w-[52px] h-[52px]" fill="currentColor" />
              </button>
            </div>
            <div className="text-sm text-[#71707B]">Tap to stop</div>
          </div>
        )}

        {!isRecording && !hasRecording && (
          <div className="mt-[26px] flex flex-col items-center gap-[22px]">
            <button
              onClick={startRecording}
              className="w-32 h-32 rounded-full text-white flex items-center justify-center transition-transform hover:scale-[1.06] active:scale-[0.96]"
              style={{ background: "linear-gradient(135deg,#9333EA,#2563EB)", boxShadow: "0 16px 34px -10px rgba(80,50,220,0.55)" }}
            >
              <Mic className="w-[52px] h-[52px]" />
            </button>
            <div className="text-sm text-[#71707B]">Tap to start recording</div>

            <div className="flex items-center gap-3.5 w-full max-w-[320px]">
              <div className="h-px bg-[#EAEAEF] flex-1" />
              <span className="text-[13px] text-[#A6A5B0]">or</span>
              <div className="h-px bg-[#EAEAEF] flex-1" />
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full max-w-[360px] border-[1.5px] border-dashed rounded-[14px] p-6 text-center cursor-pointer transition-colors ${
                isDraggingFile ? "border-[#C9BCEF] bg-[#FBFAFE]" : "border-[#EAEAEF] hover:border-[#C9BCEF] hover:bg-[#FBFAFE]"
              } ${isAnalyzing ? "opacity-50 pointer-events-none" : ""}`}
            >
              <Upload className="w-6 h-6 mx-auto mb-2.5 text-[#A6A5B0]" />
              <p className="text-[13.5px] font-medium text-[#3B3A44]">Drag &amp; drop an audio file</p>
              <p className="text-xs text-[#A6A5B0] mt-[3px]">or click to browse</p>
            </div>
            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          </div>
        )}

        {hasRecording && !isRecording && (
          <div className="mt-4 w-full space-y-4">
            <AudioPlayer source={playbackSource} />

            <div className="flex gap-3.5">
              <button
                onClick={() => {
                  setHasRecording(false);
                  setRecordingTime(0);
                  setRecordedBlob(null);
                  setUploadedFile(null);
                  setError(null);
                }}
                disabled={isAnalyzing}
                className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-xl py-[13px] border border-[#EAEAEF] bg-white text-[#3B3A44] transition-colors hover:border-[#D6D6DE] hover:bg-[#FCFCFD] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" /> Record again
              </button>
              <button
                onClick={analyzeRecording}
                disabled={isAnalyzing}
                className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-xl py-[13px] text-white transition-[filter] hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#9333EA,#2563EB)" }}
              >
                {isAnalyzing ? "Analyzing…" : "Analyze speech"}
                {!isAnalyzing && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className={`${cardClass} px-6 py-6 mt-4`}>
        <div className="flex items-center gap-2 text-[15px] font-semibold">
          <Lightbulb className="w-[18px] h-[18px] text-[#9333EA]" /> Pro tips
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mt-4">
          {[
            "Speak clearly and at a natural pace",
            "Find a quiet environment for best results",
            "Aim for 30–60 seconds of speech",
            "Practice regularly to improve your metrics",
          ].map((tip) => (
            <div key={tip} className="flex gap-2.5 items-start text-[13.5px] leading-[1.5] text-[#3B3A44]">
              <Check className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" /> {tip}
            </div>
          ))}
        </div>
      </div>

      {isAnalyzing && <AnalyzingOverlay />}
    </motion.div>
  );
}

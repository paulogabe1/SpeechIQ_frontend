import { useState } from "react";
import { ArrowLeft, Mic, Play, Download, Sparkles, Upload, Check, Lightbulb, Presentation, Volume2, GraduationCap, FileAudio, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface VoiceSynthesisProps {
  onNavigate: (page: string) => void;
}

const cardClass = "bg-white border border-[#EAEAEF] rounded-[18px]";

const NEEDS = [
  "5–10 minutes of clear audio recordings",
  "A quiet environment with minimal background noise",
  "Consistent speaking pace and tone",
  "Various sentence structures and words",
];

const USE_CASES = [
  { icon: Presentation, text: "Rehearse important presentations before delivering them" },
  { icon: Volume2, text: "Hear how your speech sounds with perfect fluency" },
  { icon: GraduationCap, text: "Generate example speeches to analyze and learn from" },
  { icon: FileAudio, text: "Create audio versions of your written content" },
];

export function VoiceSynthesis({ onNavigate }: VoiceSynthesisProps) {
  const [hasVoiceModel, setHasVoiceModel] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [synthesisText, setSynthesisText] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [hasSynthesizedAudio, setHasSynthesizedAudio] = useState(false);

  const trainVoiceModel = () => {
    setIsTraining(true);
    toast.success("Training voice model...");
    setTimeout(() => {
      setIsTraining(false);
      setHasVoiceModel(true);
      toast.success("Voice model ready!");
    }, 3000);
  };

  const synthesizeSpeech = () => {
    if (!synthesisText.trim()) {
      toast.error("Please enter some text first");
      return;
    }
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      setHasSynthesizedAudio(true);
      toast.success("Speech synthesized!");
    }, 2000);
  };

  const waveBars = Array.from({ length: 40 }, (_, i) => 14 + Math.abs(Math.sin(i * 0.5) + Math.sin(i * 0.23)) * 46);

  return (
    <div className="text-[#17161B] tracking-[-0.01em]">
      <button
        onClick={() => onNavigate("home")}
        className="inline-flex items-center gap-2 text-[#71707B] hover:text-[#17161B] transition-colors text-sm font-medium py-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div
        className="flex gap-4 items-start relative overflow-hidden rounded-[18px] px-7 py-[26px] text-white my-4"
        style={{ background: "linear-gradient(135deg,#059669 0%,#0D9488 100%)", boxShadow: "0 14px 32px -12px rgba(5,120,90,0.5)" }}
      >
        <div className="w-12 h-12 rounded-[13px] bg-white/[0.18] flex items-center justify-center shrink-0 relative z-10">
          <Sparkles className="w-[23px] h-[23px]" />
        </div>
        <div className="relative z-10">
          <div className="text-[21px] font-semibold tracking-[-0.02em]">Voice Synthesis Lab</div>
          <div className="text-[13.5px] leading-relaxed text-white/[0.88] mt-1.5 max-w-lg">
            Create a digital clone of your voice to rehearse speeches and presentations.
          </div>
        </div>
      </div>

      {!hasVoiceModel ? (
        <div className={`${cardClass} px-7 py-9 text-center`}>
          <div
            className="w-[92px] h-[92px] rounded-full flex items-center justify-center mx-auto mb-[22px]"
            style={{ background: "linear-gradient(135deg,#059669,#0D9488)", boxShadow: "0 14px 30px -10px rgba(5,120,90,0.5)" }}
          >
            <Mic className="w-[42px] h-[42px] text-white" />
          </div>
          <div className="text-[21px] font-semibold tracking-[-0.02em]">Train your voice model</div>
          <p className="text-sm text-[#71707B] leading-[1.55] max-w-[420px] mx-auto mt-2.5 mb-[26px]">
            Record 5–10 minutes of your voice reading various texts to create a personalized voice model.
          </p>

          <div className="max-w-[440px] mx-auto text-left bg-[#ECFAF3] border border-[#CDEEDD] rounded-[14px] px-5 py-[18px]">
            <div className="text-[13px] font-semibold text-[#0A6B4E] mb-3">What you'll need</div>
            {NEEDS.map((item) => (
              <div key={item} className="flex items-start gap-[9px] text-[13.5px] text-[#0F7355] leading-relaxed py-1">
                <Check className="w-[15px] h-[15px] mt-0.5 shrink-0" /> {item}
              </div>
            ))}
          </div>

          <button
            onClick={trainVoiceModel}
            disabled={isTraining}
            className="max-w-[440px] mx-auto mt-5 flex items-center justify-center gap-[9px] w-full text-[15px] font-semibold rounded-[13px] py-[15px] text-white transition-[filter] hover:brightness-105 disabled:opacity-70 disabled:cursor-default"
            style={{ background: "linear-gradient(135deg,#059669,#0D8A6E)" }}
          >
            {isTraining ? (
              <>
                <span className="w-[18px] h-[18px] border-2 border-white/40 border-t-white rounded-full animate-spin" /> Training model…
              </>
            ) : (
              <>
                <Upload className="w-[18px] h-[18px]" /> Upload training audio
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`${cardClass} px-[26px] py-6`}>
            <div className="flex items-center gap-2.5 mb-[18px]">
              <span className="w-[9px] h-[9px] rounded-full bg-[#059669]" style={{ boxShadow: "0 0 0 4px rgba(5,150,105,0.16)" }} />
              <span className="text-sm font-semibold text-[#047857]">Voice model active</span>
            </div>
            <label className="block text-[13.5px] font-semibold mb-2.5">Enter text to synthesize</label>
            <textarea
              value={synthesisText}
              onChange={(e) => setSynthesisText(e.target.value)}
              placeholder="Type or paste your speech here. The AI will generate it in your voice…"
              className="w-full h-[150px] p-4 border-[1.5px] border-[#EAEAEF] rounded-[13px] font-[inherit] text-[14.5px] leading-relaxed resize-none outline-none transition-colors focus:border-[#059669] placeholder:text-[#A6A5B0]"
            />
            <button
              onClick={synthesizeSpeech}
              disabled={isSynthesizing || !synthesisText.trim()}
              className="mt-4 flex items-center justify-center gap-[9px] w-full text-[15px] font-semibold rounded-[13px] py-[15px] text-white transition-[filter] hover:brightness-105 disabled:opacity-70 disabled:cursor-default"
              style={{ background: "linear-gradient(135deg,#059669,#0D8A6E)" }}
            >
              {isSynthesizing ? (
                <>
                  <span className="w-[18px] h-[18px] border-2 border-white/40 border-t-white rounded-full animate-spin" /> Synthesizing…
                </>
              ) : (
                <>
                  <Sparkles className="w-[18px] h-[18px]" /> Generate speech
                </>
              )}
            </button>
          </div>

          {hasSynthesizedAudio && (
            <div className={`${cardClass} px-[26px] py-6`}>
              <div className="text-[15px] font-semibold mb-4">Synthesized speech</div>
              <div className="flex items-center gap-4 bg-[#ECFAF3] border border-[#CDEEDD] rounded-[14px] px-5 py-[18px]">
                <button className="w-12 h-12 rounded-full bg-[#059669] hover:bg-[#047857] text-white flex items-center justify-center shrink-0 transition-colors">
                  <Play className="w-5 h-5" />
                </button>
                <div className="flex-1 flex items-center gap-[2px] h-11">
                  {waveBars.map((h, i) => (
                    <div key={i} className="flex-1 min-w-[2px] rounded-sm bg-[#7FCBAC]" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <span className="text-[13px] font-semibold text-[#047857] min-w-[34px] text-right">0:07</span>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => toast.success("Downloaded!")}
                  className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-xl py-[13px] border border-[#EAEAEF] bg-white text-[#3B3A44] transition-colors hover:border-[#B7E0CD] hover:bg-[#FAFDFC]"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <button
                  onClick={() => {
                    setHasSynthesizedAudio(false);
                    setSynthesisText("");
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-xl py-[13px] text-white bg-[#059669] hover:bg-[#047857] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Generate new
                </button>
              </div>
            </div>
          )}

          <div className={`${cardClass} px-[26px] py-6`}>
            <div className="flex items-center gap-2 text-[15px] font-semibold">
              <Lightbulb className="w-[18px] h-[18px] text-[#059669]" /> Use cases
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mt-4">
              {USE_CASES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex gap-2.5 items-start text-[13.5px] leading-relaxed text-[#3B3A44]">
                  <Icon className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

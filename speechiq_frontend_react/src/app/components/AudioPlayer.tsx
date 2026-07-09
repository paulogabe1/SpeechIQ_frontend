import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { WaveformSeeker } from "./WaveformSeeker";
import { useAudioWaveform } from "../lib/useAudioWaveform";

interface AudioPlayerProps {
  source: Blob | File | null | undefined;
  className?: string;
  /** Restrict playback/scrubbing to a real [start, end] window (seconds) of the
   *  full clip — used for "replay this moment" penalty mini-players. Playback
   *  auto-pauses once it reaches the window's end instead of continuing on. */
  timeWindow?: { start: number; end: number };
  /** Highlight ranges as 0-1 fractions of the FULL clip's duration (e.g. silence
   *  regions) — rendered in red regardless of played/unplayed position. Automatically
   *  re-mapped into the visible window's own coordinate space when windowed. */
  highlights?: Array<{ start: number; end: number }>;
  /** Smaller footprint for inline/nested usage (e.g. one per penalty). */
  compact?: boolean;
}

function formatTime(seconds: number) {
  const s = Number.isFinite(seconds) ? seconds : 0;
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** Play/pause + iOS Voice Memos-style waveform scrubber. Shared by every audio
 *  surface in the app (post-recording playback, the analysis page's speech
 *  player, and the per-penalty "replay this moment" mini-players) so there's
 *  exactly one playable-waveform implementation, not several static pictures. */
export function AudioPlayer({ source, className = "", timeWindow, highlights, compact = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [elementDuration, setElementDuration] = useState(0);

  const { duration: decodedDuration, samples } = useAudioWaveform(source);
  const fullDuration = decodedDuration || elementDuration;

  const url = useMemo(() => (source ? URL.createObjectURL(source) : null), [source]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setElementDuration(0);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  const winStart = timeWindow?.start ?? 0;
  const winEnd = timeWindow ? timeWindow.end : fullDuration;
  const winDuration = Math.max(0.001, winEnd - winStart);

  // Slice the full-clip samples/highlights down to just the visible window, in
  // the window's own local 0-1 coordinate space — WaveformSeeker itself doesn't
  // need to know windowing exists, it just sees a shorter "whole clip".
  const { visibleSamples, visibleHighlights } = useMemo(() => {
    if (!timeWindow || fullDuration <= 0 || samples.length === 0) {
      return { visibleSamples: samples, visibleHighlights: highlights ?? [] };
    }
    const startIdx = Math.max(0, Math.floor((winStart / fullDuration) * samples.length));
    const endIdx = Math.min(samples.length - 1, Math.ceil((winEnd / fullDuration) * samples.length));
    const sliced = samples.slice(startIdx, endIdx + 1);
    const local = (highlights ?? [])
      .map((h) => ({
        start: (h.start * fullDuration - winStart) / winDuration,
        end: (h.end * fullDuration - winStart) / winDuration,
      }))
      .filter((h) => h.end > 0 && h.start < 1)
      .map((h) => ({ start: Math.max(0, h.start), end: Math.min(1, h.end) }));
    return { visibleSamples: sliced, visibleHighlights: local };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeWindow, fullDuration, samples, highlights, winStart, winEnd, winDuration]);

  const localCurrentTime = timeWindow ? Math.min(winDuration, Math.max(0, currentTime - winStart)) : currentTime;

  // The <audio> element's native `timeupdate` event only fires a handful of
  // times per second (browsers throttle it) — driving the waveform position
  // purely off that event made the strip visibly stutter (move, pause, snap)
  // instead of tracking smoothly. Polling the real currentTime every animation
  // frame while playing gives frame-accurate motion instead.
  useEffect(() => {
    if (!isPlaying) return;
    let rafId: number;
    const tick = () => {
      const audio = audioRef.current;
      if (audio) {
        setCurrentTime(audio.currentTime);
        if (timeWindow && audio.currentTime >= winEnd) {
          audio.pause();
          setIsPlaying(false);
          return;
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, timeWindow, winEnd]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (timeWindow && (audio.currentTime < winStart - 0.05 || audio.currentTime >= winEnd)) {
        audio.currentTime = winStart;
      }
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const seek = (localTime: number) => {
    const absolute = timeWindow ? winStart + localTime : localTime;
    if (audioRef.current) audioRef.current.currentTime = absolute;
    setCurrentTime(absolute);
  };

  if (!url) return null;

  return (
    <div
      className={`${compact ? "p-3" : "p-6"} bg-green-50 rounded-xl border-2 border-green-200 space-y-2 ${className}`}
    >
      <audio
        ref={audioRef}
        src={url}
        onLoadedMetadata={(e) => {
          if (Number.isFinite(e.currentTarget.duration)) setElementDuration(e.currentTarget.duration);
        }}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          setCurrentTime(t);
          if (timeWindow && t >= winEnd) {
            e.currentTarget.pause();
            setIsPlaying(false);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(timeWindow ? winStart : 0);
        }}
        className="hidden"
      />

      <WaveformSeeker
        samples={visibleSamples}
        currentTime={localCurrentTime}
        duration={winDuration}
        onSeek={seek}
        highlights={visibleHighlights}
        height={compact ? 40 : 64}
        zoomable={!compact}
      />

      <div className="flex items-center gap-3">
        <button onClick={togglePlayback} className="text-green-600 hover:text-green-700 shrink-0">
          {isPlaying ? <Pause className={compact ? "w-5 h-5" : "w-6 h-6"} /> : <Play className={compact ? "w-5 h-5" : "w-6 h-6"} />}
        </button>
        <span className={`text-green-700 font-medium ${compact ? "text-xs" : "text-sm"}`}>
          {formatTime(localCurrentTime)} / {formatTime(winDuration)}
        </span>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

interface WaveformSeekerProps {
  /** Raw (high-resolution) peak-amplitude samples spanning the whole visible
   *  range — WaveformSeeker itself decimates these down for display, so callers
   *  should pass as much real resolution as they have, not a pre-thinned array. */
  samples: number[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  /** 0-1 fractions of THIS seeker's own visible range — rendered in red regardless
   *  of played/unplayed position (e.g. silence regions, a flagged pause). */
  highlights?: Array<{ start: number; end: number }>;
  height?: number;
  /** Show zoom controls (slider + scroll-wheel). Off by default for
   *  compact/windowed usage (e.g. penalty mini-players), which are already a
   *  zoomed-in view of just a few seconds. */
  zoomable?: boolean;
}

const BAR_WIDTH = 3;
const BAR_GAP = 2;
const STEP = BAR_WIDTH + BAR_GAP; // constant — zoom changes bar COUNT, not spacing
const BASE_BAR_COUNT = 250; // displayed bars at 1x zoom
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const WHEEL_ZOOM_SENSITIVITY = 0.0025;

/** Combines raw samples into `targetCount` bars by taking the peak within each
 *  bucket (standard waveform decimation — preserves transients better than
 *  averaging). Returns the input unchanged once targetCount reaches its length,
 *  i.e. at high enough zoom you're looking at the real, undecimated data. */
function decimate(rawSamples: number[], targetCount: number): number[] {
  if (targetCount >= rawSamples.length) return rawSamples;
  const bucketSize = rawSamples.length / targetCount;
  const result = new Array(targetCount);
  for (let i = 0; i < targetCount; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.floor((i + 1) * bucketSize);
    let peak = 0;
    for (let j = start; j < end && j < rawSamples.length; j++) {
      if (rawSamples[j] > peak) peak = rawSamples[j];
    }
    result[i] = peak;
  }
  return result;
}

/**
 * iOS Voice Memos-style scrubber: the waveform strip slides horizontally under a
 * fixed, centered playhead (rather than a moving playhead over a static track).
 * Dragging grabs the strip directly — there's no meaningful "tap here" position
 * since the timeline under the playhead is what's being manipulated, not a fixed
 * track position.
 *
 * Zoom is a multi-resolution ("mipmap") scheme rather than just spacing bars
 * further apart: the caller hands over high-resolution raw samples, and this
 * component decimates them down to ~250 bars at 1x zoom (combining several raw
 * samples' peak into each bar) and progressively fewer raw samples per bar as
 * zoom increases, until at max zoom you're looking at the undecimated real data.
 * That's what makes zooming in reveal genuine extra detail instead of an illusion
 * of it — bar spacing (STEP) itself never changes, only how many bars there are.
 */
export function WaveformSeeker({
  samples,
  currentTime,
  duration,
  onSeek,
  highlights = [],
  height = 64,
  zoomable = true,
}: WaveformSeekerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);

  const dragStartXRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const lastTickIndexRef = useRef<number | null>(null);
  const tickCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setContainerWidth(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      tickCtxRef.current?.close().catch(() => {});
    };
  }, []);

  // A new clip loaded (duration changed) — start back at the overview zoom level.
  useEffect(() => {
    setZoom(1);
  }, [duration]);

  // Scroll to zoom (no modifier key needed — this element doesn't otherwise
  // scroll, so it's safe to claim the wheel entirely). Attached as a native
  // (non-passive) listener because React 17+ registers onWheel as passive by
  // default, which silently no-ops preventDefault and lets the page scroll instead.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !zoomable) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * WHEEL_ZOOM_SENSITIVITY);
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * factor)));
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomable]);

  const targetBarCount = Math.min(samples.length, Math.round(BASE_BAR_COUNT * zoom));
  const displayedSamples = useMemo(() => decimate(samples, targetBarCount), [samples, targetBarCount]);

  const safeDuration = duration || 1;
  const totalStripWidth = Math.max(1, displayedSamples.length * STEP);
  const playheadX = containerWidth / 2;
  const progress = Math.min(1, Math.max(0, currentTime / safeDuration));
  const currentSampleIndex = progress * displayedSamples.length;
  const translateX = playheadX - currentSampleIndex * STEP;

  const ensureTickCtx = () => {
    if (!tickCtxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) tickCtxRef.current = new Ctor();
    }
    return tickCtxRef.current;
  };

  // A short synthesized click, mimicking the haptic "detent" feel of a physical
  // scrub wheel — one tick per waveform unit crossed while dragging.
  const playTick = () => {
    const ctx = ensureTickCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 1200;
    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);
    osc.connect(gainNode).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (displayedSamples.length === 0 || !duration) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartTimeRef.current = currentTime;
    lastTickIndexRef.current = Math.floor(currentSampleIndex);
    ensureTickCtx();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const deltaTime = -deltaX * (safeDuration / totalStripWidth);
    const newTime = Math.min(safeDuration, Math.max(0, dragStartTimeRef.current + deltaTime));
    onSeek(newTime);

    const newIndex = Math.floor((newTime / safeDuration) * displayedSamples.length);
    if (lastTickIndexRef.current === null || newIndex !== lastTickIndexRef.current) {
      playTick();
      lastTickIndexRef.current = newIndex;
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full">
      {zoomable && (
        <div className="flex items-center gap-2 mb-1.5 px-0.5">
          <ZoomOut className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-purple-600 h-1 cursor-pointer"
          />
          <ZoomIn className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-[10px] font-bold text-gray-400 w-7 text-right shrink-0">{zoom.toFixed(1)}x</span>
        </div>
      )}

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
        style={{ height: `${height}px` }}
      >
        <div
          className="absolute top-0 left-0 h-full flex items-center"
          style={{
            gap: `${BAR_GAP}px`,
            transform: `translateX(${translateX}px)`,
            // No CSS transition at all — AudioPlayer now drives currentTime via a
            // requestAnimationFrame loop during playback (not the sparse native
            // timeupdate event), so position updates arrive every frame already.
            // A transition on top of that would just add lag/floatiness; it used
            // to exist to paper over timeupdate's low update rate, which was
            // actually the cause of a visible stutter, not a fix for it.
          }}
        >
          {displayedSamples.map((level, i) => {
            const pos = i / displayedSamples.length;
            const isHighlighted = highlights.some((h) => pos >= h.start && pos <= h.end);
            return (
              <div
                key={i}
                className={`rounded-full shrink-0 ${
                  isHighlighted
                    ? i <= currentSampleIndex ? "bg-red-600" : "bg-red-200"
                    : i <= currentSampleIndex ? "bg-green-600" : "bg-green-200"
                }`}
                style={{ width: `${BAR_WIDTH}px`, height: `${Math.max(10, level * 100)}%` }}
              />
            );
          })}
        </div>

        {/* Fixed playhead */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-red-500 pointer-events-none"
          style={{ left: playheadX }}
        >
          <div className="absolute -top-0.5 -left-[3px] w-2 h-2 rounded-full bg-red-500" />
        </div>
      </div>
    </div>
  );
}

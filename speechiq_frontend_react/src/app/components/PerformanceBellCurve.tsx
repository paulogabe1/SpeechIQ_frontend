import { useEffect, useMemo, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { calculatePercentile } from "../lib/idealRangeScore";
import { scoreColor } from "../lib/scoreDisplay";

interface PerformanceBellCurveProps {
  currentScore: number;
  potentialScore: number;
  metricName?: string;
}

// Raw decimal precision computed internally, then rounded to 3 significant
// figures for display (formatPercentile below) — enough underlying precision
// that the sig-fig rounding has real digits to work with.
const PERCENTILE_DECIMALS = 6;
const PERCENTILE_SIG_FIGS = 3;

/** 3 significant figures (e.g. 4.77, 80.7, 19.3) rather than a fixed decimal
 *  count — a percentile near 0 keeps its precision, one near 100 doesn't
 *  carry pointless trailing digits. */
function formatPercentile(value: number): string {
  return value.toPrecision(PERCENTILE_SIG_FIGS);
}

const Y_AXIS_MAX = 50;
const CARD_WIDTH = 210; // widened from 168 to fit "Top 12.34567%" without wrapping
const CARD_HEIGHT = 30;
const CARD_GAP = 6;
const CARD_ROW_GAP = 6;
// Two card rows are reserved above the plot: both cards normally sit on the
// lower row (hugging the plot), and when their clamped positions would collide
// horizontally the POTENTIAL card lifts to the upper row instead.
const CARD_ROW_TOP = 4;
const CARD_ROW_BOTTOM = CARD_ROW_TOP + CARD_HEIGHT + CARD_ROW_GAP;
const CHART_MARGIN = { top: CARD_ROW_BOTTOM + CARD_HEIGHT + 8, right: 24, left: 8, bottom: 20 };
const CHART_HEIGHT = CHART_MARGIN.top + 180 + CHART_MARGIN.bottom;
const Y_AXIS_WIDTH = 32;
// Recharts reserves this strip for the x-axis line + tick labels INSIDE the
// chart area (above the bottom margin) — the plot itself ends at its top, so
// the overlay's vertical lines must stop there too, not at the margin.
const X_AXIS_HEIGHT = 30;

// "Potential" is always this one purple, distinct from the current score's
// real green/amber/orange/red — matches the brand's own lighter secondary
// shade (the same one used for gradient starts/ghost-bars elsewhere) darkened
// one step for legible text on a white marker card.
const POTENTIAL_COLOR = "#7E22CE";
const AXIS_TICK_STYLE = { fontSize: 11, fill: "#A6A5B0", fontFamily: "Geist, Inter, system-ui, sans-serif" };
const MONO_FONT = "'Geist Mono', 'SF Mono', monospace";

/** Final on-screen card x for a marker: centered on its vertical line, clamped
 *  so a score near either end of the axis can't push the card off the chart.
 *  Used both for rendering and for the parent's overlap detection, so the
 *  collision test sees exactly what will be drawn. */
function computeCardX(pixelX: number, containerWidth: number): number {
  const raw = pixelX - CARD_WIDTH / 2;
  return Math.max(0, Math.min(containerWidth - CARD_WIDTH, raw));
}

/**
 * Floating card + vertical line anchored to a score, positioned via plain
 * CSS left/transition rather than Recharts' ReferenceLine.
 *
 * Recharts' ReferenceLine reads its axis/clip-path from React context that's
 * registered by the chart on mount — re-rendering that context's consumer at
 * animation speed (~20-60x/second, from a tween) intermittently raced ahead of
 * the chart's own settling and made the line/label vanish for most of the
 * animation (confirmed via direct DOM inspection: 0 rendered nodes mid-tween
 * despite provably correct, in-range x values every frame — memoizing the
 * chart's data array and even throttling the tween rate didn't fix it). A
 * plain HTML overlay with a CSS transition sidesteps Recharts entirely for
 * the part that actually needs to animate, and gets a smoother, GPU-driven
 * transition for free instead of hand-rolled per-frame state updates.
 */
function ScoreMarker(props: {
  pixelX: number | null;
  cardX: number | null;
  cardY: number;
  topPx: number;
  bottomPx: number;
  label: string;
  score: number;
  percentile: number;
  color: string;
  dashed?: boolean;
}) {
  const { pixelX, cardX, cardY, topPx, bottomPx, label, score, percentile, color, dashed } = props;
  if (pixelX === null || cardX === null) return null;

  return (
    <>
      <div
        className="absolute w-0.5 transition-[left] duration-500 ease-out"
        style={{
          left: pixelX,
          top: topPx,
          height: bottomPx - topPx,
          backgroundColor: dashed ? undefined : color,
          backgroundImage: dashed
            ? `repeating-linear-gradient(to bottom, ${color} 0, ${color} 6px, transparent 6px, transparent 12px)`
            : undefined,
        }}
      />
      <div
        className="absolute bg-white border-2 rounded-full shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap transition-[left,top] duration-500 ease-out font-['Geist','Inter',system-ui,sans-serif]"
        style={{ left: cardX, top: cardY, width: CARD_WIDTH, height: CARD_HEIGHT, borderColor: color }}
      >
        <span className="text-[9px] font-medium text-[#A6A5B0] uppercase tracking-[0.04em]">{label}</span>
        <span className="font-semibold text-[13px]" style={{ color, fontFamily: MONO_FONT }}>
          {score.toFixed(1)}
        </span>
        <span className="text-[10px] text-[#A6A5B0]" style={{ fontFamily: MONO_FONT }}>
          Top {formatPercentile(100 - percentile)}%
        </span>
      </div>
    </>
  );
}

export function PerformanceBellCurve({ currentScore, potentialScore, metricName }: PerformanceBellCurveProps) {
  // Generate bell curve data (0-100 scale). This is an assumed population
  // distribution for context/percentile only — scores are monotonic (higher is
  // always better), so unlike a raw metric's bell curve there's no symmetric
  // "ideal range" or /10 score here, just where you land relative to others.
  const mean = 50;
  const stdDev = 15;

  const data = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i) => {
        const x = i;
        const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
        return { x, y: Y_AXIS_MAX * Math.exp(exponent) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const currentPercentile = calculatePercentile(currentScore, mean, stdDev, PERCENTILE_DECIMALS);
  const potentialPercentile = calculatePercentile(potentialScore, mean, stdDev, PERCENTILE_DECIMALS);

  const currentColor = scoreColor(currentScore);
  const potentialColor = POTENTIAL_COLOR;

  // Track the chart's actual rendered width so the overlay's pixel math always
  // matches Recharts' own layout, whatever the container is resized to.
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setContainerWidth(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const plotLeft = CHART_MARGIN.left + Y_AXIS_WIDTH;
  const plotRight = containerWidth - CHART_MARGIN.right;
  const plotWidth = Math.max(0, plotRight - plotLeft);
  const scoreToPixel = (score: number) => (containerWidth > 0 ? plotLeft + (score / 100) * plotWidth : null);

  const currentPixelX = scoreToPixel(currentScore);
  const potentialPixelX = scoreToPixel(potentialScore);
  const currentCardX = currentPixelX !== null ? computeCardX(currentPixelX, containerWidth) : null;
  const potentialCardX = potentialPixelX !== null ? computeCardX(potentialPixelX, containerWidth) : null;

  // Cards are centered on their own lines, so they collide whenever the two
  // scores are within about a card's width of each other (or bunched at an
  // axis edge by clamping). When that happens, POTENTIAL lifts to the upper row.
  const cardsCollide =
    currentCardX !== null &&
    potentialCardX !== null &&
    potentialCardX < currentCardX + CARD_WIDTH + CARD_GAP &&
    currentCardX < potentialCardX + CARD_WIDTH + CARD_GAP;
  const potentialCardY = cardsCollide ? CARD_ROW_TOP : CARD_ROW_BOTTOM;

  return (
    <div className="space-y-4 text-[#17161B] tracking-[-0.01em] font-['Geist','Inter',system-ui,sans-serif]">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-semibold tracking-[-0.02em]">
          {metricName ? `${metricName} Distribution` : "Overall Performance Distribution"}
        </h3>
        <div className="text-[12.5px] text-[#71707B]">Population bell curve</div>
      </div>

      <div className="flex items-stretch gap-1">
        {/* writing-mode makes the element genuinely lay out as a narrow vertical
            column — unlike a CSS rotate, which only transforms the paint and
            leaves the full horizontal text width occupying layout space. */}
        <span className="self-center shrink-0 text-[10px] text-[#A6A5B0] [writing-mode:vertical-rl] rotate-180">
          Population density
        </span>

        <div ref={containerRef} className="relative flex-1">
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <AreaChart data={data} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="bellGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EAE6F6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#EAE6F6" stopOpacity={0.15} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="x"
                domain={[0, 100]}
                ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                tick={AXIS_TICK_STYLE}
                height={X_AXIS_HEIGHT}
              />
              <YAxis domain={[0, Y_AXIS_MAX]} ticks={[0, 10, 20, 30, 40, 50]} tick={AXIS_TICK_STYLE} width={Y_AXIS_WIDTH} />

              {/* Hover readout: whatever score the mouse is over, and the
                  percentile that score corresponds to — same pattern as the
                  ideal-range bell curve's own hover tooltip. */}
              <Tooltip
                cursor={{ stroke: "#A6A5B0", strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const point = payload[0].payload as { x: number; y: number };
                  const hoveredScore = point.x;
                  const hoveredPercentile = calculatePercentile(hoveredScore, mean, stdDev, PERCENTILE_DECIMALS);
                  const hoveredColor = scoreColor(hoveredScore);
                  return (
                    <div className="bg-[#17161B] text-white rounded-lg px-3 py-1.5 shadow-xl pointer-events-none font-['Geist','Inter',system-ui,sans-serif]">
                      <div className="text-xs font-semibold whitespace-nowrap font-['Geist_Mono',monospace]">
                        Score: {hoveredScore.toFixed(0)}
                      </div>
                      <div
                        className="text-xs font-semibold whitespace-nowrap font-['Geist_Mono',monospace]"
                        style={{ color: hoveredColor }}
                      >
                        Top {formatPercentile(100 - hoveredPercentile)}%
                      </div>
                    </div>
                  );
                }}
              />

              {/* Bell curve */}
              <Area type="monotone" dataKey="y" stroke="#C9C3DE" strokeWidth={2} fill="url(#bellGradient)" />
            </AreaChart>
          </ResponsiveContainer>

          {/* Current/potential markers, overlaid in plain HTML so they can
              animate via a CSS transition instead of Recharts' ReferenceLine. */}
          <div className="absolute inset-0 pointer-events-none">
            <ScoreMarker
              pixelX={currentPixelX}
              cardX={currentCardX}
              cardY={CARD_ROW_BOTTOM}
              topPx={CHART_MARGIN.top}
              bottomPx={CHART_HEIGHT - CHART_MARGIN.bottom - X_AXIS_HEIGHT}
              label="CURRENT"
              score={currentScore}
              percentile={currentPercentile}
              color={currentColor}
            />
            <ScoreMarker
              pixelX={potentialPixelX}
              cardX={potentialCardX}
              cardY={potentialCardY}
              topPx={CHART_MARGIN.top}
              bottomPx={CHART_HEIGHT - CHART_MARGIN.bottom - X_AXIS_HEIGHT}
              label="POTENTIAL"
              score={potentialScore}
              percentile={potentialPercentile}
              color={potentialColor}
              dashed
            />
          </div>
        </div>
      </div>

      {/* Plain-language restatement — "top X%" is a common source of confusion
          (best X% or worst X%?), so spell out the complementary framing too. */}
      <p className="text-sm text-[#71707B]">
        You did better than{" "}
        <span className="font-semibold font-['Geist_Mono',monospace]" style={{ color: currentColor }}>
          {formatPercentile(currentPercentile)}%
        </span>{" "}
        of speakers.
      </p>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded" style={{ backgroundColor: currentColor }} />
          <span className="text-sm text-[#71707B]">Your current score</span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <div
            className="w-4 h-1 rounded"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${potentialColor} 0, ${potentialColor} 5px, transparent 5px, transparent 10px)`,
            }}
          />
          <span className="text-sm text-[#71707B]">After addressing issues</span>
        </div>
      </div>

      {potentialScore > currentScore && (
        <div className="flex gap-[11px] items-start bg-[#FAF8FE] border border-[#EBE3FB] rounded-xl px-4 py-3.5">
          <TrendingUp className="w-[18px] h-[18px] text-[#9333EA] mt-0.5 shrink-0" />
          <div>
            <div className="text-[13.5px] font-semibold text-[#4A2A87]">
              +{(potentialScore - currentScore).toFixed(1)} points possible
            </div>
            <div className="text-[13px] text-[#6B5A8E] leading-[1.5] mt-[3px]">
              By addressing the penalties identified below, you could move from the top{" "}
              {formatPercentile(100 - currentPercentile)}% to the top {formatPercentile(100 - potentialPercentile)}%
              of speakers.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

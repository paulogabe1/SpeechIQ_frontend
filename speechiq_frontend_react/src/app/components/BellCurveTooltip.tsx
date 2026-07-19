import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ReferenceArea, ReferenceDot, Tooltip, Label } from "recharts";
import { calculateIdealRangeScore, getBellCurveDomain, getIdealRangeScoreColor } from "../lib/idealRangeScore";

const AXIS_TICK_STYLE = { fontSize: 10, fill: "#A6A5B0", fontFamily: "Geist, Inter, system-ui, sans-serif" };

/**
 * Custom ReferenceDot label: a solid backdrop behind the score text so it
 * stays legible where it would otherwise sit right on top of the dashed
 * trace-guide lines (or the curve itself) rather than on blank space.
 *
 * When `content` is a function, Recharts skips its own position-offset math
 * entirely (that only runs for the default plain-text renderer) and just
 * calls this with the raw dot viewBox — so "top"/"bottom" placement has to be
 * replicated here manually instead of arriving pre-computed.
 */
function ScoreDotLabel(props: {
  viewBox?: { x: number; y: number; width: number; height: number };
  position?: string;
  offset?: number;
  value?: string;
  color?: string;
}) {
  const { viewBox, position, offset = 5, value, color } = props;
  if (!viewBox || !value) return null;
  const x = viewBox.x + viewBox.width / 2;
  const y = position === "bottom" ? viewBox.y + viewBox.height + offset : viewBox.y - offset;
  const paddingX = 5;
  const width = value.length * 6.4 + paddingX * 2;
  const height = 16;
  return (
    <g>
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        rx={4}
        fill="white"
        fillOpacity={0.92}
        stroke={color}
        strokeWidth={1}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
        fontFamily="'Geist Mono', 'SF Mono', monospace"
        fill={color}
      >
        {value}
      </text>
    </g>
  );
}

interface BellCurveTooltipProps {
  metric: string;
  value: number;
  idealMin: number;
  idealMax: number;
  unit: string;
}

export function BellCurveTooltip({ metric, value, idealMin, idealMax, unit }: BellCurveTooltipProps) {
  // The ideal range is NOT assumed to be ±1 standard deviation — sigma is
  // instead derived from the display window (4x the ideal range's width,
  // placeholder) sitting at ~±3σ. See getBellCurveSigma/calculateIdealRangeScore
  // for exactly how the ideal range, the base bell curve, and the 0-10 score
  // all relate to that one shared sigma (computed internally there, not here —
  // this component has no percentile display, so it never needs sigma itself).
  const mean = (idealMin + idealMax) / 2;
  const idealRangeWidth = idealMax - idealMin;

  // This is the SCORE function, not a probability density — the curve's own
  // height at a given x IS the /10 score for that value (flat 10 across the
  // ideal band, a real Gaussian falloff outside it), so tracing your value up
  // to the curve and across to the y-axis reads off your actual score.
  // Domain defaults to the same placeholder window the score function anchors
  // its 0-10 rescaling to, but always widens to comfortably include the actual
  // value — otherwise an unusually extreme value would fall outside the
  // plotted range and its marker would simply never appear.
  const { min: baseMin, max: baseMax } = getBellCurveDomain(idealMin, idealMax);
  const uncappedMin = Math.min(baseMin, value - idealRangeWidth * 0.25);
  // These metrics (durations, counts, rates, %) can't physically go below 0 — clamp
  // the display floor there instead of showing e.g. "-1 seconds" of pause duration.
  // Only clamps when the ideal range itself is non-negative, so a metric that's
  // legitimately allowed to be negative wouldn't get its domain cut off.
  const min = idealMin >= 0 ? Math.max(0, uncappedMin) : uncappedMin;
  const uncappedMax = Math.max(baseMax, value + idealRangeWidth * 0.25);
  // Percentage metrics (Speech Ratio, TTR) can't physically exceed 100% either —
  // clamp the plotted axis there too. This is display-only: the score function's
  // own zero-anchor (getBellCurveDomain, called internally by
  // calculateIdealRangeScore) stays unclamped, so a value near the physical
  // ceiling still scores close to its true position on the curve rather than
  // being pinned to 0 just because the axis stops rendering past 100.
  const max = unit === "%" ? Math.min(100, uncappedMax) : uncappedMax;
  const range = max - min;

  // Narrow ideal ranges (e.g. Avg Pause: 0.5-1.5s) place ticks close enough together
  // that rounding to whole numbers collapses distinct values onto the same label
  // (0.5 and 1.0 both round to "1"). Show one decimal place whenever the plotted
  // span is small enough for that to matter.
  const tickDecimals = range < 10 ? 1 : 0;
  const formatTick = (val: number) => val.toFixed(tickDecimals);

  const data = Array.from({ length: 100 }, (_, i) => {
    const x = min + (i / 99) * range;
    return { x, y: calculateIdealRangeScore(x, idealMin, idealMax) };
  });

  const score = calculateIdealRangeScore(value, idealMin, idealMax);
  const scoreColor = getIdealRangeScoreColor(score);

  return (
    <div className="bg-white p-4 rounded-xl shadow-[0_20px_50px_-12px_rgba(20,18,28,0.35)] border border-[#EBE3FB] w-72 max-w-[calc(100vw-3rem)] z-[9999] text-[#17161B] tracking-[-0.01em] font-['Geist','Inter',system-ui,sans-serif]">
      <div className="mb-3">
        <div className="font-semibold mb-1">{metric}</div>
        <div className="text-sm text-[#71707B] mb-2">
          Your {metric.toLowerCase()}:{" "}
          <span className="font-semibold font-['Geist_Mono',monospace]" style={{ color: scoreColor }}>
            {value} {unit}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-[#A6A5B0]">
            Ideal: {idealMin}-{idealMax} {unit}
          </div>
          <div
            className="px-3 py-1 rounded-full font-semibold text-sm font-['Geist_Mono',monospace]"
            style={{
              backgroundColor: scoreColor + "20",
              color: scoreColor,
            }}
          >
            {score.toFixed(1)}/10
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={data} margin={{ top: 14, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="bellGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EAE6F6" stopOpacity={1} />
              <stop offset="100%" stopColor="#EAE6F6" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" type="number" domain={[min, max]} ticks={[min, idealMin, mean, idealMax, max]} tick={AXIS_TICK_STYLE} tickFormatter={formatTick} />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={AXIS_TICK_STYLE} width={22} />

          {/* Live readout of whatever point on the curve the mouse is over —
              separate from the fixed "your value" markers below, which always
              stay put at the real recorded value regardless of hover. */}
          <Tooltip
            cursor={{ stroke: "#A6A5B0", strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const point = payload[0].payload as { x: number; y: number };
              const hoverColor = getIdealRangeScoreColor(point.y);
              return (
                <div className="bg-[#17161B] text-white rounded-lg px-3 py-1.5 shadow-xl pointer-events-none font-['Geist','Inter',system-ui,sans-serif]">
                  <div className="text-xs font-semibold whitespace-nowrap font-['Geist_Mono',monospace]">
                    {point.x.toFixed(tickDecimals)} {unit}
                  </div>
                  <div className="text-xs font-semibold whitespace-nowrap font-['Geist_Mono',monospace]" style={{ color: hoverColor }}>
                    {point.y.toFixed(1)}/10
                  </div>
                </div>
              );
            }}
          />

          {/* Ideal range — scores a flat 10/10 across this whole band */}
          <ReferenceArea x1={idealMin} x2={idealMax} fill="#A6A5B0" fillOpacity={0.14} stroke="#A6A5B0" strokeWidth={1} strokeDasharray="3 3" />

          {/* Score curve: height at x = score out of 10 for that value */}
          <Area type="monotone" dataKey="y" stroke="#C9C3DE" strokeWidth={2} fill="url(#bellGradient)" />

          {/* Trace guides: your x-value up to the curve, then across to the y-axis */}
          <ReferenceLine x={value} stroke={scoreColor} strokeWidth={2} strokeDasharray="4 3" ifOverflow="visible" />
          <ReferenceLine y={score} stroke={scoreColor} strokeWidth={2} strokeDasharray="4 3" ifOverflow="visible" />
          <ReferenceDot x={value} y={score} r={5} fill={scoreColor} stroke="white" strokeWidth={2} ifOverflow="visible">
            <Label
              // Near the top of the 0-10 scale, a label placed "above" the dot
              // would render above the plot area entirely and get clipped by the
              // chart's margin — flip it below the dot once there's not enough
              // headroom left for it.
              position={score >= 8.5 ? "bottom" : "top"}
              content={(labelProps: {
                viewBox?: { x: number; y: number; width: number; height: number };
                position?: string;
                offset?: number;
              }) => (
                <ScoreDotLabel
                  viewBox={labelProps.viewBox}
                  position={labelProps.position}
                  offset={labelProps.offset}
                  value={`${score.toFixed(1)}/10`}
                  color={scoreColor}
                />
              )}
            />
          </ReferenceDot>
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#A6A5B0]/20 border border-[#A6A5B0] rounded" />
          <span className="text-[#71707B]">Ideal range</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scoreColor }} />
          <span className="text-[#71707B]">Your score</span>
        </div>
      </div>
    </div>
  );
}

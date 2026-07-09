/**
 * Shared normal-distribution math for the bell curves. Two different things get
 * plotted against a normal distribution in this app, and they behave differently:
 *
 * - A raw metric (WPM, pause count, seconds, %) has a genuine "too low / too
 *   high" shape, so an ideal range makes real statistical sense — see
 *   calculateIdealRangeScore below for exactly how that's modeled.
 * - A 0-100 score is monotonic (higher is always better — there's no "too
 *   fluent"), so it has no symmetric ideal band. It's shown against an assumed
 *   population distribution for percentile/context only (see
 *   PerformanceBellCurve), with no ideal-range or /10 score attached.
 *
 * None of this is backed by a real cross-user dataset — "the population is
 * normal" is a modeling assumption either way. What *is* real is the ideal
 * bands themselves for raw metrics (125-165 WPM, 4-8 pauses, etc.) — those come
 * from the product's own documented targets, not from this statistical model.
 */

/** Standard normal CDF via the Abramowitz & Stegun 26.2.17 approximation.
 *  Returns the raw (unrounded, unclamped) probability P(Z <= z), 0-1. */
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

/** Display-ready percentile for a value against N(mean, stdDev). Pass `decimals`
 *  for finer precision (up to ~5 is reasonable before the underlying normal-CDF
 *  approximation stops being meaningfully more accurate). The 1-99 whole-number
 *  floor/ceiling only applies at the default 0-decimal precision — it exists so
 *  the app never claims a literal "0th"/"100th" percentile; at higher precision
 *  the equivalent near-0/near-100 clamp is tight enough not to matter for any
 *  real score. */
export function calculatePercentile(value: number, mean: number, stdDev: number, decimals: number = 0): number {
  const z = stdDev > 0 ? (value - mean) / stdDev : 0;
  const raw = normalCdf(z) * 100;
  if (decimals <= 0) {
    return Math.max(1, Math.min(99, Math.round(raw)));
  }
  const factor = Math.pow(10, decimals);
  const clamped = Math.max(0.00001, Math.min(99.99999, raw));
  return Math.round(clamped * factor) / factor;
}

// Half-width factor applied to the ideal range's own width to get the display/
// scoring window — total window width = 2x this = 10x the ideal range's width.
const DOMAIN_WIDTH_MULTIPLIER = 5;

/**
 * The bell curve's plotted x-axis window for a given ideal range: a
 * placeholder 10x the ideal range's own width, centered on its midpoint.
 * Shared between the score function below (which anchors its 0-10 rescaling to
 * this window's edges) and the chart component (which displays exactly this
 * window, modulo its own further physical-ceiling clamping — see
 * BellCurveTooltip), so the two can never drift out of sync with each other.
 */
export function getBellCurveDomain(idealMin: number, idealMax: number): { min: number; max: number } {
  const mean = (idealMin + idealMax) / 2;
  const halfWidth = DOMAIN_WIDTH_MULTIPLIER * (idealMax - idealMin); // "10x the ideal range" total width, placeholder
  return { min: mean - halfWidth, max: mean + halfWidth };
}

/** The base bell curve's standard deviation: sized so the display window's
 *  edges (see getBellCurveDomain) sit at ~±3σ. Used for both the score curve
 *  and the percentile, so there's exactly one σ for a given ideal range, not
 *  two different ones quietly disagreeing with each other. */
export function getBellCurveSigma(idealMin: number, idealMax: number): number {
  const { max: domainMax } = getBellCurveDomain(idealMin, idealMax);
  const mean = (idealMin + idealMax) / 2;
  return (domainMax - mean) / 3;
}

/**
 * Scores how well a value fits an ideal [idealMin, idealMax] band on a
 * continuous 0-10 scale. Built as a single base bell curve, clipped flat at
 * the ideal range, then linearly rescaled:
 *
 * 1. One ordinary Gaussian `g(x) = exp(-(x-mean)² / (2σ²))` is the "base" —
 *    a real, single, symmetric bell curve, not two tails stitched together.
 *    σ is sized so the displayed window (10x the ideal range, see
 *    getBellCurveDomain) sits at ~±3σ — the ideal range itself just falls
 *    wherever it naturally lands on that curve, not forced to be ±1σ.
 * 2. The curve is clipped (saturated) at whatever height it already has at
 *    the ideal range's boundary — g(idealMin) == g(idealMax) by symmetry —
 *    via a hard Math.min(), so the plateau is exactly flat: any value inside
 *    [idealMin, idealMax], including right at either edge, scores a clean 10.
 *    (An earlier version rounded this join with a smoothing blend to make the
 *    chart's corner less sharp, but that blend shaved the plateau down near
 *    its own edges too — a value sitting exactly at idealMax would score
 *    ~9.7 instead of 10. The score has to stay exact; if the chart line wants
 *    a softer-looking corner, that has to come from how it's drawn, not from
 *    perturbing the values it's drawn from.)
 * 3. Only *after* that combined curve exists do we map it to 0-10: the
 *    window's outer edge (its lowest visible point) becomes 0, the flat top
 *    becomes 10, linearly in between.
 */
export function calculateIdealRangeScore(value: number, idealMin: number, idealMax: number): number {
  const mean = (idealMin + idealMax) / 2;
  const idealRangeWidth = idealMax - idealMin;
  if (idealRangeWidth <= 0) return value === mean ? 10 : 0;

  const { max: domainMax } = getBellCurveDomain(idealMin, idealMax);
  const sigma = getBellCurveSigma(idealMin, idealMax);

  const baseBellCurve = (x: number) => Math.exp(-((x - mean) ** 2) / (2 * sigma * sigma));

  const plateauHeight = baseBellCurve(idealMax); // == baseBellCurve(idealMin), symmetric
  const combined = (x: number) => Math.min(baseBellCurve(x), plateauHeight);

  const floorHeight = combined(domainMax); // == combined(domainMin), the window's lowest point
  const raw = combined(value);
  const score = ((raw - floorHeight) / (plateauHeight - floorHeight)) * 10;

  return Math.max(0, Math.min(10, score));
}

// Same bands/darkening logic as lib/scoreDisplay.ts's scoreColor — this one's
// used as text/chip color too (MetricBreakdown's component rows, this file's
// own tooltip), so it needs the same ~600-weight contrast against white.
export function getIdealRangeScoreColor(score: number): string {
  if (score >= 9) return "#059669";
  if (score >= 7) return "#16A34A";
  if (score >= 5) return "#D97706";
  if (score >= 3) return "#EA580C";
  return "#DC2626";
}

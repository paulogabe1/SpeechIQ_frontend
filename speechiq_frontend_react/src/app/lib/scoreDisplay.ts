// Shared 0-100 score -> color/grade-label mapping, used everywhere a score is
// shown (dashboard-free): the analysis hero, breakdown rows, tab bar, and both
// the quick-preview modal and full per-metric panel. One set of bands so a 74
// never reads as "Strong" in one place and "Fair" in another.

// One shade darker per tier than PerformanceBellCurve's own dot colors: those
// are small marks (identified by position, not read as characters) so they
// can stay light, but these same hues used as text/chip color need real
// contrast against white — the "500" weights measure ~2-3:1, well under the
// ~4.5:1 normal text wants. This is the same darkening step in every tier.
export function scoreColor(s: number): string {
  if (s >= 85) return "#059669";
  if (s >= 70) return "#16A34A";
  if (s >= 55) return "#D97706";
  if (s >= 40) return "#EA580C";
  return "#DC2626";
}

export function grade(s: number): string {
  if (s >= 85) return "Excellent";
  if (s >= 70) return "Strong";
  if (s >= 55) return "Fair";
  if (s >= 40) return "Developing";
  return "Needs work";
}

// Plain-language definitions of what each score actually measures, kept in
// sync with the backend formulas in speechiq_api/scoring/scorer.py. If a
// formula changes there, the wording here must change with it — these are the
// user's only window into what the numbers mean.

import type { MetricCategory } from "./analysisResult";

export const METRIC_DEFINITIONS: Record<MetricCategory, string> = {
  Fluency:
    "How smoothly your speech flows. Based on how often you pause and how much time is lost to long pauses — a pause over ~1s mid-sentence, or ~1.5s between sentences, counts as long. Natural pauses at sentence ends don't hurt this score.",
  Pacing:
    "Your speaking speed and steadiness. Speed is words per minute across the whole recording, pauses included (ideal: 125–170 WPM). Steadiness checks that your rate stays even instead of lurching between rushed and dragging passages.",
  Clarity:
    "How complete and connected your phrasing is. Based on the average length of your spoken phrases (short fragments lower it) and how much of the recording is actual speech rather than silence.",
  Confidence:
    "How assertive your delivery sounds. Counts filler words (“um”, “uh”, “like”…), mid-sentence hesitations, and whether you sustain speech rather than trailing off into silence.",
  Vocabulary:
    "The variety in your word choice. Measures how many different words you use relative to how much you say, with a deduction for leaning on the same content words over and over.",
};

/** One-line tagline per metric — the modal's subtitle under the metric name.
 *  Static, not data-driven (unlike METRIC_DEFINITIONS/getMetricFeedback): a
 *  short "what this dimension is about" label, not a reading of this session. */
export const METRIC_BLURBS: Record<MetricCategory, string> = {
  Fluency: "Smooth, connected delivery without long silences.",
  Pacing: "A steady, comfortable speaking rate.",
  Clarity: "Coherent, complete sentences.",
  Confidence: "Assertive tone with minimal hesitation.",
  Vocabulary: "Varied and rich word choice.",
};

export const OVERALL_DEFINITION =
  "A weighted blend of the five scores: Fluency 30%, Pacing 25%, Confidence 25%, Clarity 15%, Vocabulary 5%.";

export const POTENTIAL_DEFINITION =
  "Potential is what a score becomes with the fixable issues we detected (long pauses, filler words, rushed passages…) removed — the fastest wins available to you right now.";

/** The learning module each metric's practice CTA points at — shared by the
 *  coaching card and the per-metric tab panel so they never name two different
 *  modules for the same dimension. */
export const MODULE_MAP: Record<MetricCategory, { module: string; desc: string }> = {
  Fluency: { module: "Pacing & Rhythm Module", desc: "Focuses on reducing long pauses and building connected speech flow." },
  Pacing: { module: "Pacing & Rhythm Module", desc: "Trains you to speak at a consistent, comfortable rate." },
  Clarity: { module: "Articulation Basics", desc: "Builds complete sentence delivery and reduces fragmented speech." },
  Confidence: { module: "Vocal Confidence Module", desc: "Eliminates filler words and builds assertive, deliberate delivery." },
  Vocabulary: { module: "Advanced Fluency Module", desc: "Expands lexical range and reduces word repetition." },
};

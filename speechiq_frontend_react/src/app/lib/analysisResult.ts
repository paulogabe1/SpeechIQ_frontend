// Pure data types + parsing for the FastAPI /analyze response.
// Ported from speechiq_frontend_flutter/lib/features/analysis/models/analysis_result.dart
// No React/DOM imports on purpose — keep this testable in isolation.

export interface MetricScore {
  score: number;
  potential: number;
}

export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface PauseMetrics {
  totalSpeechTime: number;
  totalSilenceTime: number;
  pauseCount: number;
  avgPauseDuration: number;
  longPauseCount: number;
  pauseRate: number;
}

export interface SpeechStats {
  wordCount: number;
  uniqueWordCount: number;
  speechRateWpm: number;
  wordsPerSecond: number;
  speechRatio: number;
  averageWordsPerSegment: number;
  fillers: Record<string, number>;
}

export interface TimelineSegment {
  start: number;
  end: number;
  type: string; // 'speech' | 'silence'
}

export interface IdealRange {
  min: number;
  max: number;
  unit: string;
}

/** One concrete flagged moment/pattern from the backend scorer. Timestamped
 *  events (start/end present) can be replayed in the UI; pattern-level ones
 *  (fillers, overused words) can't. */
export interface PenaltyEventData {
  description: string;
  start: number | null;
  end: number | null;
  points: number;
}

/** Per-dimension drill-down payload from scores.breakdown. `potential` is
 *  null when the API predates real potential computation (fallback heuristic
 *  applies instead). */
export interface DimensionBreakdown {
  potential: number | null;
  strengths: string[];
  penaltyEvents: PenaltyEventData[];
}

/** Keys match the backend's SpeechScorer.ideal_ranges() exactly. */
export type IdealRangeKey =
  | "speaking_rate"
  | "pause_rate"
  | "avg_pause_duration"
  | "avg_words_per_segment"
  | "speech_ratio"
  | "filler_rate_per_100_words"
  | "type_token_ratio";

/**
 * Fallback only — used when there's no real API result (e.g. MetricBreakdown's
 * standalone/demo usage). The backend (scoring/scorer.py: SpeechScorer.ideal_ranges)
 * is the single source of truth; these mirror its current values so the fallback
 * doesn't look wildly different, but are NOT re-derived from research independently.
 */
export const DEFAULT_IDEAL_RANGES: Record<IdealRangeKey, IdealRange> = {
  speaking_rate: { min: 125, max: 170, unit: "WPM" },
  pause_rate: { min: 0, max: 6, unit: "pauses/min" },
  avg_pause_duration: { min: 0.3, max: 1.2, unit: "seconds" },
  avg_words_per_segment: { min: 5, max: 15, unit: "words" },
  speech_ratio: { min: 70, max: 85, unit: "%" },
  filler_rate_per_100_words: { min: 0, max: 2, unit: "per 100 words" },
  type_token_ratio: { min: 60, max: 80, unit: "%" },
};

export interface AnalysisResult {
  overallScore: number;
  overallPotential: number;
  fluency: MetricScore;
  pacing: MetricScore;
  clarity: MetricScore;
  confidence: MetricScore;
  vocabulary: MetricScore;
  pronunciation: MetricScore;
  feedback: string[];
  transcript: string;
  segments: TranscriptSegment[];
  duration: number;
  pauseMetrics: PauseMetrics;
  speechMetrics: SpeechStats;
  timeline: TimelineSegment[];
  idealRanges: Record<IdealRangeKey, IdealRange>;
  /** Per-dimension strengths + penalty events, keyed by display category. */
  breakdowns: Partial<Record<MetricCategory, DimensionBreakdown>>;
}

export type MetricCategory = "Fluency" | "Pacing" | "Clarity" | "Confidence" | "Vocabulary";

function toNumber(v: unknown): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : 0;
}

function clampScore(v: unknown): number {
  return Math.round(Math.min(100, Math.max(0, toNumber(v))));
}

function potentialFor(score: number): number {
  return Math.min(score + 12, 100);
}

function parsePauseMetrics(j: Record<string, unknown>): PauseMetrics {
  return {
    totalSpeechTime: toNumber(j["total_speech_time"]),
    totalSilenceTime: toNumber(j["total_silence_time"]),
    pauseCount: toNumber(j["pause_count"]),
    avgPauseDuration: toNumber(j["avg_pause_duration"]),
    longPauseCount: toNumber(j["long_pause_count"]),
    pauseRate: toNumber(j["pause_rate"]),
  };
}

function parseSpeechStats(j: Record<string, unknown>): SpeechStats {
  const fillers = j["fillers"];
  return {
    wordCount: toNumber(j["word_count"]),
    uniqueWordCount: toNumber(j["unique_word_count"]),
    speechRateWpm: toNumber(j["speech_rate_wpm"]),
    wordsPerSecond: toNumber(j["words_per_second"]),
    speechRatio: toNumber(j["speech_ratio"]),
    averageWordsPerSegment: toNumber(j["avg_words_per_segment"]),
    fillers: fillers && typeof fillers === "object" ? (fillers as Record<string, number>) : {},
  };
}

function parseSegments(arr: unknown): TranscriptSegment[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((e) => {
    const j = (e ?? {}) as Record<string, unknown>;
    return {
      id: toNumber(j["id"]),
      start: toNumber(j["start"]),
      end: toNumber(j["end"]),
      text: typeof j["text"] === "string" ? (j["text"] as string) : "",
    };
  });
}

const BREAKDOWN_KEY_TO_CATEGORY: Record<string, MetricCategory> = {
  fluency: "Fluency",
  pacing: "Pacing",
  clarity: "Clarity",
  confidence: "Confidence",
  vocabulary: "Vocabulary",
};

/** Parses scores.breakdown into per-dimension potential/strengths/penalty events. */
function parseBreakdowns(j: unknown): Partial<Record<MetricCategory, DimensionBreakdown>> {
  const raw = (j ?? {}) as Record<string, unknown>;
  const result: Partial<Record<MetricCategory, DimensionBreakdown>> = {};
  for (const [key, category] of Object.entries(BREAKDOWN_KEY_TO_CATEGORY)) {
    const entry = raw[key];
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const rawEvents = Array.isArray(e["penalty_events"]) ? (e["penalty_events"] as unknown[]) : [];
    result[category] = {
      potential: typeof e["potential"] === "number" ? clampScore(e["potential"]) : null,
      strengths: Array.isArray(e["strengths"]) ? (e["strengths"] as unknown[]).map(String) : [],
      penaltyEvents: rawEvents.map((ev) => {
        const p = (ev ?? {}) as Record<string, unknown>;
        return {
          description: typeof p["description"] === "string" ? (p["description"] as string) : "",
          start: typeof p["start"] === "number" ? (p["start"] as number) : null,
          end: typeof p["end"] === "number" ? (p["end"] as number) : null,
          points: toNumber(p["points"]),
        };
      }),
    };
  }
  return result;
}

/** Reads scores.ideal_ranges from the API, falling back per-key to
 *  DEFAULT_IDEAL_RANGES for any key the backend didn't send (e.g. an older
 *  API version) rather than leaving it undefined. */
function parseIdealRanges(j: unknown): Record<IdealRangeKey, IdealRange> {
  const raw = (j ?? {}) as Record<string, unknown>;
  const result = { ...DEFAULT_IDEAL_RANGES };
  for (const key of Object.keys(DEFAULT_IDEAL_RANGES) as IdealRangeKey[]) {
    const entry = raw[key];
    if (entry && typeof entry === "object") {
      const e = entry as Record<string, unknown>;
      result[key] = {
        min: toNumber(e["min"]),
        max: toNumber(e["max"]),
        unit: typeof e["unit"] === "string" ? (e["unit"] as string) : DEFAULT_IDEAL_RANGES[key].unit,
      };
    }
  }
  return result;
}

function parseTimeline(arr: unknown): TimelineSegment[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((e) => {
    const j = (e ?? {}) as Record<string, unknown>;
    return {
      start: toNumber(j["start"]),
      end: toNumber(j["end"]),
      type: typeof j["type"] === "string" ? (j["type"] as string) : "",
    };
  });
}

function buildFeedback(
  fluency: number,
  pacing: number,
  clarity: number,
  pm: PauseMetrics,
  sm: SpeechStats,
): string[] {
  const items: string[] = [];
  items.push(
    `You spoke at ${Math.round(sm.speechRateWpm)} WPM` +
      (pm.pauseCount > 0
        ? ` with ${pm.pauseCount} pauses (avg ${pm.avgPauseDuration.toFixed(1)}s).`
        : "."),
  );
  if (fluency < 50) {
    items.push("Fluency needs attention — focus on reducing long silences.");
  } else if (pacing < 50) {
    items.push("Work on keeping a steadier speaking pace throughout.");
  } else if (clarity < 50) {
    items.push("Articulation of word endings could be sharper.");
  } else {
    items.push("Good overall delivery — keep practising to build consistency.");
  }
  return items;
}

/**
 * Parses both shapes the API can return:
 *   Full response  -> {"file": "...", "analysis": { ... }}
 *   Bare analysis  -> { "transcript": ..., "scores": ..., ... }
 */
export function parseAnalysisResult(json: unknown): AnalysisResult {
  const root = (json ?? {}) as Record<string, unknown>;
  const a = (root["analysis"] ?? root) as Record<string, unknown>;

  const rawScores = (a["scores"] ?? {}) as Record<string, unknown>;

  const fluencyScore = clampScore(rawScores["fluency"]);
  const pacingScore = clampScore(rawScores["pacing"]);
  const clarityScore = clampScore(rawScores["clarity"]);
  const confidenceScore = clampScore(rawScores["confidence"]);
  const vocabularyScore = clampScore(rawScores["vocabulary"]);
  const pronunciationScore = clampScore(rawScores["pronunciation"]);
  const overallScore = clampScore(rawScores["overall"]);

  const pausesMap = (a["pauses"] ?? {}) as Record<string, unknown>;
  const pm = parsePauseMetrics((pausesMap["metrics"] ?? {}) as Record<string, unknown>);
  const sm = parseSpeechStats((a["speech"] ?? {}) as Record<string, unknown>);

  const rawFeedback = a["feedback"];
  const feedbackList: string[] =
    Array.isArray(rawFeedback) && rawFeedback.length > 0
      ? rawFeedback.map((e) => String(e))
      : buildFeedback(fluencyScore, pacingScore, clarityScore, pm, sm);

  // Real per-dimension potentials come from the backend (same formula re-run
  // with that dimension's penalty events removed). The old +12 heuristic only
  // survives as a fallback for responses that predate the field.
  const breakdowns = parseBreakdowns(rawScores["breakdown"]);
  const potentialOf = (category: MetricCategory, score: number): number =>
    breakdowns[category]?.potential ?? potentialFor(score);

  const rawOverallPotential = rawScores["overall_potential"];
  const overallPotential =
    typeof rawOverallPotential === "number" && rawOverallPotential > 0
      ? clampScore(rawOverallPotential)
      : potentialFor(overallScore);

  return {
    overallScore,
    overallPotential,
    fluency: { score: fluencyScore, potential: potentialOf("Fluency", fluencyScore) },
    pacing: { score: pacingScore, potential: potentialOf("Pacing", pacingScore) },
    clarity: { score: clarityScore, potential: potentialOf("Clarity", clarityScore) },
    confidence: { score: confidenceScore, potential: potentialOf("Confidence", confidenceScore) },
    vocabulary: { score: vocabularyScore, potential: potentialOf("Vocabulary", vocabularyScore) },
    pronunciation: { score: pronunciationScore, potential: potentialFor(pronunciationScore) },
    feedback: feedbackList,
    transcript: typeof a["transcript"] === "string" ? (a["transcript"] as string) : "",
    segments: parseSegments(a["segments"]),
    duration: toNumber(a["duration"]),
    pauseMetrics: pm,
    speechMetrics: sm,
    timeline: parseTimeline(a["timeline"]),
    idealRanges: parseIdealRanges(rawScores["ideal_ranges"]),
    breakdowns,
  };
}

/** Silence segments as 0-1 waveform highlight ranges. */
export function getSilenceHighlights(result: AnalysisResult): Array<{ start: number; end: number }> {
  if (result.duration <= 0) return [];
  return result.timeline
    .filter((s) => s.type === "silence")
    .map((s) => ({
      start: Math.min(1, Math.max(0, s.start / result.duration)),
      end: Math.min(1, Math.max(0, s.end / result.duration)),
    }));
}

/** The lowest-scoring implemented metric (for the coaching card). Pronunciation excluded. */
export function getWorstMetric(result: AnalysisResult): MetricCategory {
  const scores: Array<[MetricCategory, number]> = [
    ["Fluency", result.fluency.score],
    ["Pacing", result.pacing.score],
    ["Clarity", result.clarity.score],
    ["Confidence", result.confidence.score],
    ["Vocabulary", result.vocabulary.score],
  ];
  return scores.reduce((a, b) => (a[1] <= b[1] ? a : b))[0];
}

import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Award, AudioLines, Sparkles, Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as HoverCard from "@radix-ui/react-hover-card";
import { BellCurveTooltip } from "./BellCurveTooltip";
import { AudioPlayer } from "./AudioPlayer";
import { useIsMobile } from "./ui/use-mobile";
import { getSilenceHighlights, DEFAULT_IDEAL_RANGES, type AnalysisResult, type IdealRangeKey, type MetricCategory } from "../lib/analysisResult";
import { getMetricFeedback } from "../lib/metricFeedback";
import { calculateIdealRangeScore, getIdealRangeScoreColor } from "../lib/idealRangeScore";
import { METRIC_DEFINITIONS, MODULE_MAP } from "../lib/metricDefinitions";
import { scoreColor, grade } from "../lib/scoreDisplay";

// Hover works great with a mouse but has no equivalent on touch — a tap can't
// "hover then leave". So this row uses HoverCard (hover, matching the original
// desktop UX) everywhere except mobile, where it falls back to Popover (tap to
// open/close). A prior pass switched this to Popover unconditionally to fix
// mobile, which silently took hover away from desktop too — this restores it.
function MetricRowCard({ isMobile, trigger, children }: { isMobile: boolean; trigger: ReactNode; children: ReactNode }) {
  const contentProps = {
    side: "bottom" as const,
    sideOffset: 10,
    collisionPadding: 16,
    // Each trigger is a nearly-full-width row, not a small inline element —
    // attaching "beside" it (side="right") means fighting for horizontal room
    // that essentially never exists next to a wide block, no matter how much
    // collision padding/boundary is tuned (confirmed: Radix's own
    // --radix-popper-available-width measured ~35px here, and flip had
    // nowhere better to go either). Attaching below instead gives it the
    // row's full width to work with, centered under it.
    //
    // Without an explicit boundary, Radix's default collision detection
    // ("clippingAncestors") walks up from the trigger and picks the modal
    // panel's own scrollable div as the "safe area" (its overflow-y-auto
    // forces the browser to actually clip overflow-x too, per the CSS spec,
    // even though it reads as computed overflow-x: visible) — pinning it to
    // the real viewport instead avoids that false, too-narrow boundary.
    collisionBoundary: typeof document !== "undefined" ? document.body : undefined,
    className: "z-[9999]",
  };

  if (isMobile) {
    return (
      <Popover.Root>
        <Popover.Trigger asChild>{trigger}</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content {...contentProps}>{children}</Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }

  return (
    <HoverCard.Root openDelay={100} closeDelay={100}>
      <HoverCard.Trigger asChild>{trigger}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content {...contentProps}>{children}</HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

const cardClass = "bg-white border border-[#EAEAEF] rounded-[18px]";

const LONG_PAUSE_THRESHOLD_SECONDS = 1.0; // matches the backend's own long-pause cutoff
const PENALTY_WAVEFORM_MARGIN_SECONDS = 1.5;

export interface Penalty {
  id: string;
  description: string;
  timestamp: number;
  pointsDeducted: number;
  /** Real [start, end] in seconds — only set when a genuine timestamped event
   *  exists (currently: Fluency's long pauses, from the API's timeline). Metrics
   *  without per-instance timing data (fillers are counts only, pacing/clarity are
   *  whole-recording averages) simply omit this and render no mini-player. */
  waveformRange?: { start: number; end: number };
}

export interface Strength {
  id: string;
  description: string;
  /** Only the illustrative fallback strengths carry bonus points — real
   *  API-detected strengths are observations, not additive scoring. */
  pointsAdded?: number;
}

export interface MetricDetail {
  metric: string;
  value: number;
  unit: string;
  idealMin?: number;
  idealMax?: number;
}

export interface MetricData {
  description: string;
  details: MetricDetail[];
  penalties: Penalty[];
  strengths: Strength[];
}

interface MetricBreakdownProps {
  metric: string;
  score: number;
  result?: AnalysisResult;
  audioSource?: Blob | File | null;
  onBack: () => void;
}

export function getMetricData(metric: string, result?: AnalysisResult): MetricData {
  const data = buildBaseMetricData(metric, result);

  // The backend scorer now emits real penalty events (timestamped where the
  // event has a location — long pauses, rushed/dragging passages, fragments)
  // and data-driven strengths per dimension. When present they replace the
  // client-side derivations/illustrative entries wholesale — including being
  // legitimately empty.
  const bd = result?.breakdowns?.[metric as MetricCategory];
  if (bd) {
    data.penalties = bd.penaltyEvents.map((e, i) => ({
      id: `api-penalty-${i}`,
      description: e.description,
      timestamp: e.start ?? -1,
      pointsDeducted: e.points,
      waveformRange: e.start !== null && e.end !== null ? { start: e.start, end: e.end } : undefined,
    }));
    data.strengths = bd.strengths.map((s, i) => ({ id: `api-strength-${i}`, description: s }));
  }
  return data;
}

function buildBaseMetricData(metric: string, result?: AnalysisResult): MetricData {
  // Real values from the API when available, else the same illustrative fallbacks
  // used by the Flutter reference implementation.
  const wpm = result?.speechMetrics.speechRateWpm ?? 152.0;
  const avgPause = result?.pauseMetrics.avgPauseDuration ?? 0.8;
  const pauseRate = result?.pauseMetrics.pauseRate ?? 5.0;
  const fillers = result?.speechMetrics.fillers ?? {};
  const wordCount = result?.speechMetrics.wordCount ?? 100;
  const uniqueWordCount = result?.speechMetrics.uniqueWordCount ?? 70;
  const avgWordsPerSeg = result?.speechMetrics.averageWordsPerSegment ?? 8.0;
  const speechRatio = result?.speechMetrics.speechRatio ?? 0.6;
  const description = getMetricFeedback(metric, result);

  // Ideal ranges are defined once, backend-side (SpeechScorer.ideal_ranges), and
  // simply displayed here — never hardcoded/re-derived in the frontend, so every
  // dimension that shows e.g. "Pause Rate" reads the exact same band.
  const ranges = result?.idealRanges ?? DEFAULT_IDEAL_RANGES;
  const range = (key: IdealRangeKey) => ranges[key];

  switch (metric) {
    case "Fluency": {
      // Real long-pause events straight from the API's timeline, instead of
      // illustrative placeholders — these carry genuine timestamps, so the
      // mini-player below them can point at (and replay) the actual moment. If
      // the recording genuinely has no pause this long, this list is empty —
      // that's accurate, not a bug (unlike the old always-3-fake-entries version).
      const longPauseEvents: Penalty[] = result
        ? result.timeline
            .filter((seg) => seg.type === "silence" && seg.end - seg.start >= LONG_PAUSE_THRESHOLD_SECONDS)
            .map((seg, i) => {
              const duration = seg.end - seg.start;
              return {
                id: `pause-${i}`,
                description: `Long pause (${duration.toFixed(1)}s)`,
                timestamp: seg.start,
                pointsDeducted: Math.min(8, Math.max(2, Math.round(duration))),
                waveformRange: { start: seg.start, end: seg.end },
              };
            })
        : [
            { id: "p1", description: "Long pause (3.2s)", timestamp: 15.4, pointsDeducted: 3, waveformRange: { start: 15.4, end: 18.6 } },
            { id: "p2", description: "Long pause (4.1s)", timestamp: 28.7, pointsDeducted: 5, waveformRange: { start: 28.7, end: 32.8 } },
            { id: "p3", description: "Long pause (2.8s)", timestamp: 45.2, pointsDeducted: 2, waveformRange: { start: 45.2, end: 48.0 } },
          ];
      return {
        description,
        details: [
          { metric: "Speaking Rate", value: wpm, unit: range("speaking_rate").unit, idealMin: range("speaking_rate").min, idealMax: range("speaking_rate").max },
          { metric: "Pause Rate", value: pauseRate, unit: range("pause_rate").unit, idealMin: range("pause_rate").min, idealMax: range("pause_rate").max },
          { metric: "Avg Pause", value: avgPause, unit: range("avg_pause_duration").unit, idealMin: range("avg_pause_duration").min, idealMax: range("avg_pause_duration").max },
        ],
        penalties: longPauseEvents,
        strengths: [
          { id: "s1", description: "Consistent speaking rate in middle sections", pointsAdded: 5 },
          { id: "s2", description: "Natural rhythm in storytelling portions", pointsAdded: 3 },
        ],
      };
    }
    case "Pacing": {
      const speakingRateRange = range("speaking_rate");
      const isTooFast = wpm > speakingRateRange.max;
      const isTooSlow = wpm < speakingRateRange.min;
      const idealWpmCenter = (speakingRateRange.min + speakingRateRange.max) / 2;
      const wpmDev = Math.abs(wpm - idealWpmCenter);
      const wpmBand = (speakingRateRange.max - speakingRateRange.min) / 2;
      return {
        description,
        details: [
          { metric: "Speaking Rate", value: wpm, unit: speakingRateRange.unit, idealMin: speakingRateRange.min, idealMax: speakingRateRange.max },
          { metric: "Rate Deviation", value: wpmDev, unit: "WPM", idealMin: 0, idealMax: wpmBand },
          { metric: "Avg Words/Segment", value: avgWordsPerSeg, unit: range("avg_words_per_segment").unit, idealMin: range("avg_words_per_segment").min, idealMax: range("avg_words_per_segment").max },
        ],
        penalties: isTooFast
          ? [{ id: "p1", description: `Rate above ideal (${Math.round(wpm)} WPM)`, timestamp: -1, pointsDeducted: Math.min(15, Math.max(0, Math.round(wpmDev))) }]
          : isTooSlow
          ? [{ id: "p1", description: `Rate below ideal (${Math.round(wpm)} WPM)`, timestamp: -1, pointsDeducted: Math.min(15, Math.max(0, Math.round(wpmDev))) }]
          : [],
        strengths: !isTooFast && !isTooSlow
          ? [
              { id: "s1", description: "Speaking rate within ideal range", pointsAdded: 8 },
              { id: "s2", description: "Consistent tempo maintained", pointsAdded: 5 },
            ]
          : [],
      };
    }
    case "Clarity": {
      const isFragmented = avgWordsPerSeg < range("avg_words_per_segment").min;
      return {
        description,
        details: [
          { metric: "Avg Words/Segment", value: avgWordsPerSeg, unit: range("avg_words_per_segment").unit, idealMin: range("avg_words_per_segment").min, idealMax: range("avg_words_per_segment").max },
          { metric: "Speech Ratio", value: speechRatio * 100, unit: range("speech_ratio").unit, idealMin: range("speech_ratio").min, idealMax: range("speech_ratio").max },
          { metric: "Pause Rate", value: pauseRate, unit: range("pause_rate").unit, idealMin: range("pause_rate").min, idealMax: range("pause_rate").max },
        ],
        penalties: isFragmented
          ? [{ id: "p1", description: "Short/fragmented speech segments", timestamp: -1, pointsDeducted: 8 }]
          : [],
        strengths: isFragmented
          ? []
          : [{ id: "s1", description: "Good segment coherence and delivery flow", pointsAdded: 6 }],
      };
    }
    case "Confidence": {
      const fillerEntries = Object.entries(fillers);
      const totalFillers = fillerEntries.reduce((sum, [, count]) => sum + count, 0);
      const fillerRate = wordCount > 0 ? (totalFillers / wordCount) * 100 : 0;
      const fillerPenalties: Penalty[] = fillerEntries.map(([word, count], i) => ({
        id: `filler-${i}`,
        description: `Filler '${word}' ×${count}`,
        timestamp: -1,
        pointsDeducted: Math.min(10, Math.max(0, count * 2)),
      }));
      return {
        description,
        details: [
          { metric: "Filler Rate", value: fillerRate, unit: range("filler_rate_per_100_words").unit, idealMin: range("filler_rate_per_100_words").min, idealMax: range("filler_rate_per_100_words").max },
          { metric: "Pause Rate", value: pauseRate, unit: range("pause_rate").unit, idealMin: range("pause_rate").min, idealMax: range("pause_rate").max },
          { metric: "Speech Ratio", value: speechRatio * 100, unit: range("speech_ratio").unit, idealMin: range("speech_ratio").min, idealMax: range("speech_ratio").max },
        ],
        penalties: fillerPenalties,
        strengths: totalFillers === 0
          ? [{ id: "s1", description: "Zero filler words — highly assertive delivery", pointsAdded: 10 }]
          : [],
      };
    }
    case "Vocabulary": {
      const ttr = wordCount > 0 ? uniqueWordCount / wordCount : 0;
      return {
        description,
        details: [
          { metric: "Type-Token Ratio", value: ttr * 100, unit: range("type_token_ratio").unit, idealMin: range("type_token_ratio").min, idealMax: range("type_token_ratio").max },
          { metric: "Unique Words", value: uniqueWordCount, unit: "words" },
          { metric: "Total Words", value: wordCount, unit: "words" },
        ],
        penalties: ttr < 0.4 && wordCount >= 20
          ? [{ id: "p1", description: "High word repetition rate", timestamp: -1, pointsDeducted: 5 }]
          : [],
        strengths: ttr >= 0.6
          ? [{ id: "s1", description: "Rich and varied vocabulary", pointsAdded: 8 }]
          : [],
      };
    }
    default:
      return {
        description,
        details: [],
        penalties: [],
        strengths: [],
      };
  }
}

export function MetricBreakdown({ metric, score, result, audioSource, onBack }: MetricBreakdownProps) {
  const isMobile = useIsMobile();
  const [pauseHighlights, setPauseHighlights] = useState<Array<{ start: number; end: number }>>([]);

  const data = getMetricData(metric, result);
  const baseSilenceHighlights = result ? getSilenceHighlights(result) : [];
  const totalDuration = result?.duration || 60;

  const handlePauseHover = (shouldHighlight: boolean, positions: Array<{ start: number; end: number }>) => {
    if (shouldHighlight) {
      setPauseHighlights(positions);
    } else {
      setPauseHighlights([]);
    }
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  };

  const potential = result?.breakdowns?.[metric as MetricCategory]?.potential ?? Math.min(score + 12, 100);
  const gain = Math.max(0, potential - score);
  const c = scoreColor(score);
  const moduleName = metric in MODULE_MAP ? MODULE_MAP[metric as MetricCategory].module : "the recommended module";

  return (
    <div className="flex flex-col gap-4 text-[#17161B] tracking-[-0.01em]">
      {/* Header */}
      <div className={`${cardClass} p-7`}>
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-[280px]">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#A6A5B0]">{metric} · full analysis</div>
            <div className="flex items-end gap-3.5 mt-3">
              <span className="text-[66px] font-semibold leading-[0.9] tracking-[-0.04em] font-['Geist_Mono',monospace]">{score}</span>
              <div className="pb-2">
                <span
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-[11px] py-[5px] rounded-full"
                  style={{ color: c, background: `${c}18` }}
                >
                  <Award className="w-3.5 h-3.5" /> {grade(score)}
                </span>
                <div className="text-[11.5px] text-[#9333EA] font-medium mt-2">
                  Potential {potential} · +{gain} recoverable
                </div>
              </div>
            </div>
            {metric in METRIC_DEFINITIONS && (
              <p className="text-[13px] leading-[1.55] text-[#71707B] max-w-xl mt-4">{METRIC_DEFINITIONS[metric as MetricCategory]}</p>
            )}
          </div>
          <div className="w-[218px] shrink-0">
            <div className="bg-[#FAF8FE] border border-[#EBE3FB] rounded-[15px] px-[17px] py-[15px]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#8163B8]">Potential gain</div>
              <div className="text-2xl font-semibold text-[#15864B] mt-1.5">+{gain} pts</div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 text-sm font-semibold rounded-xl py-3 mt-3 text-white bg-[#9333EA] hover:bg-[#7E22CE] transition-colors">
              Practice {moduleName} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Waveform — fully playable, not a static picture */}
      <div className={`${cardClass} p-7`}>
            <div className="flex items-center gap-2.5 mb-3">
              <AudioLines className="w-[18px] h-[18px] text-[#9333EA]" />
              <h3 className="text-[15px] font-semibold">Your recording</h3>
              {(baseSilenceHighlights.length > 0 || pauseHighlights.length > 0) && (
                <span className="text-xs text-[#A6A5B0] ml-auto">red = silence</span>
              )}
            </div>
        <AudioPlayer source={audioSource} highlights={[...baseSilenceHighlights, ...pauseHighlights]} />
      </div>

      {/* AI Feedback */}
      <div className={`${cardClass} p-7`}>
        <div className="flex items-center gap-2.5 mb-3">
          <Sparkles className="w-[18px] h-[18px] text-[#9333EA]" />
          <h3 className="text-[15px] font-semibold">AI feedback</h3>
        </div>
        <p className="text-[14.5px] leading-[1.55] text-[#3B3A44]">
{data.description.split(/(\w+(?:\s+\w+){0,2}(?:\s+\d+-\d+\s+\w+)?)/g).map((part, i) => {
                // Check if this part matches our hoverable terms
                if (part.toLowerCase().includes('speaking rate')) {
                  const detail = data.details.find(d => d.metric === "Speaking Rate");
                  if (detail) {
                    return (
                      <Popover.Root key={i} openDelay={0} closeDelay={0}>
                        <Popover.Trigger asChild>
                          <span className="underline decoration-dotted decoration-purple-400 cursor-help hover:bg-purple-100 px-1 rounded">
                            {part}
                          </span>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content
                            side="top"
                            sideOffset={5}
                            collisionPadding={16}
                            // Without an explicit boundary, Radix's default collision
                            // detection ("clippingAncestors") walks up from the trigger
                            // and picks the modal panel's own scrollable div as the "safe
                            // area" (its overflow-y-auto forces the browser to actually
                            // clip overflow-x too, per the CSS spec, even though it reads
                            // as computed overflow-x: visible) — pinning it to the real
                            // viewport instead avoids that false, too-narrow boundary.
                            collisionBoundary={typeof document !== "undefined" ? document.body : undefined}
                            className="z-[9999]"
                          >
                            <BellCurveTooltip
                              metric={detail.metric}
                              value={detail.value}
                              idealMin={detail.idealMin!}
                              idealMax={detail.idealMax!}
                              unit={detail.unit}
                            />
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    );
                  }
                }

                if (part.toLowerCase().includes('pause')) {
                  const pausePenalties = data.penalties.filter(p => p.waveformRange !== undefined);
                  return (
                    <span
                      key={i}
                      className="underline decoration-dotted decoration-red-400 cursor-help hover:bg-red-50 px-1 rounded"
                      onMouseEnter={() => handlePauseHover(true, pausePenalties.map(p => ({
                        start: p.waveformRange!.start / totalDuration,
                        end: p.waveformRange!.end / totalDuration,
                      })))}
                      onMouseLeave={() => handlePauseHover(false, [])}
                    >
                      {part}
                    </span>
                  );
                }

                return <span key={i}>{part}</span>;
              })}
        </p>
      </div>

      {/* Detailed Metrics */}
      {data.details.length > 0 && (
            <div className={`${cardClass} p-7`}>
              <h3 className="text-[15px] font-semibold mb-3">Metric components</h3>
              <div className="flex flex-col gap-2.5">
                {data.details.map((detail, i) => {
                  const hasIdealRange = detail.idealMin !== undefined && detail.idealMax !== undefined;
                  const idealScore = hasIdealRange
                    ? calculateIdealRangeScore(detail.value, detail.idealMin!, detail.idealMax!)
                    : null;
                  const rowScoreColor = idealScore !== null ? getIdealRangeScoreColor(idealScore) : undefined;

                  return (
                    <MetricRowCard
                      key={i}
                      isMobile={isMobile}
                      trigger={
                        <button type="button" className="flex items-center justify-between w-full px-4 py-3.5 bg-[#F3F3F7] rounded-xl cursor-pointer transition-colors hover:bg-[#EFEBFA] text-left">
                          <div>
                            <div className="text-sm font-medium">{detail.metric}</div>
                            {hasIdealRange && (
                              <div className="text-xs text-[#71707B] mt-0.5">
                                Ideal {detail.idealMin}–{detail.idealMax} {detail.unit}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">
                              {detail.value.toFixed(1)} {detail.unit}
                            </span>
                            {idealScore !== null && (
                              <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: `${rowScoreColor}1E`, color: rowScoreColor }}
                              >
                                {idealScore.toFixed(1)}/10
                              </span>
                            )}
                          </div>
                        </button>
                      }
                    >
                      {hasIdealRange && (
                        <BellCurveTooltip
                          metric={detail.metric}
                          value={detail.value}
                          idealMin={detail.idealMin!}
                          idealMax={detail.idealMax!}
                          unit={detail.unit}
                        />
                      )}
                    </MetricRowCard>
                  );
                })}
              </div>
            </div>
      )}

      {/* Penalties Section */}
      <div className={`${cardClass} p-7`}>
            <div className="flex items-center gap-2.5 mb-3">
              <TrendingDown className="w-[18px] h-[18px] text-[#DC2626]" />
              <h3 className="text-[15px] font-semibold">
                {data.penalties.length > 0
                  ? `Penalties · −${Math.round(data.penalties.reduce((sum, p) => sum + p.pointsDeducted, 0) * 10) / 10} pts`
                  : "Penalties"}
              </h3>
            </div>
            {data.penalties.length === 0 ? (
              <p className="text-[13.5px] text-[#71707B]">
                No penalties detected for this dimension in your real recording — nice work.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {data.penalties.map((penalty) => {
                  const paddedRange = penalty.waveformRange
                    ? {
                        start: Math.max(0, penalty.waveformRange.start - PENALTY_WAVEFORM_MARGIN_SECONDS),
                        end: Math.min(totalDuration, penalty.waveformRange.end + PENALTY_WAVEFORM_MARGIN_SECONDS),
                      }
                    : null;

                  return (
                    <div key={penalty.id} className="border border-[#EAEAEF] rounded-[13px] p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="text-sm font-medium">{penalty.description}</div>
                          {penalty.timestamp > 0 && (
                            <div className={`text-[12.5px] text-[#71707B] mt-[3px] font-['Geist_Mono',monospace]`}>
                              at {formatTimestamp(penalty.timestamp)}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-[#DC2626] whitespace-nowrap">−{penalty.pointsDeducted} pts</div>
                      </div>

                      {paddedRange && penalty.waveformRange && (
                        <div className="mt-3.5 pt-3.5 border-t border-[#F3F3F7]">
                          <p className="text-xs font-semibold text-[#71707B] mb-1.5">Replay this moment</p>
                          <AudioPlayer
                            source={audioSource}
                            timeWindow={paddedRange}
                            highlights={[
                              {
                                start: penalty.waveformRange.start / totalDuration,
                                end: penalty.waveformRange.end / totalDuration,
                              },
                            ]}
                            compact
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

      {/* Strengths Section */}
      {data.strengths.length > 0 && (
        <div className={`${cardClass} p-7`}>
          <div className="flex items-center gap-2.5 mb-3">
            <TrendingUp className="w-[18px] h-[18px] text-[#059669]" />
            <h3 className="text-[15px] font-semibold">Key strengths</h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {data.strengths.map((strength) => (
              <div key={strength.id} className="flex items-center border border-[#E1EFE7] bg-[#F6FBF8] rounded-xl px-4 py-3.5">
                <div className="text-sm font-medium flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#059669] shrink-0" /> {strength.description}
                </div>
                {strength.pointsAdded !== undefined && (
                  <div className="text-sm font-semibold text-[#059669] ml-auto">+{strength.pointsAdded} pts</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Foot actions */}
      <div className="flex gap-3.5">
        <button
          onClick={onBack}
          className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-xl py-[14px] border border-[#EAEAEF] bg-white text-[#3B3A44] transition-colors hover:border-[#D6D6DE] hover:bg-[#FCFCFD]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to overview
        </button>
        <button className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-xl py-[14px] text-white bg-[#17161B] hover:bg-black transition-colors">
          Practice {metric} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

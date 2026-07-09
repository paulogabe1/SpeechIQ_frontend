import type { AnalysisResult, MetricCategory } from "./analysisResult";

/**
 * Real-value-driven feedback description for a single metric, shared by the
 * analysis page's bell-curve panel (SpeechMetrics) and the per-metric drill-down
 * modal (MetricBreakdown), so the two never drift out of sync with each other.
 * Falls back to illustrative values when no real result is available.
 */
export function getMetricFeedback(metric: MetricCategory | string, result?: AnalysisResult): string {
  const wpm = result?.speechMetrics.speechRateWpm ?? 152.0;
  const pauseCount = result?.pauseMetrics.pauseCount ?? 12;
  const avgPause = result?.pauseMetrics.avgPauseDuration ?? 2.3;
  const fillers = result?.speechMetrics.fillers ?? {};
  const wordCount = result?.speechMetrics.wordCount ?? 100;
  const uniqueWordCount = result?.speechMetrics.uniqueWordCount ?? 70;
  const avgWordsPerSeg = result?.speechMetrics.averageWordsPerSegment ?? 8.0;

  switch (metric) {
    case "Fluency":
      return `You spoke at ${Math.round(wpm)} WPM with ${pauseCount} pauses detected (avg ${avgPause.toFixed(1)}s each). Aim for 140-160 WPM and fewer long pauses to improve your fluency score.`;

    case "Pacing": {
      const isTooFast = wpm > 165;
      const isTooSlow = wpm < 125;
      return isTooFast
        ? `You spoke at ${Math.round(wpm)} WPM — slightly too fast. Aim for 125-165 WPM for comfortable listening.`
        : isTooSlow
        ? `You spoke at ${Math.round(wpm)} WPM — a little slow. Pick up the pace slightly toward 125-165 WPM.`
        : `Your pacing is within the ideal 125-165 WPM range at ${Math.round(wpm)} WPM — well done.`;
    }

    case "Clarity": {
      const isFragmented = avgWordsPerSeg < 5.0;
      return isFragmented
        ? `Speech is fragmented — avg ${avgWordsPerSeg.toFixed(1)} words/segment signals stop-start delivery. Aim for 10+ words before pausing.`
        : `Good coherence — you average ${avgWordsPerSeg.toFixed(1)} words per speech segment.`;
    }

    case "Confidence": {
      const totalFillers = Object.values(fillers).reduce((sum, count) => sum + count, 0);
      const fillerRate = wordCount > 0 ? (totalFillers / wordCount) * 100 : 0;
      return totalFillers === 0
        ? "No filler words detected — excellent, confident delivery."
        : `You used ${totalFillers} filler word${totalFillers === 1 ? "" : "s"} (${fillerRate.toFixed(1)}/100 words). Replace each with a deliberate pause.`;
    }

    case "Vocabulary": {
      const ttr = wordCount > 0 ? uniqueWordCount / wordCount : 0;
      const ttrPct = (ttr * 100).toFixed(1);
      return wordCount < 20
        ? `Not enough speech (${wordCount} words) for reliable vocabulary analysis. Aim for at least 30 seconds.`
        : ttr >= 0.6
        ? `Strong vocabulary variety — ${ttrPct}% of your words are unique.`
        : ttr >= 0.4
        ? `Moderate vocabulary variety (${ttrPct}% unique). Try varying your word choices more.`
        : `Low vocabulary variety (${ttrPct}% unique words). Repeated words reduce engagement.`;
    }

    default:
      return "Analysis complete.";
  }
}

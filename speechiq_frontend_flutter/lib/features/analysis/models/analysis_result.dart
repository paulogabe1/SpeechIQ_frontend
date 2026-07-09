import 'dart:math';

// ── Public model ──────────────────────────────────────────────────────────────

class AnalysisResult {
  final int overallScore;
  final MetricScore fluency;
  final MetricScore pacing;
  final MetricScore clarity;
  final MetricScore confidence;
  final MetricScore vocabulary;
  final MetricScore pronunciation;

  // API feedback — list of prioritised, specific improvement tips
  final List<String> feedback;

  // Real API fields
  final String transcript;
  final List<TranscriptSegment> segments;
  final double duration;
  final PauseMetrics pauseMetrics;
  final SpeechMetrics speechMetrics;
  final List<TimelineSegment> timeline;

  AnalysisResult({
    required this.overallScore,
    required this.fluency,
    required this.pacing,
    required this.clarity,
    required this.confidence,
    required this.vocabulary,
    required this.pronunciation,
    List<String>? feedback,
    this.transcript = '',
    this.segments = const [],
    this.duration = 0,
    PauseMetrics? pauseMetrics,
    SpeechMetrics? speechMetrics,
    this.timeline = const [],
  })  : feedback = feedback ?? const [],
        pauseMetrics = pauseMetrics ?? PauseMetrics.empty(),
        speechMetrics = speechMetrics ?? SpeechMetrics.empty();

  /// Parses both shapes the API can return:
  ///   Full response  → {"file": "...", "analysis": { ... }}
  ///   Bare analysis  → { "transcript": ..., "scores": ..., ... }
  factory AnalysisResult.fromJson(Map<String, dynamic> json) {
    final a = json.containsKey('analysis')
        ? json['analysis'] as Map<String, dynamic>
        : json;

    final rawScores = a['scores'] as Map<String, dynamic>? ?? {};

    int clamp(num v) => v.toDouble().clamp(0.0, 100.0).round();
    int potential(int score) => min(score + 12, 100);
    double toDouble(dynamic v) => (v as num? ?? 0).toDouble();

    final fluencyScore      = clamp(toDouble(rawScores['fluency']));
    final pacingScore       = clamp(toDouble(rawScores['pacing']));
    final clarityScore      = clamp(toDouble(rawScores['clarity']));
    final confidenceScore   = clamp(toDouble(rawScores['confidence']));
    final vocabularyScore   = clamp(toDouble(rawScores['vocabulary']));
    final pronunciationScore= clamp(toDouble(rawScores['pronunciation']));
    final overallScore      = clamp(toDouble(rawScores['overall']));

    final pausesMap = a['pauses'] as Map<String, dynamic>? ?? {};
    final pm = PauseMetrics.fromJson(
        pausesMap['metrics'] as Map<String, dynamic>? ?? {});
    final sm = SpeechMetrics.fromJson(
        a['speech'] as Map<String, dynamic>? ?? {});

    // Prefer the API's feedback list; fall back to local builder
    final rawFeedback = a['feedback'];
    final List<String> feedbackList = rawFeedback is List && rawFeedback.isNotEmpty
        ? rawFeedback.map((e) => e.toString()).toList()
        : _buildFeedback(fluencyScore, pacingScore, clarityScore, pm, sm);

    return AnalysisResult(
      overallScore:  overallScore,
      fluency:       MetricScore(score: fluencyScore,      potential: potential(fluencyScore)),
      pacing:        MetricScore(score: pacingScore,       potential: potential(pacingScore)),
      clarity:       MetricScore(score: clarityScore,      potential: potential(clarityScore)),
      confidence:    MetricScore(score: confidenceScore,   potential: potential(confidenceScore)),
      vocabulary:    MetricScore(score: vocabularyScore,   potential: potential(vocabularyScore)),
      pronunciation: MetricScore(score: pronunciationScore,potential: potential(pronunciationScore)),
      feedback:      feedbackList,
      transcript:    a['transcript'] as String? ?? '',
      segments:      (a['segments'] as List<dynamic>? ?? [])
          .map((e) => TranscriptSegment.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      duration:      toDouble(a['duration']),
      pauseMetrics:  pm,
      speechMetrics: sm,
      timeline:      (a['timeline'] as List<dynamic>? ?? [])
          .map((e) => TimelineSegment.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
    );
  }

  static List<String> _buildFeedback(
    int fluency, int pacing, int clarity,
    PauseMetrics pm, SpeechMetrics sm,
  ) {
    final items = <String>[];
    items.add(
      'You spoke at ${sm.speechRateWpm.round()} WPM'
      '${pm.pauseCount > 0 ? ' with ${pm.pauseCount} pauses (avg ${pm.avgPauseDuration.toStringAsFixed(1)}s).' : '.'}',
    );
    if (fluency < 50) {
      items.add('Fluency needs attention — focus on reducing long silences.');
    } else if (pacing < 50) {
      items.add('Work on keeping a steadier speaking pace throughout.');
    } else if (clarity < 50) {
      items.add('Articulation of word endings could be sharper.');
    } else {
      items.add('Good overall delivery — keep practising to build consistency.');
    }
    return items;
  }

  /// Silence segments as 0–1 waveform highlight ranges.
  List<Map<String, double>> get silenceHighlights {
    if (duration <= 0) return [];
    return timeline
        .where((s) => s.type == 'silence')
        .map((s) => {
              'start': (s.start / duration).clamp(0.0, 1.0),
              'end':   (s.end   / duration).clamp(0.0, 1.0),
            })
        .toList();
  }

  /// The lowest-scoring implemented metric (for coaching card).
  String get worstMetric {
    final scores = {
      'Fluency':    fluency.score,
      'Pacing':     pacing.score,
      'Clarity':    clarity.score,
      'Confidence': confidence.score,
      'Vocabulary': vocabulary.score,
    };
    return scores.entries
        .reduce((a, b) => a.value <= b.value ? a : b)
        .key;
  }
}

// ── Sub-models ────────────────────────────────────────────────────────────────

class MetricScore {
  final int score;
  final int potential;
  const MetricScore({required this.score, required this.potential});
}

class TranscriptSegment {
  final int id;
  final double start;
  final double end;
  final String text;

  const TranscriptSegment({
    required this.id,
    required this.start,
    required this.end,
    required this.text,
  });

  factory TranscriptSegment.fromJson(Map<String, dynamic> j) =>
      TranscriptSegment(
        id:    (j['id']    as num? ?? 0).toInt(),
        start: (j['start'] as num? ?? 0).toDouble(),
        end:   (j['end']   as num? ?? 0).toDouble(),
        text:  j['text']   as String? ?? '',
      );
}

class PauseMetrics {
  final double totalSpeechTime;
  final double totalSilenceTime;
  final int pauseCount;
  final double avgPauseDuration;
  final int longPauseCount;   // pauses >= 1 second
  final double pauseRate;     // pauses per minute of speech

  const PauseMetrics({
    required this.totalSpeechTime,
    required this.totalSilenceTime,
    required this.pauseCount,
    required this.avgPauseDuration,
    this.longPauseCount = 0,
    this.pauseRate = 0.0,
  });

  factory PauseMetrics.empty() => const PauseMetrics(
      totalSpeechTime: 0, totalSilenceTime: 0,
      pauseCount: 0, avgPauseDuration: 0);

  factory PauseMetrics.fromJson(Map<String, dynamic> j) => PauseMetrics(
        totalSpeechTime:  (j['total_speech_time']  as num? ?? 0).toDouble(),
        totalSilenceTime: (j['total_silence_time'] as num? ?? 0).toDouble(),
        pauseCount:       (j['pause_count']        as num? ?? 0).toInt(),
        avgPauseDuration: (j['avg_pause_duration'] as num? ?? 0).toDouble(),
        longPauseCount:   (j['long_pause_count']   as num? ?? 0).toInt(),
        pauseRate:        (j['pause_rate']         as num? ?? 0).toDouble(),
      );
}

class SpeechMetrics {
  final int wordCount;
  final int uniqueWordCount;
  final double speechRateWpm;
  final double wordsPerSecond;
  final double speechRatio;
  final double averageWordsPerSegment;
  final Map<String, int> fillers;

  const SpeechMetrics({
    required this.wordCount,
    required this.uniqueWordCount,
    required this.speechRateWpm,
    required this.wordsPerSecond,
    required this.speechRatio,
    required this.averageWordsPerSegment,
    required this.fillers,
  });

  int get totalFillers => fillers.values.fold(0, (s, v) => s + v);
  double get fillerRatePer100 =>
      wordCount > 0 ? totalFillers / wordCount * 100 : 0;
  double get typeTokenRatio =>
      wordCount > 0 ? uniqueWordCount / wordCount : 0;

  factory SpeechMetrics.empty() => const SpeechMetrics(
      wordCount: 0, uniqueWordCount: 0, speechRateWpm: 0,
      wordsPerSecond: 0, speechRatio: 0,
      averageWordsPerSegment: 0, fillers: {});

  factory SpeechMetrics.fromJson(Map<String, dynamic> j) => SpeechMetrics(
        wordCount:              (j['word_count']            as num? ?? 0).toInt(),
        uniqueWordCount:        (j['unique_word_count']     as num? ?? 0).toInt(),
        speechRateWpm:          (j['speech_rate_wpm']       as num? ?? 0).toDouble(),
        wordsPerSecond:         (j['words_per_second']      as num? ?? 0).toDouble(),
        speechRatio:            (j['speech_ratio']          as num? ?? 0).toDouble(),
        averageWordsPerSegment: (j['avg_words_per_segment'] as num? ?? 0).toDouble(),
        fillers: (j['fillers'] as Map? ?? {}).cast<String, int>(),
      );
}

class TimelineSegment {
  final double start;
  final double end;
  final String type; // 'speech' | 'silence'

  const TimelineSegment({
    required this.start,
    required this.end,
    required this.type,
  });

  factory TimelineSegment.fromJson(Map<String, dynamic> j) => TimelineSegment(
        start: (j['start'] as num).toDouble(),
        end:   (j['end']   as num).toDouble(),
        type:   j['type']  as String,
      );
}

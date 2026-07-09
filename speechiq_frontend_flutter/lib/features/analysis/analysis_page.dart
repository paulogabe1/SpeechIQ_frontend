import 'dart:math';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/primary_button.dart';
import '../../shared/widgets/section_header.dart';
import 'models/analysis_result.dart';
import 'widgets/waveform_widget.dart';

// ── Data models ───────────────────────────────────────────────────────────────

class _Penalty {
  final String description;
  final double timestamp;
  final int pointsDeducted;
  final double waveformPosition;
  const _Penalty(this.description, this.timestamp, this.pointsDeducted,
      this.waveformPosition);
}

class _Strength {
  final String description;
  final int pointsAdded;
  const _Strength(this.description, this.pointsAdded);
}

class _MetricDetail {
  final String metric, unit;
  final double value;
  final double? idealMin, idealMax;
  const _MetricDetail(this.metric, this.value, this.unit,
      {this.idealMin, this.idealMax});
}

class _MetricData {
  final String description;
  final List<_MetricDetail> details;
  final List<_Penalty> penalties;
  final List<_Strength> strengths;
  const _MetricData(
      this.description, this.details, this.penalties, this.strengths);
}

class _Metric {
  final String category, color;
  final int score, potential, penaltyPoints;
  final String improvement;
  const _Metric(this.category, this.score, this.potential, this.color,
      this.improvement, this.penaltyPoints);
}

// ── Static data ───────────────────────────────────────────────────────────────

// const _metrics = [
//   _Metric('Fluency',       87, 95, 'purple', '+5%',  8),
//   _Metric('Pacing',        92, 94, 'blue',   '+8%',  2),
//   _Metric('Clarity',       78, 90, 'green',  '+2%', 12),
//   _Metric('Confidence',    85, 92, 'orange', '+12%', 7),
//   _Metric('Pronunciation', 90, 95, 'pink',   '+3%',  5),
// ];

// List<_Metric> get _metrics => [
//       _Metric(
//         'Fluency',
//         widget.analysis.scores.fluency.score,
//         widget.analysis.scores.fluency.potential,
//         'purple',
//         '',
//         widget.analysis.scores.fluency.potential -
//             widget.analysis.scores.fluency.score,
//       ),
//       _Metric(
//         'Pacing',
//         widget.analysis.scores.pacing.score,
//         widget.analysis.scores.pacing.potential,
//         'blue',
//         '',
//         widget.analysis.scores.pacing.potential -
//             widget.analysis.scores.pacing.score,
//       ),
//       _Metric(
//         'Clarity',
//         widget.analysis.scores.clarity.score,
//         widget.analysis.scores.clarity.potential,
//         'green',
//         '',
//         widget.analysis.scores.clarity.potential -
//             widget.analysis.scores.clarity.score,
//       ),
//       _Metric(
//         'Confidence',
//         widget.analysis.scores.confidence.score,
//         widget.analysis.scores.confidence.potential,
//         'orange',
//         '',
//         widget.analysis.scores.confidence.potential -
//             widget.analysis.scores.confidence.score,
//       ),
//       _Metric(
//         'Pronunciation',
//         widget.analysis.scores.pronunciation.score,
//         widget.analysis.scores.pronunciation.potential,
//         'pink',
//         '',
//         widget.analysis.scores.pronunciation.potential -
//             widget.analysis.scores.pronunciation.score,
//       ),
//     ];

_MetricData _getMetricData(String metric, {AnalysisResult? result}) {
  // Real values for Fluency from the API when available
  final wpm             = result?.speechMetrics.speechRateWpm ?? 152.0;
  final pauseCount      = result?.pauseMetrics.pauseCount ?? 12;
  final avgPause        = result?.pauseMetrics.avgPauseDuration ?? 2.3;
  final pauseRate       = result?.pauseMetrics.pauseRate ?? 10.0;
  final fillers         = result?.speechMetrics.fillers ?? <String, int>{};
  final wordCount       = result?.speechMetrics.wordCount ?? 100;
  final uniqueWordCount = result?.speechMetrics.uniqueWordCount ?? 70;
  final avgWordsPerSeg  = result?.speechMetrics.averageWordsPerSegment ?? 8.0;
  final speechRatio     = result?.speechMetrics.speechRatio ?? 0.6;

  switch (metric) {
    case 'Fluency':
      return _MetricData(
        'You spoke at ${wpm.round()} WPM with $pauseCount pauses detected '
        '(avg ${avgPause.toStringAsFixed(1)}s each). '
        'Aim for 140–160 WPM and fewer long pauses to improve your fluency score.',
        [
          _MetricDetail(
              'Speaking Rate', wpm, 'WPM', idealMin: 140, idealMax: 160),
          _MetricDetail(
              'Pause Count', pauseCount.toDouble(), 'pauses', idealMin: 4, idealMax: 8),
          _MetricDetail(
              'Avg Pause', avgPause, 'seconds', idealMin: 0.5, idealMax: 1.5),
        ],
        [
          _Penalty('Long pause (3.2s)', 15.4, 3, 0.15),
          _Penalty('Long pause (4.1s)', 28.7, 5, 0.29),
          _Penalty('Long pause (2.8s)', 45.2, 2, 0.45),
          _Penalty('Excessive pause frequency', -1, 4, -1),
        ],
        [
          _Strength('Consistent speaking rate in middle sections', 5),
          _Strength('Natural rhythm in storytelling portions', 3),
        ],
      );
    case 'Pacing':
      final isTooFast = wpm > 165;
      final isTooSlow = wpm < 125;
      final wpmDev    = (wpm - 145).abs();
      return _MetricData(
        isTooFast
          ? 'You spoke at \${wpm.round()} WPM — slightly too fast. Aim for 125–165 WPM for comfortable listening.'
          : isTooSlow
            ? 'You spoke at \${wpm.round()} WPM — a little slow. Pick up the pace slightly toward 125–165 WPM.'
            : 'Your pacing is within the ideal 125–165 WPM range at \${wpm.round()} WPM — well done.',
        [
          _MetricDetail('Speaking Rate',     wpm,         'WPM',   idealMin: 125, idealMax: 165),
          _MetricDetail('Rate Deviation',    wpmDev,      'WPM',   idealMin: 0,   idealMax: 20),
          _MetricDetail('Avg Words/Segment', avgWordsPerSeg, 'words', idealMin: 10, idealMax: 20),
        ],
        isTooFast
          ? [_Penalty('Rate above ideal (\${wpm.round()} WPM)', -1, wpmDev.round().clamp(0, 15), -1)]
          : isTooSlow
            ? [_Penalty('Rate below ideal (\${wpm.round()} WPM)', -1, wpmDev.round().clamp(0, 15), -1)]
            : [],
        (!isTooFast && !isTooSlow)
          ? [_Strength('Speaking rate within ideal range', 8), _Strength('Consistent tempo maintained', 5)]
          : [],
      );
    case 'Clarity':
      final isFragmented = avgWordsPerSeg < 5.0;
      return _MetricData(
        isFragmented
          ? 'Speech is fragmented — avg \${avgWordsPerSeg.toStringAsFixed(1)} words/segment signals stop-start delivery. Aim for 10+ words before pausing.'
          : 'Good coherence — you average \${avgWordsPerSeg.toStringAsFixed(1)} words per speech segment.',
        [
          _MetricDetail('Avg Words/Segment', avgWordsPerSeg,   'words', idealMin: 10, idealMax: 20),
          _MetricDetail('Speech Ratio',      speechRatio * 100,'%',     idealMin: 50, idealMax: 80),
          _MetricDetail('Pause Count',       pauseCount.toDouble(), 'pauses', idealMin: 0, idealMax: 8),
        ],
        isFragmented ? [_Penalty('Short/fragmented speech segments', -1, 8, -1)] : [],
        isFragmented ? [] : [_Strength('Good segment coherence and delivery flow', 6)],
      );
    case 'Confidence':
      final totalFillers  = fillers.values.fold(0, (s, v) => s + v);
      final fillerRate    = wordCount > 0 ? totalFillers / wordCount * 100 : 0.0;
      final fillerPens    = fillers.entries
          .map((e) => _Penalty("Filler '\${e.key}' ×\${e.value}", -1, (e.value * 2).clamp(0, 10), -1))
          .toList();
      return _MetricData(
        totalFillers == 0
          ? 'No filler words detected — excellent, confident delivery.'
          : 'You used \$totalFillers filler word\${totalFillers == 1 ? "" : "s"} (\${fillerRate.toStringAsFixed(1)}/100 words). Replace each with a deliberate pause.',
        [
          _MetricDetail('Filler Rate', fillerRate,             'per 100 words', idealMin: 0, idealMax: 3),
          _MetricDetail('Pause Rate',  pauseRate,              'pauses/min',    idealMin: 0, idealMax: 10),
          _MetricDetail('Speech Ratio',speechRatio * 100,      '%',             idealMin: 50, idealMax: 80),
        ],
        fillerPens,
        totalFillers == 0 ? [_Strength('Zero filler words — highly assertive delivery', 10)] : [],
      );
    case 'Vocabulary':
      final ttr    = wordCount > 0 ? uniqueWordCount / wordCount : 0.0;
      final ttrPct = (ttr * 100).toStringAsFixed(1);
      return _MetricData(
        wordCount < 20
          ? 'Not enough speech ($wordCount words) for reliable vocabulary analysis. Aim for at least 30 seconds.'
          : ttr >= 0.6
            ? 'Strong vocabulary variety — $ttrPct% of your words are unique.'
            : ttr >= 0.4
              ? 'Moderate vocabulary variety ($ttrPct% unique). Try varying your word choices more.'
              : 'Low vocabulary variety ($ttrPct% unique words). Repeated words reduce engagement.',
        [
          _MetricDetail('Type-Token Ratio', ttr * 100,              '%',     idealMin: 50, idealMax: 80),
          _MetricDetail('Unique Words',     uniqueWordCount.toDouble(),'words'),
          _MetricDetail('Total Words',      wordCount.toDouble(),     'words'),
        ],
        ttr < 0.4 && wordCount >= 20 ? [_Penalty('High word repetition rate', -1, 5, -1)] : [],
        ttr >= 0.6 ? [_Strength('Rich and varied vocabulary', 8)] : [],
      );
    default: // Pronunciation
      return const _MetricData(
        'Excellent pronunciation with clear phoneme articulation. Minor issues with word stress patterns.',
        [
          _MetricDetail('Phoneme Accuracy', 94, '%',
              idealMin: 90, idealMax: 100),
          _MetricDetail('Word Stress Errors', 3, 'words',
              idealMin: 0, idealMax: 2),
          _MetricDetail('Accent Consistency', 92, '%',
              idealMin: 85, idealMax: 100),
        ],
        [
          _Penalty("Incorrect stress: 'detail'", 16.7, 2, 0.17),
          _Penalty("Mispronounced 'nuclear' as 'nucular'", 33.2, 3, 0.33),
        ],
        [
          _Strength('Perfect pronunciation of complex terms', 8),
          _Strength('Clear consonant articulation', 6),
          _Strength('Consistent vowel sounds', 5),
        ],
      );
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

Color _scoreColor(int score) {
  if (score >= 85) return AppColors.green600;
  if (score >= 70) return const Color(0xFFCA8A04);
  return AppColors.orange500;
}

Color _metricColor(_Metric m) {
  switch (m.color) {
    case 'blue':   return AppColors.blue600;
    case 'green':  return AppColors.green600;
    case 'orange': return AppColors.orange500;
    case 'pink':   return const Color(0xFFDB2777);
    case 'teal':   return AppColors.teal600;
    default:       return AppColors.purple600;
  }
}

String _formatTs(double s) {
  final m = s ~/ 60;
  final rem = (s % 60).toStringAsFixed(1).padLeft(4, '0');
  return '$m:$rem';
}

// ── Bell curve painter ────────────────────────────────────────────────────────

class _BellCurvePainter extends CustomPainter {
  final double currentScore, potentialScore;
  _BellCurvePainter(this.currentScore, this.potentialScore);

  double _g(double x, double mean, double std) =>
      exp(-pow(x - mean, 2) / (2 * pow(std, 2)));

  static const double _labelTopPadding = 10;
  static const double _curveTopPadding = 24;

  void _drawLabel(Canvas canvas, Size size, double x, String text, Color color,
      {double y = _labelTopPadding}) {
    final tp = TextPainter(
      text: TextSpan(
        text: text,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w700,
          shadows: const [Shadow(color: Colors.white, blurRadius: 2)],
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();

    final labelX = x.clamp(tp.width / 2 + 4, size.width - tp.width / 2 - 4);
    tp.paint(canvas, Offset(labelX - tp.width / 2, y));
  }

  @override
  void paint(Canvas canvas, Size size) {
    const steps = 200;
    final dx = size.width / steps;

    final fillPath = Path();
    final linePath = Path();

    for (int i = 0; i <= steps; i++) {
      final xVal = i / steps * 100;
      final yVal = _g(xVal, 50, 15);
      final px = i * dx;
      final py =
          _curveTopPadding + (1 - yVal) * (size.height - _curveTopPadding - 10);
      if (i == 0) {
        fillPath.moveTo(px, size.height);
        fillPath.lineTo(px, py);
        linePath.moveTo(px, py);
      } else {
        fillPath.lineTo(px, py);
        linePath.lineTo(px, py);
      }
    }
    fillPath.lineTo(size.width, size.height);
    fillPath.close();

    canvas.drawPath(fillPath,
        Paint()..color = const Color(0xFFE5E7EB).withValues(alpha: 0.6));
    canvas.drawPath(
        linePath,
        Paint()
          ..color = const Color(0xFF9CA3AF)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2);

    // Current score line
    final curX = currentScore / 100 * size.width;
    canvas.drawLine(
        Offset(curX, _curveTopPadding),
        Offset(curX, size.height),
        Paint()
          ..color = _scoreColor(currentScore.round())
          ..strokeWidth = 3);

    final potX = potentialScore / 100 * size.width;
    final scoreLabel = TextPainter(
      text: TextSpan(
          text: 'Score ${currentScore.round()}',
          style: const TextStyle(
              fontSize: 10, fontWeight: FontWeight.w700, color: Colors.black)),
      textDirection: TextDirection.ltr,
    )..layout();
    final potentialLabel = TextPainter(
      text: TextSpan(
          text: 'Potential ${potentialScore.round()}',
          style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: AppColors.purple600)),
      textDirection: TextDirection.ltr,
    )..layout();

    final scoreRect = Rect.fromLTWH(curX - scoreLabel.width / 2,
        _labelTopPadding, scoreLabel.width, scoreLabel.height);
    final potentialRect = Rect.fromLTWH(potX - potentialLabel.width / 2,
        _labelTopPadding, potentialLabel.width, potentialLabel.height);
    final needsShift = scoreRect.overlaps(potentialRect) ||
        (scoreRect.center.dx - potentialRect.center.dx).abs() < 18;
    const scoreY = 6.0;

    _drawLabel(canvas, size, curX, 'Score ${currentScore.round()}',
        _scoreColor(currentScore.round()),
        y: scoreY);

    // Potential dashed line
    double y = _curveTopPadding;
    while (y < size.height) {
      canvas.drawLine(
          Offset(potX, y),
          Offset(potX, min(y + 6, size.height)),
          Paint()
            ..color = AppColors.purple600
            ..strokeWidth = 2.5);
      y += 10;
    }
    final potentialY = needsShift ? -10.0 : 6.0;
    _drawLabel(canvas, size, potX, 'Potential ${potentialScore.round()}',
        AppColors.purple600,
        y: potentialY);
  }

  @override
  bool shouldRepaint(_BellCurvePainter old) =>
      old.currentScore != currentScore || old.potentialScore != potentialScore;
}

// ── Radar painter ─────────────────────────────────────────────────────────────

class _RadarPainter extends CustomPainter {
  final List<double> scores;
  _RadarPainter(this.scores);

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = min(cx, cy) - 20;
    final n = scores.length;
    const labels = ['Fluency', 'Pacing', 'Clarity', 'Conf.', 'Vocab.'];

    final gridPaint = Paint()
      ..color = const Color(0xFFE5E7EB)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    for (int ring = 1; ring <= 4; ring++) {
      final rr = r * ring / 4;
      final pts = List.generate(
          n,
          (i) => Offset(cx + rr * cos(-pi / 2 + i * 2 * pi / n),
              cy + rr * sin(-pi / 2 + i * 2 * pi / n)));
      final path = Path()..moveTo(pts.last.dx, pts.last.dy);
      for (final p in pts) {
        path.lineTo(p.dx, p.dy);
      }
      canvas.drawPath(path, gridPaint);
    }

    for (int i = 0; i < n; i++) {
      final angle = -pi / 2 + i * 2 * pi / n;
      canvas.drawLine(Offset(cx, cy),
          Offset(cx + r * cos(angle), cy + r * sin(angle)), gridPaint);
    }

    final dataPts = List.generate(n, (i) {
      final angle = -pi / 2 + i * 2 * pi / n;
      final rr = r * scores[i] / 100;
      return Offset(cx + rr * cos(angle), cy + rr * sin(angle));
    });
    final fillPath = Path()..moveTo(dataPts.last.dx, dataPts.last.dy);
    for (final p in dataPts) {
      fillPath.lineTo(p.dx, p.dy);
    }
    canvas.drawPath(
        fillPath,
        Paint()
          ..color = AppColors.purple600.withValues(alpha: 0.35)
          ..style = PaintingStyle.fill);
    canvas.drawPath(
        fillPath,
        Paint()
          ..color = AppColors.purple600
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2);
    for (final p in dataPts) {
      canvas.drawCircle(p, 4, Paint()..color = AppColors.purple600);
    }

    final tp = TextPainter(textDirection: TextDirection.ltr);
    for (int i = 0; i < n; i++) {
      final angle = -pi / 2 + i * 2 * pi / n;
      tp.text = TextSpan(
          text: labels[i],
          style: const TextStyle(fontSize: 10, color: Color(0xFF6B7280)));
      tp.layout();
      tp.paint(
          canvas,
          Offset(cx + (r + 18) * cos(angle) - tp.width / 2,
              cy + (r + 18) * sin(angle) - tp.height / 2));
    }
  }

  @override
  bool shouldRepaint(_) => true;
}

// ── Progress chart painter ────────────────────────────────────────────────────

class _ProgressChartPainter extends CustomPainter {
  final List<Map<String, dynamic>> data;
  _ProgressChartPainter(this.data);

  @override
  void paint(Canvas canvas, Size size) {
    const p = EdgeInsets.fromLTRB(30, 10, 10, 30);
    final cW = size.width - p.left - p.right;
    final cH = size.height - p.top - p.bottom;

    final gridPaint = Paint()
      ..color = const Color(0xFFE5E7EB)
      ..strokeWidth = 1;
    for (int i = 0; i <= 4; i++) {
      final y = p.top + cH * i / 4;
      canvas.drawLine(Offset(p.left, y), Offset(p.left + cW, y), gridPaint);
      final tp = TextPainter(
        text: TextSpan(
            text: '${100 - i * 25}',
            style: const TextStyle(fontSize: 9, color: Color(0xFF9CA3AF))),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(0, y - tp.height / 2));
    }

    void drawLine(String key, Color color) {
      final paint = Paint()
        ..color = color
        ..strokeWidth = 3
        ..strokeJoin = StrokeJoin.round
        ..style = PaintingStyle.stroke;
      final path = Path();
      for (int i = 0; i < data.length; i++) {
        final val = data[i][key] as double;
        final x = p.left + i * cW / (data.length - 1);
        final y = p.top + cH * (1 - val / 100);
        i == 0 ? path.moveTo(x, y) : path.lineTo(x, y);
      }
      canvas.drawPath(path, paint);
      for (int i = 0; i < data.length; i++) {
        final val = data[i][key] as double;
        final x = p.left + i * cW / (data.length - 1);
        final y = p.top + cH * (1 - val / 100);
        canvas.drawCircle(Offset(x, y), 4, Paint()..color = color);
      }
    }

    drawLine('fluency', AppColors.purple600);
    drawLine('pacing', AppColors.blue600);
  }

  @override
  bool shouldRepaint(_) => false;
}

// ── Metric breakdown modal ────────────────────────────────────────────────────

class _MetricBreakdownModal extends StatelessWidget {
  final _Metric metric;
  final AnalysisResult? result;
  const _MetricBreakdownModal({required this.metric, this.result});

  @override
  Widget build(BuildContext context) {
    final data = _getMetricData(metric.category, result: result);
    final color = _metricColor(metric);
    final totalDeducted =
        data.penalties.fold(0, (s, p) => s + p.pointsDeducted);
    final totalBonus = data.strengths.fold(0, (s, st) => s + st.pointsAdded);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: AppRadius.lgBr),
      insetPadding: const EdgeInsets.all(AppSpacing.md),
      child: SizedBox(
        width: AppSpacing.maxContentWidth,
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(AppSpacing.sectionGap,
                AppSpacing.md, AppSpacing.md, AppSpacing.md),
            decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB)))),
            child: Row(children: [
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text('${metric.category} Analysis',
                        style: const TextStyle(
                            fontSize: 20, fontWeight: FontWeight.bold)),
                    Text('${metric.score}%',
                        style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: color)),
                  ])),
              IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded)),
            ]),
          ),
          // Body
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.sectionGap),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Waveform
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                            colors: [Color(0xFFF5F3FF), Color(0xFFEFF6FF)]),
                        borderRadius: AppRadius.mdBr,
                        border: Border.all(color: const Color(0xFFDDD6FE)),
                      ),
                      child: Column(children: [
                        Row(children: [
                          const Text('Audio Waveform',
                              style: TextStyle(fontWeight: FontWeight.bold)),
                          const Spacer(),
                          if ((result?.silenceHighlights ?? []).isNotEmpty)
                            Text('red = silence',
                                style: const TextStyle(fontSize: 10, color: Color(0xFFEF4444))),
                        ]),
                        const SizedBox(height: AppSpacing.sm),
                        WaveformWidget(
                          height: 64,
                          highlights: result?.silenceHighlights ?? [],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: _waveformLabels(result?.duration ?? 60)
                              .map((t) => Text(t,
                                  style: const TextStyle(
                                      fontSize: 11, color: Color(0xFF6B7280))))
                              .toList(),
                        ),
                      ]),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    // Feedback
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: AppRadius.mdBr,
                        border: Border.all(color: const Color(0xFFBFDBFE)),
                      ),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('💡 Feedback',
                                style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1E3A5F))),
                            const SizedBox(height: 6),
                            Text(data.description,
                                style: const TextStyle(
                                    color: Color(0xFF1E40AF), height: 1.5)),
                          ]),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    // Metric components
                    if (data.details.isNotEmpty) ...[
                      const Text('Metric Components',
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: AppSpacing.sm),
                      ...data.details.map((d) => Container(
                            margin:
                                const EdgeInsets.only(bottom: AppSpacing.sm),
                            padding: const EdgeInsets.all(AppSpacing.cardGap),
                            decoration: BoxDecoration(
                              color: AppColors.gray50,
                              borderRadius: AppRadius.xsBr,
                              border: Border.all(color: AppColors.gray200),
                            ),
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(d.metric,
                                            style: const TextStyle(
                                                fontWeight: FontWeight.w600)),
                                        Text('${d.value} ${d.unit}',
                                            style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                color: color)),
                                      ]),
                                  if (d.idealMin != null)
                                    Text(
                                        'Ideal: ${d.idealMin}–${d.idealMax} ${d.unit}',
                                        style: const TextStyle(
                                            fontSize: 11,
                                            color: AppColors.gray600)),
                                ]),
                          )),
                    ],
                    // Penalties
                    if (data.penalties.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: AppRadius.mdBr,
                          border: Border.all(color: const Color(0xFFFECACA)),
                        ),
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(children: [
                                const Icon(Icons.trending_down_rounded,
                                    color: Color(0xFFDC2626), size: 18),
                                const SizedBox(width: 6),
                                Text('Penalties ($totalDeducted pts deducted)',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF7F1D1D))),
                              ]),
                              const SizedBox(height: AppSpacing.sm),
                              ...data.penalties.map((pen) => Container(
                                    margin: const EdgeInsets.only(
                                        bottom: AppSpacing.sm),
                                    padding: const EdgeInsets.all(
                                        AppSpacing.cardGap),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: AppRadius.xsBr,
                                      border: Border.all(
                                          color: const Color(0xFFFECACA)),
                                    ),
                                    child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              children: [
                                                Expanded(
                                                    child: Text(pen.description,
                                                        style: const TextStyle(
                                                            fontWeight:
                                                                FontWeight
                                                                    .w500))),
                                                Text(
                                                    '-${pen.pointsDeducted} pts',
                                                    style: const TextStyle(
                                                        color:
                                                            Color(0xFFDC2626),
                                                        fontWeight:
                                                            FontWeight.bold)),
                                              ]),
                                          if (pen.timestamp > 0)
                                            Text(
                                                'at ${_formatTs(pen.timestamp)}',
                                                style: const TextStyle(
                                                    fontSize: 11,
                                                    color: AppColors.gray600)),
                                          if (pen.waveformPosition >= 0) ...[
                                            const SizedBox(
                                                height: AppSpacing.sm),
                                            WaveformWidget(
                                              highlights: [
                                                {
                                                  'start':
                                                      pen.waveformPosition -
                                                          0.05,
                                                  'end': pen.waveformPosition +
                                                      0.05,
                                                }
                                              ],
                                              height: 36,
                                            ),
                                          ],
                                        ]),
                                  )),
                            ]),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                    ],
                    // Strengths
                    if (data.strengths.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0FDF4),
                          borderRadius: AppRadius.mdBr,
                          border: Border.all(color: const Color(0xFFBBF7D0)),
                        ),
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(children: [
                                const Icon(Icons.trending_up_rounded,
                                    color: AppColors.green600, size: 18),
                                const SizedBox(width: 6),
                                Text('Key Strengths (+$totalBonus pts)',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF14532D))),
                              ]),
                              const SizedBox(height: AppSpacing.sm),
                              ...data.strengths.map((s) => Container(
                                    margin: const EdgeInsets.only(bottom: 6),
                                    padding: const EdgeInsets.all(
                                        AppSpacing.cardGap),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: AppRadius.xsBr,
                                      border: Border.all(
                                          color: const Color(0xFFBBF7D0)),
                                    ),
                                    child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                              child: Text(s.description,
                                                  style: const TextStyle(
                                                      fontWeight:
                                                          FontWeight.w500))),
                                          Text('+${s.pointsAdded} pts',
                                              style: const TextStyle(
                                                  color: AppColors.green600,
                                                  fontWeight: FontWeight.bold)),
                                        ]),
                                  )),
                            ]),
                      ),
                  ]),
            ),
          ),
        ]),
      ),
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/// Generates 5 evenly-spaced time labels for the waveform x-axis.
List<String> _waveformLabels(double duration) {
  if (duration <= 0) return ['0:00', '0:15', '0:30', '0:45', '1:00'];
  return List.generate(5, (i) {
    final secs = (duration * i / 4).round();
    final m = secs ~/ 60;
    final s = (secs % 60).toString().padLeft(2, '0');
    return '\$m:\$s';
  });
}

// ── Main page ─────────────────────────────────────────────────────────────────

class AnalysisPage extends StatefulWidget {
  final AnalysisResult analysis;
  final VoidCallback onBack;
  final VoidCallback onRetry;
  const AnalysisPage(
      {super.key,
      required this.analysis,
      required this.onBack,
      required this.onRetry});

  @override
  State<AnalysisPage> createState() => _AnalysisPageState();
}

class _AnalysisPageState extends State<AnalysisPage> {
  _Metric? _selectedMetric;

  List<_Metric> get _metrics => [
        _Metric(
          'Fluency',
          widget.analysis.fluency.score,
          widget.analysis.fluency.potential,
          'purple',
          '',
          widget.analysis.fluency.potential - widget.analysis.fluency.score,
        ),
        _Metric(
          'Pacing',
          widget.analysis.pacing.score,
          widget.analysis.pacing.potential,
          'blue',
          '',
          widget.analysis.pacing.potential - widget.analysis.pacing.score,
        ),
        _Metric(
          'Clarity',
          widget.analysis.clarity.score,
          widget.analysis.clarity.potential,
          'green',
          '',
          widget.analysis.clarity.potential - widget.analysis.clarity.score,
        ),
        _Metric(
          'Confidence',
          widget.analysis.confidence.score,
          widget.analysis.confidence.potential,
          'orange',
          '',
          widget.analysis.confidence.potential -
              widget.analysis.confidence.score,
        ),
        _Metric(
          'Vocabulary',
          widget.analysis.vocabulary.score,
          widget.analysis.vocabulary.potential,
          'teal',
          '',
          widget.analysis.vocabulary.potential -
              widget.analysis.vocabulary.score,
        ),
      ];

  // Use the API's weighted overall score, not a naive metric average
  int get _overallScore => widget.analysis.overallScore;
  int get _overallPotential =>
      (_metrics.fold(0, (s, m) => s + m.potential) / _metrics.length).round();
  int get _displayScore => _selectedMetric?.score ?? _overallScore;
  int get _displayPotential => _selectedMetric?.potential ?? _overallPotential;

  // Historical trend (placeholder) + current session anchored to real scores
  List<Map<String, dynamic>> get _progressData => [
    {'fluency': 65.0, 'pacing': 70.0},
    {'fluency': 68.0, 'pacing': 75.0},
    {'fluency': 72.0, 'pacing': 80.0},
    {'fluency': 78.0, 'pacing': 85.0},
    {'fluency': 82.0, 'pacing': 88.0},
    // Latest point = this session's real scores
    {
      'fluency': widget.analysis.fluency.score.toDouble(),
      'pacing':  widget.analysis.pacing.score.toDouble(),
    },
  ];

  @override
  Widget build(BuildContext context) {
    final score = _overallScore;
    final scoreColor = _scoreColor(score);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(AppSpacing.pagePadding,
          AppSpacing.pagePadding, AppSpacing.pagePadding, AppSpacing.lg),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        // Back
        GestureDetector(
          onTap: widget.onBack,
          child: const Row(children: [
            Icon(Icons.arrow_back_rounded, color: AppColors.gray600),
            SizedBox(width: AppSpacing.sm),
            Text('Back to Dashboard',
                style: TextStyle(color: AppColors.gray600)),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Overall score
        Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: scoreColor.withValues(alpha: 0.08),
            borderRadius: AppRadius.lgBr,
            border:
                Border.all(color: scoreColor.withValues(alpha: 0.4), width: 2),
          ),
          child: Column(children: [
            const Text('Your Overall Score',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: AppSpacing.sm),
            Text('$score',
                style: TextStyle(
                    fontSize: 72,
                    fontWeight: FontWeight.bold,
                    color: scoreColor)),
            Text(
                score >= 85
                    ? 'Excellent! 🎉'
                    : score >= 70
                        ? 'Great Progress! 👏'
                        : 'Keep Practicing! 💪',
                style:
                    const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
            const SizedBox(height: AppSpacing.cardGap),
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md, vertical: AppSpacing.sm),
              decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.7),
                  borderRadius: AppRadius.pillBr),
              child: const Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.trending_up_rounded,
                    color: AppColors.green600, size: 18),
                SizedBox(width: 6),
                Text('+50 XP Earned',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.green600)),
              ]),
            ),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Feedback
        Container(
          padding: const EdgeInsets.all(AppSpacing.sectionGap),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
                colors: [Color(0xFFEFF6FF), Color(0xFFF5F3FF)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight),
            borderRadius: AppRadius.lgBr,
            border: Border.all(color: const Color(0xFFBFDBFE), width: 2),
          ),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('💡 Analysis & Feedback',
                style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E3A5F))),
            const SizedBox(height: AppSpacing.md),
            WhiteCard(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      const Text('Your Speech Waveform',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      const Spacer(),
                      // Red bars = silence from real timeline data
                      if (widget.analysis.silenceHighlights.isNotEmpty)
                        Text('red = silence',
                            style: TextStyle(fontSize: 10, color: AppColors.red500)),
                    ]),
                    const SizedBox(height: AppSpacing.sm),
                    WaveformWidget(
                      height: 80,
                      highlights: widget.analysis.silenceHighlights,
                    ),
                    const SizedBox(height: 6),
                    Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: _waveformLabels(widget.analysis.duration)
                            .map((t) => Text(t,
                                style: const TextStyle(
                                    fontSize: 10, color: Color(0xFF6B7280))))
                            .toList()),
                  ]),
            ),
            const SizedBox(height: AppSpacing.md),
            // API feedback — one bullet per improvement tip
            ...widget.analysis.feedback.map((tip) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('• ', style: TextStyle(color: Color(0xFF1E40AF), fontWeight: FontWeight.bold)),
                Expanded(child: Text(tip,
                    style: const TextStyle(fontSize: 13, color: Color(0xFF1E40AF), height: 1.5))),
              ]),
            )),
            const SizedBox(height: AppSpacing.cardGap),
            // Real transcript from the API
            if (widget.analysis.transcript.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.cardGap),
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.7),
                  borderRadius: AppRadius.xsBr,
                  border: Border.all(color: const Color(0xFFDDD6FE)),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('📝 Transcript',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13,
                          color: Color(0xFF4C1D95))),
                  const SizedBox(height: AppSpacing.sm),
                  Text(widget.analysis.transcript,
                      style: const TextStyle(fontSize: 13, height: 1.5,
                          color: Color(0xFF1E3A5F))),
                  const SizedBox(height: AppSpacing.sm),
                  // Real speech stats row
                  Row(children: [
                    _StatPill('${widget.analysis.speechMetrics.speechRateWpm.round()} WPM'),
                    const SizedBox(width: AppSpacing.sm),
                    _StatPill('${widget.analysis.speechMetrics.wordCount} words'),
                    const SizedBox(width: AppSpacing.sm),
                    _StatPill('${widget.analysis.pauseMetrics.pauseCount} pauses'),
                    const SizedBox(width: AppSpacing.sm),
                    _StatPill('${widget.analysis.duration.toStringAsFixed(1)}s'),
                  ]),
                ]),
              ),
            Builder(builder: (context) {
              // Derive what's working vs focus areas from real scores
              final tips = <String, String>{
                'Fluency':    'Smooth, connected delivery',
                'Pacing':     'Speaking rate and consistency',
                'Clarity':    'Coherent, complete sentences',
                'Confidence': 'Assertive tone, minimal fillers',
                'Vocabulary': 'Varied and rich word choice',
              };
              final working = _metrics
                  .where((m) => m.score >= 70)
                  .map((m) => tips[m.category] ?? m.category)
                  .toList();
              final focus = _metrics
                  .where((m) => m.score < 70)
                  .map((m) => '${m.category}: ${m.score}% — aim for 70%+')
                  .toList();
              return Row(children: [
                Expanded(child: _FeedbackBox(
                  emoji: '✅',
                  title: "What's Working",
                  color: const Color(0xFF14532D),
                  bg: const Color(0xFFF0FDF4),
                  border: const Color(0xFFBBF7D0),
                  items: working.isEmpty ? ['Keep practising to build strengths'] : working,
                )),
                const SizedBox(width: AppSpacing.sm),
                Expanded(child: _FeedbackBox(
                  emoji: '⚠️',
                  title: 'Focus Areas',
                  color: const Color(0xFF7C2D12),
                  bg: const Color(0xFFFFF7ED),
                  border: const Color(0xFFFED7AA),
                  items: focus.isEmpty ? ['All metrics look good — maintain consistency'] : focus,
                )),
              ]);
            }),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Coaching recommendation — driven by real worst metric
        _CoachingCard(analysis: widget.analysis),
        const SizedBox(height: AppSpacing.sectionGap),

        // Breakdown + bell curve
        MouseRegion(
          onExit: (_) => setState(() => _selectedMetric = null),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                    flex: 2,
                    child: _MetricBreakdownCard(
                      metrics: _metrics, // ← real scores from widget.analysis
                      onHover: (m) => setState(() => _selectedMetric = m),
                      onExit: () {},
                      onTap: (m) {
                        setState(() => _selectedMetric = m);
                        showDialog(
                          context: context,
                          builder: (_) => _MetricBreakdownModal(metric: m, result: widget.analysis),
                        );
                      },
                      selectedMetric: _selectedMetric,
                    )),
                const SizedBox(width: AppSpacing.cardGap),
                Expanded(
                    flex: 3,
                    child: GestureDetector(
                      onTap: _selectedMetric == null
                          ? null
                          : () => showDialog(
                                context: context,
                                builder: (_) => _MetricBreakdownModal(
                                    metric: _selectedMetric!, result: widget.analysis),
                              ),
                      child: _BellCurveCard(
                        displayScore: _displayScore,
                        displayPotential: _displayPotential,
                        selectedCategory: _selectedMetric?.category,
                        selectedColor: _selectedMetric != null
                            ? _metricColor(_selectedMetric!)
                            : null,
                        isClickable: _selectedMetric != null,
                        onEnter: () {},
                        onExit: () {},
                      ),
                    )),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Radar
        WhiteCard(
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SectionHeader(title: 'Performance Radar'),
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              height: 220,
              child: CustomPaint(
                painter: _RadarPainter(
                    _metrics.map((m) => m.score.toDouble()).toList()),
                size: const Size.fromHeight(220),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              _legendDot(AppColors.purple600, 'Current'),
              const SizedBox(width: AppSpacing.md),
              _legendDot(
                  AppColors.purple600.withValues(alpha: 0.3), 'Potential'),
            ]),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Progress line chart
        WhiteCard(
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SectionHeader(title: 'Your Progress'),
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              height: 160,
              child: CustomPaint(
                painter: _ProgressChartPainter(_progressData),
                size: const Size.fromHeight(160),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              _legendDot(AppColors.purple600, 'Fluency'),
              const SizedBox(width: AppSpacing.md),
              _legendDot(AppColors.blue600, 'Pacing'),
            ]),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Quick tips
        Container(
          padding: const EdgeInsets.all(AppSpacing.sectionGap),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
                colors: [Color(0xFFF5F3FF), Color(0xFFEFF6FF)]),
            borderRadius: AppRadius.lgBr,
            border: Border.all(color: const Color(0xFFDDD6FE)),
          ),
          child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('🎯 Quick Tips for Next Practice',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF4C1D95))),
                SizedBox(height: AppSpacing.cardGap),
                Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Expanded(
                      child: _TipBox(
                    title: 'Before speaking',
                    tips: [
                      'Take a deep breath and organise your thoughts',
                      'Practise your opening sentence silently first',
                    ],
                  )),
                  SizedBox(width: AppSpacing.sm),
                  Expanded(
                      child: _TipBox(
                    title: 'While speaking',
                    tips: [
                      'Pause between ideas, not mid-sentence',
                      'Finish each word — don\'t drop endings',
                    ],
                  )),
                ]),
              ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Actions
        Row(children: [
          Expanded(
              child: OutlinedButton.icon(
            onPressed: widget.onRetry,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Practice Again'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
              shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBr),
            ),
          )),
          const SizedBox(width: AppSpacing.cardGap),
          Expanded(
              child: PrimaryButton(
            label: 'Back to Dashboard',
            onTap: widget.onBack,
          )),
        ]),
      ]),
    );
  }

  Widget _legendDot(Color color, String label) =>
      Row(mainAxisSize: MainAxisSize.min, children: [
        Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 5),
        Text(label,
            style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280))),
      ]);
}

// ── Sub-widgets (private to this file) ───────────────────────────────────────

class _FeedbackBox extends StatelessWidget {
  final String emoji, title;
  final Color color, bg, border;
  final List<String> items;
  const _FeedbackBox(
      {required this.emoji,
      required this.title,
      required this.color,
      required this.bg,
      required this.border,
      required this.items});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(AppSpacing.cardGap),
        decoration: BoxDecoration(
            color: bg,
            borderRadius: AppRadius.xsBr,
            border: Border.all(color: border)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('$emoji $title',
              style: TextStyle(
                  fontWeight: FontWeight.bold, fontSize: 13, color: color)),
          const SizedBox(height: 6),
          ...items.map((t) => Padding(
              padding: const EdgeInsets.only(bottom: 3),
              child:
                  Text('• $t', style: TextStyle(fontSize: 12, color: color)))),
        ]),
      );
}

class _CoachingCard extends StatelessWidget {
  final AnalysisResult analysis;
  const _CoachingCard({required this.analysis});

  static const _moduleMap = {
    'Fluency':    ('Pacing & Rhythm Module',      'Focuses on reducing long pauses and building connected speech flow.'),
    'Pacing':     ('Pacing & Rhythm Module',      'Trains you to speak at a consistent, comfortable rate.'),
    'Clarity':    ('Articulation Basics',          'Builds complete sentence delivery and reduces fragmented speech.'),
    'Confidence': ('Vocal Confidence Module',      'Eliminates filler words and builds assertive, deliberate delivery.'),
    'Vocabulary': ('Advanced Fluency Module',      'Expands lexical range and reduces word repetition.'),
  };

  @override
  Widget build(BuildContext context) {
    final worst  = analysis.worstMetric;
    final info   = _moduleMap[worst] ?? _moduleMap['Fluency']!;
    final module = info.$1;
    final desc   = info.$2;

    // Derive coaching stats from real data
    final longPauses   = analysis.pauseMetrics.longPauseCount;
    final gainPts      = analysis.vocabulary.potential - analysis.vocabulary.score;
    final targetPauses = (longPauses / 2).ceil();

    return Container(
      padding: const EdgeInsets.all(AppSpacing.sectionGap),
      decoration: BoxDecoration(
        gradient: AppColors.gradientPurpleBlue,
        borderRadius: AppRadius.lgBr,
        border: Border.all(color: AppColors.purple500, width: 2),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Row(children: [
          Icon(Icons.track_changes_rounded, color: Color(0xFFFDE047), size: 28),
          SizedBox(width: AppSpacing.sm),
          Text('What to Practice Next',
              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
        ]),
        const SizedBox(height: AppSpacing.md),
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: AppRadius.mdBr),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(module,
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text(desc,
                style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 13)),
            const SizedBox(height: AppSpacing.md),
            Row(children: [
              for (final s in [
                ('Lowest Score', '$worst'),
                ('Target', '70%+'),
                ('Potential Gain', '+${gainPts}pts'),
              ])
                Expanded(child: Container(
                  margin: const EdgeInsets.only(right: AppSpacing.sm),
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      borderRadius: AppRadius.xsBr),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(s.$1, style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 10)),
                    Text(s.$2, style: TextStyle(
                        color: s.$1 == 'Potential Gain' ? const Color(0xFF6EE7B7) : Colors.white,
                        fontSize: 14, fontWeight: FontWeight.bold)),
                  ]),
                )),
            ]),
            const SizedBox(height: AppSpacing.cardGap),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.purple600,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: AppRadius.xsBr),
                ),
                child: const Text('Go to Learning Module'),
              ),
            ),
          ]),
        ),
      ]),
    );
  }
}

class _MetricBreakdownCard extends StatelessWidget {
  final List<_Metric> metrics; // ← passed from state, uses real API scores
  final void Function(_Metric) onHover;
  final VoidCallback onExit;
  final void Function(_Metric) onTap;
  final _Metric? selectedMetric;
  const _MetricBreakdownCard(
      {required this.metrics,
      required this.onHover,
      required this.onExit,
      required this.onTap,
      this.selectedMetric});

  @override
  Widget build(BuildContext context) {
    return WhiteCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Detailed Breakdown',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const Text('Tap for full analysis',
            style: TextStyle(fontSize: 11, color: AppColors.gray600)),
        const SizedBox(height: AppSpacing.cardGap),
        ...metrics.map((m) {
          final color = _metricColor(m);
          return GestureDetector(
            onTap: () => onTap(m),
            child: MouseRegion(
              onEnter: (_) => onHover(m),
              onExit: (_) => onExit(),
              child: Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                padding: const EdgeInsets.all(AppSpacing.cardGap),
                decoration: BoxDecoration(
                  color: AppColors.gray50,
                  borderRadius: AppRadius.xsBr,
                  border: Border.all(color: AppColors.gray200),
                ),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [
                        Expanded(
                            child: Row(children: [
                          Text(m.category,
                              style:
                                  const TextStyle(fontWeight: FontWeight.w600)),
                          const Icon(Icons.chevron_right_rounded,
                              size: 16, color: Color(0xFF9CA3AF)),
                        ])),
                        Text('${m.score}%',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: _scoreColor(m.score))),
                        const SizedBox(width: 6),
                        Text('+${m.potential - m.score}',
                            style: const TextStyle(
                                fontSize: 11, color: AppColors.purple600)),
                      ]),
                      const SizedBox(height: 6),
                      Stack(children: [
                        ClipRRect(
                            borderRadius: AppRadius.pillBr,
                            child: LinearProgressIndicator(
                              value: m.potential / 100,
                              minHeight: 8,
                              backgroundColor: AppColors.gray100,
                              valueColor: AlwaysStoppedAnimation(
                                  AppColors.purple600.withValues(alpha: 0.25)),
                            )),
                        ClipRRect(
                            borderRadius: AppRadius.pillBr,
                            child: LinearProgressIndicator(
                              value: m.score / 100,
                              minHeight: 8,
                              backgroundColor: Colors.transparent,
                              valueColor: AlwaysStoppedAnimation(color),
                            )),
                      ]),
                      const SizedBox(height: 4),
                      Text(
                          '-${m.penaltyPoints} penalty pts • Potential: ${m.potential}%',
                          style: const TextStyle(
                              fontSize: 10, color: AppColors.gray600)),
                    ]),
              ),
            ),
          );
        }),
      ]),
    );
  }
}

class _BellCurveCard extends StatelessWidget {
  final int displayScore, displayPotential;
  final String? selectedCategory;
  final Color? selectedColor;
  final bool isClickable;
  final VoidCallback? onEnter;
  final VoidCallback? onExit;
  const _BellCurveCard(
      {required this.displayScore,
      required this.displayPotential,
      this.selectedCategory,
      this.selectedColor,
      this.isClickable = false,
      this.onEnter,
      this.onExit});

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => onEnter?.call(),
      onExit: (_) => onExit?.call(),
      child: WhiteCard(
        border: Border.all(
          color: isClickable
              ? (selectedColor ?? AppColors.purple600).withValues(alpha: 0.4)
              : AppColors.gray200,
          width: 2,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.max,
          children: [
            Row(children: [
              Expanded(
                child: Text(
                  selectedCategory != null
                      ? '$selectedCategory Distribution'
                      : 'Overall Performance',
                  style: const TextStyle(
                      fontSize: 14, fontWeight: FontWeight.bold),
                ),
              ),
              const Text('Population bell curve',
                  style: TextStyle(fontSize: 11, color: AppColors.gray600)),
            ]),
            const SizedBox(height: AppSpacing.cardGap),
            SizedBox(
              height: 220,
              child: CustomPaint(
                painter: _BellCurvePainter(
                    displayScore.toDouble(), displayPotential.toDouble()),
                size: const Size.fromHeight(220),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            if (displayPotential > displayScore) ...[
              const SizedBox(height: AppSpacing.sm),
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.purple50,
                  borderRadius: AppRadius.xsBr,
                  border: Border.all(color: const Color(0xFFDDD6FE)),
                ),
                child: Row(children: [
                  const Text('🎯', style: TextStyle(fontSize: 18)),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                      child: Text(
                    '+${displayPotential - displayScore} pts possible by addressing penalties',
                    style: const TextStyle(
                        fontSize: 11, color: AppColors.purple600),
                  )),
                ]),
              ),
            ],
            const Spacer(),
            const SizedBox(height: AppSpacing.sm),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: (selectedColor ?? AppColors.purple600)
                    .withValues(alpha: 0.08),
                borderRadius: AppRadius.xsBr,
                border: Border.all(
                    color: (selectedColor ?? AppColors.purple600)
                        .withValues(alpha: 0.25)),
              ),
              child: Text(
                selectedCategory != null
                    ? 'Focus summary: $selectedCategory is currently driving the score and potential view.'
                    : 'Hover a metric to see its impact and use this summary area for the selected focus.',
                style: TextStyle(
                  fontSize: 11,
                  color: selectedColor ?? AppColors.purple600,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TipBox extends StatelessWidget {
  final String title;
  final List<String> tips;
  const _TipBox({required this.title, required this.tips});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(AppSpacing.cardGap),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.6),
          borderRadius: AppRadius.xsBr,
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title,
              style:
                  const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          const SizedBox(height: 6),
          ...tips.map((t) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text('• $t', style: const TextStyle(fontSize: 12)))),
        ]),
      );
}

class _StatPill extends StatelessWidget {
  final String label;
  const _StatPill(this.label);

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: AppColors.purple100,
      borderRadius: AppRadius.pillBr,
    ),
    child: Text(label,
        style: const TextStyle(
            fontSize: 11,
            color: AppColors.purple600,
            fontWeight: FontWeight.w600)),
  );
}

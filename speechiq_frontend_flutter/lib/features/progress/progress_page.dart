import 'dart:math';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/section_header.dart';
import 'widgets/session_card.dart';

class ProgressPage extends StatefulWidget {
  final VoidCallback onBack;
  const ProgressPage({super.key, required this.onBack});

  @override
  State<ProgressPage> createState() => _ProgressPageState();
}

class _ProgressPageState extends State<ProgressPage> {
  int _selectedFilter = 0; // 0=All, 1=Fluency, 2=Pacing, 3=Clarity

  static const _filters = ['All', 'Fluency', 'Pacing', 'Clarity'];

  static const _sessions = [
    (date: 'Today, 2:30 PM',       title: 'Articulation Practice', score: 85, dur: 45,  xp: '+50 XP'),
    (date: 'Yesterday, 10:15 AM',  title: 'Fluency Session',       score: 78, dur: 60,  xp: '+60 XP'),
    (date: 'Dec 5, 4:00 PM',       title: 'Pacing Exercise',       score: 92, dur: 30,  xp: '+30 XP'),
    (date: 'Dec 4, 9:00 AM',       title: 'Confidence Building',   score: 70, dur: 55,  xp: '+55 XP'),
    (date: 'Dec 3, 3:45 PM',       title: 'Clarity Focus',         score: 88, dur: 40,  xp: '+40 XP'),
    (date: 'Dec 2, 11:30 AM',      title: 'General Practice',      score: 82, dur: 50,  xp: '+50 XP'),
  ];

  // Score trend data for the chart
  static const _chartData = [
    {'label': 'Week 1', 'score': 68.0},
    {'label': 'Week 2', 'score': 72.0},
    {'label': 'Week 3', 'score': 76.0},
    {'label': 'Week 4', 'score': 79.0},
    {'label': 'Week 5', 'score': 83.0},
    {'label': 'Week 6', 'score': 87.0},
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.pagePadding, AppSpacing.pagePadding,
          AppSpacing.pagePadding, AppSpacing.lg),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        GestureDetector(
          onTap: widget.onBack,
          child: const Row(children: [
            Icon(Icons.arrow_back_rounded, color: AppColors.gray600),
            SizedBox(width: AppSpacing.sm),
            Text('Back', style: TextStyle(color: AppColors.gray600)),
          ]),
        ),
        const SizedBox(height: AppSpacing.md),

        // Header banner
        Container(
          padding: const EdgeInsets.all(AppSpacing.sectionGap),
          decoration: BoxDecoration(
            gradient: AppColors.gradientPurpleBlue,
            borderRadius: AppRadius.lgBr,
          ),
          child: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Icon(Icons.history_rounded, color: Colors.white, size: 26),
              SizedBox(width: AppSpacing.sm),
              Text('Practice History',
                  style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            ]),
            SizedBox(height: AppSpacing.md),
            Row(children: [
              _HeaderStat('47', 'Sessions', Icons.mic_rounded),
              SizedBox(width: AppSpacing.sm),
              _HeaderStat('82', 'Avg Score', Icons.bar_chart_rounded),
              SizedBox(width: AppSpacing.sm),
              _HeaderStat('12.5h', 'Total Time', Icons.timer_rounded),
              SizedBox(width: AppSpacing.sm),
              _HeaderStat('2,450', 'Total XP', Icons.bolt_rounded),
            ]),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Score trend chart
        WhiteCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SectionHeader(
              title: 'Score Trend',
              icon: Icons.trending_up_rounded,
              iconColor: AppColors.green600,
            ),
            const SizedBox(height: 4),
            const Text('+19 points over 6 weeks',
                style: TextStyle(fontSize: 12, color: AppColors.green600, fontWeight: FontWeight.w600)),
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              height: 140,
              child: CustomPaint(
                painter: _TrendChartPainter(_chartData),
                size: const Size.fromHeight(140),
              ),
            ),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Metric highlights
        const Row(children: [
          Expanded(child: _MetricHighlight(
            label: 'Best Metric', value: 'Pacing', score: 92,
            color: AppColors.blue600, bg: Color(0xFFEFF6FF),
            border: Color(0xFFBFDBFE), icon: '⏱️',
          )),
          SizedBox(width: AppSpacing.cardGap),
          Expanded(child: _MetricHighlight(
            label: 'Needs Work', value: 'Clarity', score: 78,
            color: AppColors.orange500, bg: Color(0xFFFFF7ED),
            border: Color(0xFFFED7AA), icon: '🎯',
          )),
        ]),
        const SizedBox(height: AppSpacing.sectionGap),

        // Filter tabs + session list
        WhiteCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SectionHeader(title: 'Sessions'),
            const SizedBox(height: AppSpacing.cardGap),
            // Filter chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: List.generate(_filters.length, (i) {
                final isSelected = _selectedFilter == i;
                return GestureDetector(
                  onTap: () => setState(() => _selectedFilter = i),
                  child: Container(
                    margin: const EdgeInsets.only(right: AppSpacing.sm),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.purple600 : AppColors.gray100,
                      borderRadius: AppRadius.pillBr,
                    ),
                    child: Text(_filters[i],
                        style: TextStyle(
                            color: isSelected ? Colors.white : AppColors.gray600,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            fontSize: 13)),
                  ),
                );
              })),
            ),
            const SizedBox(height: AppSpacing.md),
            ..._sessions.map((s) => SessionCard(
              date: s.date, title: s.title,
              score: s.score, durationSec: s.dur, xp: s.xp,
            )),
          ]),
        ),
      ]),
    );
  }
}

class _HeaderStat extends StatelessWidget {
  final String value, label;
  final IconData icon;
  const _HeaderStat(this.value, this.label, this.icon);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.sm),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.15),
          borderRadius: AppRadius.xsBr,
        ),
        child: Column(children: [
          Icon(icon, color: Colors.white, size: 18),
          const SizedBox(height: 4),
          Text(value,
              style: const TextStyle(
                  color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
          Text(label,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 10)),
        ]),
      ),
    );
  }
}

class _MetricHighlight extends StatelessWidget {
  final String label, value, icon;
  final int score;
  final Color color, bg, border;
  const _MetricHighlight({
    required this.label, required this.value, required this.score,
    required this.color, required this.bg, required this.border, required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: AppRadius.mdBr,
        border: Border.all(color: border, width: 2),
      ),
      child: Row(children: [
        Text(icon, style: const TextStyle(fontSize: 28)),
        const SizedBox(width: AppSpacing.sm),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.gray600)),
          Text(value,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          Text('$score%',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: color)),
        ])),
      ]),
    );
  }
}

// ── Score trend chart painter ────────────────────────────────────────────────

class _TrendChartPainter extends CustomPainter {
  final List<Map<String, dynamic>> data;
  _TrendChartPainter(this.data);

  @override
  void paint(Canvas canvas, Size size) {
    const pad = EdgeInsets.fromLTRB(36, 8, 16, 28);
    final cW = size.width - pad.left - pad.right;
    final cH = size.height - pad.top - pad.bottom;
    const minVal = 50.0;
    const maxVal = 100.0;

    // Grid
    final gridPaint = Paint()
      ..color = const Color(0xFFE5E7EB)
      ..strokeWidth = 1;
    for (int i = 0; i <= 4; i++) {
      final y = pad.top + cH * i / 4;
      canvas.drawLine(Offset(pad.left, y), Offset(pad.left + cW, y), gridPaint);
      final val = (maxVal - (maxVal - minVal) * i / 4).round();
      final tp = TextPainter(
        text: TextSpan(text: '$val',
            style: const TextStyle(fontSize: 9, color: Color(0xFF9CA3AF))),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(0, y - tp.height / 2));
    }

    // X labels
    for (int i = 0; i < data.length; i++) {
      final x = pad.left + i * cW / (data.length - 1);
      final tp = TextPainter(
        text: TextSpan(text: data[i]['label'],
            style: const TextStyle(fontSize: 8, color: Color(0xFF9CA3AF))),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(x - tp.width / 2, size.height - pad.bottom + 5));
    }

    // Gradient fill
    final pts = List.generate(data.length, (i) {
      final val = data[i]['score'] as double;
      return Offset(
        pad.left + i * cW / (data.length - 1),
        pad.top + cH * (1 - (val - minVal) / (maxVal - minVal)),
      );
    });

    final fillPath = Path()..moveTo(pts.first.dx, pad.top + cH);
    for (final p in pts) {
      fillPath.lineTo(p.dx, p.dy);
    }
    fillPath.lineTo(pts.last.dx, pad.top + cH);
    fillPath.close();

    canvas.drawPath(
      fillPath,
      Paint()
        ..shader = LinearGradient(
          colors: [AppColors.purple600.withValues(alpha: 0.3), AppColors.purple600.withValues(alpha: 0.0)],
          begin: Alignment.topCenter, end: Alignment.bottomCenter,
        ).createShader(Rect.fromLTWH(0, pad.top, size.width, cH)),
    );

    // Line
    final linePath = Path()..moveTo(pts.first.dx, pts.first.dy);
    for (int i = 1; i < pts.length; i++) {
      // Smooth cubic bezier
      final cp1 = Offset((pts[i - 1].dx + pts[i].dx) / 2, pts[i - 1].dy);
      final cp2 = Offset((pts[i - 1].dx + pts[i].dx) / 2, pts[i].dy);
      linePath.cubicTo(cp1.dx, cp1.dy, cp2.dx, cp2.dy, pts[i].dx, pts[i].dy);
    }
    canvas.drawPath(
      linePath,
      Paint()
        ..color = AppColors.purple600
        ..strokeWidth = 3
        ..style = PaintingStyle.stroke
        ..strokeJoin = StrokeJoin.round,
    );

    // Dots
    for (final p in pts) {
      canvas.drawCircle(p, 5, Paint()..color = Colors.white);
      canvas.drawCircle(p, 4, Paint()..color = AppColors.purple600);
    }
  }

  @override
  bool shouldRepaint(_) => false;
}

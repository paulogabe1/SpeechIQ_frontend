import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Renders a speech waveform as a dense bar chart.
/// [highlights] marks ranges (0–1) in red to indicate problem areas.
class WaveformWidget extends StatefulWidget {
  final List<Map<String, double>> highlights;
  final double height;
  final int seed;

  const WaveformWidget({
    super.key,
    this.highlights = const [],
    this.height = 60,
    this.seed = 42,
  });

  @override
  State<WaveformWidget> createState() => _WaveformWidgetState();
}

class _WaveformWidgetState extends State<WaveformWidget> {
  late final List<double> _bars;

  @override
  void initState() {
    super.initState();
    final rng = Random(widget.seed);
    // 150 bars for smooth, high-resolution waveform
    _bars = List.generate(150, (i) {
      final progress = i / 150;
      final base = sin(progress * pi * 6) * 0.4
                 + sin(progress * pi * 2) * 0.3
                 + 0.3;
      return (base + rng.nextDouble() * 0.25).clamp(0.08, 1.0);
    });
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: widget.height,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: List.generate(_bars.length, (i) {
          final pos = i / _bars.length;
          final isHighlighted = widget.highlights.any(
              (h) => pos >= (h['start'] ?? 0) && pos <= (h['end'] ?? 0));
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 0.6),
              child: FractionallySizedBox(
                heightFactor: _bars[i],
                child: Container(
                  decoration: BoxDecoration(
                    color: isHighlighted ? AppColors.red500 : AppColors.purple500,
                    // Rounder bars
                    borderRadius: BorderRadius.circular(5),
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

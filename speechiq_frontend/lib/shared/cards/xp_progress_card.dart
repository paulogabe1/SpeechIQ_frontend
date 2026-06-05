import 'package:flutter/material.dart';

import 'app_card.dart';

class XPProgressCard extends StatelessWidget {
  final int level;
  final double progress;

  const XPProgressCard({
    super.key,
    required this.level,
    required this.progress,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [

          Text(
            "Level $level",
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 16),

          LinearProgressIndicator(
            value: progress,
          ),

          const SizedBox(height: 8),

          Text(
            "${(progress * 100).round()}% Complete",
          ),
        ],
      ),
    );
  }
}
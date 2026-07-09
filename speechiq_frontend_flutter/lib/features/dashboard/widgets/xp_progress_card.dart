import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_radius.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/widgets/app_card.dart';

class XpProgressCard extends StatelessWidget {
  final int level;
  final int currentXP;
  final int nextLevelXP;
  final Animation<double> progressAnimation;

  const XpProgressCard({
    super.key,
    required this.level,
    required this.currentXP,
    required this.nextLevelXP,
    required this.progressAnimation,
  });

  @override
  Widget build(BuildContext context) {
    return GradientCard(
      gradient: AppColors.gradientPurpleBlue,
      border: Border.all(color: AppColors.purple500, width: 2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.emoji_events_rounded,
                  color: Color(0xFFFDE047), size: 32),
              const SizedBox(width: AppSpacing.sm),
              Text('Level $level',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          AnimatedBuilder(
            animation: progressAnimation,
            builder: (_, __) => ClipRRect(
              borderRadius: AppRadius.pillBr,
              child: LinearProgressIndicator(
                value: progressAnimation.value,
                minHeight: 16,
                backgroundColor: Colors.white.withOpacity(0.2),
                valueColor:
                    const AlwaysStoppedAnimation<Color>(Color(0xFFFDE047)),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.cardGap),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('$currentXP / $nextLevelXP XP',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold)),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Next Level',
                      style: TextStyle(
                          color: Colors.white.withOpacity(0.9), fontSize: 12)),
                  Text('${nextLevelXP - currentXP} XP needed',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_radius.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/widgets/app_card.dart';

class AchievementPreview extends StatelessWidget {
  final List<_Achievement> achievements;

  const AchievementPreview({super.key, required this.achievements});

  @override
  Widget build(BuildContext context) {
    return WhiteCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Recent Achievements',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: achievements.map((a) => Expanded(
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                padding: const EdgeInsets.all(AppSpacing.cardGap),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                      colors: [Color(0xFFF9FAFB), Color(0xFFF3F4F6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight),
                  borderRadius: AppRadius.mdBr,
                ),
                child: Column(
                  children: [
                    Text(a.icon, style: const TextStyle(fontSize: 28)),
                    const SizedBox(height: 6),
                    Text(a.title,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                            fontSize: 11, fontWeight: FontWeight.bold)),
                    Text(a.subtitle,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                            fontSize: 10, color: AppColors.gray600)),
                  ],
                ),
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }
}

class _Achievement {
  final String icon, title, subtitle;
  const _Achievement(this.icon, this.title, this.subtitle);
}

// Convenience factory for static list
const kRecentAchievements = [
  _Achievement('🔥', 'Week Warrior', '7 day streak'),
  _Achievement('🎯', 'Perfect Score', '100% fluency'),
  _Achievement('⚡', 'Speed Demon', 'Perfect pacing'),
  _Achievement('🏆', 'Level 10', 'Reached level 10'),
];

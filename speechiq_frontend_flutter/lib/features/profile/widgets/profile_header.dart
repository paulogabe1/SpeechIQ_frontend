import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_radius.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/widgets/app_card.dart';

class ProfileHeader extends StatelessWidget {
  final int level, currentXP, nextLevelXP;

  const ProfileHeader({
    super.key,
    required this.level,
    required this.currentXP,
    required this.nextLevelXP,
  });

  @override
  Widget build(BuildContext context) {
    final progress = currentXP / nextLevelXP;

    return GradientCard(
      gradient: AppColors.gradientPurpleBlue,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Your Profile',
                style: TextStyle(
                    color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold)),
            SizedBox(height: 4),
            Text('Keep up the great work!',
                style: TextStyle(color: Colors.white70, fontSize: 13)),
          ]),
          Container(
            width: 72, height: 72,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.star_rounded, color: Colors.white, size: 40),
          ),
        ]),
        const SizedBox(height: AppSpacing.sectionGap),
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.12),
            borderRadius: AppRadius.mdBr,
          ),
          child: Column(children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Row(children: [
                const Icon(Icons.emoji_events_rounded, color: Colors.white, size: 22),
                const SizedBox(width: AppSpacing.sm),
                Text('Level $level',
                    style: const TextStyle(
                        color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              ]),
              Text('$currentXP / $nextLevelXP XP',
                  style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ]),
            const SizedBox(height: AppSpacing.sm),
            ClipRRect(
              borderRadius: AppRadius.pillBr,
              child: LinearProgressIndicator(
                value: progress, minHeight: 12,
                backgroundColor: Colors.white.withOpacity(0.2),
                valueColor: const AlwaysStoppedAnimation(Colors.white),
              ),
            ),
            const SizedBox(height: 6),
            Align(
              alignment: Alignment.centerLeft,
              child: Text('${nextLevelXP - currentXP} XP to level ${level + 1}',
                  style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ),
          ]),
        ),
      ]),
    );
  }
}

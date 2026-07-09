import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_radius.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/widgets/app_card.dart';

class MissionBanner extends StatelessWidget {
  final String title;
  final int completed;
  final int total;
  final int xpReward;

  const MissionBanner({
    super.key,
    required this.title,
    required this.completed,
    required this.total,
    required this.xpReward,
  });

  @override
  Widget build(BuildContext context) {
    return GradientCard(
      gradient: AppColors.gradientAmberOrange,
      border: Border.all(color: AppColors.amber300, width: 2),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.track_changes_rounded,
                color: Colors.white, size: 30),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Today's Mission",
                    style: TextStyle(color: Colors.white, fontSize: 12)),
                Text(title,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold)),
                Text('Reward: +$xpReward XP',
                    style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.9), fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('$completed/$total',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.bold)),
              Text('Completed',
                  style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.9), fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }
}

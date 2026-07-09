import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_radius.dart';
import '../../../../core/theme/app_spacing.dart';

class GoalCard extends StatelessWidget {
  final String title, description, icon;
  final int current, target;
  final Color color, bgColor, borderColor;

  const GoalCard({
    super.key,
    required this.title,
    required this.description,
    required this.icon,
    required this.current,
    required this.target,
    required this.color,
    required this.bgColor,
    required this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    final progress = (current / target).clamp(0.0, 1.0);
    final isComplete = progress >= 1.0;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.cardGap),
      padding: const EdgeInsets.all(AppSpacing.sectionGap),
      decoration: BoxDecoration(
        gradient: LinearGradient(
            colors: [bgColor, Colors.white],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight),
        borderRadius: AppRadius.lgBr,
        border: Border.all(color: borderColor, width: 2),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 10,
              offset: const Offset(0, 2)),
        ],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Text(icon, style: const TextStyle(fontSize: 36)),
          const SizedBox(width: AppSpacing.cardGap),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              Text(description,
                  style: TextStyle(fontSize: 12, color: AppColors.gray600)),
            ]),
          ),
          if (isComplete)
            const Icon(Icons.check_circle_rounded, color: AppColors.green600, size: 24),
        ]),
        const SizedBox(height: AppSpacing.md),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Progress: $current / $target',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
          Text('${(progress * 100).round()}%',
              style: TextStyle(fontWeight: FontWeight.bold, color: color)),
        ]),
        const SizedBox(height: AppSpacing.sm),
        ClipRRect(
          borderRadius: AppRadius.pillBr,
          child: LinearProgressIndicator(
            value: progress, minHeight: 12,
            backgroundColor: Colors.white.withOpacity(0.6),
            valueColor: AlwaysStoppedAnimation(color),
          ),
        ),
        const SizedBox(height: 6),
        isComplete
            ? const Text('🎉 Goal completed! Claim your reward',
                style: TextStyle(
                    fontSize: 12, color: AppColors.green600, fontWeight: FontWeight.bold))
            : Row(children: [
                Icon(Icons.trending_up_rounded, size: 14, color: AppColors.gray600),
                const SizedBox(width: 4),
                Text('${target - current} more to go!',
                    style: TextStyle(fontSize: 12, color: AppColors.gray600)),
              ]),
      ]),
    );
  }
}

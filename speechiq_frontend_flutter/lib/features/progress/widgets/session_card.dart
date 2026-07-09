import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_radius.dart';
import '../../../../core/theme/app_spacing.dart';

class SessionCard extends StatelessWidget {
  final String date, title, xp;
  final int score, durationSec;

  const SessionCard({
    super.key,
    required this.date,
    required this.title,
    required this.score,
    required this.durationSec,
    required this.xp,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.cardGap),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadius.lgBr,
        border: Border.all(color: AppColors.gray200),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2)),
        ],
      ),
      child: Row(children: [
        // Score badge
        Container(
          width: 52, height: 52,
          decoration: BoxDecoration(
            gradient: AppColors.gradientPurpleBlue,
            borderRadius: AppRadius.mdBr,
          ),
          child: Center(
            child: Text('$score',
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 2),
            Text(date,
                style: TextStyle(fontSize: 12, color: AppColors.gray600)),
            const SizedBox(height: 4),
            Row(children: [
              Icon(Icons.timer_outlined, size: 12, color: AppColors.gray600),
              const SizedBox(width: 4),
              Text('${durationSec}s',
                  style: TextStyle(fontSize: 11, color: AppColors.gray600)),
            ]),
          ]),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.purple100,
            borderRadius: AppRadius.pillBr,
          ),
          child: Text(xp,
              style: const TextStyle(
                  color: AppColors.purple600,
                  fontWeight: FontWeight.bold,
                  fontSize: 12)),
        ),
      ]),
    );
  }
}

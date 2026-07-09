import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_radius.dart';

class DashboardHeader extends StatelessWidget {
  final int streakDays;

  const DashboardHeader({super.key, required this.streakDays});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ShaderMask(
              shaderCallback: (bounds) =>
                  AppColors.gradientPurpleBlue.createShader(bounds),
              child: const Text(
                'SpeechIQ',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Master your speech, one practice at a time',
              style: TextStyle(fontSize: 13, color: AppColors.gray600),
            ),
          ],
        ),
        _StreakChip(days: streakDays),
      ],
    );
  }
}

class _StreakChip extends StatelessWidget {
  final int days;
  const _StreakChip({required this.days});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: AppColors.orange100,
        borderRadius: AppRadius.pillBr,
      ),
      child: Row(
        children: [
          const Icon(Icons.local_fire_department_rounded,
              color: AppColors.orange500, size: 20),
          const SizedBox(width: 6),
          Text(
            '$days day streak',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Color(0xFFC2410C),
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}

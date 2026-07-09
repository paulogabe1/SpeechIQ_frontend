import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_radius.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/widgets/app_card.dart';

class StatisticsGrid extends StatelessWidget {
  const StatisticsGrid({super.key});

  @override
  Widget build(BuildContext context) {
    const stats = [
      _Stat('Total XP',        '14,250', Icons.bolt_rounded,
          Color(0xFFFEF08A), Color(0xFFA16207)),
      _Stat('Longest Streak',  '15 days', Icons.local_fire_department_rounded,
          AppColors.orange100, AppColors.orange500),
      _Stat('Hours Practised', '12.5h',  Icons.access_time_rounded,
          Color(0xFFDBEAFE), AppColors.blue600),
      _Stat('Total Sessions',  '47',     Icons.emoji_events_rounded,
          AppColors.purple100, AppColors.purple600),
    ];

    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: AppSpacing.cardGap,
      crossAxisSpacing: AppSpacing.cardGap,
      childAspectRatio: 1.6,
      children: stats.map(_buildCard).toList(),
    );
  }

  Widget _buildCard(_Stat s) {
    return WhiteCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(color: s.iconBg, shape: BoxShape.circle),
          child: Icon(s.icon, color: s.iconColor, size: 22),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(s.label,
                  style: TextStyle(fontSize: 11, color: AppColors.gray600)),
              Text(s.value,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ]),
    );
  }
}

class _Stat {
  final String label, value;
  final IconData icon;
  final Color iconBg, iconColor;
  const _Stat(this.label, this.value, this.icon, this.iconBg, this.iconColor);
}

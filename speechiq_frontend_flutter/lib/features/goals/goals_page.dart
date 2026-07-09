import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../shared/widgets/app_card.dart';
import 'widgets/goal_card.dart';

class GoalsPage extends StatelessWidget {
  final VoidCallback onBack;
  const GoalsPage({super.key, required this.onBack});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.pagePadding, AppSpacing.pagePadding,
          AppSpacing.pagePadding, AppSpacing.lg),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        GestureDetector(
          onTap: onBack,
          child: Row(children: [
            Icon(Icons.arrow_back_rounded, color: AppColors.gray600),
            const SizedBox(width: AppSpacing.sm),
            Text('Back', style: TextStyle(color: AppColors.gray600)),
          ]),
        ),
        const SizedBox(height: AppSpacing.md),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Row(children: [
            Icon(Icons.track_changes_rounded, color: AppColors.purple600, size: 28),
            SizedBox(width: AppSpacing.sm),
            Text('Your Goals',
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
          ]),
          ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.add_rounded, size: 18),
            label: const Text('New Goal'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.purple600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: AppRadius.xsBr),
            ),
          ),
        ]),
        const SizedBox(height: AppSpacing.sectionGap),

        const Text('Active Goals',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: AppSpacing.cardGap),
        GoalCard(
          title: 'Reach 90 Fluency',
          description: 'Improve your fluency score to 90 or above',
          icon: '🎯', current: 87, target: 90,
          color: AppColors.purple600,
          bgColor: AppColors.purple50,
          borderColor: const Color(0xFFD8B4FE),
        ),
        GoalCard(
          title: '7-Day Streak',
          description: 'Practice every day for 7 days in a row',
          icon: '🔥', current: 5, target: 7,
          color: AppColors.orange500,
          bgColor: const Color(0xFFFFF7ED),
          borderColor: const Color(0xFFFED7AA),
        ),
        GoalCard(
          title: 'Complete 50 Sessions',
          description: 'Reach a total of 50 practice sessions',
          icon: '📊', current: 47, target: 50,
          color: AppColors.blue600,
          bgColor: AppColors.blue50,
          borderColor: const Color(0xFFBFDBFE),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        const Text('Completed Goals',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: AppSpacing.cardGap),
        WhiteCard(
          child: Column(children: [
            _CompletedRow(icon: '🏆', title: 'Reach Level 10',     date: '5 days ago'),
            _CompletedRow(icon: '⚡', title: '100% Pacing Score',  date: '1 week ago'),
            _CompletedRow(icon: '🎓', title: '30 Total Sessions',  date: '2 weeks ago',
                showDivider: false),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        const Text('Suggested Goals',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: AppSpacing.cardGap),
        Wrap(
          spacing: AppSpacing.sm,
          runSpacing: AppSpacing.sm,
          children: const [
            _SuggestedChip(icon: '🎯', label: 'Reach 95 Overall'),
            _SuggestedChip(icon: '🔥', label: '30-Day Streak'),
            _SuggestedChip(icon: '🗣️', label: 'Master Pronunciation'),
            _SuggestedChip(icon: '⏱️', label: 'Practice 20 Hours'),
            _SuggestedChip(icon: '💪', label: 'Build Confidence'),
            _SuggestedChip(icon: '🎤', label: 'Perfect Pacing'),
          ],
        ),
      ]),
    );
  }
}

class _CompletedRow extends StatelessWidget {
  final String icon, title, date;
  final bool showDivider;
  const _CompletedRow({
    required this.icon,
    required this.title,
    required this.date,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
              colors: [Color(0xFFF0FDF4), Color(0xFFECFDF5)]),
          borderRadius: AppRadius.mdBr,
          border: Border.all(color: const Color(0xFFBBF7D0)),
        ),
        child: Row(children: [
          Text(icon, style: const TextStyle(fontSize: 28)),
          const SizedBox(width: AppSpacing.md),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            Text('Completed $date',
                style: TextStyle(fontSize: 12, color: AppColors.gray600)),
          ])),
          const Icon(Icons.check_circle_rounded, color: AppColors.green600, size: 22),
        ]),
      ),
      if (showDivider) const SizedBox(height: AppSpacing.sm),
    ]);
  }
}

class _SuggestedChip extends StatelessWidget {
  final String icon, label;
  const _SuggestedChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadius.pillBr,
        border: Border.all(color: AppColors.gray200),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 4,
              offset: const Offset(0, 1)),
        ],
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Text(icon, style: const TextStyle(fontSize: 14)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
        const SizedBox(width: 6),
        Icon(Icons.add_rounded, color: AppColors.gray600, size: 14),
      ]),
    );
  }
}

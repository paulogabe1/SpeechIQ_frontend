import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/section_header.dart';
import 'widgets/profile_header.dart';
import 'widgets/statistics_card.dart';

class ProfilePage extends StatelessWidget {
  final VoidCallback onBack;
  const ProfilePage({super.key, required this.onBack});

  static const _achievements = [
    _Achievement('🔥', 'Week Warrior',     '7 day streak',         true,  'Today'),
    _Achievement('🎯', 'Perfect Score',    '100% in any metric',   true,  '2 days ago'),
    _Achievement('⚡', 'Speed Demon',      'Perfect pacing score', true,  '3 days ago'),
    _Achievement('🏆', 'Level 10',         'Reached level 10',     true,  '5 days ago'),
    _Achievement('💪', 'Marathon',         'Practise for 1 hour',  true,  '1 week ago'),
    _Achievement('🎓', 'Scholar',          'Complete 50 sessions', false, null),
    _Achievement('🌟', 'Rising Star',      'Improve by 20 points', true,  '2 weeks ago'),
    _Achievement('🔮', 'Consistency King', '30 day streak',        false, null),
    _Achievement('💎', 'Elite Speaker',    'Reach level 20',       false, null),
  ];

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

        const ProfileHeader(level: 12, currentXP: 2450, nextLevelXP: 3000),
        const SizedBox(height: AppSpacing.sectionGap),

        const StatisticsGrid(),
        const SizedBox(height: AppSpacing.sectionGap),

        // Achievements
        WhiteCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SectionHeader(
              title: 'Achievements',
              icon: Icons.emoji_events_rounded,
              iconColor: AppColors.amber400,
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                  color: AppColors.purple100, borderRadius: AppRadius.pillBr),
              child: Text(
                '${_achievements.where((a) => a.earned).length}/${_achievements.length}',
                style: const TextStyle(
                    color: AppColors.purple600,
                    fontWeight: FontWeight.bold,
                    fontSize: 12),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: AppSpacing.sm,
                crossAxisSpacing: AppSpacing.sm,
                childAspectRatio: 0.82,
              ),
              itemCount: _achievements.length,
              itemBuilder: (_, i) => _AchievementBadge(achievement: _achievements[i]),
            ),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Settings section
        WhiteCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SectionHeader(
              title: 'Settings',
              icon: Icons.settings_rounded,
              iconColor: AppColors.gray600,
            ),
            const SizedBox(height: AppSpacing.md),
            _SettingsRow(icon: Icons.notifications_rounded,  label: 'Notifications',     color: AppColors.purple600),
            _SettingsRow(icon: Icons.lock_rounded,           label: 'Privacy',            color: AppColors.blue600),
            _SettingsRow(icon: Icons.star_rounded,           label: 'Subscription',       color: AppColors.amber400),
            _SettingsRow(icon: Icons.help_outline_rounded,   label: 'Help & Support',     color: AppColors.green600, showDivider: false),
          ]),
        ),
      ]),
    );
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _AchievementBadge extends StatelessWidget {
  final _Achievement achievement;
  const _AchievementBadge({super.key, required this.achievement});

  @override
  Widget build(BuildContext context) {
    final a = achievement;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.sm),
      decoration: BoxDecoration(
        gradient: a.earned
            ? const LinearGradient(colors: [Color(0xFFFFFBEB), Color(0xFFFFF7ED)])
            : const LinearGradient(colors: [Color(0xFFF9FAFB), Color(0xFFF3F4F6)]),
        borderRadius: AppRadius.mdBr,
        border: Border.all(
            color: a.earned ? const Color(0xFFFCD34D) : AppColors.gray200,
            width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(a.icon, style: const TextStyle(fontSize: 26)),
          const SizedBox(height: AppSpacing.xs),
          Text(a.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                  fontSize: 11, fontWeight: FontWeight.bold)),
          Text(a.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 10, color: AppColors.gray600)),
          const Spacer(),
          if (a.earned && a.date != null)
            Text('✓ ${a.date}',
                style: const TextStyle(
                    fontSize: 9,
                    color: AppColors.green600,
                    fontWeight: FontWeight.w600))
          else if (!a.earned)
            Text('🔒 Locked',
                style: TextStyle(fontSize: 9, color: AppColors.gray600)),
        ],
      ),
    );
  }
}

class _SettingsRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final bool showDivider;
  const _SettingsRow({
    required this.icon,
    required this.label,
    required this.color,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
        child: Row(children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: AppRadius.xsBr,
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: AppSpacing.cardGap),
          Expanded(
            child: Text(label,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
          ),
          Icon(Icons.chevron_right_rounded, color: AppColors.gray600, size: 20),
        ]),
      ),
      if (showDivider) Divider(height: 1, color: AppColors.gray100),
    ]);
  }
}

class _Achievement {
  final String icon, title, description;
  final bool earned;
  final String? date;
  const _Achievement(this.icon, this.title, this.description, this.earned, this.date);
}

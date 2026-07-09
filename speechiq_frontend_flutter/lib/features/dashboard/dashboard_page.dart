import 'package:flutter/material.dart';
import 'package:speechiq/shared/services/api_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/section_header.dart';
import 'widgets/dashboard_header.dart';
import 'widgets/mission_banner.dart';
import 'widgets/xp_progress_card.dart';
import 'widgets/forecast_card.dart';
import 'widgets/achievement_preview.dart';

class DashboardPage extends StatefulWidget {
  final VoidCallback onStartPractice;
  final VoidCallback onVoiceSynthesis;
  final VoidCallback onViewHistory;
  final VoidCallback? onNavigateToLearn;

  const DashboardPage({
    super.key,
    required this.onStartPractice,
    required this.onVoiceSynthesis,
    required this.onViewHistory,
    this.onNavigateToLearn,
  });

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage>
    with SingleTickerProviderStateMixin {
  static const int _xp = 2450;
  static const int _nextLevelXP = 3000;
  static const int _level = 12;
  static const int _streak = 7;

  late AnimationController _progressController;
  late Animation<double> _progressAnimation;

  @override
  void initState() {
    super.initState();
    _progressController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _progressAnimation = Tween<double>(begin: 0, end: _xp / _nextLevelXP)
        .animate(CurvedAnimation(
            parent: _progressController, curve: Curves.easeOut));
    Future.delayed(
      const Duration(milliseconds: 300),
      () {
        if (mounted) _progressController.forward();
      },
    );
  }

  @override
  void dispose() {
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(AppSpacing.pagePadding,
          AppSpacing.pagePadding, AppSpacing.pagePadding, AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ElevatedButton(
            onPressed: () async {
              try {
                final result = await ApiService().get("/");

                print(result);
              } catch (e) {
                print(e);
              }
            },
            child: const Text("Test Backend"),
          ),
          const DashboardHeader(streakDays: _streak),
          const SizedBox(height: AppSpacing.sectionGap),
          XpProgressCard(
            level: _level,
            currentXP: _xp,
            nextLevelXP: _nextLevelXP,
            progressAnimation: _progressAnimation,
          ),
          const SizedBox(height: AppSpacing.sectionGap),
          const MissionBanner(
              title: 'Record 2 speeches', completed: 1, total: 2, xpReward: 50),
          const SizedBox(height: AppSpacing.sectionGap),
          _MainActions(
            onStartPractice: widget.onStartPractice,
            onVoiceSynthesis: widget.onVoiceSynthesis,
          ),
          const SizedBox(height: AppSpacing.sectionGap),
          _ContinuePracticeCard(onTap: widget.onNavigateToLearn),
          const SizedBox(height: AppSpacing.sectionGap),
          _FocusCard(onStartModule: widget.onNavigateToLearn),
          const SizedBox(height: AppSpacing.sectionGap),
          const ForecastCard(
            currentScore: 82,
            projectedScore: 88,
            weeksAhead: 2,
            improvementLabel: "You're improving faster than last month",
          ),
          const SizedBox(height: AppSpacing.sectionGap),
          _RecentPracticeCard(),
          const SizedBox(height: AppSpacing.sectionGap),
          const AchievementPreview(achievements: kRecentAchievements),
        ],
      ),
    );
  }
}

// ── Inline widgets (small enough to stay in the page file) ───────────────────

class _ContinuePracticeCard extends StatelessWidget {
  final VoidCallback? onTap;
  const _ContinuePracticeCard({this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: WhiteCard(
        border: Border.all(color: const Color(0xFFE9D5FF), width: 2),
        child: Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                gradient: AppColors.gradientPurpleBlue,
                borderRadius: AppRadius.mdBr,
              ),
              child:
                  const Icon(Icons.mic_rounded, color: Colors.white, size: 30),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Continue Practice',
                      style: TextStyle(fontSize: 12, color: AppColors.gray600)),
                  const Text('Articulation',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  RichText(
                    text: const TextSpan(
                      style: TextStyle(fontSize: 13, color: AppColors.gray600),
                      children: [
                        TextSpan(text: 'Last score: '),
                        TextSpan(
                            text: '82',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppColors.purple600)),
                        TextSpan(text: ' • Goal: '),
                        TextSpan(
                            text: '85',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppColors.green600)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const Row(
              children: [
                Text('Resume',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.purple600)),
                SizedBox(width: 4),
                Icon(Icons.arrow_forward_rounded,
                    color: AppColors.purple600, size: 20),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _FocusCard extends StatelessWidget {
  final VoidCallback? onStartModule;
  const _FocusCard({this.onStartModule});

  @override
  Widget build(BuildContext context) {
    return WhiteCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: "Today's Focus",
            icon: Icons.emoji_events_rounded,
            iconColor: AppColors.purple600,
          ),
          const SizedBox(height: AppSpacing.md),
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                  colors: [Color(0xFFF5F3FF), Color(0xFFEFF6FF)]),
              borderRadius: AppRadius.mdBr,
              border: Border.all(color: const Color(0xFFE9D5FF)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Reduce long pauses',
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: AppSpacing.cardGap),
                Row(
                  children: [
                    _focusStat(
                        'Detected', '8 pauses', AppColors.red500, '> 1 second'),
                    _focusStat(
                        'Target', '4 pauses', AppColors.green600, '> 1 second'),
                    _focusStat(
                        'Impact', '+7', AppColors.purple600, 'fluency pts'),
                  ],
                ),
                const SizedBox(height: AppSpacing.cardGap),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: onStartModule,
                    icon: const Icon(Icons.arrow_forward_rounded, size: 18),
                    label: const Text('Start Recommended Module'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.purple600,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape:
                          RoundedRectangleBorder(borderRadius: AppRadius.xsBr),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _focusStat(String label, String value, Color color, String sub) =>
      Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: const TextStyle(fontSize: 11, color: AppColors.gray600)),
            Text(value,
                style: TextStyle(
                    fontSize: 22, fontWeight: FontWeight.bold, color: color)),
            Text(sub,
                style: const TextStyle(fontSize: 10, color: AppColors.gray600)),
          ],
        ),
      );
}

class _MainActions extends StatelessWidget {
  final VoidCallback onStartPractice;
  final VoidCallback onVoiceSynthesis;
  const _MainActions(
      {required this.onStartPractice, required this.onVoiceSynthesis});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ActionCard(
            gradient: AppColors.gradientPurpleBlue,
            icon: Icons.mic_rounded,
            badge: '+50 XP',
            title: 'Start Practice',
            subtitle: 'Record your speech and get instant feedback',
            onTap: onStartPractice,
          ),
        ),
        const SizedBox(width: AppSpacing.sectionGap),
        Expanded(
          child: _ActionCard(
            gradient: AppColors.gradientEmeraldTeal,
            icon: Icons.track_changes_rounded,
            badge: 'Premium',
            title: 'Voice Synthesis',
            subtitle: 'Generate speech with your synthesized voice',
            onTap: onVoiceSynthesis,
          ),
        ),
      ],
    );
  }
}

class _ActionCard extends StatelessWidget {
  final LinearGradient gradient;
  final IconData icon;
  final String badge, title, subtitle;
  final VoidCallback onTap;

  const _ActionCard({
    required this.gradient,
    required this.icon,
    required this.badge,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.sectionGap),
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: AppRadius.lgBr,
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.15),
                blurRadius: 16,
                offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: Colors.white, size: 40),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: AppRadius.pillBr,
                  ),
                  child: Text(badge,
                      style:
                          const TextStyle(color: Colors.white, fontSize: 11)),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(title,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text(subtitle,
                style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.85), fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

class _RecentPracticeCard extends StatelessWidget {
  static const _sessions = [
    (title: 'Articulation Practice', score: 85, xp: '+50 XP', time: '2:30 PM'),
    (title: 'Fluency Session', score: 78, xp: '+60 XP', time: 'Yesterday'),
    (title: 'Pacing Exercise', score: 92, xp: '+30 XP', time: 'Dec 5'),
  ];

  @override
  Widget build(BuildContext context) {
    return WhiteCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Recent Practice',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          Text('View all',
              style: TextStyle(
                  fontSize: 13,
                  color: AppColors.purple600,
                  fontWeight: FontWeight.w600)),
        ]),
        const SizedBox(height: AppSpacing.md),
        ..._sessions.map((s) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.cardGap),
                decoration: BoxDecoration(
                  color: AppColors.gray50,
                  borderRadius: AppRadius.mdBr,
                  border: Border.all(color: AppColors.gray200),
                ),
                child: Row(children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                        gradient: AppColors.gradientPurpleBlue,
                        borderRadius: AppRadius.xsBr),
                    child: Center(
                      child: Text('${s.score}',
                          style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14)),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.cardGap),
                  Expanded(
                      child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(s.title,
                          style: const TextStyle(
                              fontWeight: FontWeight.w600, fontSize: 13)),
                      Text(s.time,
                          style: const TextStyle(
                              fontSize: 11, color: AppColors.gray600)),
                    ],
                  )),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                        color: AppColors.purple100,
                        borderRadius: AppRadius.pillBr),
                    child: Text(s.xp,
                        style: const TextStyle(
                            color: AppColors.purple600,
                            fontWeight: FontWeight.bold,
                            fontSize: 11)),
                  ),
                ]),
              ),
            )),
      ]),
    );
  }
}

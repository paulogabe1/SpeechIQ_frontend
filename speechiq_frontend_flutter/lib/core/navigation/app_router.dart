import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import 'bottom_nav.dart';
import '../../features/dashboard/dashboard_page.dart';
import '../../features/practice/practice_page.dart';
import '../../features/practice/learning_path_page.dart';
import '../../features/goals/goals_page.dart';
import '../../features/progress/progress_page.dart';
import '../../features/voice_lab/voice_lab_page.dart';
import '../../features/profile/profile_page.dart';

class AppRouter extends StatefulWidget {
  const AppRouter({super.key});

  @override
  State<AppRouter> createState() => _AppRouterState();
}

class _AppRouterState extends State<AppRouter> {
  AppView _current = AppView.home;

  bool get _showBottomNav =>
      _current != AppView.practice && _current != AppView.synthesis;

  void _navigate(AppView view) => setState(() => _current = view);

  @override
  Widget build(BuildContext context) {
    return Container(
      // Full-width gradient background
      decoration: const BoxDecoration(gradient: AppColors.backgroundGradient),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: AppSpacing.maxContentWidth),
          child: Scaffold(
            backgroundColor: Colors.transparent,
            body: SafeArea(child: _buildView()),
            bottomNavigationBar: _showBottomNav
                ? BottomNav(currentView: _current, onNavigate: _navigate)
                : null,
          ),
        ),
      ),
    );
  }

  Widget _buildView() {
    switch (_current) {
      case AppView.home:
        return DashboardPage(
          onStartPractice:   () => _navigate(AppView.practice),
          onVoiceSynthesis:  () => _navigate(AppView.synthesis),
          onViewHistory:     () => _navigate(AppView.history),
          onNavigateToLearn: () => _navigate(AppView.learn),
        );
      case AppView.practice:
        return PracticePage(
          onBack:          () => _navigate(AppView.home),
          onAnalysisDone:  () => _navigate(AppView.home),
        );
      case AppView.synthesis:
        return VoiceLabPage(onBack: () => _navigate(AppView.home));
      case AppView.learn:
        return LearningPathPage(onBack: () => _navigate(AppView.home));
      case AppView.goals:
        return GoalsPage(onBack: () => _navigate(AppView.home));
      case AppView.history:
        return ProgressPage(onBack: () => _navigate(AppView.home));
      case AppView.profile:
        return ProfilePage(onBack: () => _navigate(AppView.home));
    }
  }
}

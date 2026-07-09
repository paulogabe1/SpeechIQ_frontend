import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';

// AppView lives here because BottomNav is the only widget that renders it,
// and main.dart already imports this file — no separate app_view.dart needed.
enum AppView { home, practice, synthesis, learn, goals, history, profile }

class BottomNav extends StatelessWidget {
  final AppView currentView;
  final void Function(AppView) onNavigate;

  const BottomNav({
    super.key,
    required this.currentView,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    const items = [
      _NavItem(AppView.home,    Icons.home_rounded,         'Home'),
      _NavItem(AppView.learn,   Icons.menu_book_rounded,    'Learn'),
      _NavItem(AppView.goals,   Icons.track_changes_rounded,'Goals'),
      _NavItem(AppView.history, Icons.history_rounded,      'History'),
      _NavItem(AppView.profile, Icons.person_rounded,       'Profile'),
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(top: BorderSide(color: AppColors.gray200)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 12,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: items.map((item) {
              final isActive = currentView == item.view;
              return GestureDetector(
                onTap: () => onNavigate(item.view),
                behavior: HitTestBehavior.opaque,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.purple100 : Colors.transparent,
                    borderRadius: AppRadius.mdBr,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        item.icon,
                        size: 24,
                        color: isActive ? AppColors.purple600 : AppColors.gray600,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.label,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                          color: isActive ? AppColors.purple600 : AppColors.gray600,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final AppView view;
  final IconData icon;
  final String label;
  const _NavItem(this.view, this.icon, this.label);
}

import 'package:flutter/material.dart';

import '../../features/dashboard/dashboard_page.dart';
import '../../features/practice/practice_page.dart';
import '../../features/progress/progress_page.dart';
import '../../features/achievements/achievements_page.dart';
import '../../features/profile/profile_page.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {

  int currentIndex = 0;

  final pages = const [
    DashboardPage(),
    PracticePage(),
    ProgressPage(),
    AchievementsPage(),
    ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      body: pages[currentIndex],

      bottomNavigationBar: NavigationBar(

        selectedIndex: currentIndex,

        onDestinationSelected: (index) {
          setState(() {
            currentIndex = index;
          });
        },

        destinations: const [

          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            label: "Home",
          ),

          NavigationDestination(
            icon: Icon(Icons.mic_none),
            label: "Practice",
          ),

          NavigationDestination(
            icon: Icon(Icons.show_chart),
            label: "Progress",
          ),

          NavigationDestination(
            icon: Icon(Icons.emoji_events_outlined),
            label: "Awards",
          ),

          NavigationDestination(
            icon: Icon(Icons.person_outline),
            label: "Profile",
          ),
        ],
      ),
    );
  }
}
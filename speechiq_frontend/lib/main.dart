import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'shared/cards/dashboard_page.dart' show DashboardPage;

void main() {
  runApp(const SpeechIQApp());
}

class SpeechIQApp extends StatelessWidget {
  const SpeechIQApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "SpeechIQ",
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const DashboardPage(),
    );
  }
}
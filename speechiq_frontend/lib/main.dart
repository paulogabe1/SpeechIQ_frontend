import 'package:flutter/material.dart';
import 'package:speechiq_frontend/core/navigation/app_shell.dart';

import 'core/theme/app_theme.dart';

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
      home: const AppShell(),
    );
  }
}
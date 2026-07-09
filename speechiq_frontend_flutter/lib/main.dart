import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/navigation/app_router.dart';

void main() => runApp(const SpeechIQApp());

class SpeechIQApp extends StatelessWidget {
  const SpeechIQApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SpeechIQ',
      theme: AppTheme.theme,
      debugShowCheckedModeBanner: false,
      home: const AppRouter(),
    );
  }
}

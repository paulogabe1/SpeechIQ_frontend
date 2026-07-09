import 'package:flutter/material.dart';

class AppColors {
  // ── Primary palette ──────────────────────────────────────────────────────
  static const purple600  = Color(0xFF9333EA);
  static const purple500  = Color(0xFFA855F7);
  static const purple100  = Color(0xFFF3E8FF);
  static const purple50   = Color(0xFFFAF5FF);

  static const blue600    = Color(0xFF2563EB);
  static const blue50     = Color(0xFFEFF6FF);

  // ── Accent palette ───────────────────────────────────────────────────────
  static const orange500  = Color(0xFFF97316);
  static const orange100  = Color(0xFFFFEDD5);
  static const amber400   = Color(0xFFFBBF24);
  static const amber300   = Color(0xFFFCD34D);

  static const green600   = Color(0xFF16A34A);
  static const green50    = Color(0xFFF0FDF4);
  static const emerald500 = Color(0xFF10B981);
  static const teal600    = Color(0xFF0D9488);

  static const red500     = Color(0xFFEF4444);
  static const pink600    = Color(0xFFDB2777);

  // ── Neutral palette ──────────────────────────────────────────────────────
  static const gray50     = Color(0xFFF9FAFB);
  static const gray100    = Color(0xFFF3F4F6);
  static const gray200    = Color(0xFFE5E7EB);
  static const gray600    = Color(0xFF4B5563);
  static const gray900    = Color(0xFF111827);

  // ── Gradients ────────────────────────────────────────────────────────────
  static const gradientPurpleBlue = LinearGradient(
    colors: [purple600, blue600],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const gradientAmberOrange = LinearGradient(
    colors: [amber400, orange500],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const gradientGreen = LinearGradient(
    colors: [Color(0xFF22C55E), emerald500],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const gradientEmeraldTeal = LinearGradient(
    colors: [emerald500, teal600],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const backgroundGradient = LinearGradient(
    colors: [Color(0xFFFAF5FF), Color(0xFFEFF6FF), Color(0xFFF0FDFA)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

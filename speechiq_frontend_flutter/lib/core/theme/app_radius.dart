import 'package:flutter/material.dart';

/// Centralised border-radius scale.
/// Use [AppRadius.sm], [AppRadius.md], etc. instead of magic numbers.
class AppRadius {
  static const double xs     = 8.0;
  static const double sm     = 10.0;
  static const double md     = 14.0;
  static const double lg     = 20.0;
  static const double xl     = 28.0;

  /// Used for pill-shaped chips and badges
  static const double pill   = 999.0;

  // ── BorderRadius shorthands ───────────────────────────────────────────────
  static final BorderRadius xsBr   = BorderRadius.circular(xs);
  static final BorderRadius smBr   = BorderRadius.circular(sm);
  static final BorderRadius mdBr   = BorderRadius.circular(md);
  static final BorderRadius lgBr   = BorderRadius.circular(lg);
  static final BorderRadius xlBr   = BorderRadius.circular(xl);
  static final BorderRadius pillBr = BorderRadius.circular(pill);
}

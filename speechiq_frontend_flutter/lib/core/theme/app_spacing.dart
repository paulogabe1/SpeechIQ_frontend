/// Centralised spacing scale used throughout the app.
/// All padding, margin, and gap values should come from here.
class AppSpacing {
  // ── Base scale ───────────────────────────────────────────────────────────
  static const double xs    = 4.0;
  static const double sm    = 8.0;
  static const double md    = 16.0;
  static const double lg    = 24.0;
  static const double xl    = 32.0;
  static const double xxl   = 48.0;

  // ── Named semantic sizes ─────────────────────────────────────────────────
  /// Outer horizontal/vertical padding for scrollable pages
  static const double pagePadding  = 20.0;

  /// Standard internal padding for cards
  static const double cardPadding  = 24.0;

  /// Vertical gap between sections on a page
  static const double sectionGap   = 16.0;

  /// Gap between stacked cards
  static const double cardGap      = 12.0;

  /// Compact gap for tightly spaced items within a card
  static const double itemGap      = 8.0;

  /// Gap between icon/emoji and label
  static const double iconGap      = 8.0;

  /// Max width for all page content (mobile-frame centering on wide screens)
  static const double maxContentWidth = 1024.0;
}

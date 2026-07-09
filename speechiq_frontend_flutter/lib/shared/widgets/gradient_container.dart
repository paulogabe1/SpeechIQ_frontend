import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';

/// A full-page background gradient wrapper.
class GradientContainer extends StatelessWidget {
  final Widget child;
  final LinearGradient? gradient;

  const GradientContainer({
    super.key,
    required this.child,
    this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: gradient ?? AppColors.backgroundGradient,
      ),
      child: child,
    );
  }
}

/// A coloured pill-shaped badge (e.g. "+50 XP", "Premium").
class BadgeChip extends StatelessWidget {
  final String label;
  final Color backgroundColor;
  final Color textColor;

  const BadgeChip({
    super.key,
    required this.label,
    this.backgroundColor = AppColors.purple100,
    this.textColor = AppColors.purple600,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: AppRadius.pillBr,
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }
}

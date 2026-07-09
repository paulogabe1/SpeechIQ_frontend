import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_radius.dart';
import '../../../../core/theme/app_spacing.dart';

class ForecastCard extends StatelessWidget {
  final int currentScore;
  final int projectedScore;
  final int weeksAhead;
  final String improvementLabel;

  const ForecastCard({
    super.key,
    required this.currentScore,
    required this.projectedScore,
    required this.weeksAhead,
    required this.improvementLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
            colors: [Color(0xFFF0FDF4), Color(0xFFECFDF5)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight),
        borderRadius: AppRadius.lgBr,
        border: Border.all(color: const Color(0xFFBBF7D0), width: 2),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 12,
              offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.trending_up_rounded, color: AppColors.green600, size: 22),
              SizedBox(width: AppSpacing.iconGap),
              Text('Improvement Forecast',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Current Fluency',
                    style: TextStyle(fontSize: 12, color: AppColors.gray600)),
                Text('$currentScore',
                    style: const TextStyle(
                        fontSize: 40, fontWeight: FontWeight.bold)),
              ]),
              const Expanded(
                child: Center(
                  child: Icon(Icons.arrow_forward_rounded,
                      color: AppColors.green600, size: 32),
                ),
              ),
              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('Projected in $weeksAhead weeks',
                    style: TextStyle(fontSize: 12, color: AppColors.gray600)),
                Text('$projectedScore',
                    style: const TextStyle(
                        fontSize: 40,
                        fontWeight: FontWeight.bold,
                        color: AppColors.green600)),
                Text('+${projectedScore - currentScore} points',
                    style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.green600,
                        fontWeight: FontWeight.w600)),
              ]),
            ],
          ),
          const Divider(height: 24, color: Color(0xFFBBF7D0)),
          RichText(
            text: TextSpan(
              style: const TextStyle(fontSize: 13, color: Color(0xFF374151)),
              children: [
                TextSpan(
                    text: improvementLabel,
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                const TextSpan(
                    text: '  +12%',
                    style: TextStyle(
                        color: AppColors.green600, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

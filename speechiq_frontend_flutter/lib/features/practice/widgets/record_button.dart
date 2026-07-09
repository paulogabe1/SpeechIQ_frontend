import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// The large circular mic/stop button at the centre of the practice screen.
class RecordButton extends StatelessWidget {
  final bool isRecording;
  final VoidCallback onTap;

  const RecordButton({
    super.key,
    required this.isRecording,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 120,
        height: 120,
        decoration: BoxDecoration(
          gradient: isRecording
              ? const LinearGradient(
                  colors: [Color(0xFFEF4444), Color(0xFFDC2626)])
              : AppColors.gradientPurpleBlue,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: (isRecording ? Colors.red : AppColors.purple600)
                  .withOpacity(0.4),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Icon(
          isRecording
              ? Icons.stop_circle_rounded
              : Icons.mic_rounded,
          color: Colors.white,
          size: 56,
        ),
      ),
    );
  }
}

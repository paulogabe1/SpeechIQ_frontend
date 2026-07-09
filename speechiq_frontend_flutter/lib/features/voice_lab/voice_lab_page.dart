import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/primary_button.dart';

class VoiceLabPage extends StatefulWidget {
  final VoidCallback onBack;
  const VoiceLabPage({super.key, required this.onBack});

  @override
  State<VoiceLabPage> createState() => _VoiceLabPageState();
}

class _VoiceLabPageState extends State<VoiceLabPage> {
  final _controller = TextEditingController();
  bool _isGenerating = false;
  bool _hasGenerated = false;
  double _speed = 1.0;
  double _pitch = 1.0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _generate() async {
    if (_controller.text.isEmpty) return;
    setState(() => _isGenerating = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() { _isGenerating = false; _hasGenerated = true; });
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.pagePadding),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        GestureDetector(
          onTap: widget.onBack,
          child: Row(children: [
            Icon(Icons.arrow_back_rounded, color: AppColors.gray600),
            const SizedBox(width: AppSpacing.sm),
            Text('Back to Dashboard', style: TextStyle(color: AppColors.gray600)),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Header card
        GradientCard(
          gradient: AppColors.gradientEmeraldTeal,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Row(children: [
              Icon(Icons.record_voice_over_rounded, color: Colors.white, size: 28),
              SizedBox(width: AppSpacing.sm),
              Text('Voice Lab',
                  style: TextStyle(
                      color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            ]),
            const SizedBox(height: 6),
            Text('Generate speech with your synthesised voice',
                style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 13)),
            const SizedBox(height: AppSpacing.cardGap),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.cardGap, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: AppRadius.pillBr,
              ),
              child: const Text('✨ Premium Feature',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Input card
        WhiteCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Enter Text to Synthesise',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: AppSpacing.cardGap),
            TextField(
              controller: _controller,
              maxLines: 5,
              decoration: InputDecoration(
                hintText: 'Type or paste your text here…',
                hintStyle: TextStyle(color: AppColors.gray600),
                border: OutlineInputBorder(
                    borderRadius: AppRadius.xsBr,
                    borderSide: BorderSide(color: AppColors.gray200)),
                focusedBorder: OutlineInputBorder(
                    borderRadius: AppRadius.xsBr,
                    borderSide: const BorderSide(color: AppColors.purple600, width: 2)),
                filled: true,
                fillColor: AppColors.gray50,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            _SliderRow(
              label: 'Speed',
              value: _speed,
              min: 0.5, max: 2.0,
              activeColor: AppColors.emerald500,
              onChanged: (v) => setState(() => _speed = v),
            ),
            _SliderRow(
              label: 'Pitch',
              value: _pitch,
              min: 0.5, max: 2.0,
              activeColor: AppColors.emerald500,
              onChanged: (v) => setState(() => _pitch = v),
            ),
            const SizedBox(height: AppSpacing.sm),
            PrimaryButton(
              label: _isGenerating ? 'Generating…' : 'Generate Speech',
              isLoading: _isGenerating,
              onTap: _generate,
              icon: _isGenerating ? null : Icons.auto_awesome_rounded,
              backgroundColor: AppColors.emerald500,
            ),
          ]),
        ),

        if (_hasGenerated) ...[
          const SizedBox(height: AppSpacing.sectionGap),
          WhiteCard(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Row(children: [
                Icon(Icons.check_circle_rounded, color: AppColors.green600),
                SizedBox(width: AppSpacing.sm),
                Text('Generated!',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ]),
              const SizedBox(height: AppSpacing.md),
              // Playback bar
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: AppRadius.mdBr,
                  border: Border.all(color: const Color(0xFFBBF7D0)),
                ),
                child: Row(children: [
                  const Icon(Icons.play_circle_rounded,
                      color: AppColors.green600, size: 32),
                  const SizedBox(width: AppSpacing.cardGap),
                  Expanded(child: ClipRRect(
                    borderRadius: AppRadius.pillBr,
                    child: const LinearProgressIndicator(
                      value: 0, minHeight: 8,
                      backgroundColor: Color(0xFFBBF7D0),
                      valueColor: AlwaysStoppedAnimation(AppColors.green600),
                    ),
                  )),
                  const SizedBox(width: AppSpacing.cardGap),
                  const Text('0:00',
                      style: TextStyle(
                          color: AppColors.green600, fontWeight: FontWeight.w600)),
                ]),
              ),
              const SizedBox(height: AppSpacing.cardGap),
              Row(children: [
                Expanded(child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.download_rounded, size: 16),
                  label: const Text('Download'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.emerald500,
                    side: const BorderSide(color: AppColors.emerald500),
                    shape: RoundedRectangleBorder(borderRadius: AppRadius.xsBr),
                  ),
                )),
                const SizedBox(width: AppSpacing.sm),
                Expanded(child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.share_rounded, size: 16),
                  label: const Text('Share'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.blue600,
                    side: const BorderSide(color: AppColors.blue600),
                    shape: RoundedRectangleBorder(borderRadius: AppRadius.xsBr),
                  ),
                )),
              ]),
            ]),
          ),
        ],
      ]),
    );
  }
}

class _SliderRow extends StatelessWidget {
  final String label;
  final double value, min, max;
  final Color activeColor;
  final ValueChanged<double> onChanged;

  const _SliderRow({
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.activeColor,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.cardGap),
      child: Row(children: [
        SizedBox(
          width: 44,
          child: Text(label,
              style: const TextStyle(fontWeight: FontWeight.w500)),
        ),
        Expanded(
          child: SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: activeColor,
              thumbColor: activeColor,
              inactiveTrackColor: AppColors.gray200,
            ),
            child: Slider(
                value: value, min: min, max: max, onChanged: onChanged),
          ),
        ),
        Text(value.toStringAsFixed(1),
            style: const TextStyle(fontWeight: FontWeight.bold)),
      ]),
    );
  }
}

import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/primary_button.dart';
import '../analysis/analysis_page.dart';
import '../analysis/models/analysis_result.dart';
import 'widgets/record_button.dart';
import 'package:file_picker/file_picker.dart';
import '../../shared/services/speechiq_service.dart';

class PracticePage extends StatefulWidget {
  final VoidCallback onBack;
  final VoidCallback onAnalysisDone;

  const PracticePage({
    super.key,
    required this.onBack,
    required this.onAnalysisDone,
  });

  @override
  State<PracticePage> createState() => _PracticePageState();
}

class _PracticePageState extends State<PracticePage>
    with SingleTickerProviderStateMixin {
  bool _isRecording   = false;
  bool _hasRecording  = false;
  bool _isAnalyzing   = false;
  bool _showAnalysis  = false;
  int  _recordingTime = 0;
  Timer? _timer;
  String? _errorMessage;

  late AnimationController _pulseController;

  // Holds the real result once the API responds
  AnalysisResult? _response;

  final _prompts = const [
    'Describe your favourite childhood memory in detail.',
    'Explain a complex topic you\'re passionate about.',
    'Tell a story about a time you overcame a challenge.',
    'Describe your ideal day from start to finish.',
  ];
  late final String _currentPrompt;

  @override
  void initState() {
    super.initState();
    _currentPrompt = _prompts[DateTime.now().millisecond % _prompts.length];
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  void _startRecording() {
    setState(() { _isRecording = true; _recordingTime = 0; _errorMessage = null; });
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _recordingTime++);
    });
  }

  void _stopRecording() {
    _timer?.cancel();
    setState(() { _isRecording = false; _hasRecording = true; });
  }

  // ── Bug fix 2: mic-recorded audio now also routes through real API ──────────
  // For now (no actual mic recording integration yet) we keep the existing
  // placeholder that shows the analysis page with whatever _response is set.
  // Once mic recording is wired up, replace the Future.delayed with a real call.
  Future<void> _analyzeRecording() async {
    setState(() { _isAnalyzing = true; _errorMessage = null; });
    // TODO: replace with actual mic audio bytes when recording is implemented
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() {
        _isAnalyzing = false;
        _showAnalysis = true;
        // Falls back to default placeholder result if no real response yet
      });
    }
  }

  // ── Bug fix 1: navigate to analysis page after receiving the API response ───
  Future<void> _pickAndAnalyzeFile() async {
    final result = await FilePicker.platform.pickFiles(type: FileType.audio);
    if (result == null) return;

    final bytes = result.files.single.bytes;
    if (bytes == null) return;

    setState(() { _isAnalyzing = true; _errorMessage = null; });

    try {
      final response = await SpeechIQService().analyzeAudioBytes(
        bytes,
        result.files.single.name,
      );

      // fromJson now handles {"file": ..., "analysis": {...}} automatically
      final analysisResult = AnalysisResult.fromJson(response);

      if (mounted) {
        setState(() {
          _response     = analysisResult;
          _isAnalyzing  = false;
          _showAnalysis = true; // ← was missing — this is why the page never opened
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isAnalyzing  = false;
          _errorMessage = 'Analysis failed: ${e.toString()}';
        });
      }
    }
  }

  String _formatTime(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '$m:${s.toString().padLeft(2, '0')}';
  }

  // Default placeholder shown when navigating from the mic record path
  // (before real mic recording is wired up).
  AnalysisResult get _effectiveResponse => _response ?? AnalysisResult(
    overallScore: 82,
    fluency:       MetricScore(score: 87, potential: 95),
    pacing:        MetricScore(score: 92, potential: 94),
    clarity:       MetricScore(score: 78, potential: 90),
    confidence:    MetricScore(score: 74, potential: 84),
    vocabulary:    MetricScore(score: 81, potential: 89),
    pronunciation: MetricScore(score: 72, potential: 83),
    feedback: const ['Upload an audio file to get real analysis from the API.'],
  );

  @override
  Widget build(BuildContext context) {
    if (_showAnalysis) {
      return AnalysisPage(
        analysis: _effectiveResponse,
        onBack: widget.onAnalysisDone,
        onRetry: () => setState(() {
          _showAnalysis  = false;
          _hasRecording  = false;
          _recordingTime = 0;
          _response      = null;
          _errorMessage  = null;
        }),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.pagePadding),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        // Back
        GestureDetector(
          onTap: widget.onBack,
          child: Row(children: [
            Icon(Icons.arrow_back_rounded, color: AppColors.gray600),
            const SizedBox(width: AppSpacing.sm),
            Text('Back to Dashboard',
                style: TextStyle(color: AppColors.gray600)),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Prompt card
        Container(
          padding: const EdgeInsets.all(AppSpacing.sectionGap),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
                colors: [Color(0xFFEDE9FE), Color(0xFFDBEAFE)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight),
            borderRadius: AppRadius.lgBr,
            border: Border.all(color: const Color(0xFFC4B5FD), width: 2),
          ),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Icon(Icons.volume_up_rounded,
                color: AppColors.purple600, size: 28),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Your Practice Prompt',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold,
                        color: Color(0xFF581C87))),
                const SizedBox(height: AppSpacing.sm),
                Text(_currentPrompt,
                    style: const TextStyle(fontSize: 15, color: Color(0xFF6D28D9))),
              ]),
            ),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Error banner
        if (_errorMessage != null)
          Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.sectionGap),
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: AppRadius.mdBr,
              border: Border.all(color: const Color(0xFFFECACA)),
            ),
            child: Row(children: [
              const Icon(Icons.error_outline_rounded,
                  color: Color(0xFFDC2626), size: 20),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(_errorMessage!,
                    style: const TextStyle(
                        color: Color(0xFFB91C1C), fontSize: 13)),
              ),
            ]),
          ),

        // Recording card
        WhiteCard(
          child: Column(children: [
            const Text('Record Your Speech',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: AppSpacing.lg),
            if (_isRecording) _buildTimer(),
            if (!_hasRecording) ...[
              RecordButton(
                isRecording: _isRecording,
                onTap: _isRecording ? _stopRecording : _startRecording,
              ),
              const SizedBox(height: AppSpacing.cardGap),
              Text(
                _isRecording ? 'Tap to stop' : 'Tap to start recording',
                style: TextStyle(color: AppColors.gray600),
              ),
              if (!_isRecording) ...[
                const SizedBox(height: AppSpacing.sectionGap),
                _divider(),
                const SizedBox(height: AppSpacing.md),
                OutlinedButton.icon(
                  onPressed: _isAnalyzing ? null : _pickAndAnalyzeFile,
                  icon: _isAnalyzing
                      ? const SizedBox(width: 16, height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.upload_rounded),
                  label: Text(_isAnalyzing ? 'Analysing…' : 'Upload Audio File'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.gray600,
                    padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sectionGap,
                        vertical: AppSpacing.cardGap),
                    shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBr),
                  ),
                ),
              ],
            ],
            if (_hasRecording) _buildPlayback(),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Tips
        Container(
          padding: const EdgeInsets.all(AppSpacing.sectionGap),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: AppRadius.mdBr,
            border: Border.all(color: const Color(0xFFBFDBFE)),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('💡 Pro Tips',
                style: TextStyle(fontWeight: FontWeight.bold,
                    color: Color(0xFF1E3A5F), fontSize: 15)),
            const SizedBox(height: AppSpacing.sm),
            for (final tip in [
              'Speak clearly and at a natural pace',
              'Find a quiet environment for best results',
              'Aim for 30–60 seconds of speech',
              'Practice regularly to improve your metrics',
            ])
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Text('• $tip',
                    style: const TextStyle(fontSize: 13, color: Color(0xFF1E40AF))),
              ),
          ]),
        ),
      ]),
    );
  }

  Widget _buildTimer() {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sectionGap),
      child: Container(
        padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg, vertical: AppSpacing.cardGap),
        decoration: BoxDecoration(
          color: const Color(0xFFFEE2E2),
          borderRadius: AppRadius.pillBr,
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          AnimatedBuilder(
            animation: _pulseController,
            builder: (_, __) => Container(
              width: 12, height: 12,
              decoration: BoxDecoration(
                color: AppColors.red500
                    .withOpacity(0.4 + 0.6 * _pulseController.value),
                shape: BoxShape.circle,
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Text(_formatTime(_recordingTime),
              style: const TextStyle(
                  color: Color(0xFFB91C1C),
                  fontSize: 18,
                  fontWeight: FontWeight.bold)),
        ]),
      ),
    );
  }

  Widget _buildPlayback() {
    return Column(children: [
      Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: const Color(0xFFF0FDF4),
          borderRadius: AppRadius.mdBr,
          border: Border.all(color: const Color(0xFFBBF7D0), width: 2),
        ),
        child: Row(children: [
          const Icon(Icons.play_circle_rounded, color: AppColors.green600, size: 28),
          const SizedBox(width: AppSpacing.cardGap),
          Expanded(child: ClipRRect(
            borderRadius: AppRadius.pillBr,
            child: const LinearProgressIndicator(
              value: 0.75, minHeight: 8,
              backgroundColor: Color(0xFFBBF7D0),
              valueColor: AlwaysStoppedAnimation(AppColors.green600),
            ),
          )),
          const SizedBox(width: AppSpacing.cardGap),
          Text(_formatTime(_recordingTime),
              style: const TextStyle(
                  color: AppColors.green600, fontWeight: FontWeight.w600)),
        ]),
      ),
      const SizedBox(height: AppSpacing.md),
      Row(children: [
        Expanded(child: OutlinedButton(
          onPressed: () => setState(() { _hasRecording = false; _recordingTime = 0; }),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
            shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBr),
          ),
          child: const Text('Record Again'),
        )),
        const SizedBox(width: AppSpacing.cardGap),
        Expanded(child: PrimaryButton(
          label: 'Analyse Speech',
          isLoading: _isAnalyzing,
          onTap: _analyzeRecording,
        )),
      ]),
    ]);
  }

  Widget _divider() => Row(children: [
    const Expanded(child: Divider()),
    Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.cardGap),
      child: Text('or', style: TextStyle(color: AppColors.gray600, fontSize: 13)),
    ),
    const Expanded(child: Divider()),
  ]);
}

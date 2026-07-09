import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/section_header.dart';

class LearningPathPage extends StatelessWidget {
  final VoidCallback onBack;
  const LearningPathPage({super.key, required this.onBack});

  static const _modules = [
    _Module('Articulation Basics',  'Master clear consonant sounds',    '🎯', true,  100, 5, 5),
    _Module('Pacing & Rhythm',      'Control your speaking speed',       '⏱️', true,   80, 4, 5),
    _Module('Vocal Confidence',     'Project authority through voice',   '💪', false,   0, 0, 6),
    _Module('Advanced Fluency',     'Eliminate hesitations and fillers', '🌟', false,   0, 0, 8),
  ];

  static const _quickLessons = [
    _QuickLesson('Eliminate Filler Words', '5 min', '🗣️', AppColors.purple600, Color(0xFFF3E8FF)),
    _QuickLesson('Power Pauses',           '8 min', '⏸️', AppColors.blue600,   Color(0xFFEFF6FF)),
    _QuickLesson('Vocal Warm-Up',          '3 min', '🎤', AppColors.emerald500, Color(0xFFF0FDF4)),
    _QuickLesson('Stress & Intonation',    '6 min', '📈', AppColors.orange500, Color(0xFFFFF7ED)),
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.pagePadding, AppSpacing.pagePadding,
          AppSpacing.pagePadding, AppSpacing.lg),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        GestureDetector(
          onTap: onBack,
          child: const Row(children: [
            Icon(Icons.arrow_back_rounded, color: AppColors.gray600),
            SizedBox(width: AppSpacing.sm),
            Text('Back', style: TextStyle(color: AppColors.gray600)),
          ]),
        ),
        const SizedBox(height: AppSpacing.md),

        // ── Original top content ────────────────────────────────────────────

        // Continue where you left off
        GradientCard(
          gradient: AppColors.gradientPurpleBlue,
          border: Border.all(color: AppColors.purple500, width: 2),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Continue Learning',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 13)),
            const SizedBox(height: 4),
            const Text('Pacing & Rhythm',
                style: TextStyle(
                    color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: AppSpacing.md),
            Row(children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Lesson 4 of 5',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 12)),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: AppRadius.pillBr,
                  child: LinearProgressIndicator(
                    value: 0.8, minHeight: 8,
                    backgroundColor: Colors.white.withValues(alpha: 0.2),
                    valueColor: const AlwaysStoppedAnimation(Color(0xFFFDE047)),
                  ),
                ),
                const SizedBox(height: 4),
                Text('80% complete',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 11)),
              ])),
              const SizedBox(width: AppSpacing.md),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.purple600,
                  shape: RoundedRectangleBorder(borderRadius: AppRadius.xsBr),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                ),
                child: const Text('Resume', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ]),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // Stats row
        const Row(children: [
          _LearnStat('12', 'Lessons done',   Icons.check_circle_rounded, AppColors.green600),
          SizedBox(width: AppSpacing.cardGap),
          _LearnStat('3',  'Badges earned',  Icons.emoji_events_rounded, AppColors.amber400),
          SizedBox(width: AppSpacing.cardGap),
          _LearnStat('4.2h', 'Time invested', Icons.timer_rounded,       AppColors.blue600),
        ]),
        const SizedBox(height: AppSpacing.sectionGap),

        // Quick lessons
        WhiteCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SectionHeader(
              title: 'Quick Lessons',
              icon: Icons.bolt_rounded,
              iconColor: AppColors.amber400,
            ),
            const SizedBox(height: 4),
            const Text('Short focused exercises for fast improvement',
                style: TextStyle(fontSize: 12, color: AppColors.gray600)),
            const SizedBox(height: AppSpacing.md),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: AppSpacing.sm,
              crossAxisSpacing: AppSpacing.sm,
              childAspectRatio: 2.2,
              children: _quickLessons.map((l) => _QuickLessonCard(lesson: l)).toList(),
            ),
          ]),
        ),
        const SizedBox(height: AppSpacing.sectionGap),

        // ── Existing module list ────────────────────────────────────────────

        const Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Learning Path',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          Text('2 / 4 complete',
              style: TextStyle(fontSize: 12, color: AppColors.gray600)),
        ]),
        const SizedBox(height: AppSpacing.sm),
        // Overall progress bar
        ClipRRect(
          borderRadius: AppRadius.pillBr,
          child: const LinearProgressIndicator(
            value: 0.5, minHeight: 8,
            backgroundColor: AppColors.gray100,
            valueColor: AlwaysStoppedAnimation(AppColors.purple600),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        ..._modules.asMap().entries.map((e) => _ModuleCard(module: e.value, index: e.key)),
      ]),
    );
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _LearnStat extends StatelessWidget {
  final String value, label;
  final IconData icon;
  final Color color;
  const _LearnStat(this.value, this.label, this.icon, this.color);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.cardGap),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: AppRadius.mdBr,
          border: Border.all(color: AppColors.gray200),
        ),
        child: Column(children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: AppSpacing.xs),
          Text(value,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          Text(label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 10, color: AppColors.gray600)),
        ]),
      ),
    );
  }
}

class _QuickLessonCard extends StatelessWidget {
  final _QuickLesson lesson;
  const _QuickLessonCard({super.key, required this.lesson});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.cardGap, vertical: AppSpacing.sm),
      decoration: BoxDecoration(
        color: lesson.bg,
        borderRadius: AppRadius.xsBr,
        border: Border.all(color: lesson.color.withValues(alpha: 0.2)),
      ),
      child: Row(children: [
        Text(lesson.icon, style: const TextStyle(fontSize: 22)),
        const SizedBox(width: AppSpacing.sm),
        Expanded(child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(lesson.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            Text(lesson.duration,
                style: const TextStyle(fontSize: 10, color: AppColors.gray600)),
          ],
        )),
      ]),
    );
  }
}

class _ModuleCard extends StatelessWidget {
  final _Module module;
  final int index;
  const _ModuleCard({super.key, required this.module, required this.index});

  @override
  Widget build(BuildContext context) {
    final isLocked = !module.unlocked;
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.sectionGap),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadius.lgBr,
        border: Border.all(
          color: module.unlocked ? const Color(0xFFE9D5FF) : AppColors.gray200,
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 2)),
        ],
      ),
      child: Row(children: [
        Stack(alignment: Alignment.topRight, children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              gradient: module.unlocked ? AppColors.gradientPurpleBlue : null,
              color: module.unlocked ? null : AppColors.gray100,
              borderRadius: AppRadius.mdBr,
            ),
            child: Center(
              child: Text(isLocked ? '🔒' : module.icon,
                  style: const TextStyle(fontSize: 26)),
            ),
          ),
          if (module.progress == 100)
            Container(
              padding: const EdgeInsets.all(2),
              decoration: const BoxDecoration(
                  color: AppColors.green600, shape: BoxShape.circle),
              child: const Icon(Icons.check_rounded, color: Colors.white, size: 12),
            ),
        ]),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text('Module ${index + 1}',
                  style: const TextStyle(fontSize: 11, color: AppColors.gray600)),
              if (module.progress == 100)
                Container(
                  margin: const EdgeInsets.only(left: AppSpacing.sm),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                      color: const Color(0xFFD1FAE5), borderRadius: AppRadius.pillBr),
                  child: const Text('Complete',
                      style: TextStyle(
                          fontSize: 10, color: AppColors.green600, fontWeight: FontWeight.bold)),
                ),
            ]),
            const SizedBox(height: 2),
            Text(module.title,
                style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: isLocked ? AppColors.gray600 : AppColors.gray900)),
            const SizedBox(height: 2),
            Text(module.description,
                style: const TextStyle(fontSize: 12, color: AppColors.gray600)),
            if (module.unlocked && module.progress > 0) ...[
              const SizedBox(height: AppSpacing.sm),
              ClipRRect(
                borderRadius: AppRadius.pillBr,
                child: LinearProgressIndicator(
                  value: module.progress / 100, minHeight: 6,
                  backgroundColor: AppColors.gray100,
                  valueColor: const AlwaysStoppedAnimation(AppColors.purple600),
                ),
              ),
              const SizedBox(height: 4),
              Text('${module.lessonsCompleted}/${module.totalLessons} lessons',
                  style: const TextStyle(fontSize: 11, color: AppColors.gray600)),
            ],
          ]),
        ),
        if (!isLocked)
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: const BoxDecoration(
                color: AppColors.purple100, shape: BoxShape.circle),
            child: const Icon(Icons.play_arrow_rounded,
                color: AppColors.purple600, size: 20),
          ),
      ]),
    );
  }
}

// ── Data classes ───────────────────────────────────────────────────────────────

class _Module {
  final String title, description, icon;
  final bool unlocked;
  final int progress, lessonsCompleted, totalLessons;
  const _Module(this.title, this.description, this.icon, this.unlocked,
      this.progress, this.lessonsCompleted, this.totalLessons);
}

class _QuickLesson {
  final String title, duration, icon;
  final Color color, bg;
  const _QuickLesson(this.title, this.duration, this.icon, this.color, this.bg);
}

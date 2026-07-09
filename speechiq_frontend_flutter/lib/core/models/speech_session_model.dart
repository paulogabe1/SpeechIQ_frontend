import 'score_model.dart';

/// Represents one completed practice session.
class SpeechSessionModel {
  final String id;
  final DateTime recordedAt;
  final int durationSeconds;
  final ScoreModel scores;
  final int xpEarned;
  final String prompt;

  const SpeechSessionModel({
    required this.id,
    required this.recordedAt,
    required this.durationSeconds,
    required this.scores,
    required this.xpEarned,
    required this.prompt,
  });

  factory SpeechSessionModel.fromJson(Map<String, dynamic> json) {
    return SpeechSessionModel(
      id: json['id'] as String,
      recordedAt: DateTime.parse(json['recordedAt'] as String),
      durationSeconds: json['durationSeconds'] as int,
      scores: ScoreModel.fromJson(json['scores'] as Map<String, dynamic>),
      xpEarned: json['xpEarned'] as int,
      prompt: json['prompt'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'recordedAt': recordedAt.toIso8601String(),
      'durationSeconds': durationSeconds,
      'scores': scores.toJson(),
      'xpEarned': xpEarned,
      'prompt': prompt,
    };
  }
}

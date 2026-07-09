/// Holds the speech analysis scores for a single session.
class ScoreModel {
  final int overall;
  final int fluency;
  final int pacing;
  final int clarity;
  final int confidence;
  final int pronunciation;

  const ScoreModel({
    required this.overall,
    required this.fluency,
    required this.pacing,
    required this.clarity,
    required this.confidence,
    required this.pronunciation,
  });

  static ScoreModel fromJson(Map<String, dynamic> json) {
    return ScoreModel(
      overall: json['overall'] as int,
      fluency: json['fluency'] as int,
      pacing: json['pacing'] as int,
      clarity: json['clarity'] as int,
      confidence: json['confidence'] as int,
      pronunciation: json['pronunciation'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'overall': overall,
      'fluency': fluency,
      'pacing': pacing,
      'clarity': clarity,
      'confidence': confidence,
      'pronunciation': pronunciation,
    };
  }
}

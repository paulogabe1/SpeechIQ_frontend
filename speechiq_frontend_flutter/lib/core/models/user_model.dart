/// Represents the authenticated user's profile and account data.
class UserModel {
  final String id;
  final String name;
  final String email;
  final int level;
  final int currentXP;
  final int nextLevelXP;
  final int streakDays;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.level,
    required this.currentXP,
    required this.nextLevelXP,
    required this.streakDays,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      level: json['level'] as int,
      currentXP: json['currentXP'] as int,
      nextLevelXP: json['nextLevelXP'] as int,
      streakDays: json['streakDays'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'level': level,
      'currentXP': currentXP,
      'nextLevelXP': nextLevelXP,
      'streakDays': streakDays,
    };
  }
}

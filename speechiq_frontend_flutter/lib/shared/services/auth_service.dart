/// Manages authentication and user session state.
/// TODO: implement with Firebase Auth or custom JWT flow.
class AuthService {
  Future<void> signIn(String email, String password) async {
    throw UnimplementedError('AuthService.signIn not yet implemented');
  }

  Future<void> signOut() async {
    throw UnimplementedError('AuthService.signOut not yet implemented');
  }

  bool get isSignedIn => false; // TODO
}

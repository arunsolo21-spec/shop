import 'package:fpdart/fpdart.dart';
import '../../../../core/error/failures.dart';

abstract class AuthRepository {
  Future<Either<Failure, Map<String, dynamic>>> login(
      String email, String password);
  Future<Either<Failure, Map<String, dynamic>>> googleSignIn({
    required String idToken,
    required String accessToken,
    required String name,
    required String email,
  });
  Future<Either<Failure, Map<String, dynamic>>> register(
      String name, String email, String password);
  Future<Either<Failure, void>> forgotPassword(String email);
  Future<Either<Failure, void>> resetPassword(
      String email, String token, String newPassword);
  Future<Either<Failure, void>> logout();
}

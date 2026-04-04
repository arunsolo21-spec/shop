import 'package:fpdart/fpdart.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../auth_repository.dart';

class SignupUseCase implements UseCase<Map<String, dynamic>, SignupParams> {
  final AuthRepository _repository;

  SignupUseCase(this._repository);

  @override
  Future<Either<Failure, Map<String, dynamic>>> call(
      SignupParams params) async {
    return await _repository.register(
        params.name, params.email, params.password);
  }
}

class SignupParams {
  final String name;
  final String email;
  final String password;

  const SignupParams({
    required this.name,
    required this.email,
    required this.password,
  });
}

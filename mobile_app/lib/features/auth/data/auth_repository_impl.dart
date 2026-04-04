import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/storage/secure_storage.dart';
import '../domain/auth_repository.dart';
import 'auth_remote_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteSource _remoteSource;
  final SecureStorageService _storageService;

  AuthRepositoryImpl(this._remoteSource, this._storageService);

  @override
  Future<Either<Failure, Map<String, dynamic>>> login(
      String email, String password) async {
    try {
      final response = await _remoteSource.login(email, password);
      final data = response['data'] as Map<String, dynamic>? ?? response;
      final token = data['access_token'] as String? ??
          response['access_token'] as String?;

      if (token != null && token.isNotEmpty) {
        await _storageService.write('auth_token', token);
        return Right(response);
      }

      return const Left(ServerFailure('No token received from server'));
    } on DioException catch (e) {
      final errorMessage = e.response?.data['message'] ??
          e.response?.data['error'] ??
          'Login Failed';
      return Left(ServerFailure(errorMessage.toString()));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> googleSignIn({
    required String idToken,
    required String accessToken,
    required String name,
    required String email,
  }) async {
    try {
      final response = await _remoteSource.googleSignIn(
        idToken: idToken,
        accessToken: accessToken,
        name: name,
        email: email,
      );
      final token = response['data']?['access_token'] ??
          response['access_token'];

      if (token != null && token.isNotEmpty) {
        await _storageService.write('auth_token', token);
      }

      return Right(response);
    } on DioException catch (e) {
      final errorMessage = e.response?.data['message'] ??
          e.response?.data['error'] ??
          'Google Sign-In Failed';
      return Left(ServerFailure(errorMessage.toString()));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> register(
      String name, String email, String password) async {
    try {
      final response = await _remoteSource.register(name, email, password);
      final token = response['data']?['access_token'] ??
          response['access_token'];

      if (token != null && token.isNotEmpty) {
        await _storageService.write('auth_token', token);
      }

      return Right(response);
    } on DioException catch (e) {
      final errorMessage = e.response?.data['message'] ??
          e.response?.data['error'] ??
          'Registration Failed';
      return Left(ServerFailure(errorMessage.toString()));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> forgotPassword(String email) async {
    try {
      await _remoteSource.forgotPassword(email);
      return const Right(null);
    } on DioException catch (e) {
      final errorMessage =
          e.response?.data['message'] ?? 'Failed to send reset email';
      return Left(ServerFailure(errorMessage.toString()));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> resetPassword(
      String email, String token, String newPassword) async {
    try {
      await _remoteSource.resetPassword(email, token, newPassword);
      return const Right(null);
    } on DioException catch (e) {
      final errorMessage =
          e.response?.data['message'] ?? 'Failed to reset password';
      return Left(ServerFailure(errorMessage.toString()));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      await _storageService.delete('auth_token');
      return const Right(null);
    } catch (e) {
      return const Left(CacheFailure('Failed to logout'));
    }
  }
}
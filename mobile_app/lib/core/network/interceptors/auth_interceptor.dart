import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../config/env.dart';
import 'package:flutter/foundation.dart';

class AuthInterceptor extends Interceptor {
  final FlutterSecureStorage _storage;
  const AuthInterceptor(this._storage);

  @override
  Future<void> onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    try {
      // ✅ Skip auth for public endpoints
      final publicPaths = [
        '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password',
        '/payments/upi/apps', '/health',
      ];
      if (publicPaths.any((path) => options.path.contains(path))) {
        return handler.next(options);
      }

      final token = await _storage.read(key: Env.jwtTokenKey);
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    } catch (e) {
      if (kDebugMode) debugPrint('⚠️ AuthInterceptor error: $e');
    }
    return handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    return handler.next(err);
  }
}
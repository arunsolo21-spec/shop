import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/env.dart';
import '../error/exceptions.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/error_interceptor.dart';
import 'interceptors/logging_interceptor.dart';
import '../error/failures.dart';

final dioClientProvider = Provider<DioClient>((ref) => DioClient());

class DioClient {
  late final Dio _dio;
  final FlutterSecureStorage _secureStorage;

  DioClient() : _secureStorage = const FlutterSecureStorage() {
    _dio = Dio(BaseOptions(
      baseUrl: Env.baseUrl,
      connectTimeout: Duration(milliseconds: Env.connectTimeout),
      receiveTimeout: Duration(milliseconds: Env.receiveTimeout),
      responseType: ResponseType.json,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-App-Version': '1.0.0',
        'X-Platform': kIsWeb ? 'web' : (defaultTargetPlatform == TargetPlatform.android ? 'android' : 'ios'),
      },
      validateStatus: (status) => status != null && status < 500,
    ));

    _dio.interceptors.addAll([
      AuthInterceptor(_secureStorage),
      ErrorInterceptor(),
      if (!kReleaseMode) LoggingInterceptor(),
    ]);

    // Dev-only: Allow self-signed certs (disable in production)
    if (!kIsWeb && !Env.isProduction) {
      try {
        final adapter = _dio.httpClientAdapter;
        if (adapter.runtimeType.toString().contains('IOHttpClientAdapter')) {
          (adapter as dynamic).createHttpClient = () {
            final client = HttpClient();
            client.badCertificateCallback = (_, __, ___) => false;
            return client;
          };
        }
      } catch (_) {}
    }
  }

  Dio get dio => _dio;

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters, Options? options, CancelToken? cancelToken}) async {
    try {
      return await _dio.get(path, queryParameters: queryParameters, options: options, cancelToken: cancelToken);
    } on DioException catch (e) {
      _handleDioError(e);
      rethrow;
    }
  }

  Future<Response> post(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options, CancelToken? cancelToken}) async {
    try {
      return await _dio.post(path, data: data, queryParameters: queryParameters, options: options, cancelToken: cancelToken);
    } on DioException catch (e) {
      _handleDioError(e);
      rethrow;
    }
  }

  Future<Response> put(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options, CancelToken? cancelToken}) async {
    try {
      return await _dio.put(path, data: data, queryParameters: queryParameters, options: options, cancelToken: cancelToken);
    } on DioException catch (e) {
      _handleDioError(e);
      rethrow;
    }
  }

  Future<Response> delete(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options, CancelToken? cancelToken}) async {
    try {
      return await _dio.delete(path, data: data, queryParameters: queryParameters, options: options, cancelToken: cancelToken);
    } on DioException catch (e) {
      _handleDioError(e);
      rethrow;
    }
  }

  Future<Response> patch(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options, CancelToken? cancelToken}) async {
    try {
      return await _dio.patch(path, data: data, queryParameters: queryParameters, options: options, cancelToken: cancelToken);
    } on DioException catch (e) {
      _handleDioError(e);
      rethrow;
    }
  }

  void _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        if (kDebugMode) debugPrint('❌ [DioClient] Timeout: ${error.message}');
        throw const TimeoutFailure('Request timeout. Please try again.');
      case DioExceptionType.connectionError:
        if (kDebugMode) debugPrint('❌ [DioClient] Connection Error: ${error.message}');
        throw const NetworkFailure('No internet connection. Please check your network.');
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        if (statusCode == 401) {
          if (kDebugMode) debugPrint('❌ [DioClient] Unauthorized: ${error.message}');
          throw const UnauthorizedException('Session expired. Please login again.');
        } else if (statusCode == 400) {
          final data = error.response?.data;
          if (data is Map && data['errors'] != null) {
            if (kDebugMode) debugPrint('❌ [DioClient] Validation Error: ${error.message}');
            throw ValidationException(Map<String, List<String>>.from(data['errors']));
          }
        } else if (statusCode == 500 || statusCode == 502 || statusCode == 503) {
          if (kDebugMode) debugPrint('❌ [DioClient] Server Error: ${error.message}');
          throw ServerException('Server is temporarily unavailable. Please try again later.', statusCode: statusCode);
        }
        break;
      case DioExceptionType.cancel:
        if (kDebugMode) debugPrint('⚠️ [DioClient] Request cancelled');
        throw Exception('Request cancelled');
      case DioExceptionType.unknown:
      case DioExceptionType.badCertificate:
        if (kDebugMode) debugPrint('❌ [DioClient] Network Error: ${error.message}');
        throw const NetworkFailure('Network error occurred. Please try again.');
    }
  }
}
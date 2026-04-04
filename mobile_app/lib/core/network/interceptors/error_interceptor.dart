import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../error/exceptions.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final path = err.requestOptions.path;
    final statusCode = err.response?.statusCode;
    final responseData = err.response?.data;

    if (kDebugMode) {
      print('❌ ERROR INTERCEPTOR: ${err.message}');
      print('📍 Path: $path');
      print('🔢 Status: $statusCode');
      print('📦 Data: $responseData');
    }

    DioException newError;

    if (statusCode == 401) {
      if (!path.contains('/auth/login') &&
          !path.contains('/auth/register') &&
          !path.contains('/auth/forgot-password')) {
        newError = DioException(
          requestOptions: err.requestOptions,
          response: err.response,
          type: err.type,
          message: 'Session expired. Please login again.',
          error: const UnauthorizedException('Unauthorized'),
        );
      } else {
        newError = err;
      }
    } else if (statusCode == 400) {
      final message = responseData is Map
          ? (responseData['message'] as String?) ?? 'Invalid request'
          : 'Invalid request';
      newError = DioException(
        requestOptions: err.requestOptions,
        response: err.response,
        type: err.type,
        message: message,
        error: ValidationException(
            Map<String, List<String>>.from(responseData['errors'] ?? {})),
      );
    } else if (statusCode == 404) {
      newError = DioException(
        requestOptions: err.requestOptions,
        response: err.response,
        type: err.type,
        message: 'Resource not found',
        error: ServerException('Resource not found', statusCode: statusCode),
      );
    } else if (statusCode == 500 || statusCode == 502 || statusCode == 503) {
      newError = DioException(
        requestOptions: err.requestOptions,
        response: err.response,
        type: err.type,
        message: 'Server is temporarily unavailable. Please try again later.',
        error: ServerException('Server error', statusCode: statusCode),
      );
    } else if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.connectionError) {
      newError = DioException(
        requestOptions: err.requestOptions,
        response: err.response,
        type: err.type,
        message: 'Network connection failed. Please check your internet.',
        error: const NetworkException('Connection failed'),
      );
    } else {
      newError = err;
    }

    return handler.next(newError);
  }
}

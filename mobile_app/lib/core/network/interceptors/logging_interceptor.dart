import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      print('📤 REQUEST: ${options.method} ${options.path}');
      print('📝 Headers: ${options.headers}');
      print('📦 Data: ${options.data}');
    }
    return handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode) {
      print(
          '📥 RESPONSE: ${response.statusCode} ${response.requestOptions.path}');
      print('📦 Data: ${response.data}');
    }
    return handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      print('❌ ERROR: ${err.message}');
      print('📍 Path: ${err.requestOptions.path}');
    }
    return handler.next(err);
  }
}

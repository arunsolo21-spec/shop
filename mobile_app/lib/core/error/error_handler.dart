import 'package:flutter/foundation.dart';
import 'app_exception.dart';

class ErrorHandler {
  static void handle(Object error, [StackTrace? stackTrace]) {
    if (kDebugMode) {
      debugPrint('❌ ERROR: ${error.toString()}');
      if (stackTrace != null) {
        debugPrint('📍 STACK: $stackTrace');
      }
    }
    
    if (error is AppException) {
      _handleAppException(error);
    } else if (error is Exception) {
      _handleException(error);
    } else {
      _handleError(error);
    }
  }

  static void _handleAppException(AppException exception) {
    switch (exception) {
      case ValidationException():
        debugPrint('⚠️ Validation Error: ${exception.firstError}');
        break;
      case AuthenticationException():
        debugPrint('🔐 Auth Error: ${exception.message}');
        break;
      case AuthorizationException():
        debugPrint('🚫 AuthZ Error: ${exception.message}');
        break;
      case NotFoundException():
        debugPrint('🔍 Not Found: ${exception.message}');
        break;
      case ServerException():
        debugPrint('💥 Server Error: ${exception.message}');
        break;
      case NetworkException():
        debugPrint('📡 Network Error: ${exception.message}');
        break;
      case TimeoutException():
        debugPrint('⏱️ Timeout: ${exception.message}');
        break;
      default:
        debugPrint('⚠️ App Exception: ${exception.message}');
    }
  }

  static void _handleException(Exception exception) {
    final message = exception.toString();
    
    // Web-specific network errors
    if (kIsWeb && message.contains('XMLHttpRequest')) {
      debugPrint('🌐 Web Network Error: CORS or connection issue');
    } else if (message.contains('SocketException')) {
      debugPrint('📡 Network Error: No internet connection');
    } else if (message.contains('Timeout')) {
      debugPrint('⏱️ Timeout Error: Request took too long');
    } else if (message.contains('HandshakeException')) {
      debugPrint('🔒 SSL Error: Certificate validation failed');
    } else {
      debugPrint('⚠️ Exception: ${exception.toString()}');
    }
  }

  static void _handleError(Object error) {
    debugPrint('❌ Error: ${error.toString()}');
  }

  static String getErrorMessage(Object error) {
    if (error is AppException) {
      return error.message;
    } else if (error is Exception) {
      final message = error.toString();
      
      // Web-specific errors
      if (kIsWeb && message.contains('XMLHttpRequest')) {
        return 'Cannot connect to server. Please ensure:\n'
               '1. Backend is running at http://localhost:3000\n'
               '2. CORS is enabled on the server\n'
               '3. You have internet connection';
      }
      
      // General errors
      if (message.contains('SocketException')) {
        return 'No internet connection. Please check your network settings.';
      } else if (message.contains('Timeout')) {
        return 'Request timed out. Please try again.';
      } else if (message.contains('HandshakeException')) {
        return 'Secure connection failed. Please check your internet.';
      }
      
      return message.replaceAll('Exception: ', '');
    } else {
      return 'An unexpected error occurred';
    }
  }

  static int getStatusCode(Object error) {
    if (error is AppException) {
      return error.statusCode ?? 500;
    }
    return 500;
  }
  
  static bool isRetryableError(Object error) {
    if (error is NetworkException || error is TimeoutException) {
      return true;
    }
    
    final message = error.toString().toLowerCase();
    return message.contains('timeout') ||
           message.contains('socket') ||
           message.contains('network');
  }
  
  static String getSuggestedAction(Object error) {
    if (error is NetworkException || error.toString().contains('SocketException')) {
      return 'Check your internet connection and try again';
    } else if (error is TimeoutException) {
      return 'The server is taking too long. Try again later';
    } else if (error is ServerException) {
      return 'Server is temporarily unavailable. Please try again later';
    } else if (error is AuthenticationException) {
      return 'Please login again to continue';
    }
    return 'Please try again';
  }
}
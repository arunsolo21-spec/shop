class AppException implements Exception {
  final String message;
  final int? statusCode;
  final String? code;
  final Map<String, dynamic>? details;

  const AppException(
    this.message, {
    this.statusCode,
    this.code,
    this.details,
  });

  @override
  String toString() {
    if (code != null) {
      return 'AppException[$code]: $message';
    }
    return 'AppException: $message';
  }

  Map<String, dynamic> toJson() {
    return {
      'message': message,
      'statusCode': statusCode,
      'code': code,
      'details': details,
      'timestamp': DateTime.now().toIso8601String(),
    };
  }
}

class ApiException extends AppException {
  const ApiException(
    super.message, {
    super.statusCode,
    super.code,
    super.details,
  });
}

class ValidationException extends AppException {
  final Map<String, List<String>> errors;

  const ValidationException(this.errors)
      : super('Validation failed', statusCode: 400, code: 'VALIDATION_ERROR');

  String get firstError => errors.values.first.first;

  @override
  Map<String, dynamic> toJson() {
    return {
      ...super.toJson(),
      'errors': errors,
    };
  }
}

class AuthenticationException extends AppException {
  const AuthenticationException([super.message = 'Authentication failed'])
      : super(statusCode: 401, code: 'AUTH_ERROR');
}

class AuthorizationException extends AppException {
  const AuthorizationException([super.message = 'Access denied'])
      : super(statusCode: 403, code: 'FORBIDDEN');
}

class NotFoundException extends AppException {
  const NotFoundException([super.message = 'Resource not found'])
      : super(statusCode: 404, code: 'NOT_FOUND');
}

class ConflictException extends AppException {
  const ConflictException([super.message = 'Resource conflict'])
      : super(statusCode: 409, code: 'CONFLICT');
}

class ServerException extends AppException {
  const ServerException([super.message = 'Internal server error'])
      : super(statusCode: 500, code: 'SERVER_ERROR');
}

class NetworkException extends AppException {
  const NetworkException([super.message = 'Network error'])
      : super(statusCode: 0, code: 'NETWORK_ERROR');
}

class TimeoutException extends AppException {
  const TimeoutException([super.message = 'Request timeout'])
      : super(statusCode: 408, code: 'TIMEOUT');
}

class CacheException extends AppException {
  const CacheException([super.message = 'Cache error'])
      : super(statusCode: 0, code: 'CACHE_ERROR');
}
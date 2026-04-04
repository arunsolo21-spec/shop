class ServerException implements Exception {
  final String message;
  final int? statusCode;
  final String? code;

  const ServerException(
    this.message, {
    this.statusCode,
    this.code,
  });

  @override
  String toString() => 'ServerException: $message (Code: $statusCode)';
}

class CacheException implements Exception {
  final String message;
  const CacheException(this.message);

  @override
  String toString() => 'CacheException: $message';
}

class NetworkException implements Exception {
  final String message;
  const NetworkException(this.message);

  @override
  String toString() => 'NetworkException: $message';
}

class UnauthorizedException implements Exception {
  final String message;
  const UnauthorizedException(this.message);

  @override
  String toString() => 'UnauthorizedException: $message';
}

class ValidationException implements Exception {
  final Map<String, List<String>> errors;

  const ValidationException(this.errors);

  String get firstError => errors.values.first.first;

  @override
  String toString() => 'ValidationException: $firstError';
}

class PaymentException implements Exception {
  final String message;
  final String? errorCode;

  const PaymentException(this.message, {this.errorCode});

  @override
  String toString() => 'PaymentException: $message';
}

import 'package:equatable/equatable.dart';

abstract class Failure extends Equatable {
  final String message;
  final int? statusCode;

  const Failure(this.message, {this.statusCode});

  @override
  List<Object?> get props => [message, statusCode];
}

class ServerFailure extends Failure {
  const ServerFailure(super.message, {super.statusCode});
}

class CacheFailure extends Failure {
  const CacheFailure(super.message);
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message);
}

class ValidationFailure extends Failure {
  final Map<String, List<String>> errors;

  const ValidationFailure(super.message, this.errors);

  String get firstError => errors.values.first.first;
}

class AuthFailure extends Failure {
  const AuthFailure(super.message);
}

class PaymentFailure extends Failure {
  final String? errorCode;

  const PaymentFailure(super.message, {this.errorCode});
}

class TimeoutFailure extends Failure {
  const TimeoutFailure(super.message);
}

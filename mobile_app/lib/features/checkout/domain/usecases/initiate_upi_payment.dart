import 'package:fpdart/fpdart.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/payment_repository.dart';

class InitiateUPIPaymentUseCase
    implements UseCase<Map<String, dynamic>, InitiateUPIPaymentParams> {
  final PaymentRepository _repository;

  InitiateUPIPaymentUseCase(this._repository);

  @override
  Future<Either<Failure, Map<String, dynamic>>> call(
      InitiateUPIPaymentParams params) async {
    return await _repository.initiatePayment(
      orderId: params.orderId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
    );
  }
}

class InitiateUPIPaymentParams {
  final int orderId;
  final double amount;
  final String paymentMethod;

  const InitiateUPIPaymentParams({
    required this.orderId,
    required this.amount,
    required this.paymentMethod,
  });
}
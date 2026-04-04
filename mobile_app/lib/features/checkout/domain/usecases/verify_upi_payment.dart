import 'package:fpdart/fpdart.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/payment_repository.dart';

class VerifyUPIPaymentUseCase
    implements UseCase<Map<String, dynamic>, VerifyUPIPaymentParams> {
  final PaymentRepository _repository;

  VerifyUPIPaymentUseCase(this._repository);

  @override
  Future<Either<Failure, Map<String, dynamic>>> call(
      VerifyUPIPaymentParams params) async {
    return await _repository.verifyPayment(
      razorpayPaymentId: params.razorpayPaymentId,
      razorpayOrderId: params.razorpayOrderId,
      razorpaySignature: params.razorpaySignature,
      orderId: params.orderId,
    );
  }
}

class VerifyUPIPaymentParams {
  final String razorpayPaymentId;
  final String razorpayOrderId;
  final String razorpaySignature;
  final int orderId;

  const VerifyUPIPaymentParams({
    required this.razorpayPaymentId,
    required this.razorpayOrderId,
    required this.razorpaySignature,
    required this.orderId,
  });
}
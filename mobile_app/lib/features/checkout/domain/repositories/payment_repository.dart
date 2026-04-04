import 'package:fpdart/fpdart.dart';
import '../../../../core/error/failures.dart';
import '../entities/payment_method.dart';

abstract class PaymentRepository {
  Future<Either<Failure, Map<String, dynamic>>> initiatePayment({
    required int orderId,
    required double amount,
    required String paymentMethod,
  });

  Future<Either<Failure, Map<String, dynamic>>> verifyPayment({
    required String razorpayPaymentId,
    required String razorpayOrderId,
    required String razorpaySignature,
    required int orderId,
  });

  Future<Either<Failure, List<UPIApp>>> getUPIApps();

  Future<Either<Failure, bool>> checkUPIAppInstalled(String packageName);

  Future<Either<Failure, bool>> launchUPIApp({
    required String packageName,
    required String upiUrl,
  });
}
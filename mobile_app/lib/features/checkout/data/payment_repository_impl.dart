// lib/features/checkout/data/payment_repository_impl.dart
import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/foundation.dart';
import '../../../core/error/failures.dart';
import '../../../core/network/dio_client.dart';
import '../domain/entities/payment_method.dart';
import '../domain/repositories/payment_repository.dart';

class PaymentRepositoryImpl implements PaymentRepository {
  final DioClient _dioClient;

  PaymentRepositoryImpl(this._dioClient);

  @override
  Future<Either<Failure, Map<String, dynamic>>> initiatePayment({
    required int orderId,
    required double amount,
    required String paymentMethod,
  }) async {
    try {
      final response = await _dioClient.post(
        '/payments/initiate/$orderId',
        data: {
          'amount': amount,
          'paymentMethod': paymentMethod,
        },
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        return Right(response.data['data'] as Map<String, dynamic>);
      } else {
        return Left(ServerFailure(
          response.data['message'] ?? 'Payment initiation failed',
        ));
      }
    } on DioException catch (e) {
      final errorMessage = e.response?.data['message'] ?? e.message ?? 'Network error';
      return Left(ServerFailure(errorMessage));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> verifyPayment({
    required String razorpayPaymentId,
    required String razorpayOrderId,
    required String razorpaySignature,
    required int orderId,
  }) async {
    try {
      final response = await _dioClient.post(
        '/payments/verify/$orderId',
        data: {
          'razorpay_payment_id': razorpayPaymentId,
          'razorpay_order_id': razorpayOrderId,
          'razorpay_signature': razorpaySignature,
        },
      );
      if (response.statusCode == 200) {
        return Right(response.data['data'] as Map<String, dynamic>);
      } else {
        return Left(ServerFailure(
          response.data['message'] ?? 'Payment verification failed',
        ));
      }
    } on DioException catch (e) {
      final errorMessage = e.response?.data['message'] ?? e.message ?? 'Network error';
      return Left(ServerFailure(errorMessage));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<UPIApp>>> getUPIApps() async {
    try {
      final response = await _dioClient.get('/payments/upi/apps');
      if (response.statusCode == 200) {
        final appsData = response.data['data'] as List? ?? [];
        final apps = appsData
            .map((e) => UPIApp.fromJson(e as Map<String, dynamic>))
            .toList();
        return Right(apps.isNotEmpty ? apps : UPIApp.getPopularApps());
      } else {
        return Right(UPIApp.getPopularApps());
      }
    } on DioException {
      return Right(UPIApp.getPopularApps());
    } catch (e) {
      return Right(UPIApp.getPopularApps());
    }
  }

  @override
  Future<Either<Failure, bool>> checkUPIAppInstalled(String packageName) async {
    try {
      if (kIsWeb) {
        return const Right(false);
      }
      final uri = Uri.parse('package:$packageName');
      final canLaunch = await canLaunchUrl(uri);
      return Right(canLaunch);
    } catch (e) {
      return const Right(false);
    }
  }

  @override
  Future<Either<Failure, bool>> launchUPIApp({
    required String packageName,
    required String upiUrl,
  }) async {
    try {
      if (kIsWeb) {
        return const Left(ServerFailure('UPI not supported on web'));
      }
      final uri = Uri.parse(upiUrl);
      final canLaunch = await canLaunchUrl(uri);
      if (canLaunch) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        return const Right(true);
      } else {
        return const Left(ServerFailure('Cannot launch UPI app'));
      }
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
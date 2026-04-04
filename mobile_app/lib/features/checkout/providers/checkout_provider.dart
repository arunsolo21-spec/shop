// lib/features/checkout/providers/checkout_provider.dart
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/hive_storage.dart';
import '../../cart/presentation/providers/cart_provider.dart';
import '../data/payment_repository_impl.dart';

class CheckoutState {
  final bool isProcessing;
  final String? error;
  final int? orderId;
  final String? orderNumber;
  final String? paymentId;

  const CheckoutState({
    this.isProcessing = false,
    this.error,
    this.orderId,
    this.orderNumber,
    this.paymentId,
  });

  CheckoutState copyWith({
    bool? isProcessing,
    String? error,
    int? orderId,
    String? orderNumber,
    String? paymentId,
  }) {
    return CheckoutState(
      isProcessing: isProcessing ?? this.isProcessing,
      error: error,
      orderId: orderId,
      orderNumber: orderNumber,
      paymentId: paymentId,
    );
  }
}

final paymentRepositoryProvider = Provider<PaymentRepositoryImpl>((ref) {
  return PaymentRepositoryImpl(ref.read(dioClientProvider));
});

final checkoutProvider =
    StateNotifierProvider<CheckoutNotifier, CheckoutState>((ref) {
  return CheckoutNotifier(
    ref.read(dioClientProvider),
    ref.read(cartProvider.notifier),
    ref.read(hiveStorageProvider),
    ref.read(paymentRepositoryProvider),
  );
});

class CheckoutNotifier extends StateNotifier<CheckoutState> {
  final DioClient _dio;
  final CartNotifier _cartNotifier;
  final HiveStorageService _hiveStorage;
  final PaymentRepositoryImpl _paymentRepository;

  CheckoutNotifier(
    this._dio,
    this._cartNotifier,
    this._hiveStorage,
    this._paymentRepository,
  ) : super(const CheckoutState());

  Future<bool> placeOrder({
    required int addressId,
    required String paymentMethod,
    String? upiAppId,
    String? upiVPA,
    required double amount,
  }) async {
    state = state.copyWith(isProcessing: true, error: null);

    try {
      final cartResponse = await _dio.get('/cart');
      if (cartResponse.statusCode != 200) {
        state = state.copyWith(
          isProcessing: false,
          error: 'Failed to load cart items',
        );
        return false;
      }

      final cartItems = cartResponse.data['data']['items'] as List? ?? [];
      if (cartItems.isEmpty) {
        state = state.copyWith(
          isProcessing: false,
          error: 'Your cart is empty',
        );
        return false;
      }

      final orderItems = cartItems.map((item) {
        return {
          'productId': int.parse(item['productId'].toString()),
          'quantity': item['quantity'] as int,
        };
      }).toList();

      final orderPayload = {
        'items': orderItems,
        'addressId': addressId,
        'paymentMethod': paymentMethod,
        if (upiAppId != null) 'upiAppId': upiAppId,
        if (upiVPA != null && upiVPA.isNotEmpty) 'upiVPA': upiVPA,
      };

      final orderResponse = await _dio.post('/orders', data: orderPayload);

      if (orderResponse.statusCode == 200 ||
          orderResponse.statusCode == 201) {
        await _cartNotifier.clearCart();
        await _hiveStorage.clearCart();

        final orderData =
            orderResponse.data['data'] as Map<String, dynamic>? ?? {};

        if (paymentMethod == 'UPI') {
          final paymentResult = await _paymentRepository.initiatePayment(
            orderId: orderData['id'] as int,
            amount: amount,
            paymentMethod: 'UPI',
          );
          paymentResult.fold(
            (failure) {
              if (kDebugMode) {
                debugPrint('Payment initiation failed: ${failure.message}');
              }
            },
            (paymentData) {
              if (kDebugMode) {
                debugPrint('Payment initiated: $paymentData');
              }
            },
          );
        }

        state = state.copyWith(
          isProcessing: false,
          orderId: orderData['id'] as int?,
          orderNumber: orderData['orderId'] as String?,
          paymentId: orderData['paymentId'] as String?,
        );
        return true;
      } else {
        final errorMessage = orderResponse.data['message'] as String? ??
            orderResponse.data['error'] as String? ??
            'Failed to place order';
        state = state.copyWith(
          isProcessing: false,
          error: errorMessage,
        );
        return false;
      }
    } catch (e) {
      String errorMessage = 'Network error. Please check your connection.';
      if (e.toString().contains('SocketException')) {
        errorMessage = 'No internet connection. Please try again.';
      } else if (e.toString().contains('401')) {
        errorMessage = 'Session expired. Please login again.';
      } else if (e.toString().contains('400')) {
        errorMessage = 'Invalid order data. Please check your cart.';
      }
      state = state.copyWith(
        isProcessing: false,
        error: errorMessage,
      );
      return false;
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}
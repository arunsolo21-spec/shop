import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/hive_storage.dart';
import '../../data/order_repository_impl.dart';
import '../../../checkout/domain/entities/order.dart' show Order, OrderStatus, OrderStats;

class OrderState {
  final bool isLoading;
  final String? error;
  final List<Order> orders;
  final Order? currentOrder;
  final OrderStats? stats;

  const OrderState({
    this.isLoading = false,
    this.error,
    this.orders = const [],
    this.currentOrder,
    this.stats,
  });

  OrderState copyWith({
    bool? isLoading,
    String? error,
    List<Order>? orders,
    Order? currentOrder,
    OrderStats? stats,
  }) {
    return OrderState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      orders: orders ?? this.orders,
      currentOrder: currentOrder ?? this.currentOrder,
      stats: stats ?? this.stats,
    );
  }
}

class OrderNotifier extends StateNotifier<OrderState> {
  final OrderRepositoryImpl _repository;
  final HiveStorageService _hiveStorage;

  OrderNotifier(
    this._repository,
    this._hiveStorage,
  ) : super(const OrderState());

  Future<void> loadOrders() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _repository.getUserOrders(0);
      result.fold(
        (failure) {
          state = state.copyWith(
            isLoading: false,
            error: failure.message,
            orders: const [],
          );
        },
        (orders) {
          state = state.copyWith(
            isLoading: false,
            orders: orders,
            error: null,
          );
        },
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load orders: $e',
        orders: const [],
      );
    }
  }

  Future<void> loadOrderDetails(String orderId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final numericId = int.tryParse(orderId.replaceAll('#ORD', '')) ?? 0;
      if (numericId <= 0) {
        state = state.copyWith(
          isLoading: false,
          error: 'Invalid order ID',
        );
        return;
      }
      final result = await _repository.getOrderById(0, numericId);
      result.fold(
        (failure) {
          state = state.copyWith(
            isLoading: false,
            error: failure.message,
            currentOrder: null,
          );
        },
        (order) {
          state = state.copyWith(
            isLoading: false,
            currentOrder: order,
            error: null,
          );
        },
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load order details: $e',
        currentOrder: null,
      );
    }
  }

  Future<void> loadOrderStats() async {
    try {
      final result = await _repository.getOrderStats();
      result.fold(
        (failure) {
          state = state.copyWith(error: failure.message);
        },
        (stats) {
          state = state.copyWith(stats: stats);
        },
      );
    } catch (e) {
      state = state.copyWith(error: 'Failed to load stats: $e');
    }
  }

  Future<bool> cancelOrder(int orderId, String reason) async {
    try {
      final result = await _repository.cancelOrder(orderId, reason);
      return result.fold(
        (failure) {
          state = state.copyWith(error: failure.message);
          return false;
        },
        (_) {
          loadOrders();
          return true;
        },
      );
    } catch (e) {
      state = state.copyWith(error: 'Failed to cancel order: $e');
      return false;
    }
  }

  List<Order> getActiveOrders() {
    return state.orders
        .where((order) =>
            order.status != OrderStatus.delivered &&
            order.status != OrderStatus.cancelled)
        .toList();
  }

  List<Order> getCompletedOrders() {
    return state.orders
        .where((order) =>
            order.status == OrderStatus.delivered ||
            order.status == OrderStatus.cancelled)
        .toList();
  }

  int getOrderCount() {
    return state.orders.length;
  }
}

final orderRepositoryProvider = Provider((ref) => OrderRepositoryImpl(
      ref.read(dioClientProvider),
      ref.read(hiveStorageProvider),
    ));

final orderProvider =
    StateNotifierProvider<OrderNotifier, OrderState>((ref) {
  return OrderNotifier(
    ref.read(orderRepositoryProvider),
    ref.read(hiveStorageProvider),
  );
});
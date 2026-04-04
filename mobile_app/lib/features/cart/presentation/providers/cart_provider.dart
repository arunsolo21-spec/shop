import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/hive_storage.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../data/cart_repository_impl.dart';
import '../../domain/entities/cart_item.dart';
import '../../domain/usecases/add_to_cart.dart';
import '../../domain/usecases/calculate_total.dart';

final cartRepositoryProvider = Provider((ref) => CartRepositoryImpl(
  ref.read(hiveStorageProvider),
  ref.read(dioClientProvider),
  ref.read(secureStorageProvider),
));

final addToCartUseCaseProvider =
    Provider((ref) => AddToCartUseCase(ref.read(cartRepositoryProvider)));

final calculateTotalUseCaseProvider =
    Provider((ref) => CalculateTotalUseCase());

class CartState {
  final bool isLoading;
  final String? error;
  final List<CartItem> items;
  final double totalAmount;
  final bool isSyncing;
  const CartState({
    this.isLoading = false,
    this.error,
    this.items = const [],
    this.totalAmount = 0.0,
    this.isSyncing = false,
  });

  CartState copyWith({
    bool? isLoading,
    String? error,
    List<CartItem>? items,
    double? totalAmount,
    bool? isSyncing,
  }) {
    return CartState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      items: items ?? this.items,
      totalAmount: totalAmount ?? this.totalAmount,
      isSyncing: isSyncing ?? this.isSyncing,
    );
  }
}

class CartNotifier extends StateNotifier<CartState> {
  final CartRepositoryImpl _repository;
  final AddToCartUseCase _addToCartUseCase;
  final CalculateTotalUseCase _calculateTotalUseCase;

  CartNotifier(
    this._repository,
    this._addToCartUseCase,
    this._calculateTotalUseCase,
  ) : super(const CartState());

  Future<void> loadCart() async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      final result = await _repository.getCartItems();
      result.fold(
        (failure) {
          state = state.copyWith(
            isLoading: false,
            error: failure.message,
            items: const [],
            totalAmount: 0.0,
          );
        },
        (items) {
          final total = _calculateTotalUseCase(items);
          state = state.copyWith(
            isLoading: false,
            items: items,
            totalAmount: total,
            error: null,
          );
        },
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load cart: $e',
        items: const [],
        totalAmount: 0.0,
      );
    }
  }

  Future<void> addItem(CartItem item) async {
    try {
      final result = await _addToCartUseCase(item);
      result.fold(
        (failure) {
          state = state.copyWith(error: failure.message);
        },
        (_) async {
          await loadCart();
        },
      );
    } catch (e) {
      state = state.copyWith(error: 'Failed to add item: $e');
    }
  }

  Future<void> updateQuantity(String productId, int quantity) async {
    if (quantity < 1) {
      await removeItem(productId);
      return;
    }
    try {
      final result = await _repository.updateQuantity(productId, quantity);
      result.fold(
        (failure) {
          state = state.copyWith(error: failure.message);
        },
        (_) async {
          await loadCart();
        },
      );
    } catch (e) {
      state = state.copyWith(error: 'Failed to update quantity: $e');
    }
  }

  Future<void> removeItem(String productId) async {
    try {
      final result = await _repository.removeFromCart(productId);
      result.fold(
        (failure) {
          state = state.copyWith(error: failure.message);
        },
        (_) async {
          await loadCart();
        },
      );
    } catch (e) {
      state = state.copyWith(error: 'Failed to remove item: $e');
    }
  }

  Future<void> clearCart() async {
    try {
      await _repository.clearCart();
      state = const CartState();
    } catch (e) {
      state = state.copyWith(error: 'Failed to clear cart: $e');
    }
  }

  Future<void> syncCartToBackend() async {
    try {
      state = state.copyWith(isSyncing: true, error: null);
      final result = await _repository.syncLocalCartToBackend();
      result.fold(
        (failure) {
          state = state.copyWith(
            isSyncing: false,
            error: failure.message,
          );
        },
        (_) async {
          state = state.copyWith(isSyncing: false);
          await loadCart();
        },
      );
    } catch (e) {
      state = state.copyWith(
        isSyncing: false,
        error: 'Failed to sync cart: $e',
      );
    }
  }

  int getCartItemCount() {
    return state.items.fold(0, (sum, item) => sum + item.quantity);
  }

  double getCartTotal() {
    return state.totalAmount;
  }

  bool isCartEmpty() {
    return state.items.isEmpty;
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier(
    ref.read(cartRepositoryProvider),
    ref.read(addToCartUseCaseProvider),
    ref.read(calculateTotalUseCaseProvider),
  );
});
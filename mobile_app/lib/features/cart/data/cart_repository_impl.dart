import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/storage/hive_storage.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/secure_storage.dart';
import '../domain/entities/cart_item.dart';
import '../domain/repositories/cart_repository.dart';
import 'dart:convert';

class CartRepositoryImpl implements CartRepository {
  final HiveStorageService _hiveStorage;
  final DioClient _dioClient;
  final SecureStorageService _secureStorage;

  CartRepositoryImpl(
    this._hiveStorage,
    this._dioClient,
    this._secureStorage,
  );

  Future<int> _getUserId() async {
    try {
      final token = await _secureStorage.getToken();
      if (token != null && token.isNotEmpty) {
        final parts = token.split('.');
        if (parts.length >= 2) {
          final payload = parts[1];
          final normalized = base64Url.normalize(payload);
          final decoded = utf8.decode(base64Url.decode(normalized));
          final json = jsonDecode(decoded) as Map<String, dynamic>;
          final userId = json['userId'] as int?;
          if (userId != null && userId > 0) {
            return userId;
          }
        }
      }
    } catch (e) {
      return 0;
    }
    return 0;
  }

  @override
  Future<Either<Failure, List<CartItem>>> getCartItems() async {
    try {
      final userId = await _getUserId();
      if (userId > 0) {
        try {
          final response = await _dioClient.get('/cart');
          if (response.statusCode == 200) {
            final data = response.data;
            if (data['success'] == true && data['data'] != null) {
              final itemsData = data['data']['items'] as List? ?? [];
              if (itemsData.isNotEmpty) {
                final backendItems = itemsData
                    .map((e) => CartItem.fromJson(e))
                    .toList();
                for (final item in backendItems) {
                  await _hiveStorage.saveToCart(item.productId, item.toJson());
                }
                return Right(backendItems);
              }
            }
          }
        } catch (e) {
        }
      }
      final localData = _hiveStorage.getCartItems();
      final localItems = localData.map((e) => CartItem.fromJson(e)).toList();
      return Right(localItems);
    } on DioException {
      final localData = _hiveStorage.getCartItems();
      final localItems = localData.map((e) => CartItem.fromJson(e)).toList();
      return Right(localItems);
    } catch (e) {
      return const Left(CacheFailure('Failed to load cart items'));
    }
  }

  @override
  Future<Either<Failure, void>> addToCart(CartItem item) async {
    try {
      final userId = await _getUserId();
      if (userId > 0) {
        try {
          final response = await _dioClient.post('/cart/add', data: {
            'productId': int.tryParse(item.productId) ?? 0,
            'quantity': item.quantity,
          });
          if (response.statusCode == 200 || response.statusCode == 201) {
            await _hiveStorage.saveToCart(item.productId, item.toJson());
            return const Right(null);
          }
        } catch (e) {
        }
      }
      await _hiveStorage.saveToCart(item.productId, item.toJson());
      return const Right(null);
    } on DioException {
      await _hiveStorage.saveToCart(item.productId, item.toJson());
      return const Right(null);
    } catch (e) {
      await _hiveStorage.saveToCart(item.productId, item.toJson());
      return const Right(null);
    }
  }

  @override
  Future<Either<Failure, void>> removeFromCart(String productId) async {
    try {
      final userId = await _getUserId();
      if (userId > 0) {
        try {
          await _dioClient.delete('/cart/remove/$productId');
        } catch (e) {
        }
      }
      await _hiveStorage.removeFromCart(productId);
      return const Right(null);
    } on DioException {
      await _hiveStorage.removeFromCart(productId);
      return const Right(null);
    } catch (e) {
      await _hiveStorage.removeFromCart(productId);
      return const Right(null);
    }
  }

  @override
  Future<Either<Failure, void>> updateQuantity(String productId, int quantity) async {
    try {
      final userId = await _getUserId();
      if (userId > 0) {
        try {
          await _dioClient.put('/cart/update', data: {
            'productId': int.tryParse(productId) ?? 0,
            'quantity': quantity,
          });
        } catch (e) {
        }
      }
      final localData = _hiveStorage.getCartItems();
      final itemData = localData.firstWhere(
        (element) => element['productId'] == productId,
        orElse: () => <String, dynamic>{},
      );
      if (itemData.isNotEmpty) {
        final originalItem = CartItem.fromJson(itemData);
        final updatedItem = originalItem.copyWith(quantity: quantity);
        await _hiveStorage.saveToCart(productId, updatedItem.toJson());
      }
      return const Right(null);
    } on DioException {
      final localData = _hiveStorage.getCartItems();
      final itemData = localData.firstWhere(
        (element) => element['productId'] == productId,
        orElse: () => <String, dynamic>{},
      );
      if (itemData.isNotEmpty) {
        final originalItem = CartItem.fromJson(itemData);
        final updatedItem = originalItem.copyWith(quantity: quantity);
        await _hiveStorage.saveToCart(productId, updatedItem.toJson());
      }
      return const Right(null);
    } catch (e) {
      final localData = _hiveStorage.getCartItems();
      final itemData = localData.firstWhere(
        (element) => element['productId'] == productId,
        orElse: () => <String, dynamic>{},
      );
      if (itemData.isNotEmpty) {
        final originalItem = CartItem.fromJson(itemData);
        final updatedItem = originalItem.copyWith(quantity: quantity);
        await _hiveStorage.saveToCart(productId, updatedItem.toJson());
      }
      return const Right(null);
    }
  }

  @override
  Future<Either<Failure, void>> clearCart() async {
    try {
      final userId = await _getUserId();
      if (userId > 0) {
        try {
          await _dioClient.delete('/cart/clear');
        } catch (e) {
        }
      }
      await _hiveStorage.clearCart();
      return const Right(null);
    } on DioException {
      await _hiveStorage.clearCart();
      return const Right(null);
    } catch (e) {
      await _hiveStorage.clearCart();
      return const Right(null);
    }
  }

  Future<Either<Failure, void>> syncLocalCartToBackend() async {
    try {
      final userId = await _getUserId();
      if (userId <= 0) {
        return const Right(null);
      }
      final localCartItems = _hiveStorage.getCartItems();
      if (localCartItems.isEmpty) {
        return const Right(null);
      }
      for (final itemData in localCartItems) {
        try {
          final item = CartItem.fromJson(itemData);
          await _dioClient.post('/cart/add', data: {
            'productId': int.tryParse(item.productId) ?? 0,
            'quantity': item.quantity,
          });
        } catch (e) {
        }
      }
      await _hiveStorage.clearCart();
      return const Right(null);
    } catch (e) {
      return const Left(ServerFailure('Failed to sync cart to backend'));
    }
  }
}
import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/hive_storage.dart';
import '../../checkout/domain/entities/order.dart' as order_entity;
import '../domain/repositories/order_repository.dart';

class OrderRepositoryImpl implements OrderRepository {
  final DioClient _dioClient;
  final HiveStorageService _hiveStorage;

  OrderRepositoryImpl(this._dioClient, this._hiveStorage);

  @override
  Future<Either<Failure, List<order_entity.Order>>> getUserOrders(
      int userId) async {
    try {
      final response = await _dioClient.get('/orders');
      if (response.statusCode == 200) {
        final ordersData = response.data['data'] as List? ?? [];
        final orders = ordersData
            .map((e) => order_entity.Order.fromJson(e as Map<String, dynamic>))
            .toList();
        if (orders.isNotEmpty) {
          await _hiveStorage
              .cacheOrders(orders.map((e) => e.toJson()).toList());
        }
        return Right(orders);
      }
      final cachedOrders = _hiveStorage.getCachedOrders();
      final orders = cachedOrders
          .map((e) => order_entity.Order.fromJson(e))
          .toList();
      return Right(orders);
    } on DioException {
      final cachedOrders = _hiveStorage.getCachedOrders();
      final orders = cachedOrders
          .map((e) => order_entity.Order.fromJson(e))
          .toList();
      return Right(orders);
    } catch (e) {
      return const Left(ServerFailure('Failed to load orders'));
    }
  }

  @override
  Future<Either<Failure, order_entity.Order>> getOrderById(
      int userId, int orderId) async {
    try {
      final response = await _dioClient.get('/orders/$orderId');
      if (response.statusCode == 200) {
        final orderData = response.data['data'] as Map<String, dynamic>?;
        if (orderData != null) {
          final order = order_entity.Order.fromJson(orderData);
          return Right(order);
        }
      }
      return const Left(ServerFailure('Order not found'));
    } on DioException catch (e) {
      final errorMessage =
          e.response?.data['message'] ?? e.message ?? 'Failed to fetch order';
      return Left(ServerFailure(errorMessage.toString()));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, order_entity.Order>> createOrder(
      int userId,
      CreateOrderParams params,
    ) async {
    try {
      final payload = {
        'items': params.items
            .map((e) => {
                  'productId': e.productId,
                  'quantity': e.quantity,
                })
            .toList(),
        'addressId': params.addressId,
        'paymentMethod': params.paymentMethod,
      };
      final response = await _dioClient.post('/orders', data: payload);
      if (response.statusCode == 200 || response.statusCode == 201) {
        final orderData = response.data['data'] as Map<String, dynamic>?;
        if (orderData != null) {
          final order = order_entity.Order.fromJson(orderData);
          await _hiveStorage.clearCart();
          return Right(order);
        }
      }
      final errorMessage = response.data['message'] ?? 'Failed to place order';
      return Left(ServerFailure(errorMessage.toString()));
    } on DioException catch (e) {
      final errorMessage =
          e.response?.data['message'] ?? e.message ?? 'Failed to place order';
      return Left(ServerFailure(errorMessage.toString()));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, order_entity.Order>> updateOrderStatus(
      int orderId,
      order_entity.OrderStatus status,
    ) async {
    try {
      final response = await _dioClient.patch(
        '/orders/admin/$orderId/status',
        data: {'status': status.name.toUpperCase()},
      );
      if (response.statusCode == 200) {
        final orderData = response.data['data'] as Map<String, dynamic>?;
        if (orderData != null) {
          final order = order_entity.Order.fromJson(orderData);
          return Right(order);
        }
      }
      return const Left(ServerFailure('Failed to update order status'));
    } on DioException catch (e) {
      final errorMessage =
          e.response?.data['message'] ?? e.message ?? 'Failed to update status';
      return Left(ServerFailure(errorMessage.toString()));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, order_entity.OrderStats>> getOrderStats() async {
    try {
      final response = await _dioClient.get('/orders/admin/stats/summary');
      if (response.statusCode == 200) {
        final statsData = response.data['data'] as Map<String, dynamic>?;
        if (statsData != null) {
          final stats = order_entity.OrderStats.fromJson(statsData);
          return Right(stats);
        }
      }
      return const Left(ServerFailure('Failed to fetch order statistics'));
    } on DioException catch (e) {
      final errorMessage =
          e.response?.data['message'] ?? e.message ?? 'Failed to fetch stats';
      return Left(ServerFailure(errorMessage.toString()));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> cancelOrder(int orderId, String reason) async {
    try {
      final response = await _dioClient.patch(
        '/orders/admin/$orderId/status',
        data: {
          'status': 'CANCELLED',
          'cancellationReason': reason,
        },
      );
      if (response.statusCode == 200) {
        return const Right(null);
      }
      final errorMessage = response.data['message'] ?? 'Failed to cancel order';
      return Left(ServerFailure(errorMessage.toString()));
    } on DioException catch (e) {
      final errorMessage =
          e.response?.data['message'] ?? e.message ?? 'Failed to cancel order';
      return Left(ServerFailure(errorMessage.toString()));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
import 'package:fpdart/fpdart.dart';
import '../../../../core/error/failures.dart';
import '../../../checkout/domain/entities/order.dart' as order_entity;

abstract class OrderRepository {
  Future<Either<Failure, List<order_entity.Order>>> getUserOrders(int userId);
  Future<Either<Failure, order_entity.Order>> getOrderById(
      int userId, int orderId);
  Future<Either<Failure, order_entity.Order>> createOrder(
      int userId, CreateOrderParams params);
  Future<Either<Failure, order_entity.Order>> updateOrderStatus(
      int orderId, order_entity.OrderStatus status);
  Future<Either<Failure, order_entity.OrderStats>> getOrderStats();
  Future<Either<Failure, void>> cancelOrder(int orderId, String reason);
}

class CreateOrderParams {
  final List<OrderItemParams> items;
  final int addressId;
  final String paymentMethod;

  const CreateOrderParams({
    required this.items,
    required this.addressId,
    required this.paymentMethod,
  });
}

class OrderItemParams {
  final int productId;
  final int quantity;

  const OrderItemParams({
    required this.productId,
    required this.quantity,
  });
}
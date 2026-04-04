import '../entities/cart_item.dart';

class CalculateTotalUseCase {
  double call(List<CartItem> items) {
    double total = 0;
    for (var item in items) {
      total += item.price * item.quantity;
    }
    return total;
  }
}

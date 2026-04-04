import 'package:fpdart/fpdart.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../entities/cart_item.dart';
import '../repositories/cart_repository.dart';

class AddToCartUseCase implements UseCase<void, CartItem> {
  final CartRepository _repository;

  AddToCartUseCase(this._repository);

  @override
  Future<Either<Failure, void>> call(CartItem params) async {
    return await _repository.addToCart(params);
  }
}

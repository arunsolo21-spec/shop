import 'package:fpdart/fpdart.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../product_repository.dart';
import '../entities/product.dart';

class GetProductDetailsUseCase
    implements UseCase<Product, GetProductDetailsParams> {
  final ProductRepository _repository;

  GetProductDetailsUseCase(this._repository);

  @override
  Future<Either<Failure, Product>> call(GetProductDetailsParams params) async {
    return await _repository.getProductById(params.productId);
  }
}

class GetProductDetailsParams {
  final int productId;

  const GetProductDetailsParams({
    required this.productId,
  });
}

class Product {
  final int id;
  final String name;
  final String brand;
  final String variant;
  final double price;
  final double mrp;
  final int discount;
  final String? description;
  final String? shortDescription;
  final String? imageUrl;
  final List<String> images;
  final bool inStock;
  final int quantity;
  final bool isFeatured;
  final bool isBestseller;
  final bool showOnHome;
  final List<String> searchKeywords;
  final SubCategory? subCategory;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Product({
    required this.id,
    required this.name,
    required this.brand,
    required this.variant,
    required this.price,
    required this.mrp,
    required this.discount,
    this.description,
    this.shortDescription,
    this.imageUrl,
    this.images = const [],
    required this.inStock,
    required this.quantity,
    required this.isFeatured,
    required this.isBestseller,
    required this.showOnHome,
    required this.searchKeywords,
    this.subCategory,
    required this.createdAt,
    required this.updatedAt,
  });

  String get displayPrice => '₹${price.toStringAsFixed(2)}';
  String get displayMrp => mrp > price ? '₹${mrp.toStringAsFixed(2)}' : '';
  String get displayDiscount => discount > 0 ? '$discount% OFF' : '';
  String get displayQuantity => '$quantity ${_getUnit(variant)}';
  bool get hasDiscount => mrp > price && discount > 0;
  bool get isAvailable => inStock && quantity > 0;

  String _getUnit(String variant) {
    final lower = variant.toLowerCase();
    if (lower.contains('kg') ||
        lower.contains('litre') ||
        lower.contains('ltr')) {
      return lower.contains('kg') ? 'kg' : 'L';
    }
    if (lower.contains('g') || lower.contains('ml')) {
      return lower.contains('g') ? 'g' : 'ml';
    }
    return 'unit';
  }

  String get categoryPath {
    if (subCategory?.category?.name != null) {
      return '${subCategory!.category!.name} > ${subCategory!.name}';
    }
    return subCategory?.name ?? 'Products';
  }

  List<String> get searchTags => [
        name.toLowerCase(),
        brand.toLowerCase(),
        variant.toLowerCase(),
        ...searchKeywords.map((e) => e.toLowerCase()),
        if (subCategory?.name != null) subCategory!.name.toLowerCase(),
        if (subCategory?.category?.name != null)
          subCategory!.category!.name.toLowerCase(),
      ];

  bool matchesSearch(String query) {
    final lowerQuery = query.toLowerCase().trim();
    return searchTags.any((tag) => tag.contains(lowerQuery));
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Product &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          name == other.name &&
          price == other.price &&
          updatedAt == other.updatedAt;

  @override
  int get hashCode => id.hashCode ^ name.hashCode ^ updatedAt.hashCode;

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      brand: json['brand'] ?? '',
      variant: json['variant'] ?? '1 unit',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      mrp: (json['mrp'] as num?)?.toDouble() ?? 0.0,
      discount: json['discount'] ?? 0,
      description: json['description'],
      shortDescription: json['shortDescription'],
      imageUrl: json['imageUrl'],
      images:
          (json['images'] as List?)?.map((e) => e.toString()).toList() ?? [],
      inStock: json['inStock'] ?? true,
      quantity: json['quantity'] ?? 0,
      isFeatured: json['isFeatured'] ?? false,
      isBestseller: json['isBestseller'] ?? false,
      showOnHome: json['showOnHome'] ?? true,
      searchKeywords: (json['searchKeywords'] as List?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      subCategory: json['subCategory'] != null
          ? SubCategory.fromJson(json['subCategory'] as Map<String, dynamic>)
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'brand': brand,
      'variant': variant,
      'price': price,
      'mrp': mrp,
      'discount': discount,
      'description': description,
      'shortDescription': shortDescription,
      'imageUrl': imageUrl,
      'images': images,
      'inStock': inStock,
      'quantity': quantity,
      'isFeatured': isFeatured,
      'isBestseller': isBestseller,
      'showOnHome': showOnHome,
      'searchKeywords': searchKeywords,
      'subCategory': subCategory?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Product copyWith({
    int? id,
    String? name,
    String? brand,
    String? variant,
    double? price,
    double? mrp,
    int? discount,
    String? description,
    String? shortDescription,
    String? imageUrl,
    List<String>? images,
    bool? inStock,
    int? quantity,
    bool? isFeatured,
    bool? isBestseller,
    bool? showOnHome,
    List<String>? searchKeywords,
    SubCategory? subCategory,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      brand: brand ?? this.brand,
      variant: variant ?? this.variant,
      price: price ?? this.price,
      mrp: mrp ?? this.mrp,
      discount: discount ?? this.discount,
      description: description ?? this.description,
      shortDescription: shortDescription ?? this.shortDescription,
      imageUrl: imageUrl ?? this.imageUrl,
      images: images ?? this.images,
      inStock: inStock ?? this.inStock,
      quantity: quantity ?? this.quantity,
      isFeatured: isFeatured ?? this.isFeatured,
      isBestseller: isBestseller ?? this.isBestseller,
      showOnHome: showOnHome ?? this.showOnHome,
      searchKeywords: searchKeywords ?? this.searchKeywords,
      subCategory: subCategory ?? this.subCategory,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class SubCategory {
  final int id;
  final String name;
  final String? image;
  final bool isActive;
  final int priority;
  final int categoryId;
  final Category? category;

  const SubCategory({
    required this.id,
    required this.name,
    this.image,
    required this.isActive,
    required this.priority,
    required this.categoryId,
    this.category,
  });

  factory SubCategory.fromJson(Map<String, dynamic> json) {
    return SubCategory(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      image: json['image'],
      isActive: json['isActive'] ?? true,
      priority: json['priority'] ?? 0,
      categoryId: json['categoryId'] ?? 0,
      category: json['category'] != null
          ? Category.fromJson(json['category'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'image': image,
      'isActive': isActive,
      'priority': priority,
      'categoryId': categoryId,
      'category': category?.toJson(),
    };
  }
}

class Category {
  final int id;
  final String name;
  final String? image;
  final bool isActive;
  final int priority;

  const Category({
    required this.id,
    required this.name,
    this.image,
    required this.isActive,
    required this.priority,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      image: json['image'],
      isActive: json['isActive'] ?? true,
      priority: json['priority'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'image': image,
      'isActive': isActive,
      'priority': priority,
    };
  }
}

abstract class ProductRepository {
  Future<Either<Failure, Product>> getProductById(int productId);
  Future<Either<Failure, List<Product>>> getProducts({
    int? page,
    int? limit,
    String? search,
    int? categoryId,
    int? subCategoryId,
    String? sortBy,
    String? sortOrder,
    double? minPrice,
    double? maxPrice,
    bool? inStock,
  });
  Future<Either<Failure, List<Product>>> getFeaturedProducts({int limit = 12});
  Future<Either<Failure, List<Product>>> getBestsellers({int limit = 12});
}

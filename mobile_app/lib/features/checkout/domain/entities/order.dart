import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart'; 


class Order extends Equatable {
  final int id;
  final String orderId;
  final int userId;
  final double totalAmount;
  final OrderStatus status;
  final String paymentMethod;
  final String? paymentId;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final List<OrderItem> items;
  final Address? address;
  final User? user;

  const Order({
    required this.id,
    required this.orderId,
    required this.userId,
    required this.totalAmount,
    required this.status,
    required this.paymentMethod,
    this.paymentId,
    required this.createdAt,
    this.updatedAt,
    required this.items,
    this.address,
    this.user,
  });

  double get subtotal =>
      items.fold(0, (sum, item) => sum + (item.price * item.quantity));
  double get deliveryFee => totalAmount > 500 ? 0 : 40;
  double get grandTotal => subtotal + deliveryFee;

  bool get isTrackable =>
      status == OrderStatus.confirmed ||
      status == OrderStatus.packed ||
      status == OrderStatus.outForDelivery;

  bool get canCancel =>
      status == OrderStatus.pending || status == OrderStatus.confirmed;

  @override
  List<Object?> get props => [
        id,
        orderId,
        userId,
        totalAmount,
        status,
        paymentMethod,
        paymentId,
        createdAt,
        updatedAt,
        items,
        address,
        user,
      ];

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? 0,
      orderId: json['orderId'] ?? '',
      userId: json['userId'] ?? 0,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      status: OrderStatus.values.firstWhere(
        (e) => e.name == (json['status']?.toString() ?? 'PENDING'),
        orElse: () => OrderStatus.pending,
      ),
      paymentMethod: json['paymentMethod'] ?? 'COD',
      paymentId: json['paymentId'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt:
          json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
      items: (json['items'] as List?)
              ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      address: json['address'] != null
          ? Address.fromJson(json['address'] as Map<String, dynamic>)
          : null,
      user: json['user'] != null
          ? User.fromJson(json['user'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderId': orderId,
      'userId': userId,
      'totalAmount': totalAmount,
      'status': status.name,
      'paymentMethod': paymentMethod,
      'paymentId': paymentId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'items': items.map((e) => e.toJson()).toList(),
      'address': address?.toJson(),
      'user': user?.toJson(),
    };
  }
}

class OrderItem extends Equatable {
  final int? id;
  final int productId;
  final String? name;
  final String? image;
  final double price;
  final int quantity;

  const OrderItem({
    this.id,
    required this.productId,
    this.name,
    this.image,
    required this.price,
    required this.quantity,
  });

  double get totalPrice => price * quantity;

  @override
  List<Object?> get props => [id, productId, name, image, price, quantity];

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'],
      productId: json['productId'] ?? 0,
      name: json['name'],
      image: json['image'],
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      quantity: json['quantity'] ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productId': productId,
      'name': name,
      'image': image,
      'price': price,
      'quantity': quantity,
    };
  }
}

class Address extends Equatable {
  final int id;
  final String name;
  final String phone;
  final String street;
  final String? landmark;
  final String city;
  final String? district;
  final String state;
  final String zip;
  final String country;
  final bool isDefault;
  final int userId;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Address({
    required this.id,
    required this.name,
    required this.phone,
    required this.street,
    this.landmark,
    required this.city,
    this.district,
    required this.state,
    required this.zip,
    required this.country,
    required this.isDefault,
    required this.userId,
    required this.createdAt,
    required this.updatedAt,
  });

  String get formattedAddress {
    final parts = [
      street,
      if (landmark?.isNotEmpty ?? false) landmark,
      city,
      if (district?.isNotEmpty ?? false) district,
      '$state $zip',
      country,
    ].where((e) => e?.isNotEmpty ?? false).toList();
    return parts.join(', ');
  }

  @override
  List<Object?> get props => [
        id,
        name,
        phone,
        street,
        landmark,
        city,
        district,
        state,
        zip,
        country,
        isDefault,
        userId,
        createdAt,
        updatedAt,
      ];

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      street: json['street'] ?? '',
      landmark: json['landmark'],
      city: json['city'] ?? '',
      district: json['district'],
      state: json['state'] ?? 'Tamil Nadu',
      zip: json['zip'] ?? '',
      country: json['country'] ?? 'India',
      isDefault: json['isDefault'] ?? false,
      userId: json['userId'] ?? 0,
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
      'phone': phone,
      'street': street,
      'landmark': landmark,
      'city': city,
      'district': district,
      'state': state,
      'zip': zip,
      'country': country,
      'isDefault': isDefault,
      'userId': userId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class User extends Equatable {
  final int id;
  final String email;
  final String? name;
  final String? phone;
  final String role;
  final bool isActive;
  final String? profileImage;

  const User({
    required this.id,
    required this.email,
    this.name,
    this.phone,
    required this.role,
    required this.isActive,
    this.profileImage,
  });

  @override
  List<Object?> get props =>
      [id, email, name, phone, role, isActive, profileImage];

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      email: json['email'] ?? '',
      name: json['name'],
      phone: json['phone'],
      role: json['role'] ?? 'USER',
      isActive: json['isActive'] ?? true,
      profileImage: json['profileImage'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phone': phone,
      'role': role,
      'isActive': isActive,
      'profileImage': profileImage,
    };
  }
}

enum OrderStatus {
  pending,
  confirmed,
  packed,
  outForDelivery,
  delivered,
  cancelled,
}

extension OrderStatusExtension on OrderStatus {
  String get label {
    switch (this) {
      case OrderStatus.pending:
        return 'Pending';
      case OrderStatus.confirmed:
        return 'Confirmed';
      case OrderStatus.packed:
        return 'Packed';
      case OrderStatus.outForDelivery:
        return 'Out for Delivery';
      case OrderStatus.delivered:
        return 'Delivered';
      case OrderStatus.cancelled:
        return 'Cancelled';
    }
  }

  Color get color {
    switch (this) {
      case OrderStatus.pending:
        return Colors.orange;
      case OrderStatus.confirmed:
        return Colors.blue;
      case OrderStatus.packed:
        return Colors.purple;
      case OrderStatus.outForDelivery:
        return Colors.indigo;
      case OrderStatus.delivered:
        return Colors.green;
      case OrderStatus.cancelled:
        return Colors.red;
    }
  }
}
class OrderStats extends Equatable {
  final int totalOrders;
  final double totalRevenue;
  final int pendingOrders;
  final int deliveredOrders;
  final int cancelledOrders;

  const OrderStats({
    required this.totalOrders,
    required this.totalRevenue,
    required this.pendingOrders,
    required this.deliveredOrders,
    this.cancelledOrders = 0,
  });

  @override
  List<Object?> get props => [
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
      ];

  factory OrderStats.fromJson(Map<String, dynamic> json) {
    return OrderStats(
      totalOrders: json['totalOrders'] ?? 0,
      totalRevenue: (json['totalRevenue'] as num?)?.toDouble() ?? 0.0,
      pendingOrders: json['pendingOrders'] ?? 0,
      deliveredOrders: json['deliveredOrders'] ?? 0,
      cancelledOrders: json['cancelledOrders'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalOrders': totalOrders,
      'totalRevenue': totalRevenue,
      'pendingOrders': pendingOrders,
      'deliveredOrders': deliveredOrders,
      'cancelledOrders': cancelledOrders,
    };
  }
}
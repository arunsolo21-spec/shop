import 'package:flutter/foundation.dart';

class Env {
  static String get baseUrl {
    if (kIsWeb) {
      const envUrl = String.fromEnvironment('BASE_URL');
      return envUrl.isNotEmpty ? envUrl : 'http://localhost:3000';
    }
    const envUrl = String.fromEnvironment('BASE_URL');
    return envUrl.isNotEmpty ? envUrl : 'http://10.0.2.2:3000'; // Android emulator
  }

  static const int connectTimeout = 30000;
  static const int receiveTimeout = 30000;
  static const bool isProduction = bool.fromEnvironment('PROD', defaultValue: false);
  
  static const String defaultState = "Tamil Nadu";
  static const String defaultCountry = "India";
  static const String pincodePattern = r'^\d{6}$';
  static const String phonePattern = r'^[6-9]\d{9}$';
  
  static const List<String> tamilNaduDistricts = [ /* your list */ ];

  // Auth
  static String get authLogin => '$baseUrl/auth/login';
  static String get authRegister => '$baseUrl/auth/register';
  static String get authForgotPassword => '$baseUrl/auth/forgot-password';
  static String get authResetPassword => '$baseUrl/auth/reset-password';

  // User
  static String get userProfile => '$baseUrl/users/profile';
  static String get profileEndpoint => '$baseUrl/users/profile';
  static String get userAddresses => '$baseUrl/users/addresses';
  static String get addressesEndpoint => '$baseUrl/users/addresses';

  // Orders
  static String get orders => '$baseUrl/orders';
  static String get ordersEndpoint => '$baseUrl/orders';

  // Home/Products
  static String get homeLayout => '$baseUrl/home/layout';
  static String get products => '$baseUrl/products';

  // Cart
  static String get cart => '$baseUrl/cart';

  // Categories/Banners
  static String get categories => '$baseUrl/categories';
  static String get banners => '$baseUrl/banners';

  // Payments
  static String get payments => '$baseUrl/payments';
  static String get initiatePayment => '$baseUrl/payments/initiate';
  static String get verifyPayment => '$baseUrl/payments/verify';
  static String get upiApps => '$baseUrl/payments/upi/apps'; // ✅ Public endpoint

  // Storage
  static const String jwtTokenKey = 'auth_token';
  static const String userDataKey = 'user_data';
  static const int tokenRefreshThreshold = 300;

  // Payment config
  static const String razorpayKeyId = 'rzp_test_xxxxx';
  static const String merchantId = 'freshmart';
  static const String merchantName = 'FreshMart Grocery';
}
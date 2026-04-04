import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HiveStorageService {
  static const String _preferencesBox = 'app_preferences';
  static const String _cartBox = 'cart_box';
  static const String _cacheBox = 'cache_box';
  static const String _profileCacheKey = 'profile_data';
  static const String _addressesCacheKey = 'addresses_data';
  static const String _ordersCacheKey = 'orders_data';
  static const String _productsCacheKey = 'products_cache';

  Future<void> init() async {
    try {
      if (kIsWeb) {
        Hive.init(null);
      } else {
        await Hive.initFlutter();
      }
      await Hive.openBox(_preferencesBox);
      await Hive.openBox(_cartBox);
      await Hive.openBox(_cacheBox);
    } catch (e) {
      throw Exception('Failed to initialize Hive: $e');
    }
  }

  Box get _prefs => Hive.box(_preferencesBox);
  Box get _cart => Hive.box(_cartBox);
  Box get _cache => Hive.box(_cacheBox);

  Future<void> saveThemeMode(bool isDark) async {
    await _prefs.put('is_dark_mode', isDark);
  }

  bool get isDarkMode => _prefs.get('is_dark_mode', defaultValue: false);

  Future<void> saveToCart(
      String productId, Map<String, dynamic> productData) async {
    try {
      await _cart.put(productId, productData);
    } catch (e) {
      throw Exception('Failed to save to cart: $e');
    }
  }

  List<Map<String, dynamic>> getCartItems() {
    try {
      final values = _cart.values;
      return values.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> removeFromCart(String productId) async {
    try {
      await _cart.delete(productId);
    } catch (e) {
      throw Exception('Failed to remove from cart: $e');
    }
  }

  Future<void> clearCart() async {
    try {
      await _cart.clear();
    } catch (e) {
      throw Exception('Failed to clear cart: $e');
    }
  }

  Future<void> saveToCache(String key, dynamic data,
      {Duration ttl = const Duration(hours: 1)}) async {
    try {
      await _cache.put(key, data);
      await _cache.put('${key}_timestamp', DateTime.now().toIso8601String());
      await _cache.put('${key}_ttl', ttl.inMilliseconds);
    } catch (e) {
      throw Exception('Failed to save to cache: $e');
    }
  }

  dynamic getFromCache(String key) {
    try {
      final timestamp = _cache.get('${key}_timestamp');
      final ttl = _cache.get('${key}_ttl', defaultValue: 3600000);
      if (timestamp == null) return null;
      final cacheTime = DateTime.parse(timestamp);
      final now = DateTime.now();
      if (now.difference(cacheTime).inMilliseconds > ttl) {
        _cache.delete(key);
        _cache.delete('${key}_timestamp');
        _cache.delete('${key}_ttl');
        return null;
      }
      return _cache.get(key);
    } catch (e) {
      return null;
    }
  }

  Future<void> clearCache(String key) async {
    try {
      await _cache.delete(key);
      await _cache.delete('${key}_timestamp');
      await _cache.delete('${key}_ttl');
    } catch (e) {
      throw Exception('Failed to clear cache: $e');
    }
  }

  Future<void> cacheProfile(Map<String, dynamic> profileData) async {
    await saveToCache(_profileCacheKey, profileData);
  }

  Map<String, dynamic>? getCachedProfile() {
    final data = getFromCache(_profileCacheKey);
    if (data == null) return null;
    return Map<String, dynamic>.from(data as Map);
  }

  Future<void> cacheAddresses(List<Map<String, dynamic>> addresses) async {
    await saveToCache(_addressesCacheKey, addresses);
  }

  List<Map<String, dynamic>> getCachedAddresses() {
    final data = getFromCache(_addressesCacheKey);
    if (data == null) return [];
    if (data is! List) return [];
    return data.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }

  Future<void> cacheOrders(List<Map<String, dynamic>> orders) async {
    await saveToCache(_ordersCacheKey, orders);
  }

  List<Map<String, dynamic>> getCachedOrders() {
    final data = getFromCache(_ordersCacheKey);
    if (data == null) return [];
    if (data is! List) return [];
    return data.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }

  Future<void> cacheProducts(List<Map<String, dynamic>> products) async {
    await saveToCache(_productsCacheKey, products,
        ttl: const Duration(minutes: 30));
  }

  List<Map<String, dynamic>> getCachedProducts() {
    final data = getFromCache(_productsCacheKey);
    if (data == null) return [];
    if (data is! List) return [];
    return data.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }

  Future<void> clearAllCache() async {
    try {
      await _cache.clear();
    } catch (e) {
      throw Exception('Failed to clear cache: $e');
    }
  }

  Future<void> dispose() async {
    try {
      await Hive.close();
    } catch (e) {
      throw Exception('Failed to close Hive: $e');
    }
  }
}

final hiveStorageProvider = Provider<HiveStorageService>((ref) {
  return HiveStorageService();
});
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepository(ref.watch(dioClientProvider));
});

class HomeRepository {
  final DioClient _dio;

  HomeRepository(this._dio);

  Future<Response> fetchHomeData() async {
    try {
      final response = await _dio.get(
        '/home/layout',
        options: Options(
          sendTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 15),
        ),
      );
      if (response.statusCode == 200) {
        return response;
      } else {
        if (kDebugMode) {
          debugPrint('❌ [HomeRepository] Unexpected status code: ${response.statusCode}');
        }
        throw Exception('Server returned ${response.statusCode}');
      }
    } on DioException catch (e) {
      if (kDebugMode) {
        debugPrint('❌ [HomeRepository] Error: ${e.message}');
      }
      if (kIsWeb && e.toString().contains('XMLHttpRequest')) {
        throw Exception(
          'Cannot connect to backend server. Please check:\n'
          '1. Backend is running at http://localhost:3000\n'
          '2. CORS is enabled on the server\n'
          '3. Your internet connection',
        );
      }
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout) {
        throw Exception(
          'Cannot connect to server. Please check:\n'
          '1. Your internet connection\n'
          '2. Backend is running\n'
          '3. Base URL is correct',
        );
      }
      throw Exception('Failed to fetch home data: ${e.message}');
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ [HomeRepository] Unexpected error: $e');
      }
      throw Exception('Unexpected error fetching home data: $e');
    }
  }

  Future<Response> fetchProductsBySubCategory(int subCategoryId) async {
    try {
      if (subCategoryId <= 0) {
        throw Exception('Invalid subCategoryId: $subCategoryId');
      }
      final response = await _dio.get(
        '/products',
        queryParameters: {'subCategoryId': subCategoryId.toString()},
        options: Options(
          sendTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 15),
        ),
      );
      return response;
    } on DioException catch (e) {
      if (kDebugMode) {
        debugPrint('❌ [HomeRepository] Error fetching products: ${e.message}');
      }
      throw Exception('Failed to fetch products: ${e.message}');
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ [HomeRepository] Unexpected error: $e');
      }
      throw Exception('Unexpected error fetching products: $e');
    }
  }

  Future<Response> fetchProductsByIds(List<String> productIds) async {
    try {
      if (productIds.isEmpty) {
        throw Exception('No product IDs provided');
      }
      final response = await _dio.post(
        '/products/by-ids',
        data: {'productIds': productIds},
        options: Options(
          sendTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 15),
        ),
      );
      return response;
    } on DioException catch (e) {
      if (kDebugMode) {
        debugPrint('❌ [HomeRepository] Error fetching products by IDs: ${e.message}');
      }
      throw Exception('Failed to fetch products: ${e.message}');
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ [HomeRepository] Unexpected error: $e');
      }
      throw Exception('Unexpected error fetching products: $e');
    }
  }

  Future<Response> searchProducts(String query) async {
    try {
      if (query.trim().isEmpty) {
        throw Exception('Search query cannot be empty');
      }
      final response = await _dio.get(
        '/products',
        queryParameters: {'search': query},
        options: Options(
          sendTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 15),
        ),
      );
      return response;
    } on DioException catch (e) {
      if (kDebugMode) {
        debugPrint('❌ [HomeRepository] Error searching products: ${e.message}');
      }
      throw Exception('Failed to search products: ${e.message}');
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ [HomeRepository] Unexpected error: $e');
      }
      throw Exception('Unexpected error searching products: $e');
    }
  }
}
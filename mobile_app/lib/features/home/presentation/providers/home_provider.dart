import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/home_repository.dart';
import '../../domain/entities/home_layout.dart';
import '../../../../core/network/dio_client.dart';

class HomeState {
  final bool isLoading;
  final HomeLayout? data;
  final String? error;
  final DateTime? lastRefreshed;

  HomeState({
    this.isLoading = false,
    this.data,
    this.error,
    this.lastRefreshed,
  });

  HomeState copyWith({
    bool? isLoading,
    HomeLayout? data,
    String? error,
    DateTime? lastRefreshed,
  }) {
    return HomeState(
      isLoading: isLoading ?? this.isLoading,
      data: data ?? this.data,
      error: error ?? this.error,
      lastRefreshed: lastRefreshed ?? this.lastRefreshed,
    );
  }
}

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepository(ref.watch(dioClientProvider));
});

final homeProvider = StateNotifierProvider<HomeNotifier, HomeState>((ref) {
  final repository = ref.watch(homeRepositoryProvider);
  return HomeNotifier(repository);
});

final searchProvider = FutureProvider.autoDispose
    .family<List<SimpleProduct>, String>((ref, query) async {
  final repository = ref.watch(homeRepositoryProvider);
  final response = await repository.searchProducts(query);
  if (response.statusCode == 200) {
    final responseData = response.data['data'];
    if (responseData == null) {
      throw Exception('No data in response');
    }
    final List<dynamic> productsData;
    if (responseData is List) {
      productsData = responseData;
    } else if (responseData is Map && responseData['data'] is List) {
      productsData = responseData['data'];
    } else {
      throw Exception('Invalid data format in response');
    }
    return productsData.map((e) {
      try {
        return SimpleProduct.fromJson(e);
      } catch (e) {
        throw Exception('Failed to parse product: $e');
      }
    }).toList();
  }
  throw Exception('Failed to load search results');
});

final categoryProductsProvider = FutureProvider.autoDispose
    .family<List<SimpleProduct>, int>((ref, subCategoryId) async {
  final repository = ref.watch(homeRepositoryProvider);
  final response = await repository.fetchProductsBySubCategory(subCategoryId);
  if (response.statusCode == 200) {
    final responseData = response.data['data'];
    if (responseData == null) {
      throw Exception('No data in response');
    }
    final List<dynamic> productsData;
    if (responseData is List) {
      productsData = responseData;
    } else if (responseData is Map && responseData['data'] is List) {
      productsData = responseData['data'];
    } else {
      throw Exception('Invalid data format in response');
    }
    return productsData.map((e) {
      try {
        return SimpleProduct.fromJson(e);
      } catch (e) {
        throw Exception('Failed to parse product: $e');
      }
    }).toList();
  }
  throw Exception('Failed to load products');
});

final productsByIdsProvider = FutureProvider.autoDispose
    .family<List<SimpleProduct>, List<String>>((ref, productIds) async {
  final repository = ref.watch(homeRepositoryProvider);
  final response = await repository.fetchProductsByIds(productIds);
  if (response.statusCode == 200) {
    final responseData = response.data['data'];
    if (responseData == null) {
      throw Exception('No data in response');
    }
    final List<dynamic> productsData;
    if (responseData is List) {
      productsData = responseData;
    } else if (responseData is Map && responseData['data'] is List) {
      productsData = responseData['data'];
    } else {
      throw Exception('Invalid data format in response');
    }
    return productsData.map((e) {
      try {
        return SimpleProduct.fromJson(e);
      } catch (e) {
        throw Exception('Failed to parse product: $e');
      }
    }).toList();
  }
  throw Exception('Failed to load products');
});

class HomeNotifier extends StateNotifier<HomeState> {
  final HomeRepository _repository;

  HomeNotifier(this._repository) : super(HomeState(isLoading: true));

  Future<void> loadHomeData({bool forceRefresh = false}) async {
    if (!forceRefresh &&
        state.data != null &&
        state.lastRefreshed != null &&
        DateTime.now().difference(state.lastRefreshed!).inMinutes < 5) {
      return;
    }

    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _repository.fetchHomeData();
      if (response.statusCode == 200) {
        final layout = HomeLayout.fromJson(response.data['data']);
        state = state.copyWith(
          isLoading: false,
          data: layout,
          error: null,
          lastRefreshed: DateTime.now(),
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: 'Failed to load data',
          lastRefreshed: DateTime.now(),
        );
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ [HomeNotifier] Error loading home data: $e');
      }
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
        lastRefreshed: DateTime.now(),
      );
    }
  }

  Future<void> refreshBanners() async {
    try {
      final response = await _repository.fetchHomeData();
      if (response.statusCode == 200) {
        final layout = HomeLayout.fromJson(response.data['data']);
        state = state.copyWith(
          data: HomeLayout(
            user: state.data?.user ?? layout.user,
            banners: layout.banners,
            directory: state.data?.directory ?? layout.directory,
          ),
          lastRefreshed: DateTime.now(),
        );
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ [HomeNotifier] Error refreshing banners: $e');
      }
    }
  }
}
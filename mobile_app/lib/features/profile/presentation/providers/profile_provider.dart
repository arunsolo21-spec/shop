// lib/features/profile/presentation/providers/profile_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../../../core/storage/hive_storage.dart';
import '../../../../core/config/env.dart';

class ProfileState {
  final bool isLoading;
  final bool isSubmitting;
  final String? error;
  final Map<String, dynamic>? userData;
  final List<Map<String, dynamic>> addresses;
  final List<Map<String, dynamic>> orders;
  final bool hasLoadedOnce;

  const ProfileState({
    this.isLoading = false,
    this.isSubmitting = false,
    this.error,
    this.userData,
    this.addresses = const [],
    this.orders = const [],
    this.hasLoadedOnce = false,
  });

  ProfileState copyWith({
    bool? isLoading,
    bool? isSubmitting,
    String? error,
    Map<String, dynamic>? userData,
    List<Map<String, dynamic>>? addresses,
    List<Map<String, dynamic>>? orders,
    bool? hasLoadedOnce,
  }) {
    return ProfileState(
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: error,
      userData: userData ?? this.userData,
      addresses: addresses ?? this.addresses,
      orders: orders ?? this.orders,
      hasLoadedOnce: hasLoadedOnce ?? this.hasLoadedOnce,
    );
  }
}

class ProfileNotifier extends StateNotifier<ProfileState> {
  final DioClient _dioClient;
  final SecureStorageService _secureStorage;
  final HiveStorageService _hiveStorage;

  ProfileNotifier(
    this._dioClient,
    this._secureStorage,
    this._hiveStorage,
  ) : super(const ProfileState());

  Future<void> loadProfile({bool forceRefresh = false}) async {
    if (!forceRefresh && state.hasLoadedOnce) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final cachedData = _hiveStorage.getCachedProfile();
      if (cachedData != null) {
        state = state.copyWith(
          isLoading: false,
          userData: cachedData,
          hasLoadedOnce: true,
        );
      }

      final response = await _dioClient.get(Env.profileEndpoint);
      if (response.statusCode == 200) {
        final data = response.data['data'] as Map<String, dynamic>;
        state = state.copyWith(
          isLoading: false,
          userData: data,
          error: null,
          hasLoadedOnce: true,
        );
        await _hiveStorage.cacheProfile(data);
      }
    } catch (_) {
      final cachedData = _hiveStorage.getCachedProfile();
      state = state.copyWith(
        isLoading: false,
        error: cachedData != null ? null : 'Failed to load profile',
        userData: cachedData ?? state.userData,
        hasLoadedOnce: cachedData != null,
      );
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    state = state.copyWith(isSubmitting: true, error: null);

    try {
      final response = await _dioClient.put(Env.profileEndpoint, data: data);
      if (response.statusCode == 200) {
        final updatedData = response.data['data'] as Map<String, dynamic>;
        state = state.copyWith(
          isSubmitting: false,
          userData: updatedData,
        );
        await _hiveStorage.cacheProfile(updatedData);
        return true;
      }
      state = state.copyWith(isSubmitting: false);
      return false;
    } catch (_) {
      state = state.copyWith(
        isSubmitting: false,
        error: 'Failed to update profile',
      );
      return false;
    }
  }

  Future<void> loadAddresses({bool forceRefresh = false}) async {
    if (!forceRefresh && state.addresses.isNotEmpty) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final cachedData = _hiveStorage.getCachedAddresses();
      if (cachedData.isNotEmpty) {
        state = state.copyWith(
          isLoading: false,
          addresses: cachedData,
        );
      }

      final response = await _dioClient.get(Env.addressesEndpoint);
      if (response.statusCode == 200) {
        final responseData = response.data['data'];
        final data = responseData is List
            ? responseData.map((e) => Map<String, dynamic>.from(e as Map)).toList()
            : <Map<String, dynamic>>[];

        state = state.copyWith(
          isLoading: false,
          addresses: data,
          error: null,
        );
        await _hiveStorage.cacheAddresses(data);
      }
    } catch (_) {
      final cachedData = _hiveStorage.getCachedAddresses();
      state = state.copyWith(
        isLoading: false,
        error: cachedData.isEmpty ? 'Failed to load addresses' : null,
        addresses: cachedData,
      );
    }
  }

  Future<bool> addAddress(Map<String, dynamic> addressData) async {
    state = state.copyWith(isSubmitting: true, error: null);

    try {
      final response = await _dioClient.post(Env.addressesEndpoint, data: addressData);
      if (response.statusCode == 201 || response.statusCode == 200) {
        await loadAddresses(forceRefresh: true);
        state = state.copyWith(isSubmitting: false);
        return true;
      }
      state = state.copyWith(isSubmitting: false);
      return false;
    } catch (_) {
      state = state.copyWith(
        isSubmitting: false,
        error: 'Failed to add address',
      );
      return false;
    }
  }

  Future<bool> updateAddress(int id, Map<String, dynamic> addressData) async {
    state = state.copyWith(isSubmitting: true, error: null);

    try {
      final response = await _dioClient.put(
        '${Env.addressesEndpoint}/$id',
        data: addressData,
      );
      if (response.statusCode == 200) {
        await loadAddresses(forceRefresh: true);
        state = state.copyWith(isSubmitting: false);
        return true;
      }
      state = state.copyWith(isSubmitting: false);
      return false;
    } catch (_) {
      state = state.copyWith(
        isSubmitting: false,
        error: 'Failed to update address',
      );
      return false;
    }
  }

  Future<bool> deleteAddress(int id) async {
    state = state.copyWith(isSubmitting: true, error: null);

    try {
      final response = await _dioClient.delete('${Env.addressesEndpoint}/$id');
      if (response.statusCode == 204 || response.statusCode == 200) {
        await loadAddresses(forceRefresh: true);
        state = state.copyWith(isSubmitting: false);
        return true;
      }
      state = state.copyWith(isSubmitting: false);
      return false;
    } catch (_) {
      state = state.copyWith(
        isSubmitting: false,
        error: 'Failed to delete address',
      );
      return false;
    }
  }

  Future<bool> setDefaultAddress(int id) async {
    state = state.copyWith(isSubmitting: true, error: null);

    try {
      final response = await _dioClient.post(
        '${Env.addressesEndpoint}/$id/set-default',
      );
      if (response.statusCode == 200) {
        await loadAddresses(forceRefresh: true);
        state = state.copyWith(isSubmitting: false);
        return true;
      }
      state = state.copyWith(isSubmitting: false);
      return false;
    } catch (_) {
      state = state.copyWith(
        isSubmitting: false,
        error: 'Failed to set default address',
      );
      return false;
    }
  }

  Future<void> loadOrders({bool forceRefresh = false}) async {
    if (!forceRefresh && state.orders.isNotEmpty) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final cachedData = _hiveStorage.getCachedOrders();
      if (cachedData.isNotEmpty) {
        state = state.copyWith(
          isLoading: false,
          orders: cachedData,
        );
      }

      final response = await _dioClient.get(Env.ordersEndpoint);
      if (response.statusCode == 200) {
        final responseData = response.data['data'];
        final data = responseData is List
            ? responseData.map((e) => Map<String, dynamic>.from(e as Map)).toList()
            : <Map<String, dynamic>>[];

        state = state.copyWith(
          isLoading: false,
          orders: data,
          error: null,
        );
        await _hiveStorage.cacheOrders(data);
      }
    } catch (_) {
      final cachedData = _hiveStorage.getCachedOrders();
      state = state.copyWith(
        isLoading: false,
        error: cachedData.isEmpty ? 'Failed to load orders' : null,
        orders: cachedData,
      );
    }
  }

  Future<void> logout() async {
    await _secureStorage.delete('auth_token');
    await _hiveStorage.clearCart();
    await _hiveStorage.clearAllCache();
    state = const ProfileState();
  }
}

final dioClientProvider = Provider<DioClient>((ref) => DioClient());
final secureStorageProvider = Provider<SecureStorageService>((ref) => SecureStorageService());
final hiveStorageProvider = Provider<HiveStorageService>((ref) => HiveStorageService());

final profileProvider = StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  return ProfileNotifier(
    ref.read(dioClientProvider),
    ref.read(secureStorageProvider),
    ref.read(hiveStorageProvider),
  );
});
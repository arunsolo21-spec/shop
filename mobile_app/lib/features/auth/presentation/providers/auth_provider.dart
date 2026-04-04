import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../../../core/storage/hive_storage.dart';
import '../../../../core/network/dio_client.dart';
import '../../data/auth_repository_impl.dart';
import '../../data/auth_remote_source.dart';
import '../../../cart/domain/entities/cart_item.dart';

class AuthState {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? user;
  final bool isAuthenticated;
  const AuthState({this.isLoading = false, this.error, this.user, this.isAuthenticated = false});
  AuthState copyWith({bool? isLoading, String? error, Map<String, dynamic>? user, bool? isAuthenticated}) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      user: user ?? this.user,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepositoryImpl _repository;
  final DioClient _dioClient;
  final HiveStorageService _hiveStorage;
  final SecureStorageService _secureStorage;

  AuthNotifier(this._repository, this._dioClient, this._hiveStorage, this._secureStorage) : super(const AuthState()) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    try {
      final token = await _secureStorage.getToken();
      if (token != null && token.isNotEmpty) {
        final user = await _fetchUserProfile();
        if (user != null) {
          state = state.copyWith(user: user, isAuthenticated: true, isLoading: false);
          await _syncLocalCartToBackend();
          return;
        }
      }
      state = state.copyWith(isAuthenticated: false, user: null, isLoading: false);
    } catch (_) {
      await _secureStorage.clearToken();
      state = state.copyWith(isAuthenticated: false, user: null, isLoading: false);
    }
  }

  Future<Map<String, dynamic>?> _fetchUserProfile() async {
    try {
      final response = await _dioClient.get('/users/profile');
      if (response.statusCode == 200) {
        final data = response.data;
        if (data['success'] == true && data['data'] != null) return data['data'] as Map<String, dynamic>;
      }
    } catch (_) {
      await _secureStorage.clearToken();
    }
    return null;
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _repository.login(email, password);
      return result.fold(
        (failure) { state = state.copyWith(isLoading: false, error: failure.message); return false; },
        (response) async {
          try {
            final data = response['data'] as Map<String, dynamic>? ?? response;
            final user = data['user'] as Map<String, dynamic>? ?? {};
            final token = data['access_token'] as String? ?? response['access_token'] as String?;
            if (token != null && token.isNotEmpty) {
              await _secureStorage.saveToken(token);
              state = state.copyWith(isLoading: false, user: user, isAuthenticated: true);
              await _syncLocalCartToBackend();
              return true;
            }
            state = state.copyWith(isLoading: false, error: 'No token received');
            return false;
          } catch (e) {
            state = state.copyWith(isLoading: false, error: 'Error processing login: $e');
            return false;
          }
        },
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Login failed: $e');
      return false;
    }
  }

  Future<bool> signInWithGoogle(String idToken, String accessToken, String name, String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _repository.googleSignIn(idToken: idToken, accessToken: accessToken, name: name, email: email);
      return result.fold(
        (failure) { state = state.copyWith(isLoading: false, error: failure.message); return false; },
        (response) async {
          try {
            final data = response['data'] as Map<String, dynamic>? ?? response;
            final user = data['user'] as Map<String, dynamic>? ?? {};
            final token = data['access_token'] as String? ?? response['access_token'] as String?;
            if (token != null && token.isNotEmpty) {
              await _secureStorage.saveToken(token);
              state = state.copyWith(isLoading: false, user: user, isAuthenticated: true);
              await _syncLocalCartToBackend();
              return true;
            }
            state = state.copyWith(isLoading: false, error: 'No token received');
            return false;
          } catch (e) {
            state = state.copyWith(isLoading: false, error: 'Google sign-in error: $e');
            return false;
          }
        },
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Google Sign-In failed: $e');
      return false;
    }
  }

  Future<void> _syncLocalCartToBackend() async {
    try {
      final localCartItems = _hiveStorage.getCartItems();
      if (localCartItems.isEmpty) return;
      for (final itemData in localCartItems) {
        try {
          final item = CartItem.fromJson(itemData);
          await _dioClient.post('/cart/add', data: {'productId': int.tryParse(item.productId) ?? 0, 'quantity': item.quantity});
        } catch (_) {}
      }
      await _hiveStorage.clearCart();
    } catch (_) {}
  }

  Future<bool> signup(String name, String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    final result = await _repository.register(name, email, password);
    return result.fold(
      (failure) { state = state.copyWith(isLoading: false, error: failure.message); return false; },
      (response) async {
        try {
          final user = response['data']?['user'] ?? response['user'] ?? {};
          final token = response['data']?['access_token'] ?? response['access_token'];
          if (token != null && token.isNotEmpty) {
            await _secureStorage.saveToken(token);
            state = state.copyWith(isLoading: false, user: user, isAuthenticated: true);
            await _syncLocalCartToBackend();
            return true;
          }
          state = state.copyWith(isLoading: false, error: 'No token received');
          return false;
        } catch (e) {
          state = state.copyWith(isLoading: false, error: 'Signup error: $e');
          return false;
        }
      },
    );
  }

  Future<bool> forgotPassword(String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _repository.forgotPassword(email);
      return result.fold(
        (failure) { state = state.copyWith(isLoading: false, error: failure.message); return false; },
        (_) { state = state.copyWith(isLoading: false); return true; },
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'Failed to send reset email');
      return false;
    }
  }

  Future<bool> resetPassword(String email, String token, String newPassword) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _repository.resetPassword(email, token, newPassword);
      return result.fold(
        (failure) { state = state.copyWith(isLoading: false, error: failure.message); return false; },
        (_) { state = state.copyWith(isLoading: false); return true; },
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'Failed to reset password');
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _repository.logout();
      await _secureStorage.clearToken();
      await _hiveStorage.clearCart();
      state = const AuthState();
    } catch (_) {}
  }

  void clearError() => state = state.copyWith(error: null);
}

// Providers
final secureStorageProvider = Provider((ref) => SecureStorageService());
final hiveStorageProvider = Provider((ref) => HiveStorageService());
final dioClientProvider = Provider((ref) => DioClient());
final authRemoteSourceProvider = Provider((ref) => AuthRemoteSource());
final authRepositoryProvider = Provider((ref) => AuthRepositoryImpl(ref.read(authRemoteSourceProvider), ref.read(secureStorageProvider)));
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier(
  ref.read(authRepositoryProvider), ref.read(dioClientProvider), ref.read(hiveStorageProvider), ref.read(secureStorageProvider),
));
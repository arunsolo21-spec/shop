import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/dio_client.dart';
import '../storage/secure_storage.dart';
import '../routing/app_router.dart';

final fcmServiceProvider = Provider<FCMService>((ref) {
  return FCMService(
    ref.read(dioClientProvider),
    ref.read(secureStorageProvider),
  );
});

class FCMService {
  final DioClient _dioClient;
  final SecureStorageService _secureStorage;
  final FirebaseMessaging _messaging;
  String? _deviceToken;
  bool _isInitialized = false;

  FCMService(this._dioClient, this._secureStorage)
      : _messaging = FirebaseMessaging.instance;

  Future<void> initialize() async {
    if (_isInitialized) return;
    try {
      if (!kIsWeb) {
        final settings = await _messaging.requestPermission(
          alert: true,
          badge: true,
          sound: true,
          provisional: false,
        );
        if (settings.authorizationStatus != AuthorizationStatus.authorized) {
          debugPrint('FCM permissions denied');
        }
      }

      _messaging.onTokenRefresh.listen((newToken) {
        _deviceToken = newToken;
        _registerTokenWithBackend().catchError((_) {});
      });

      await _getToken();
      await _setupMessageHandlers();
      _isInitialized = true;
    } catch (e) {
      debugPrint('FCM initialization error: $e');
    }
  }

  Future<void> _getToken() async {
    try {
      _deviceToken = await _messaging.getToken();
      if (_deviceToken != null && _deviceToken!.isNotEmpty) {
        await _registerTokenWithBackend();
      }
    } catch (e) {
      debugPrint('Failed to get FCM token: $e');
    }
  }

  Future<void> _registerTokenWithBackend() async {
    if (_deviceToken == null || _deviceToken!.isEmpty) return;
    try {
      final token = await _secureStorage.getToken();
      if (token == null || token.isEmpty) return;
      await _dioClient.post('/notifications/register-device', data: {
        'deviceToken': _deviceToken,
        'deviceType': defaultTargetPlatform == TargetPlatform.android ? 'android' : 'ios',
      });
    } catch (e) {
      debugPrint('Failed to register token with backend: $e');
    }
  }

  Future<void> _setupMessageHandlers() async {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      _handleForegroundMessage(message);
    });

    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      _handleNavigation(message.data);
    });

    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNavigation(initialMessage.data);
    }
  }

  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('Foreground message: ${message.notification?.title}');
  }

  void _handleNavigation(Map<String, dynamic> data) {
    try {
      final type = data['type'] as String?;
      final orderId = data['orderId'] as String?;
      
      if (orderId != null && type != null) {
        final router = appRouter;
        switch (type) {
          case 'order_status':
          case 'delivery_assigned':
          case 'delivery_update':
          case 'new_delivery':
            router.push('/tracking/$orderId');
            break;
          case 'promotion':
            router.push('/home');
            break;
        }
      }
    } catch (e) {
      debugPrint('Navigation error: $e');
    }
  }

  Future<void> unsubscribeFromTopics() async {
    try {
      await _messaging.unsubscribeFromTopic('all_users');
      await _messaging.unsubscribeFromTopic('promotions');
      await _messaging.unsubscribeFromTopic('delivery_partners');
    } catch (e) {
      debugPrint('Failed to unsubscribe from topics: $e');
    }
  }

  Future<void> unregisterToken() async {
    if (_deviceToken == null || _deviceToken!.isEmpty) return;
    try {
      await _dioClient.post('/notifications/unregister-device', data: {
        'deviceToken': _deviceToken,
      });
      await _messaging.deleteToken();
      _deviceToken = null;
      _isInitialized = false;
    } catch (e) {
      debugPrint('Failed to unregister token: $e');
    }
  }

  String? get deviceToken => _deviceToken;
  bool get isInitialized => _isInitialized;
}
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  try {
    if (kIsWeb) {
      Hive.init(null);
    } else {
      await Hive.initFlutter();
    }
    await Hive.openBox('app_preferences');
    await Hive.openBox('cart_box');
    await Hive.openBox('cache_box');
  } catch (e) {
    debugPrint('Hive initialization error: $e');
  }

  if (!kIsWeb) {
    PlatformDispatcher.instance.onError = (Object error, StackTrace stackTrace) {
      debugPrint('Platform Error: $error $stackTrace');
      return true;
    };
  }

  FlutterError.onError = (details) {
    FlutterError.presentError(details);
  };

  runApp(
    const ProviderScope(
      child: FreshMartApp(),
    ),
  );
}
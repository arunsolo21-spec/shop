import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';

class UPIUtils {
  static String generateUPIUrl({
    required String vpa,
    required String payeeName,
    required String transactionId,
    required double amount,
    String? currency,
  }) {
    final uri = Uri(
      scheme: 'upi',
      path: 'pay',
      queryParameters: {
        'pa': vpa,
        'pn': payeeName,
        'tr': transactionId,
        'am': amount.toStringAsFixed(2),
        'cu': currency ?? 'INR',
      },
    );
    return uri.toString();
  }

  static Future<bool> launchUPI(String upiUrl) async {
    try {
      if (kIsWeb) return false;
      
      final uri = Uri.parse(upiUrl);
      
      // Try to launch the UPI intent
      if (await canLaunchUrl(uri)) {
        return await launchUrl(
          uri,
          mode: LaunchMode.externalApplication,
        );
      }
      return false;
    } catch (e) {
      debugPrint('Error launching UPI: $e');
      return false;
    }
  }

  static Future<bool> isAppInstalled(String packageName) async {
    // Simplified: just try to launch the package URI
    try {
      if (kIsWeb) return false;
      final url = Uri.parse('android-app://$packageName');
      return await canLaunchUrl(url);
    } catch (e) {
      return false;
    }
  }

  static String generateTransactionId() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final random = DateTime.now().microsecondsSinceEpoch % 10000;
    return 'TXN$timestamp$random';
  }

  static String formatAmount(double amount) {
    return amount.toStringAsFixed(2);
  }

  static bool isValidVPA(String vpa) {
    final regex = RegExp(r'^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$');
    return regex.hasMatch(vpa);
  }
}
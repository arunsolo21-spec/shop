import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../theme/app_theme.dart';

class AuthHelper {
  /// Show login prompt dialog when user is not authenticated
  static void checkAndPromptLogin(
    BuildContext context,
    WidgetRef ref, {
    String message = 'Please login to continue.',
    String? returnUrl, // Optional: return here after login
  }) {
    final authState = ref.read(authProvider);
    
    if (!authState.isAuthenticated) {
      showDialog(
        context: context,
        barrierDismissible: true,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Row(
            children: [
              Icon(Icons.lock_outline, color: AppTheme.primaryGreen),
              SizedBox(width: 8),
              Text('Login Required'),
            ],
          ),
          content: Text(
            message,
            style: TextStyle(color: Colors.grey[700]),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Maybe Later'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                // Navigate to login, optionally return after success
                if (returnUrl != null) {
                  context.push('/login', extra: {'returnTo': returnUrl});
                } else {
                  context.push('/login');
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryGreen,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
              ),
              child: const Text('Login Now'),
            ),
          ],
        ),
      );
    }
  }
  
  /// Simple snackbar version for less intrusive prompts
  static void showLoginSnackbar(BuildContext context, WidgetRef ref) {
    final authState = ref.read(authProvider);
    
    if (!authState.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.info_outline, color: Colors.white),
              const SizedBox(width: 8),
              const Expanded(child: Text('Login to save items to cart')),
              TextButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).hideCurrentSnackBar();
                  context.push('/login');
                },
                child: const Text(
                  'Login',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          backgroundColor: AppTheme.primaryGreen,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 4),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      );
    }
  }
}
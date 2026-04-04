import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AppErrorWidget extends StatelessWidget {
  final String message;
  final String? subMessage;
  final VoidCallback? onRetry;
  final IconData? icon;
  final Color? iconColor;
  final bool showRetryButton;
  final EdgeInsetsGeometry padding;
  const AppErrorWidget({
    super.key,
    required this.message,
    this.subMessage,
    this.onRetry,
    this.icon,
    this.iconColor,
    this.showRetryButton = true,
    this.padding = const EdgeInsets.all(24),
  });
  factory AppErrorWidget.network({
    Key? key,
    String? message,
    VoidCallback? onRetry,
  }) {
    return AppErrorWidget(
      key: key,
      message: message ?? 'No internet connection',
      subMessage: 'Please check your network settings',
      icon: Icons.wifi_off,
      iconColor: Colors.blue,
      onRetry: onRetry,
    );
  }
  factory AppErrorWidget.server({
    Key? key,
    String? message,
    VoidCallback? onRetry,
  }) {
    return AppErrorWidget(
      key: key,
      message: message ?? 'Server error',
      subMessage: 'Please try again later',
      icon: Icons.error_outline,
      iconColor: Colors.red,
      onRetry: onRetry,
    );
  }
  factory AppErrorWidget.notFound({
    Key? key,
    String? message,
    VoidCallback? onRetry,
  }) {
    return AppErrorWidget(
      key: key,
      message: message ?? 'Not found',
      subMessage: 'The requested resource could not be found',
      icon: Icons.search_off,
      iconColor: Colors.orange,
      onRetry: onRetry,
    );
  }
  factory AppErrorWidget.unauthorized({
    Key? key,
    String? message,
    VoidCallback? onRetry,
  }) {
    return AppErrorWidget(
      key: key,
      message: message ?? 'Session expired',
      subMessage: 'Please login again to continue',
      icon: Icons.lock_outline,
      iconColor: Colors.purple,
      onRetry: onRetry,
    );
  }
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: padding,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: (iconColor ?? AppTheme.primaryGreen).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon ?? Icons.error_outline,
                size: 48,
                color: iconColor ?? AppTheme.primaryGreen,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              message,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.textDark,
              ),
              textAlign: TextAlign.center,
            ),
            if (subMessage?.isNotEmpty ?? false) ...[
              const SizedBox(height: 8),
              Text(
                subMessage!,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (showRetryButton && onRetry != null) ...[
              const SizedBox(height: 24),
              SizedBox(
                width: 200,
                child: ElevatedButton(
                  onPressed: onRetry,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryGreen,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Retry',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class InlineErrorWidget extends StatelessWidget {
  final String message;
  final VoidCallback? onDismiss;
  const InlineErrorWidget({
    super.key,
    required this.message,
    this.onDismiss,
  });
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.red.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: Colors.red[700], size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                color: Colors.red[700],
                fontSize: 14,
              ),
            ),
          ),
          if (onDismiss != null)
            IconButton(
              icon: const Icon(Icons.close, size: 18),
              onPressed: onDismiss,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              color: Colors.red[700],
            ),
        ],
      ),
    );
  }
}

class EmptyStateWidget extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData icon;
  final Color? iconColor;
  final Widget? actionButton;
  final EdgeInsetsGeometry padding;
  const EmptyStateWidget({
    super.key,
    required this.title,
    this.subtitle,
    this.icon = Icons.inbox_outlined,
    this.iconColor,
    this.actionButton,
    this.padding = const EdgeInsets.all(24),
  });
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: padding,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: (iconColor ?? Colors.grey).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 48,
                color: iconColor ?? Colors.grey,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.textDark,
              ),
              textAlign: TextAlign.center,
            ),
            if (subtitle?.isNotEmpty ?? false) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (actionButton != null) ...[
              const SizedBox(height: 24),
              actionButton!,
            ],
          ],
        ),
      ),
    );
  }
}
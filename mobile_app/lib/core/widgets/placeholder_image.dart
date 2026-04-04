import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';

class PlaceholderImage extends StatelessWidget {
  final String? imageUrl;
  final double width;
  final double height;
  final BoxFit fit;
  final String? placeholderText;
  final Color backgroundColor;
  final Color textColor;
  final double borderRadius;
  final IconData? icon;

  const PlaceholderImage({
    super.key,
    this.imageUrl,
    this.width = 150,
    this.height = 150,
    this.fit = BoxFit.cover,
    this.placeholderText,
    this.backgroundColor = AppTheme.primaryGreen,
    this.textColor = Colors.white,
    this.borderRadius = 12,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    if (imageUrl == null ||
        imageUrl!.isEmpty ||
        imageUrl!.contains('placeholder') ||
        imageUrl!.contains('No+Image')) {
      return _buildCustomPlaceholder();
    }

    return CachedNetworkImage(
      imageUrl: imageUrl!,
      width: width,
      height: height,
      fit: fit,
      placeholder: (context, url) => _buildCustomPlaceholder(),
      errorWidget: (context, url, error) => _buildCustomPlaceholder(),
      memCacheWidth: width.toInt(),
      memCacheHeight: height.toInt(),
    );
  }

  Widget _buildCustomPlaceholder() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: backgroundColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(
          color: backgroundColor.withOpacity(0.3),
          width: 2,
        ),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon ?? Icons.shopping_bag_outlined,
              size: width * 0.4,
              color: backgroundColor.withOpacity(0.5),
            ),
            if (placeholderText != null) ...[
              const SizedBox(height: 8),
              Text(
                placeholderText!,
                style: TextStyle(
                  color: textColor.withOpacity(0.7),
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
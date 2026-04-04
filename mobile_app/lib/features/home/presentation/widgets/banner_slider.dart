import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart' hide CarouselController;
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/entities/home_layout.dart';

class BannerSlider extends StatefulWidget {
  final List<BannerItem> banners;
  const BannerSlider({super.key, required this.banners});

  @override
  State<BannerSlider> createState() => _BannerSliderState();
}

class _BannerSliderState extends State<BannerSlider> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    if (widget.banners.isEmpty) return const SizedBox.shrink();

    final screenWidth = MediaQuery.of(context).size.width;
    final bannerHeight = screenWidth < 360
        ? 140.0
        : screenWidth < 600
            ? 160.0
            : 180.0;
    final viewportFraction = screenWidth < 360 ? 0.95 : 0.92;

    return Column(
      children: [
        CarouselSlider.builder(
          itemCount: widget.banners.length,
          options: CarouselOptions(
            height: bannerHeight,
            autoPlay: true,
            autoPlayInterval: const Duration(seconds: 4),
            enlargeCenterPage: false,
            viewportFraction: viewportFraction,
            autoPlayCurve: Curves.easeInOut,
            onPageChanged: (index, reason) {
              setState(() => _currentIndex = index);
            },
          ),
          itemBuilder: (context, index, realIndex) {
            final banner = widget.banners[index];
            return _BannerCard(
              banner: banner,
              onTap: () => _handleBannerTap(banner),
            );
          },
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: widget.banners.asMap().entries.map((entry) {
            final isActive = _currentIndex == entry.key;
            return Container(
              width: isActive ? 24 : 8,
              height: 8,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                shape: isActive ? BoxShape.rectangle : BoxShape.circle,
                borderRadius: isActive ? BorderRadius.circular(4) : null,
                color: isActive
                    ? AppTheme.primaryGreen
                    : Colors.grey.shade300,
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  void _handleBannerTap(BannerItem banner) {
    debugPrint('🎯 [BANNER TAP] Banner ID: ${banner.id}');
    debugPrint('🎯 [BANNER TAP] Link Type: ${banner.linkType}');
    debugPrint('🎯 [BANNER TAP] Target ID: ${banner.targetId}');
    debugPrint('🎯 [BANNER TAP] Target IDs: ${banner.targetIds}');
    debugPrint('🎯 [BANNER TAP] Target Screen: ${banner.targetScreen}');

    final linkType = banner.linkType?.toUpperCase() ?? 'NONE';

    switch (linkType) {
      case 'PRODUCT':
        if (banner.targetId.isNotEmpty) {
          debugPrint('🎯 [BANNER TAP] Navigating to product: ${banner.targetId}');
          context.push('/product/${banner.targetId}');
        } else {
          debugPrint('⚠️ [BANNER TAP] No targetId for PRODUCT link');
        }
        break;
      case 'CATEGORY':
        if (banner.targetId.isNotEmpty) {
          debugPrint('🎯 [BANNER TAP] Navigating to category: ${banner.targetId}');
          context.push(
            '/product-listing',
            extra: {
              'categoryId': int.tryParse(banner.targetId) ?? 0,
              'categoryName': 'Category',
            },
          );
        } else {
          debugPrint('⚠️ [BANNER TAP] No targetId for CATEGORY link');
        }
        break;
      case 'MULTIPLE_PRODUCTS':
        if (banner.targetIds.isNotEmpty) {
          debugPrint('🎯 [BANNER TAP] Navigating to products: ${banner.targetIds}');
          context.push(
            '/product-listing',
            extra: {
              'productIds': banner.targetIds,
              'categoryName': 'Special Offer',
            },
          );
        } else {
          debugPrint('⚠️ [BANNER TAP] No targetIds for MULTIPLE_PRODUCTS link');
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('No products in this offer'),
              backgroundColor: Colors.orange,
            ),
          );
        }
        break;
      case 'SEARCH':
        if (banner.targetId.isNotEmpty) {
          debugPrint('🎯 [BANNER TAP] Navigating to search: ${banner.targetId}');
          context.push('/search', extra: banner.targetId);
        } else {
          debugPrint('⚠️ [BANNER TAP] No targetId for SEARCH link');
        }
        break;
      case 'NONE':
      default:
        debugPrint('ℹ️ [BANNER TAP] No action for NONE link type');
        break;
    }
  }
}

class _BannerCard extends StatelessWidget {
  final BannerItem banner;
  final VoidCallback onTap;
  const _BannerCard({required this.banner, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final borderRadius = screenWidth < 360 ? 12.0 : 16.0;
    final imageUrl = banner.imageUrl.isNotEmpty
        ? banner.imageUrl
        : 'https://via.placeholder.com/400x180?text=FreshMart';

    return GestureDetector(
      onTap: () {
        debugPrint('👆 [BANNER CARD] Tap detected!');
        onTap();
      },
      behavior: HitTestBehavior.opaque,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(borderRadius),
          color: Colors.grey.shade200,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(borderRadius),
          child: Stack(
            fit: StackFit.expand,
            children: [
              CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: Colors.grey.shade300,
                  child: const Center(
                    child: CircularProgressIndicator(
                      color: AppTheme.primaryGreen,
                      strokeWidth: 2,
                    ),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  color: Colors.grey.shade300,
                  child: const Center(
                    child: Icon(Icons.image_not_supported, color: Colors.grey),
                  ),
                ),
              ),
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withOpacity(0.3),
                    ],
                    stops: const [0.6, 1.0],
                  ),
                ),
              ),
              if (banner.discount > 0)
                Positioned(
                  top: screenWidth < 360 ? 8 : 12,
                  right: screenWidth < 360 ? 8 : 12,
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: screenWidth < 360 ? 8 : 12,
                      vertical: screenWidth < 360 ? 4 : 6,
                    ),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Colors.red, Colors.redAccent],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(
                        screenWidth < 360 ? 6 : 8
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.red.withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      '${banner.discount}% OFF',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: screenWidth < 360 ? 10 : 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              if (banner.title != null || banner.subtitle != null)
                Positioned(
                  bottom: screenWidth < 360 ? 8 : 12,
                  left: screenWidth < 360 ? 8 : 12,
                  right: screenWidth < 360 ? 8 : 12,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (banner.title != null)
                        Text(
                          banner.title!,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: screenWidth < 360 ? 14 : 16,
                            fontWeight: FontWeight.bold,
                            shadows: [
                              Shadow(
                                color: Colors.black.withOpacity(0.5),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                        ),
                      if (banner.subtitle != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          banner.subtitle!,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: screenWidth < 360 ? 11 : 13,
                            shadows: [
                              Shadow(
                                color: Colors.black.withOpacity(0.5),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
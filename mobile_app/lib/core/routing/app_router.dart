import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// Auth Screens
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/signup_screen.dart';
import '../../features/auth/presentation/screens/forgot_password_screen.dart';

// Home Screens
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/home/presentation/screens/search_screen.dart';
import '../../features/home/presentation/screens/product_listing_screen.dart';

// Cart & Checkout
import '../../features/cart/presentation/screens/cart_screen.dart';
import '../../features/checkout/presentation/checkout_screen.dart';

// Orders
import '../../features/orders/presentation/order_list_screen.dart';
import '../../features/orders/presentation/order_tracking_screen.dart';
import '../../features/orders/presentation/order_success_screen.dart';

// Product Details
import '../../features/product_details/presentation/product_detail_screen.dart';

// Profile
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/profile/presentation/address_screen.dart';
import '../../features/profile/presentation/edit_profile_screen.dart';
import '../../features/profile/presentation/order_history_screen.dart';

// Domain Entities
import '../../features/home/domain/entities/home_layout.dart';

// Core
import '../theme/app_theme.dart';
import '../storage/secure_storage.dart';

// ─────────────────────────────────────────────────────────────
// APP ROUTER
// ─────────────────────────────────────────────────────────────
final appRouter = GoRouter(
  initialLocation: '/home',
  debugLogDiagnostics: false,
  refreshListenable: GoRouterRefreshStream(),
  
  errorBuilder: (context, state) => Scaffold(
    backgroundColor: Colors.white,
    body: SafeArea(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.primaryGreen.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.error_outline,
                  size: 64,
                  color: AppTheme.primaryGreen,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Page not found',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textDark,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                state.uri.path,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () => context.go('/home'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryGreen,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 40,
                    vertical: 16,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 4,
                  shadowColor: AppTheme.primaryGreen.withOpacity(0.3),
                ),
                child: const Text(
                  'Go Home',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  ),
  
  routes: [
    // ─── AUTH ROUTES ─────────────────────────────────────
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/signup',
      name: 'signup',
      builder: (context, state) => const SignupScreen(),
    ),
    GoRoute(
      path: '/forgot-password',
      name: 'forgotPassword',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    
    // ─── HOME ROUTES ─────────────────────────────────────
    GoRoute(
      path: '/home',
      name: 'home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/search',
      name: 'search',
      builder: (context, state) => const SearchScreen(),
    ),
    
    // ─── CART & CHECKOUT ─────────────────────────────────
    GoRoute(
      path: '/cart',
      name: 'cart',
      builder: (context, state) => const CartScreen(),
    ),
    GoRoute(
      path: '/checkout',
      name: 'checkout',
      builder: (context, state) => const CheckoutScreen(),
    ),
    
    // ─── PRODUCT ROUTES ──────────────────────────────────
    GoRoute(
      path: '/product/:id',
      name: 'productDetail',
      builder: (context, state) {
        final product = state.extra as SimpleProduct?;
        final effectiveProduct = product ??
            SimpleProduct(
              id: 0,
              name: 'Unknown Product',
              price: 0.0,
              mrp: 0.0,
              imageUrl: 'https://via.placeholder.com/300x300?text=Product',
              quantityLabel: '1 unit',
              discount: 0,
              description: '',
            );
        return ProductDetailScreen(product: effectiveProduct);
      },
    ),
    GoRoute(
      path: '/product-listing',
      name: 'productListing',
      builder: (context, state) {
        final extraData = state.extra as Map<String, dynamic>?;
        final categoryId = extraData?['categoryId'] as int?;
        final categoryName = extraData?['categoryName'] as String?;
        final subCategories = 
            extraData?['subCategories'] as List<DirectorySubCategory>?;
        final subCategoryId = extraData?['subCategoryId'] as int?;
        return ProductListingScreen(
          categoryId: categoryId,
          categoryName: categoryName,
          subCategories: subCategories,
          subCategoryId: subCategoryId,
        );
      },
    ),
    
    // ─── ORDER ROUTES ────────────────────────────────────
    GoRoute(
      path: '/orders',
      name: 'orderList',
      builder: (context, state) => const OrderListScreen(),
    ),
    GoRoute(
      path: '/order-success',
      name: 'orderSuccess',
      builder: (context, state) => const OrderSuccessScreen(),
    ),
    GoRoute(
      path: '/tracking/:id',
      name: 'tracking',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return OrderTrackingScreen(orderId: id);
      },
    ),
    
    // ─── PROFILE ROUTES ──────────────────────────────────
    GoRoute(
      path: '/profile',
      name: 'profile',
      builder: (context, state) => const ProfileScreen(),
    ),
    GoRoute(
      path: '/profile/edit',
      name: 'editProfile',
      builder: (context, state) => const EditProfileScreen(),
    ),
    GoRoute(
      path: '/profile/addresses',
      name: 'addresses',
      builder: (context, state) => const AddressScreen(),
    ),
    GoRoute(
      path: '/profile/orders',
      name: 'orderHistory',
      builder: (context, state) => const OrderHistoryScreen(),
    ),
  ],
);

// ─────────────────────────────────────────────────────────────
// AUTH REFRESH STREAM (Triggers rebuild on token changes)
// ─────────────────────────────────────────────────────────────
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream() {
    _listenToAuthChanges();
  }

  void _listenToAuthChanges() async {
    final secureStorage = SecureStorageService();
    await secureStorage.hasToken().then((_) => notifyListeners());
  }
}
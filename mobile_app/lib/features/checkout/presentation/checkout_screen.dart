// lib/features/checkout/presentation/checkout_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/login_prompt_dialog.dart';
import '../../cart/presentation/providers/cart_provider.dart';
import '../providers/checkout_provider.dart';
import 'widgets/address_selector.dart';
import 'widgets/payment_selector.dart';
import 'widgets/upi_app_selector.dart';
import 'widgets/upi_id_input.dart';
import '../domain/entities/payment_method.dart';
import '../../../features/auth/presentation/providers/auth_provider.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  int? _selectedAddressId;
  PaymentMethodType _paymentMethod = PaymentMethodType.cod;
  UPIApp? _selectedUPIApp;
  String _upiVPA = '';
  bool _showUPIOptions = false;

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(cartProvider);
    final checkoutState = ref.watch(checkoutProvider);
    final authState = ref.watch(authProvider);
    final subtotal = cartState.totalAmount;
    final deliveryFee = subtotal > 500 ? 0.0 : 40.0;
    final total = subtotal + deliveryFee;

    if (!authState.isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        LoginPromptDialog.show(
          context: context,
          title: 'Login Required',
          message: 'Please sign in to complete your order',
          returnUrl: '/checkout',
        );
      });
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Checkout',
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.bold,
            fontSize: 20,
            letterSpacing: -0.5,
          ),
        ),
      ),
      body: checkoutState.isProcessing
          ? _buildProcessingState()
          : SafeArea(
              child: Column(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          AddressSelector(
                            selectedAddressId: _selectedAddressId,
                            onAddressSelected: (id) {
                              setState(() => _selectedAddressId = id);
                            },
                          ),
                          const SizedBox(height: 24),
                          PaymentSelector(
                            selectedMethod: _paymentMethod,
                            onMethodChanged: (method) {
                              setState(() {
                                _paymentMethod = method;
                                _showUPIOptions = method == PaymentMethodType.upi;
                              });
                            },
                          ),
                          if (_showUPIOptions) ...[
                            const SizedBox(height: 24),
                            UPIAppSelector(
                              apps: UPIApp.getPopularApps(),
                              selectedApp: _selectedUPIApp,
                              onAppSelected: (app) {
                                setState(() => _selectedUPIApp = app);
                              },
                            ),
                            const SizedBox(height: 24),
                            UPIIDInput(
                              onVPAChanged: (vpa) {
                                setState(() => _upiVPA = vpa);
                              },
                            ),
                          ],
                          const SizedBox(height: 24),
                          _buildOrderSummary(subtotal, deliveryFee, total),
                        ],
                      ),
                    ),
                  ),
                  _buildPlaceOrderButton(
                    total,
                    cartState.items.isEmpty,
                    _selectedAddressId,
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildProcessingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppTheme.primaryGreen.withOpacity(0.1),
                  AppTheme.accentGreen.withOpacity(0.1),
                ],
              ),
              shape: BoxShape.circle,
            ),
            child: const SizedBox(
              width: 50,
              height: 50,
              child: CircularProgressIndicator(
                color: AppTheme.primaryGreen,
                strokeWidth: 3,
              ),
            ),
          ),
          const SizedBox(height: 32),
          const Text(
            'Processing Order...',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: AppTheme.textDark,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Please wait while we place your order',
            style: TextStyle(
              fontSize: 15,
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderSummary(double subtotal, double deliveryFee, double total) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.primaryGreen.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.receipt_long_rounded,
                  color: AppTheme.primaryGreen,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Order Summary',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _buildSummaryRow('Subtotal', '₹${subtotal.toStringAsFixed(2)}'),
          const SizedBox(height: 12),
          _buildSummaryRow(
            'Delivery Fee',
            deliveryFee == 0 ? 'FREE' : '₹${deliveryFee.toStringAsFixed(2)}',
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Divider(thickness: 1),
          ),
          _buildSummaryRow(
            'Total',
            '₹${total.toStringAsFixed(2)}',
            isTotal: true,
          ),
          if (deliveryFee == 0)
            Container(
              margin: const EdgeInsets.only(top: 16),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.primaryGreen.withOpacity(0.1),
                    AppTheme.accentGreen.withOpacity(0.1),
                  ],
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: AppTheme.primaryGreen.withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryGreen.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.local_shipping,
                      color: AppTheme.primaryGreen,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Text(
                      'Free delivery on orders above ₹500',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppTheme.primaryGreen,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 17 : 15,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            color: Colors.grey.shade700,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isTotal ? 24 : 15,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
            color: isTotal ? AppTheme.primaryGreen : Colors.black87,
            letterSpacing: isTotal ? -0.5 : 0,
          ),
        ),
      ],
    );
  }

  Widget _buildPlaceOrderButton(
    double total,
    bool isCartEmpty,
    int? selectedAddressId,
  ) {
    final canPlaceOrder = !isCartEmpty && selectedAddressId != null;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 30,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          width: double.infinity,
          height: 60,
          child: ElevatedButton(
            onPressed: canPlaceOrder ? () => _placeOrder(total) : null,
            style: ElevatedButton.styleFrom(
              backgroundColor:
                  canPlaceOrder ? AppTheme.primaryGreen : Colors.grey.shade300,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: canPlaceOrder ? 4 : 0,
              shadowColor:
                  canPlaceOrder ? AppTheme.primaryGreen.withOpacity(0.3) : null,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (canPlaceOrder)
                  const Icon(
                    Icons.shopping_bag_rounded,
                    color: Colors.white,
                    size: 24,
                  ),
                if (canPlaceOrder) const SizedBox(width: 12),
                Text(
                  selectedAddressId == null
                      ? 'Select Delivery Address'
                      : isCartEmpty
                          ? 'Cart is Empty'
                          : _paymentMethod == PaymentMethodType.cod
                              ? 'Place Order (COD)'
                              : 'Pay ₹${total.toStringAsFixed(2)}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _placeOrder(double total) async {
    final authState = ref.read(authProvider);
    if (!authState.isAuthenticated) {
      LoginPromptDialog.show(
        context: context,
        title: 'Session Expired',
        message: 'Please login again to complete your order',
        returnUrl: '/checkout',
      );
      return;
    }

    if (_selectedAddressId == null) {
      _showError('Please select a delivery address');
      return;
    }

    if (_paymentMethod == PaymentMethodType.upi) {
      if (_selectedUPIApp == null && _upiVPA.isEmpty) {
        _showError('Please select a UPI app or enter UPI ID');
        return;
      }
    }

    final success = await ref.read(checkoutProvider.notifier).placeOrder(
          addressId: _selectedAddressId!,
          paymentMethod: _paymentMethod == PaymentMethodType.cod ? 'COD' : 'UPI',
          upiAppId: _selectedUPIApp?.id,
          upiVPA: _upiVPA,
          amount: total,
        );

    if (success && mounted) {
      context.go('/order-success');
    } else if (mounted) {
      final error = ref.read(checkoutProvider).error;
      _showError(error ?? 'Failed to place order');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: const EdgeInsets.all(16),
      ),
    );
  }
}
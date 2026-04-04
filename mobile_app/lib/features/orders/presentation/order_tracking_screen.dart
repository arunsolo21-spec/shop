import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_theme.dart';
import 'providers/order_provider.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../../core/widgets/error_widget.dart';
import 'package:freshmart/features/checkout/domain/entities/order.dart' show Order, OrderStatus;
import 'package:freshmart/features/auth/presentation/providers/auth_provider.dart';

class OrderTrackingScreen extends ConsumerStatefulWidget {
  final String orderId;
  const OrderTrackingScreen({super.key, required this.orderId});

  @override
  ConsumerState<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends ConsumerState<OrderTrackingScreen> {
  bool _showFullPhone = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(orderProvider.notifier).loadOrderDetails(widget.orderId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final orderState = ref.watch(orderProvider);
    final authState = ref.watch(authProvider);

    if (orderState.isLoading) {
      return const Scaffold(
        body: Center(
          child: AppLoadingWidget(
            message: 'Loading order details...',
            showBackground: true,
          ),
        ),
      );
    }

    if (orderState.error != null) {
      return Scaffold(
        body: AppErrorWidget.network(
          message: orderState.error!,
          onRetry: () {
            ref.read(orderProvider.notifier).loadOrderDetails(widget.orderId);
          },
        ),
      );
    }

    final order = orderState.currentOrder;
    if (order == null) {
      return Scaffold(
        body: AppErrorWidget.notFound(
          message: 'Order not found',
          onRetry: () {
            ref.read(orderProvider.notifier).loadOrderDetails(widget.orderId);
          },
        ),
      );
    }

    final deliveryPartner = (order as dynamic).deliveryPartner;
    final userPhone = authState.user?['phone'] ?? '';
    final displayPhone = _showFullPhone ? userPhone : _maskPhone(userPhone);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: CircleAvatar(
          backgroundColor: Colors.white,
          child: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.black),
            onPressed: () => context.pop(),
          ),
        ),
        title: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            order.orderId,
            style: const TextStyle(
              color: Colors.black,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          Container(
            width: double.infinity,
            height: MediaQuery.of(context).size.height * 0.6,
            decoration: const BoxDecoration(
              color: Color(0xFFE5E5E5),
              image: DecorationImage(
                image: NetworkImage(
                    "https://img.freepik.com/free-vector/city-map-navigation-interface-design_1017-15494.jpg"),
                fit: BoxFit.cover,
                opacity: 0.8,
              ),
            ),
          ),
          Center(
            child: Container(
              height: MediaQuery.of(context).size.height * 0.6,
              alignment: Alignment.center,
              child: const Icon(
                Icons.location_on,
                color: AppTheme.primaryGreen,
                size: 48,
              ),
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: MediaQuery.of(context).size.height * 0.5,
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 20,
                    offset: Offset(0, -5),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 50,
                      height: 5,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Estimated Delivery",
                        style: TextStyle(color: Colors.grey),
                      ),
                      Text(
                        _getEstimatedDelivery(order.status.name),
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _getStatusText(order.status.name),
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textDark,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Expanded(
                    child: ListView(
                      padding: EdgeInsets.zero,
                      children: [
                        _buildTimelineStep(
                          title: "Order Placed",
                          time: _formatDate(order.createdAt.toIso8601String()),
                          isCompleted: true,
                          isFirst: true,
                        ),
                        _buildTimelineStep(
                          title: "Order Confirmed",
                          time: order.status != OrderStatus.pending
                              ? _formatDate(
                                  (order.updatedAt ?? order.createdAt).toIso8601String())
                              : 'Pending',
                          isCompleted: order.status != OrderStatus.pending,
                        ),
                        _buildTimelineStep(
                          title: "Order Prepared",
                          time: [
                            OrderStatus.packed,
                            OrderStatus.outForDelivery,
                            OrderStatus.delivered
                          ].contains(order.status)
                              ? _formatDate(
                                  (order.updatedAt ?? order.createdAt).toIso8601String())
                              : 'Pending',
                          isCompleted: [
                            OrderStatus.packed,
                            OrderStatus.outForDelivery,
                            OrderStatus.delivered
                          ].contains(order.status),
                        ),
                        _buildTimelineStep(
                          title: "Out for Delivery",
                          time: order.status == OrderStatus.outForDelivery ||
                                  order.status == OrderStatus.delivered
                              ? _formatDate(
                                  (order.updatedAt ?? order.createdAt).toIso8601String())
                              : 'Pending',
                          isCompleted: order.status == OrderStatus.outForDelivery ||
                              order.status == OrderStatus.delivered,
                          isActive: order.status == OrderStatus.outForDelivery,
                        ),
                        _buildTimelineStep(
                          title: "Delivered",
                          time: order.status == OrderStatus.delivered
                              ? _formatDate(
                                  (order.updatedAt ?? order.createdAt).toIso8601String())
                              : 'Est. 2-3 Days',
                          isCompleted: order.status == OrderStatus.delivered,
                          isLast: true,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildDeliveryPartnerSection(deliveryPartner, displayPhone),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineStep({
    required String title,
    required String time,
    required bool isCompleted,
    bool isActive = false,
    bool isFirst = false,
    bool isLast = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            if (!isFirst)
              Container(
                width: 2,
                height: 20,
                color: isCompleted ? AppTheme.primaryGreen : Colors.grey[300],
              ),
            Container(
              width: 16,
              height: 16,
              decoration: BoxDecoration(
                color: isActive || isCompleted ? AppTheme.primaryGreen : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isActive || isCompleted ? AppTheme.primaryGreen : Colors.grey[300]!,
                  width: 2,
                ),
              ),
              child: isActive
                  ? Center(
                      child: Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                      ),
                    )
                  : null,
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 20,
                color: isCompleted ? AppTheme.primaryGreen : Colors.grey[300],
              ),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: isCompleted || isActive ? FontWeight.bold : FontWeight.normal,
                    color: isCompleted || isActive ? Colors.black : Colors.grey,
                  ),
                ),
                Text(
                  time,
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDeliveryPartnerSection(dynamic deliveryPartner, String displayPhone) {
    if (deliveryPartner == null) {
      return Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.person,
              color: Colors.grey,
              size: 30,
            ),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Delivery Partner",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  "Will be assigned soon",
                  style: TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
          CircleAvatar(
            backgroundColor: Colors.grey[300],
            child: const Icon(Icons.phone, color: Colors.white, size: 20),
          ),
        ],
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: AppTheme.primaryGreen.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.delivery_dining,
              color: AppTheme.primaryGreen,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  deliveryPartner['name'] ?? deliveryPartner['name'] ?? 'Delivery Partner',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      displayPhone,
                      style: TextStyle(color: Colors.grey[600], fontSize: 13),
                    ),
                    const SizedBox(width: 8),
                    if (!_showFullPhone && displayPhone.contains('****'))
                      GestureDetector(
                        onTap: () => setState(() => _showFullPhone = true),
                        child: const Text(
                          "Show",
                          style: TextStyle(
                            color: AppTheme.primaryGreen,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
          CircleAvatar(
            backgroundColor: AppTheme.primaryGreen,
            child: IconButton(
              icon: const Icon(Icons.phone, color: Colors.white, size: 20),
              onPressed: () async {
                final phoneToCall = _showFullPhone ? displayPhone : (deliveryPartner['phone'] ?? '');
                if (phoneToCall.isEmpty) return;
                final uri = Uri.parse('tel:$phoneToCall');
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri);
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Order Placed';
      case 'confirmed':
        return 'Order Confirmed';
      case 'packed':
        return 'Order Prepared';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Order Cancelled';
      default:
        return 'Processing';
    }
  }

  String _getEstimatedDelivery(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'Delivered';
      case 'out_for_delivery':
        return '30-45 Mins';
      case 'packed':
        return '1-2 Hours';
      case 'confirmed':
        return '2-3 Hours';
      case 'pending':
        return '3-4 Hours';
      case 'cancelled':
        return 'Cancelled';
      default:
        return '2-3 Days';
    }
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('hh:mm a').format(date);
    } catch (e) {
      return 'Pending';
    }
  }

  String _maskPhone(String phone) {
    if (phone.length < 6) return phone;
    final cleaned = phone.replaceAll(RegExp(r'\D'), '');
    if (cleaned.length >= 10) {
      return '${cleaned.substring(0, 3)}****${cleaned.substring(cleaned.length - 2)}';
    }
    return phone;
  }
}
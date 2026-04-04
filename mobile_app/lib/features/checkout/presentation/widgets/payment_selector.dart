import 'package:flutter/material.dart';
import '../../../../../core/theme/app_theme.dart';

enum PaymentMethodType { cod, upi }

class PaymentSelector extends StatelessWidget {
  final PaymentMethodType selectedMethod;
  final Function(PaymentMethodType) onMethodChanged;

  const PaymentSelector({
    super.key,
    required this.selectedMethod,
    required this.onMethodChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.primaryGreen.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.payment_outlined,
                  color: AppTheme.primaryGreen,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Payment Method',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildPaymentOption(
            title: 'Cash on Delivery',
            subtitle: 'Pay when you receive your order',
            icon: Icons.money,
            value: PaymentMethodType.cod,
            isAvailable: true,
          ),
          const SizedBox(height: 12),
          _buildPaymentOption(
            title: 'UPI Payment',
            subtitle: 'GPay, PhonePe, Paytm, BHIM',
            icon: Icons.qr_code,
            value: PaymentMethodType.upi,
            isAvailable: true,
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption({
    required String title,
    required String subtitle,
    required IconData icon,
    required PaymentMethodType value,
    required bool isAvailable,
  }) {
    final isSelected = selectedMethod == value;

    return GestureDetector(
      onTap: isAvailable ? () => onMethodChanged(value) : null,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected && isAvailable
              ? AppTheme.primaryGreen.withOpacity(0.05)
              : Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected && isAvailable
                ? AppTheme.primaryGreen
                : Colors.grey.shade200,
            width: isSelected && isAvailable ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected && isAvailable
                  ? AppTheme.primaryGreen
                  : Colors.grey,
              size: 24,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: isSelected && isAvailable
                          ? FontWeight.bold
                          : FontWeight.normal,
                      color: isSelected && isAvailable
                          ? AppTheme.primaryGreen
                          : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected && isAvailable)
              const Icon(
                Icons.check_circle,
                color: AppTheme.primaryGreen,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }
}
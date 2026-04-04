// lib/core/utils/formatters.dart
import 'package:intl/intl.dart';

class Formatters {
  static const String _currencyCode = 'INR';
  static const String _locale = 'en_IN';
  static const String _defaultState = 'Tamil Nadu';
  static const String _defaultCountry = 'India';

  static String formatCurrency(double amount, {bool showSymbol = true}) {
    final formatter = NumberFormat.currency(
      locale: _locale,
      symbol: showSymbol ? '₹' : '',
      decimalDigits: 2,
    );
    return formatter.format(amount);
  }

  static String formatCurrencyWithoutDecimals(double amount) {
    final formatter = NumberFormat.currency(
      locale: _locale,
      symbol: '₹',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }

  static String formatShortCurrency(double amount) {
    if (amount >= 10000000) {
      return '₹${(amount / 10000000).toStringAsFixed(1)} Cr';
    } else if (amount >= 100000) {
      return '₹${(amount / 100000).toStringAsFixed(1)} L';
    } else if (amount >= 1000) {
      return '₹${(amount / 1000).toStringAsFixed(1)}K';
    }
    return formatCurrency(amount);
  }

  static String formatDate(DateTime date, {String format = 'dd MMM yyyy'}) {
    return DateFormat(format, _locale).format(date);
  }

  static String formatDateTime(DateTime date) {
    return DateFormat('dd MMM yyyy, hh:mm a', _locale).format(date);
  }

  static String formatTime(DateTime date) {
    return DateFormat('hh:mm a', _locale).format(date);
  }

  static String formatRelativeTime(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return formatDate(date);
    }
  }

  static String formatOrderDate(DateTime date) {
    return DateFormat('dd/MM/yyyy', _locale).format(date);
  }

  static String formatDeliveryDate(DateTime date) {
    return DateFormat('EEEE, dd MMM', _locale).format(date);
  }

  static String formatPhone(String phone) {
    final cleaned = phone.replaceAll(RegExp(r'\D'), '');
    if (cleaned.length == 10) {
      return '+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}';
    } else if (cleaned.length == 12 && cleaned.startsWith('91')) {
      return '+91 ${cleaned.substring(2, 7)} ${cleaned.substring(7)}';
    }
    return phone;
  }

  static bool isValidIndianPhone(String phone) {
    final cleaned = phone.replaceAll(RegExp(r'\D'), '');
    return RegExp(r'^[6-9]\d{9}$').hasMatch(cleaned);
  }

  static bool isValidPincode(String pincode) {
    return RegExp(r'^\d{6}$').hasMatch(pincode);
  }

  static String formatPincode(String pincode) {
    final cleaned = pincode.replaceAll(RegExp(r'\D'), '');
    if (cleaned.length == 6) {
      return cleaned;
    }
    return pincode;
  }

  static String formatAddress({
    required String street,
    String? landmark,
    required String city,
    String? district,
    String state = _defaultState,
    required String zip,
    String country = _defaultCountry,
  }) {
    final parts = [
      street,
      if (landmark?.isNotEmpty ?? false) 'Near $landmark',
      city,
      if (district?.isNotEmpty ?? false) district,
      '$state - $zip',
      if (country != _defaultCountry) country,
    ].where((e) => e?.isNotEmpty ?? false).toList();
    return parts.join(', ');
  }

  static String formatDistrictCity(String? district, String city) {
    if (district?.isNotEmpty ?? false) {
      return '$district, $city';
    }
    return city;
  }

  static String formatOrderNumber(String orderId) {
    if (orderId.startsWith('#')) return orderId;
    return '#ORD${orderId.padLeft(5, '0')}';
  }

  static String formatDiscount(double price, double mrp) {
    if (mrp <= price || mrp <= 0) return '';
    final discount = ((mrp - price) / mrp * 100).round();
    return '$discount% OFF';
  }

  static String formatWeight(double weight, String unit) {
    if (unit.toLowerCase() == 'kg' && weight >= 1) {
      return '${weight.toStringAsFixed(weight % 1 == 0 ? 0 : 1)} $unit';
    }
    if (unit.toLowerCase() == 'g' && weight >= 1000) {
      return '${(weight / 1000).toStringAsFixed(1)} kg';
    }
    return '${weight.toStringAsFixed(weight % 1 == 0 ? 0 : 1)} $unit';
  }

  static String truncateText(String text, int maxLength) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}...';
  }

  static String capitalizeFirst(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }

  static String formatCategoryName(String name) {
    return name
        .replaceAll(RegExp(r'[_-]'), ' ')
        .split(' ')
        .map((word) => capitalizeFirst(word))
        .join(' ');
  }

  static String getTamilMonthName(int month) {
    const tamilMonths = [
      '',
      'சித்திரை',
      'வைகாசி',
      'ஆனி',
      'ஆடி',
      'ஆவணி',
      'புரட்டாசி',
      'ஐப்பசி',
      'கார்த்திகை',
      'மார்கழி',
      'தை',
      'மாசி',
      'பங்குனி',
    ];
    if (month >= 1 && month <= 12) {
      return tamilMonths[month];
    }
    return '';
  }

  static String formatTamilDate(DateTime date) {
    final day = date.day;
    final tamilMonth = getTamilMonthName(date.month);
    final year = date.year;
    if (tamilMonth.isNotEmpty) {
      return '$day $tamilMonth $year';
    }
    return formatDate(date);
  }
}
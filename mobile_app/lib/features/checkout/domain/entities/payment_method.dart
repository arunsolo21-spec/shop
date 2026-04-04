enum PaymentMethod {
  cod,
  upi,
}

extension PaymentMethodExtension on PaymentMethod {
  String get label {
    switch (this) {
      case PaymentMethod.cod:
        return 'Cash on Delivery';
      case PaymentMethod.upi:
        return 'UPI Payment';
    }
  }

  String get description {
    switch (this) {
      case PaymentMethod.cod:
        return 'Pay when you receive your order';
      case PaymentMethod.upi:
        return 'Pay securely using UPI';
    }
  }
}

class UPIApp {
  final String id;
  final String name;
  final String packageName;
  final String urlScheme;
  final String iconPath;
  final bool isPopular;

  const UPIApp({
    required this.id,
    required this.name,
    required this.packageName,
    required this.urlScheme,
    required this.iconPath,
    this.isPopular = false,
  });

  static List<UPIApp> getPopularApps() {
    return [
      const UPIApp(
        id: 'gpay',
        name: 'Google Pay',
        packageName: 'com.google.android.apps.nbu.paisa.user',
        urlScheme: 'tez://',
        iconPath: 'assets/icons/gpay.png',
        isPopular: true,
      ),
      const UPIApp(
        id: 'phonepe',
        name: 'PhonePe',
        packageName: 'com.phonepe.app',
        urlScheme: 'phonepe://',
        iconPath: 'assets/icons/phonepe.png',
        isPopular: true,
      ),
      const UPIApp(
        id: 'paytm',
        name: 'Paytm',
        packageName: 'net.one97.paytm',
        urlScheme: 'paytmmp://',
        iconPath: 'assets/icons/paytm.png',
        isPopular: true,
      ),
      const UPIApp(
        id: 'bhim',
        name: 'BHIM UPI',
        packageName: 'in.org.npci.upiapp',
        urlScheme: 'bhimupi://',
        iconPath: 'assets/icons/bhim.png',
        isPopular: false,
      ),
      const UPIApp(
        id: 'other',
        name: 'Other UPI Apps',
        packageName: '',
        urlScheme: '',
        iconPath: 'assets/icons/other_upi.png',
        isPopular: false,
      ),
    ];
  }

  factory UPIApp.fromJson(Map<String, dynamic> json) {
    return UPIApp(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      packageName: json['packageName'] ?? '',
      urlScheme: json['urlScheme'] ?? '',
      iconPath: json['iconPath'] ?? '',
      isPopular: json['isPopular'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'packageName': packageName,
      'urlScheme': urlScheme,
      'iconPath': iconPath,
      'isPopular': isPopular,
    };
  }
}
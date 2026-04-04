import '../../../../core/config/env.dart';

class UserProfile {
  final int id;
  final String name;
  final String phone;

  UserProfile({
    required this.id,
    required this.name,
    required this.phone,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
    );
  }
}

class BannerItem {
  final int id;
  final String imageUrl;
  final String? linkType;
  final String targetScreen;
  final String targetId;
  final List<String> targetIds;
  final int discount;
  final DateTime? validUntil;
  final String? title;
  final String? subtitle;

  BannerItem({
    required this.id,
    required this.imageUrl,
    this.linkType,
    this.targetScreen = 'home',
    this.targetId = '',
    this.targetIds = const [],
    this.discount = 0,
    this.validUntil,
    this.title,
    this.subtitle,
  });

  factory BannerItem.fromJson(Map<String, dynamic> json) {
    String img = json['imageUrl']?.toString() ?? '';
    
    if (img.isNotEmpty && !img.startsWith('http')) {
      if (img.startsWith('/uploads/')) {
        img = '${Env.baseUrl}$img';
      } else if (img.startsWith('/assets/')) {
        img = '${Env.baseUrl}$img';
      } else {
        img = '${Env.baseUrl}/$img';
      }
    }
    
    if (img.isEmpty) {
      img = 'https://via.placeholder.com/400x180?text=FreshMart';
    }

    DateTime? validUntil;
    if (json['validUntil'] != null) {
      try {
        validUntil = DateTime.parse(json['validUntil']);
      } catch (e) {
        validUntil = null;
      }
    }

    List<String> targetIdsList = [];
    if (json['targetIds'] != null) {
      if (json['targetIds'] is List) {
        targetIdsList = (json['targetIds'] as List)
            .map((e) => e.toString())
            .toList();
      } else if (json['targetIds'] is String) {
        targetIdsList = (json['targetIds'] as String)
            .split(',')
            .map((e) => e.trim())
            .toList();
      }
    }

    return BannerItem(
      id: json['id'] ?? 0,
      imageUrl: img,
      linkType: json['linkType'],
      targetScreen: json['targetScreen'] ?? 'home',
      targetId: json['targetId'] ?? '',
      targetIds: targetIdsList,
      discount: json['discount'] ?? 0,
      validUntil: validUntil,
      title: json['title'],
      subtitle: json['subtitle'],
    );
  }
}

class DirectoryCategory {
  final int id;
  final String name;
  final String? image;
  final bool isActive;
  final int priority;
  final List<DirectorySubCategory> subCategories;

  DirectoryCategory({
    required this.id,
    required this.name,
    this.image,
    this.isActive = true,
    this.priority = 0,
    required this.subCategories,
  });

  factory DirectoryCategory.fromJson(Map<String, dynamic> json) {
    String? img = json['image'];
    
    if (img != null && img.isNotEmpty && !img.startsWith('http')) {
      if (img.startsWith('/images/images/categories/')) {
        img = img.replaceFirst('/images/images/categories/', '/assets/images/categories/');
      } else if (img.startsWith('/images/images/subcategories/')) {
        img = img.replaceFirst('/images/images/subcategories/', '/assets/images/subcategories/');
      }
      if (!img.startsWith('http')) {
        img = '${Env.baseUrl}$img';
      }
    }

    return DirectoryCategory(
      id: json['id'] ?? 0,
      name: json['title'] ?? json['name'] ?? 'Category',
      image: img,
      isActive: json['isActive'] ?? true,
      priority: json['priority'] ?? 0,
      subCategories: (json['subCategories'] as List?)
          ?.map((e) => DirectorySubCategory.fromJson(e))
          .toList() ??
          [],
    );
  }
}

class DirectorySubCategory {
  final int id;
  final String name;
  final String imageUrl;
  final bool isActive;
  final int priority;

  DirectorySubCategory({
    required this.id,
    required this.name,
    this.imageUrl = '',
    this.isActive = true,
    this.priority = 0,
  });

  factory DirectorySubCategory.fromJson(Map<String, dynamic> json) {
    String img = json['imageUrl'] ?? json['image'] ?? '';
    
    if (img.isNotEmpty && !img.startsWith('http')) {
      if (img.startsWith('/images/images/subcategories/')) {
        img = img.replaceFirst('/images/images/subcategories/', '/assets/images/subcategories/');
      }
      if (!img.startsWith('http')) {
        img = '${Env.baseUrl}$img';
      }
    }

    return DirectorySubCategory(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      imageUrl: img,
      isActive: json['isActive'] ?? true,
      priority: json['priority'] ?? 0,
    );
  }
}

class SimpleProduct {
  final int id;
  final String name;
  final String imageUrl;
  final double price;
  final double mrp;
  final String quantityLabel;
  final int discount;
  final String description;

  SimpleProduct({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.price,
    required this.mrp,
    required this.quantityLabel,
    required this.discount,
    required this.description,
  });

  factory SimpleProduct.fromJson(Map<String, dynamic> json) {
    String image = 'https://via.placeholder.com/300x300?text=Product';
    
    if (json['imageUrl'] != null && json['imageUrl'].toString().isNotEmpty) {
      String imgUrl = json['imageUrl'].toString();
      if (!imgUrl.startsWith('http')) {
        if (imgUrl.startsWith('/uploads/')) {
          imgUrl = '${Env.baseUrl}$imgUrl';
        } else if (imgUrl.startsWith('/assets/')) {
          imgUrl = '${Env.baseUrl}$imgUrl';
        } else {
          imgUrl = '${Env.baseUrl}/$imgUrl';
        }
      }
      image = imgUrl;
    } else if (json['images'] != null && (json['images'] as List).isNotEmpty) {
      String imgUrl = json['images'][0]?.toString() ?? '';
      if (!imgUrl.startsWith('http')) {
        if (imgUrl.startsWith('/uploads/')) {
          imgUrl = '${Env.baseUrl}$imgUrl';
        } else if (imgUrl.startsWith('/assets/')) {
          imgUrl = '${Env.baseUrl}$imgUrl';
        } else {
          imgUrl = '${Env.baseUrl}/$imgUrl';
        }
      }
      image = imgUrl;
    }

    String cleanImage = image;
    if (cleanImage.startsWith('assets/assets/')) {
      cleanImage = cleanImage.replaceFirst('assets/assets/', 'assets/');
    }

    num priceNum = 0;
    if (json['price'] != null) {
      if (json['price'] is num) {
        priceNum = json['price'];
      } else if (json['price'] is String) {
        priceNum = double.tryParse(json['price']) ?? 0;
      }
    }

    num mrpNum = priceNum;
    if (json['mrp'] != null) {
      if (json['mrp'] is num) {
        mrpNum = json['mrp'];
      } else if (json['mrp'] is String) {
        mrpNum = double.tryParse(json['mrp']) ?? priceNum;
      }
    }

    int discountNum = 0;
    if (json['discount'] != null) {
      if (json['discount'] is num) {
        discountNum = json['discount'].toInt();
      } else if (json['discount'] is String) {
        discountNum = int.tryParse(json['discount']) ?? 0;
      }
    }

    return SimpleProduct(
      id: json['id'] ?? 0,
      name: json['name'] ?? 'Unknown Product',
      imageUrl: cleanImage,
      price: priceNum.toDouble(),
      mrp: mrpNum.toDouble(),
      quantityLabel: json['unit'] ?? json['quantityLabel'] ?? json['variant'] ?? '1 unit',
      discount: discountNum,
      description: json['description'] ?? json['shortDescription'] ?? '',
    );
  }
}

class HomeLayout {
  final UserProfile user;
  final List<BannerItem> banners;
  final List<DirectoryCategory> directory;

  HomeLayout({
    required this.user,
    required this.banners,
    required this.directory,
  });

  factory HomeLayout.fromJson(Map<String, dynamic> json) {
    return HomeLayout(
      user: UserProfile.fromJson(json['user'] ?? {}),
      banners: (json['banners'] as List?)
          ?.map((e) => BannerItem.fromJson(e))
          .toList() ??
          [],
      directory: (json['directory'] as List?)
          ?.map((e) => DirectoryCategory.fromJson(e))
          .toList() ??
          [],
    );
  }
}
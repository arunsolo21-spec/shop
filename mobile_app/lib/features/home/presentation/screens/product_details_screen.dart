import 'package:flutter/material.dart';
import '../../domain/entities/home_layout.dart';

class ProductDetailsScreen extends StatelessWidget {
  final SimpleProduct product;
  final String categoryName;

  const ProductDetailsScreen({
    super.key,
    required this.product,
    required this.categoryName,
  });

  // Helper to reuse the logic for the fallback icon
  String _getCategoryIcon(String name) {
    final n = name.toLowerCase();
    if (n.contains('beverage') ||
        n.contains('drink') ||
        n.contains('juice') ||
        n.contains('water')) {
      return 'assets/images/subcategories/beverages.png';
    }
    if (n.contains('chocolate') || n.contains('candy')) {
      return 'assets/images/subcategories/chocolate.png';
    }
    if (n.contains('biscuit') || n.contains('cookie')) {
      return 'assets/images/subcategories/biscuits.png';
    }
    if (n.contains('chip') || n.contains('namkeen') || n.contains('snack')) {
      return 'assets/images/subcategories/chips.png';
    }
    if (n.contains('rice') || n.contains('grain')) {
      return 'assets/images/subcategories/rice.png';
    }
    if (n.contains('atta') || n.contains('flour') || n.contains('wheat')) {
      return 'assets/images/subcategories/wheat.png';
    }
    if (n.contains('dal') || n.contains('pulse')) {
      return 'assets/images/subcategories/dals.png';
    }
    if (n.contains('oil') || n.contains('ghee')) {
      return 'assets/images/subcategories/oilsgheephotoroom.png';
    }
    if (n.contains('salt') || n.contains('sugar')) {
      return 'assets/images/subcategories/sugar.png';
    }
    if (n.contains('spice') || n.contains('masala')) {
      return 'assets/images/subcategories/spices.png';
    }
    if (n.contains('bath') || n.contains('soap') || n.contains('body')) {
      return 'assets/images/subcategories/bath.png';
    }
    if (n.contains('hair') || n.contains('shampoo')) {
      return 'assets/images/subcategories/shampoo.png';
    }
    if (n.contains('oral') || n.contains('paste') || n.contains('brush')) {
      return 'assets/images/subcategories/oral.png';
    }
    if (n.contains('detergent') || n.contains('wash')) {
      return 'assets/images/subcategories/detergent.png';
    }
    if (n.contains('cleaner') || n.contains('floor')) {
      return 'assets/images/subcategories/home_cleaning.png';
    }
    if (n.contains('baby') || n.contains('diaper')) {
      return 'assets/images/subcategories/baby_care.png';
    }
    return 'assets/images/subcategories/general.png';
  }

  @override
  Widget build(BuildContext context) {
    final iconPath = _getCategoryIcon(categoryName);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, color: Colors.black),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: SizedBox(
                      height: 250,
                      width: 250,
                      child: Image.asset(
                        iconPath,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                  Text(
                    product.name,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.quantityLabel,
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Text(
                        '₹${product.price}',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF1B5E20),
                        ),
                      ),
                      const SizedBox(width: 12),
                      if (product.mrp > product.price)
                        Text(
                          '₹${product.mrp}',
                          style: TextStyle(
                            fontSize: 16,
                            decoration: TextDecoration.lineThrough,
                            color: Colors.grey[400],
                          ),
                        ),
                      const Spacer(),
                      if (product.discount > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.green[50],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '${product.discount}% OFF',
                            style: const TextStyle(
                              color: Color(0xFF1B5E20),
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 30),
                  const Text(
                    "Product Details",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    "This is a premium quality product from the $categoryName category. It is carefully sourced and packed to ensure freshness and quality.",
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[700],
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 1,
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () {
                  // Add to cart logic here
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1B5E20),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  "Add to Cart",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

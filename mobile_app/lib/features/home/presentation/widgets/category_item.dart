import 'package:flutter/material.dart';
import '../../domain/entities/home_layout.dart';

class CategoryItem extends StatelessWidget {
  final DirectoryCategory category;
  final VoidCallback onTap;

  const CategoryItem({super.key, required this.category, required this.onTap});

  String _getAssetPath(String name) {
    final n = name.toLowerCase();
    if (n.contains('rice')) return 'assets/images/subcategories/rice.png';
    if (n.contains('dal')) return 'assets/images/subcategories/dals.png';
    if (n.contains('oil') || n.contains('ghee')) {
      return 'assets/images/subcategories/oilsgheephotoroom.png';
    }
    if (n.contains('spice') || n.contains('masala')) {
      return 'assets/images/subcategories/spices.png';
    }
    if (n.contains('beverage') || n.contains('drink')) {
      return 'assets/images/subcategories/beverages.png';
    }
    if (n.contains('chip') || n.contains('snack')) {
      return 'assets/images/subcategories/chips.png';
    }
    if (n.contains('chocolate') || n.contains('sweet')) {
      return 'assets/images/subcategories/chocolate.png';
    }
    if (n.contains('bread') || n.contains('bakery')) {
      return 'assets/images/subcategories/bread.png';
    }
    if (n.contains('noodle') || n.contains('pasta')) {
      return 'assets/images/subcategories/noodles.png';
    }
    if (n.contains('baby')) return 'assets/images/subcategories/baby_care.png';
    if (n.contains('dairy') || n.contains('milk')) {
      return 'assets/images/subcategories/dairy.png';
    }
    if (n.contains('detergent') || n.contains('wash')) {
      return 'assets/images/subcategories/detergent.png';
    }
    if (n.contains('clean')) {
      return 'assets/images/subcategories/home_cleaning.png';
    }
    if (n.contains('mosquito') || n.contains('repellent')) {
      return 'assets/images/subcategories/mosquito_coil.png';
    }
    if (n.contains('agarbatti') || n.contains('pooja')) {
      return 'assets/images/subcategories/agarbatti.png';
    }
    if (n.contains('bath') || n.contains('soap')) {
      return 'assets/images/subcategories/bath.png';
    }
    if (n.contains('shampoo') || n.contains('hair')) {
      return 'assets/images/subcategories/shampoo.png';
    }
    if (n.contains('oral') || n.contains('paste')) {
      return 'assets/images/subcategories/oral.png';
    }
    if (n.contains('feminine') || n.contains('pad')) {
      return 'assets/images/subcategories/feminine_hygiene.png';
    }
    if (n.contains('first') || n.contains('aid')) {
      return 'assets/images/subcategories/firstaid.png';
    }
    if (n.contains('light') || n.contains('bulb')) {
      return 'assets/images/subcategories/light.png';
    }
    if (n.contains('notebook') || n.contains('stationery')) {
      return 'assets/images/subcategories/notebook.png';
    }
    if (n.contains('sauce') || n.contains('ketchup')) {
      return 'assets/images/subcategories/sauces.png';
    }
    if (n.contains('sugar')) return 'assets/images/subcategories/sugar.png';
    if (n.contains('wheat') || n.contains('atta')) {
      return 'assets/images/subcategories/wheat.png';
    }
    if (n.contains('biscuit') || n.contains('cookie')) {
      return 'assets/images/subcategories/biscuits.png';
    }
    if (n.contains('dry') || n.contains('nut')) {
      return 'assets/images/subcategories/dry_fruits.png';
    }
    return 'assets/images/subcategories/general.png';
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 70,
            height: 70,
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              shape: BoxShape.circle,
            ),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Image.asset(
                _getAssetPath(category.name),
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) =>
                    Image.asset('assets/images/subcategories/general.png'),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            category.name,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

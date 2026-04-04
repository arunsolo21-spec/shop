import 'package:flutter/material.dart';

class CategoryList extends StatelessWidget {
  final List<Category> categories;

  const CategoryList({super.key, required this.categories});

  // Helper to map API category names to Local Assets
  String _getCorrectIconPath(String categoryName) {
    final name = categoryName.toLowerCase();

    // UPDATED PATH: subcategories
    if (name.contains("baby")) {
      return "assets/images/subcategories/baby_care.png";
    }
    if (name.contains("beverage")) {
      return "assets/images/subcategories/beverages.png";
    }
    if (name.contains("dairy")) return "assets/images/subcategories/dairy.png";
    if (name.contains("pulse") || name.contains("dal")) {
      return "assets/images/subcategories/dals.png";
    }
    if (name.contains("clean") || name.contains("house")) {
      return "assets/images/subcategories/home_cleaning.png";
    }
    if (name.contains("oil") || name.contains("ghee")) {
      return "assets/images/subcategories/oils&ghee-photoroom.png";
    }
    if (name.contains("personal")) {
      return "assets/images/subcategories/bath.png";
    }
    if (name.contains("pooja")) {
      return "assets/images/subcategories/agarbatti.png";
    }
    if (name.contains("rice") || name.contains("grain")) {
      return "assets/images/subcategories/rice.png";
    }
    if (name.contains("snack") || name.contains("chips")) {
      return "assets/images/subcategories/chips.png";
    }
    if (name.contains("spice") || name.contains("masala")) {
      return "assets/images/subcategories/chilly.png";
    }
    if (name.contains("station")) {
      return "assets/images/subcategories/notebook.png";
    }

    // Default Fallback
    return "assets/images/subcategories/rice.png";
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 110, // Fixed height for the strip
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (context, index) =>
            const SizedBox(width: 20), // Spacing between items
        itemBuilder: (context, index) {
          final category = categories[index];
          final String localAssetPath = _getCorrectIconPath(category.name);

          return GestureDetector(
            onTap: () {
              // Navigate to Category Products Screen
              // Assuming you have a route set up like '/category/:name'
              // context.push('/categories/${category.name}');

              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text("Selected: ${category.name}"),
                  duration: const Duration(milliseconds: 500),
                ),
              );
            },
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Circular Icon Container
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: Padding(
                      padding: const EdgeInsets.all(
                          8.0), // Slight padding inside circle
                      child: Image.asset(
                        localAssetPath,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) {
                          return Icon(Icons.category, color: Colors.grey[400]);
                        },
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                // Category Label
                SizedBox(
                  width: 75,
                  child: Text(
                    category.name,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                      height: 1.2,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

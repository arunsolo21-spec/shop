import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/home_skeleton.dart';
import '../../../../core/widgets/error_widget.dart';
import '../providers/home_provider.dart';
import '../widgets/banner_slider.dart';
import '../../domain/entities/home_layout.dart';
import '../../../../core/theme/app_theme.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(homeProvider.notifier).loadHomeData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final homeState = ref.watch(homeProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      body: homeState.isLoading
          ? const SafeArea(child: HomeSkeleton())
          : homeState.error != null
              ? _buildErrorView(homeState.error!)
              : SafeArea(
                  child: RefreshIndicator(
                    color: AppTheme.primaryGreen,
                    onRefresh: () async {
                      await ref.read(homeProvider.notifier).loadHomeData();
                    },
                    child: CustomScrollView(
                      physics: const BouncingScrollPhysics(),
                      slivers: [
                        _buildHeader(),
                        _buildBannerSection(homeState.data?.banners ?? []),
                        SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final category = homeState.data!.directory[index];
                              return CategorySection(category: category);
                            },
                            childCount: homeState.data?.directory.length ?? 0,
                          ),
                        ),
                        const SliverPadding(
                          padding: EdgeInsets.only(bottom: 100),
                        ),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildHeader() {
    return SliverAppBar(
      pinned: true,
      floating: true,
      backgroundColor: AppTheme.primaryGreen,
      elevation: 0,
      toolbarHeight: 70,
      automaticallyImplyLeading: false,
      title: Padding(
        padding: const EdgeInsets.only(right: 8),
        child: Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => context.push('/search'),
                child: Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: const Row(
                    children: [
                      Padding(
                        padding: EdgeInsets.only(left: 16),
                        child: Icon(Icons.search, color: Colors.grey, size: 22),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Search products...',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 15,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            _buildIconButton(
              icon: Icons.shopping_cart_outlined,
              onTap: () => context.push('/cart'),
            ),
            const SizedBox(width: 8),
            _buildIconButton(
              icon: Icons.person_outline,
              onTap: () => context.push('/profile'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIconButton({
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: Icon(icon, color: Colors.white, size: 24),
        ),
      ),
    );
  }

  Widget _buildBannerSection(List<BannerItem> banners) {
    if (banners.isEmpty) {
      return const SliverToBoxAdapter(child: SizedBox.shrink());
    }

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: BannerSlider(banners: banners),
      ),
    );
  }

  Widget _buildErrorView(String message) {
    return AppErrorWidget.network(
      message: message,
      onRetry: () {
        ref.read(homeProvider.notifier).loadHomeData();
      },
    );
  }
}

class CategorySection extends StatelessWidget {
  final DirectoryCategory category;

  const CategorySection({super.key, required this.category});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  category.name,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              GestureDetector(
                onTap: () {
                  context.push(
                    '/product-listing',
                    extra: {
                      'categoryId': category.id,
                      'categoryName': category.name,
                      'subCategories': category.subCategories,
                    },
                  );
                },
                child: const Text(
                  "See All",
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryGreen,
                  ),
                ),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              childAspectRatio: 0.75,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: category.subCategories.length,
            itemBuilder: (context, index) {
              final sub = category.subCategories[index];
              return GestureDetector(
                onTap: () {
                  context.push(
                    '/product-listing',
                    extra: {
                      'categoryId': category.id,
                      'categoryName': category.name,
                      'subCategories': category.subCategories,
                      'selectedSubCategoryId': sub.id,
                    },
                  );
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: sub.imageUrl.isEmpty
                            ? const Icon(Icons.category, color: Colors.grey)
                            : sub.imageUrl.startsWith('http')
                                ? ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: Image.network(
                                      sub.imageUrl,
                                      fit: BoxFit.contain,
                                      errorBuilder:
                                          (context, error, stackTrace) =>
                                              const Icon(Icons.category,
                                                  color: Colors.grey),
                                    ),
                                  )
                                : ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: Image.asset(
                                      sub.imageUrl,
                                      fit: BoxFit.contain,
                                      errorBuilder:
                                          (context, error, stackTrace) =>
                                              const Icon(Icons.category,
                                                  color: Colors.grey),
                                    ),
                                  ),
                      ),
                      const SizedBox(height: 8),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                        child: Text(
                          sub.name,
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: Colors.black87,
                            height: 1.2,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 24),
        Divider(height: 1, color: Colors.grey[200]),
      ],
    );
  }
}
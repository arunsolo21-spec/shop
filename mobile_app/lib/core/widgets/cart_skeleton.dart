import 'package:flutter/material.dart';
import '../../../../core/widgets/shimmer_skeleton.dart';

class CartSkeleton extends StatelessWidget {
  const CartSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: 4,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: const Row(
                  children: [
                    ShimmerSkeleton(height: 80, width: 80, borderRadius: 8),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ShimmerSkeleton(
                              height: 16, width: 150, borderRadius: 4),
                          SizedBox(height: 8),
                          ShimmerSkeleton(
                              height: 14, width: 80, borderRadius: 4),
                          SizedBox(height: 12),
                          Row(
                            children: [
                              ShimmerSkeleton(
                                  height: 32, width: 100, borderRadius: 6),
                              Spacer(),
                              ShimmerSkeleton(
                                  height: 14, width: 60, borderRadius: 4),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
            boxShadow: [
              BoxShadow(
                color: Colors.black12,
                blurRadius: 20,
                offset: Offset(0, -5),
              ),
            ],
          ),
          child: const Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ShimmerSkeleton(height: 14, width: 80, borderRadius: 4),
                  ShimmerSkeleton(height: 16, width: 100, borderRadius: 4),
                ],
              ),
              SizedBox(height: 16),
              ShimmerSkeleton(
                  height: 56, width: double.infinity, borderRadius: 28),
            ],
          ),
        ),
      ],
    );
  }
}

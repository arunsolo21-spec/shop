import 'package:flutter/material.dart';
import 'shimmer_skeleton.dart';

class HomeSkeleton extends StatelessWidget {
  const HomeSkeleton({super.key});
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const ShimmerSkeleton(
            height: 50,
            width: double.infinity,
            borderRadius: 12,
          ),
          const SizedBox(height: 20),
          const ShimmerSkeleton(
            height: 180,
            width: double.infinity,
            borderRadius: 16,
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              3,
              (index) => Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey.shade300,
                ),
              ),
            ),
          ),
          const SizedBox(height: 30),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(
              5,
              (index) => const Column(
                children: [
                  ShimmerSkeleton.circle(size: 60),
                  SizedBox(height: 8),
                  ShimmerSkeleton(height: 10, width: 40, borderRadius: 4),
                ],
              ),
            ),
          ),
          const SizedBox(height: 30),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              ShimmerSkeleton(height: 20, width: 150, borderRadius: 4),
              ShimmerSkeleton(height: 15, width: 50, borderRadius: 4),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 240,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 3,
              separatorBuilder: (context, index) => const SizedBox(width: 16),
              itemBuilder: (context, index) {
                return Container(
                  width: 150,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ShimmerSkeleton(
                        height: 130,
                        width: 150,
                        borderRadius: 12,
                      ),
                      Padding(
                        padding: EdgeInsets.all(12.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ShimmerSkeleton(
                              height: 12,
                              width: 100,
                              borderRadius: 4,
                            ),
                            SizedBox(height: 6),
                            ShimmerSkeleton(
                              height: 12,
                              width: 80,
                              borderRadius: 4,
                            ),
                            SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                ShimmerSkeleton(
                                  height: 16,
                                  width: 40,
                                  borderRadius: 4,
                                ),
                                ShimmerSkeleton(
                                  height: 24,
                                  width: 24,
                                  borderRadius: 6,
                                ),
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
        ],
      ),
    );
  }
}
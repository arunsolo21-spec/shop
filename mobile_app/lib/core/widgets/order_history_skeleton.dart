import 'package:flutter/material.dart';
import '../../../../core/widgets/shimmer_skeleton.dart';

class OrderHistorySkeleton extends StatelessWidget {
  const OrderHistorySkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) {
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[200]!),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ShimmerSkeleton(height: 16, width: 120, borderRadius: 4),
                  ShimmerSkeleton(height: 24, width: 80, borderRadius: 4),
                ],
              ),
              SizedBox(height: 12),
              ShimmerSkeleton(height: 14, width: 150, borderRadius: 4),
              SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ShimmerSkeleton(height: 12, width: 100, borderRadius: 4),
                  ShimmerSkeleton(height: 16, width: 80, borderRadius: 4),
                ],
              ),
              SizedBox(height: 12),
              ShimmerSkeleton(
                  height: 40, width: double.infinity, borderRadius: 8),
            ],
          ),
        );
      },
    );
  }
}

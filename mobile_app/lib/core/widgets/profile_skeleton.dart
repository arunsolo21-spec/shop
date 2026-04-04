import 'package:flutter/material.dart';
import '../../../../core/widgets/shimmer_skeleton.dart';

class ProfileSkeleton extends StatelessWidget {
  const ProfileSkeleton({super.key}); // const constructor

  @override
  Widget build(BuildContext context) {
    return const SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        children: [
          ShimmerSkeleton(
              height: 150, width: double.infinity, borderRadius: 16),
          SizedBox(height: 24),
          ShimmerSkeleton(
              height: 200, width: double.infinity, borderRadius: 16),
          SizedBox(height: 24),
          ShimmerSkeleton(
              height: 120, width: double.infinity, borderRadius: 16),
          SizedBox(height: 24),
          ShimmerSkeleton(
              height: 120, width: double.infinity, borderRadius: 16),
          SizedBox(height: 24),
          ShimmerSkeleton(height: 56, width: double.infinity, borderRadius: 12),
        ],
      ),
    );
  }
}

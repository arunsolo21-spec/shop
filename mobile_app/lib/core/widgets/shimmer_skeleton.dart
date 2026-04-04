import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ShimmerSkeleton extends StatelessWidget {
  final double height;
  final double width;
  final double borderRadius;
  final ShapeBorder shapeBorder;

  const ShimmerSkeleton({
    super.key,
    required this.height,
    required this.width,
    this.borderRadius = 8,
    this.shapeBorder = const RoundedRectangleBorder(),
  });

  // Factory constructor for Circular skeletons (like Profile Avatars or Category Icons)
  const ShimmerSkeleton.circle({
    super.key,
    required double size,
  })  : height = size,
        width = size,
        borderRadius = size / 2,
        shapeBorder = const CircleBorder();

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      period: const Duration(seconds: 2), // Smooth 2s animation
      child: Container(
        height: height,
        width: width,
        decoration: ShapeDecoration(
          color: Colors.grey[300], // The generic "grey box" color
          shape: shapeBorder is RoundedRectangleBorder
              ? RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(borderRadius))
              : shapeBorder,
        ),
      ),
    );
  }
}

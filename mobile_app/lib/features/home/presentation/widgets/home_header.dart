import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/entities/home_layout.dart';

class HomeHeader extends StatelessWidget {
  final HomeUser? user;

  const HomeHeader({super.key, this.user});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundImage: user != null && user!.profileImage.isNotEmpty
                    ? NetworkImage(user!.profileImage)
                    : null,
                backgroundColor: Colors.grey[200],
                child: user == null || user!.profileImage.isEmpty
                    ? const Icon(Icons.person, color: Colors.grey)
                    : null,
              ),
              const SizedBox(width: 12),
              Text(
                user?.name ?? "Guest",
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.primaryGreen,
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                user?.location.split(',')[0] ?? "Location",
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.primaryGreen,
                ),
              ),
              Row(
                children: [
                  Text(
                    user?.location.split(',').length == 2
                        ? user!.location.split(',')[1].trim()
                        : "",
                    style: const TextStyle(
                        fontSize: 12, color: AppTheme.primaryGreen),
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.location_on,
                      color: AppTheme.primaryGreen, size: 16),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

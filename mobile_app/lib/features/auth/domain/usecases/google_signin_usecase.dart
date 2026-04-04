import 'package:fpdart/fpdart.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../auth_repository.dart';

class GoogleSignInUseCase
    implements UseCase<GoogleSignInResponse, GoogleSignInParams> {
  final AuthRepository _repository;

  GoogleSignInUseCase(this._repository);

  @override
  Future<Either<Failure, GoogleSignInResponse>> call(
      GoogleSignInParams params) async {
    return await _repository.googleSignIn(
      idToken: params.idToken,
      accessToken: params.accessToken,
      name: params.name,
      email: params.email,
    );
  }
}

class GoogleSignInParams {
  final String idToken;
  final String accessToken;
  final String name;
  final String email;

  const GoogleSignInParams({
    required this.idToken,
    required this.accessToken,
    required this.name,
    required this.email,
  });

  GoogleSignInParams copyWith({
    String? idToken,
    String? accessToken,
    String? name,
    String? email,
  }) {
    return GoogleSignInParams(
      idToken: idToken ?? this.idToken,
      accessToken: accessToken ?? this.accessToken,
      name: name ?? this.name,
      email: email ?? this.email,
    );
  }
}

class GoogleSignInResponse {
  final String accessToken;
  final GoogleUser user;
  final bool isNewUser;

  const GoogleSignInResponse({
    required this.accessToken,
    required this.user,
    this.isNewUser = false,
  });

  factory GoogleSignInResponse.fromJson(Map<String, dynamic> json) {
    final userData = json['user'] as Map<String, dynamic>? ?? json;
    return GoogleSignInResponse(
      accessToken: json['access_token'] ?? '',
      user: GoogleUser.fromJson(userData),
      isNewUser: json['isNewUser'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'access_token': accessToken,
      'user': user.toJson(),
      'isNewUser': isNewUser,
    };
  }
}

class GoogleUser {
  final int id;
  final String email;
  final String name;
  final String? phone;
  final String role;
  final bool isActive;
  final String? profileImage;
  final DateTime createdAt;

  const GoogleUser({
    required this.id,
    required this.email,
    required this.name,
    this.phone,
    required this.role,
    required this.isActive,
    this.profileImage,
    required this.createdAt,
  });

  factory GoogleUser.fromJson(Map<String, dynamic> json) {
    return GoogleUser(
      id: json['id'] ?? 0,
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'],
      role: json['role'] ?? 'USER',
      isActive: json['isActive'] ?? true,
      profileImage: json['profileImage'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phone': phone,
      'role': role,
      'isActive': isActive,
      'profileImage': profileImage,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  String get initials {
    final names = name.trim().split(' ');
    if (names.length >= 2) {
      return '${names[0][0]}${names[1][0]}'.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }
}

import '../../../../core/network/dio_client.dart';

class AuthRemoteSource {
  final DioClient _dioClient;

  AuthRemoteSource() : _dioClient = DioClient();

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dioClient.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> googleSignIn({
    required String idToken,
    required String accessToken,
    required String name,
    required String email,
  }) async {
    final response = await _dioClient.post('/auth/google-signin', data: {
      'idToken': idToken,
      'accessToken': accessToken,
      'name': name,
      'email': email,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> register(
      String name, String email, String password) async {
    final response = await _dioClient.post('/auth/register', data: {
      'name': name,
      'email': email,
      'password': password,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> forgotPassword(String email) async {
    final response = await _dioClient.post('/auth/forgot-password', data: {
      'email': email,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> resetPassword(
      String email, String token, String newPassword) async {
    final response = await _dioClient.post('/auth/reset-password', data: {
      'email': email,
      'token': token,
      'password': newPassword,
    });
    return response.data;
  }
}

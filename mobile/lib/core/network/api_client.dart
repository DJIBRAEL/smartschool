import 'package:dio/dio.dart';

// Stockage en mémoire simple (pas de plugin natif requis)
class _TokenStore {
  static String? _token;
  static String? get token => _token;
  static void set(String t) => _token = t;
  static void clear() => _token = null;
}

class ApiClient {
  ApiClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: const String.fromEnvironment(
          'API_URL',
          defaultValue: 'http://localhost:3001/api/v1',
        ),
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = _TokenStore.token;
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            _TokenStore.clear();
          }
          handler.next(error);
        },
      ),
    );
  }

  static final ApiClient instance = ApiClient._internal();
  late final Dio _dio;

  Dio get dio => _dio;

  Future<String> login(String email, String password) async {
    final res = await _dio.post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
    final token = res.data['token'] as String;
    final role = res.data['role'] as String;
    _TokenStore.set(token);
    return role;
  }

  void logout() {
    _TokenStore.clear();
  }
}

import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../core/api/auth_interceptor.dart';

part 'api_client.g.dart';

@riverpod
Dio dio(Ref ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: 'https://motract-backend-5sct.onrender.com', // Production URL
      connectTimeout: const Duration(
        seconds: 60,
      ), // Increased for Render cold start
      receiveTimeout: const Duration(
        seconds: 60,
      ), // Increased for Render cold start
    ),
  );

  dio.interceptors.add(AuthInterceptor());
  dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));

  return dio;
}

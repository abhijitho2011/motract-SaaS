import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workshop/src/core/api/api_client.dart';

part 'auth_repository.g.dart';

@RestApi()
abstract class AuthApi {
  factory AuthApi(Dio dio) = _AuthApi;

  @POST('/auth/login')
  Future<dynamic> login(@Body() Map<String, dynamic> body);
}

@riverpod
AuthApi authApi(Ref ref) {
  final dio = ref.watch(dioProvider);
  return AuthApi(dio);
}

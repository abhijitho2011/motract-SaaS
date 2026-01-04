import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:shared_preferences/shared_preferences.dart';

part 'api_client.g.dart';

const String baseUrl = 'https://motract-backend-5sct.onrender.com';

@riverpod
Dio dio(Ref ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 60),
      receiveTimeout: const Duration(seconds: 60),
    ),
  );

  dio.interceptors.add(AuthInterceptor());
  dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));

  return dio;
}

class AuthInterceptor extends Interceptor {
  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // Token expired or invalid - could redirect to login
    }
    handler.next(err);
  }
}

// RSA API Methods
class RsaApi {
  final Dio dio;
  RsaApi(this.dio);

  // Auth - RSA login with phone + password
  Future<Map<String, dynamic>> login(String phone, String password) async {
    final response = await dio.post(
      '/auth/rsa-login',
      data: {'phone': phone, 'password': password},
    );
    if (response.data is String) {
      throw Exception(response.data);
    }
    return response.data as Map<String, dynamic>;
  }

  // Profile
  Future<Map<String, dynamic>?> getProfile() async {
    final response = await dio.get('/rsa/profile');
    if (response.data == null || response.data is String) {
      return null;
    }
    return response.data as Map<String, dynamic>;
  }

  // Online/Offline
  Future<void> goOnline(double lat, double lng) async {
    await dio.put('/rsa/online', data: {'lat': lat, 'lng': lng});
  }

  Future<void> goOffline() async {
    await dio.put('/rsa/offline');
  }

  Future<void> updateLocation(double lat, double lng) async {
    await dio.put('/rsa/location', data: {'lat': lat, 'lng': lng});
  }

  // Jobs
  Future<List<dynamic>> getPendingJobs() async {
    final response = await dio.get('/rsa/jobs/pending');
    return response.data;
  }

  Future<List<dynamic>> getMyJobs({String? status}) async {
    final response = await dio.get(
      '/rsa/jobs',
      queryParameters: {if (status != null) 'status': status},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> getJobDetails(String id) async {
    final response = await dio.get('/rsa/jobs/$id');
    return response.data;
  }

  Future<void> acceptJob(String id) async {
    await dio.put('/rsa/jobs/$id/accept');
  }

  Future<void> updateJobStatus(String id, String status) async {
    await dio.put('/rsa/jobs/$id/status', data: {'status': status});
  }

  Future<void> completeJob(
    String id, {
    double? fare,
    double? distanceKm,
  }) async {
    await dio.put(
      '/rsa/jobs/$id/complete',
      data: {
        if (fare != null) 'fare': fare,
        if (distanceKm != null) 'distanceKm': distanceKm,
      },
    );
  }

  Future<void> cancelJob(String id, {String? reason}) async {
    await dio.put(
      '/rsa/jobs/$id/cancel',
      data: {if (reason != null) 'reason': reason},
    );
  }

  // Bhuvan Map API - Get Route between two points
  Future<Map<String, dynamic>> getRoute({
    required double lat1,
    required double lon1,
    required double lat2,
    required double lon2,
  }) async {
    final response = await dio.get(
      '/map/route',
      queryParameters: {'lat1': lat1, 'lon1': lon1, 'lat2': lat2, 'lon2': lon2},
    );
    return response.data as Map<String, dynamic>;
  }

  // Get Nearby Workshops (for towing destination)
  Future<List<dynamic>> getNearbyWorkshops(double lat, double lng) async {
    final response = await dio.get(
      '/rsa-booking/public/workshops/nearby',
      queryParameters: {'lat': lat.toString(), 'lng': lng.toString()},
    );
    return response.data as List<dynamic>;
  }
}

@riverpod
RsaApi rsaApi(Ref ref) {
  return RsaApi(ref.watch(dioProvider));
}

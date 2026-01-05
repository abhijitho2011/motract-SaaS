import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ClientApi {
  static const String baseUrl = 'https://motract-backend-5sct.onrender.com';

  late Dio _dio;
  String? _token;

  ClientApi() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          if (_token != null) {
            options.headers['Authorization'] = 'Bearer $_token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('access_token');
  }

  Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', token);
  }

  Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
  }

  // ==========================================
  // Authentication
  // ==========================================

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String mobile,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/client/register',
        data: {
          'name': name,
          'email': email,
          'mobile': mobile,
          'password': password,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> login({
    required String mobile,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/client-login',
        data: {'mobile': mobile, 'password': password},
      );
      final data = response.data as Map<String, dynamic>;
      if (data['access_token'] != null) {
        await setToken(data['access_token']);
      }
      return data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ==========================================
  // Vehicle Management
  // ==========================================

  Future<List<dynamic>> getMyVehicles() async {
    await loadToken();
    try {
      final response = await _dio.get('/client/vehicles');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> addVehicle(String regNumber) async {
    await loadToken();
    try {
      final response = await _dio.post(
        '/client/vehicles/add',
        data: {'regNumber': regNumber},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> verifyAndAddVehicle(
    String vehicleId,
    String vinNumber,
  ) async {
    await loadToken();
    try {
      final response = await _dio.post(
        '/client/vehicles/verify',
        data: {'vehicleId': vehicleId, 'vinNumber': vinNumber},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ==========================================
  // Service History
  // ==========================================

  Future<List<dynamic>> getVehicleHistory(String vehicleId) async {
    await loadToken();
    try {
      final response = await _dio.get('/client/vehicles/$vehicleId/history');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ==========================================
  // Workshop Booking
  // ==========================================

  Future<List<dynamic>> getBookingCategories() async {
    await loadToken();
    try {
      final response = await _dio.get('/client/booking/categories');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<dynamic>> searchWorkshops({
    String? categoryId,
    String? query,
  }) async {
    await loadToken();
    try {
      final params = <String, dynamic>{};
      if (categoryId != null) params['categoryId'] = categoryId;
      if (query != null) params['query'] = query;

      final response = await _dio.get(
        '/client/booking/workshops',
        queryParameters: params,
      );
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<dynamic>> getWorkshopSlots(String workshopId, String date) async {
    await loadToken();
    try {
      final response = await _dio.get(
        '/client/booking/workshops/$workshopId/slots',
        queryParameters: {'date': date},
      );
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> createBooking({
    required String workshopId,
    required String vehicleId,
    required List<String> serviceCategories,
    required String bookingDate,
    required String slotTime,
    String? notes,
  }) async {
    await loadToken();
    try {
      final response = await _dio.post(
        '/client/booking/create',
        data: {
          'workshopId': workshopId,
          'vehicleId': vehicleId,
          'serviceCategories': serviceCategories,
          'bookingDate': bookingDate,
          'slotTime': slotTime,
          'notes': notes,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<dynamic>> getMyBookings() async {
    await loadToken();
    try {
      final response = await _dio.get('/client/booking/my-bookings');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ==========================================
  // Enhanced Booking System
  // ==========================================

  // Get all service categories
  Future<List<dynamic>> getServiceCategories() async {
    await loadToken();
    try {
      final response = await _dio.get('/client/booking/service-categories');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get nearby workshops with ratings
  Future<List<dynamic>> getNearbyWorkshops({
    required double lat,
    required double lng,
    String? categoryId,
  }) async {
    await loadToken();
    try {
      final params = <String, dynamic>{
        'lat': lat.toString(),
        'lng': lng.toString(),
      };
      if (categoryId != null) params['categoryId'] = categoryId;

      final response = await _dio.get(
        '/client/booking/nearby-workshops',
        queryParameters: params,
      );
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get available slots for a workshop (movie-ticket style)
  Future<List<dynamic>> getAvailableSlotsForWorkshop(
    String workshopId,
    String date, {
    String? categoryId,
  }) async {
    await loadToken();
    try {
      final params = <String, dynamic>{'date': date};
      if (categoryId != null) params['categoryId'] = categoryId;

      final response = await _dio.get(
        '/client/booking/slots/$workshopId',
        queryParameters: params,
      );
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Create booking with slot
  Future<Map<String, dynamic>> createBookingWithSlot({
    required String workshopId,
    required String vehicleId,
    required String serviceCategoryId,
    required String date,
    required String slotTime,
    String? slotId,
    String? notes,
  }) async {
    await loadToken();
    try {
      final response = await _dio.post(
        '/client/booking/book-slot',
        data: {
          'workshopId': workshopId,
          'vehicleId': vehicleId,
          'serviceCategoryId': serviceCategoryId,
          'date': date,
          'slotTime': slotTime,
          'slotId': slotId,
          'notes': notes,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Submit workshop rating
  Future<Map<String, dynamic>> submitWorkshopRating({
    required String bookingId,
    required int rating,
    String? feedback,
  }) async {
    await loadToken();
    try {
      final response = await _dio.post(
        '/client/booking/$bookingId/rating',
        data: {'rating': rating, 'feedback': feedback},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ==========================================
  // RSA Booking
  // ==========================================

  Future<List<dynamic>> getRsaCategories() async {
    await loadToken();
    try {
      final response = await _dio.get('/rsa-booking/categories');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> requestRsa({
    required String vehicleId,
    required String serviceType,
    required double lat,
    required double lng,
    double? destLat,
    double? destLng,
    String? destAddress,
  }) async {
    await loadToken();
    try {
      final data = {
        'vehicleId': vehicleId,
        'serviceType': serviceType,
        'pickupLat': lat,
        'pickupLng': lng,
      };
      if (destLat != null) data['destinationLat'] = destLat;
      if (destLng != null) data['destinationLng'] = destLng;
      if (destAddress != null) data['destinationAddress'] = destAddress;

      final response = await _dio.post('/rsa-booking/request', data: data);
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getRsaJobStatus(String jobId) async {
    await loadToken();
    try {
      final response = await _dio.get('/rsa-booking/job/$jobId');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> submitRsaRating(
    String jobId,
    int rating,
    String? feedback,
  ) async {
    await loadToken();
    try {
      final response = await _dio.post(
        '/rsa-booking/job/$jobId/rating',
        data: {'rating': rating, 'feedback': feedback},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ==========================================
  // Error Handling
  // ==========================================

  String _handleError(DioException e) {
    if (e.response?.data is Map) {
      return e.response?.data['message'] ?? 'An error occurred';
    }
    if (e.type == DioExceptionType.connectionTimeout) {
      return 'Connection timeout';
    }
    if (e.type == DioExceptionType.receiveTimeout) {
      return 'Server not responding';
    }
    return e.message ?? 'An error occurred';
  }
}

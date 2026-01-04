import 'package:dio/dio.dart';

class ApiClient {
  static final Dio dio = Dio(
    BaseOptions(
      baseUrl: 'https://motract-backend-5sct.onrender.com',
      connectTimeout: const Duration(seconds: 60),
      receiveTimeout: const Duration(seconds: 60),
    ),
  )..interceptors.add(LogInterceptor(requestBody: true, responseBody: true));

  // Dashboard
  static Future<Map<String, dynamic>> getDashboardStats() async {
    final response = await dio.get('/super-admin/dashboard/stats');
    return response.data;
  }

  // Organizations
  static Future<dynamic> createOrganization(Map<String, dynamic> data) async {
    final response = await dio.post('/super-admin/organizations', data: data);
    return response.data;
  }

  static Future<List<dynamic>> getOrganizations({
    String? accountType,
    bool? isAuthorized,
    bool? isActive,
  }) async {
    final response = await dio.get(
      '/super-admin/organizations',
      queryParameters: {
        if (accountType != null) 'accountType': accountType,
        if (isAuthorized != null) 'isAuthorized': isAuthorized,
        if (isActive != null) 'isActive': isActive,
      },
    );
    return response.data;
  }

  static Future<List<dynamic>> getMapData({String? accountType}) async {
    final response = await dio.get(
      '/super-admin/organizations/map',
      queryParameters: {if (accountType != null) 'accountType': accountType},
    );
    return response.data;
  }

  static Future<dynamic> getOrganization(String id) async {
    final response = await dio.get('/super-admin/organizations/$id');
    return response.data;
  }

  static Future<dynamic> updateOrganization(
    String id,
    Map<String, dynamic> data,
  ) async {
    final response = await dio.put(
      '/super-admin/organizations/$id',
      data: data,
    );
    return response.data;
  }

  static Future<void> deleteOrganization(String id) async {
    await dio.delete('/super-admin/organizations/$id');
  }

  // Categories
  static Future<List<dynamic>> getCategories() async {
    final response = await dio.get('/super-admin/categories');
    return response.data;
  }

  static Future<dynamic> createCategory(Map<String, dynamic> data) async {
    final response = await dio.post('/super-admin/categories', data: data);
    return response.data;
  }

  static Future<List<dynamic>> getSubCategories(String categoryId) async {
    final response = await dio.get(
      '/super-admin/categories/$categoryId/sub-categories',
    );
    return response.data;
  }

  static Future<dynamic> createSubCategory(
    String categoryId,
    Map<String, dynamic> data,
  ) async {
    final response = await dio.post(
      '/super-admin/categories/$categoryId/sub-categories',
      data: data,
    );
    return response.data;
  }

  // Bookings
  static Future<List<dynamic>> getBookings({
    String? organizationId,
    String? status,
  }) async {
    final response = await dio.get(
      '/super-admin/bookings',
      queryParameters: {
        if (organizationId != null) 'organizationId': organizationId,
        if (status != null) 'status': status,
      },
    );
    return response.data;
  }

  // Vehicle Masters
  static Future<List<dynamic>> getMakes() async {
    final response = await dio.get('/vehicle/masters/makes');
    return response.data;
  }

  static Future<dynamic> createMake(String name) async {
    final response = await dio.post(
      '/vehicle/masters/makes',
      data: {'name': name},
    );
    return response.data;
  }

  static Future<List<dynamic>> getModels(String makeId) async {
    final response = await dio.get(
      '/vehicle/masters/models',
      queryParameters: {'makeId': makeId},
    );
    return response.data;
  }

  static Future<dynamic> createModel(String makeId, String name) async {
    final response = await dio.post(
      '/vehicle/masters/models',
      data: {'makeId': makeId, 'name': name},
    );
    return response.data;
  }

  static Future<List<dynamic>> getVariants(String modelId) async {
    final response = await dio.get(
      '/vehicle/masters/variants',
      queryParameters: {'modelId': modelId},
    );
    return response.data;
  }

  static Future<dynamic> createVariant(
    String modelId,
    String name,
    String fuelType,
  ) async {
    final response = await dio.post(
      '/vehicle/masters/variants',
      data: {'modelId': modelId, 'name': name, 'fuelType': fuelType},
    );
    return response.data;
  }

  // Registered Vehicles
  static Future<List<dynamic>> getAllVehicles({
    String? workshopId,
    String? regNumber,
  }) async {
    final response = await dio.get(
      '/super-admin/vehicles',
      queryParameters: {
        if (workshopId != null) 'workshopId': workshopId,
        if (regNumber != null) 'regNumber': regNumber,
      },
    );
    return response.data;
  }

  static Future<dynamic> updateVehicle(
    String id,
    Map<String, dynamic> data,
  ) async {
    final response = await dio.put('/super-admin/vehicles/$id', data: data);
    return response.data;
  }

  static Future<List<dynamic>> getVehicleServiceHistory(
    String vehicleId,
  ) async {
    final response = await dio.get(
      '/super-admin/vehicles/$vehicleId/service-history',
    );
    return response.data;
  }

  // Map Settings
  static Future<Map<String, dynamic>> getMapSettings() async {
    final response = await dio.get('/super-admin/map-settings');
    return response.data;
  }

  static Future<Map<String, dynamic>> updateMapSettings(
    String apiToken,
    String? expiresAt,
  ) async {
    final response = await dio.post(
      '/super-admin/map-settings',
      data: {
        'apiToken': apiToken,
        if (expiresAt != null) 'expiresAt': expiresAt,
      },
    );
    return response.data;
  }

  static Future<Map<String, dynamic>> testMapConnection(String apiToken) async {
    final response = await dio.post(
      '/super-admin/map-settings/test',
      data: {'apiToken': apiToken},
    );
    return response.data;
  }
}

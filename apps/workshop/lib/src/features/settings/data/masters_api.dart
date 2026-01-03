import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/core/api/api_client.dart';
import 'package:dio/dio.dart';

// API Provider for Inventory Masters
final inventoryMastersApiProvider = Provider<InventoryMastersApi>((ref) {
  final dio = ref.watch(dioProvider);
  return InventoryMastersApi(dio);
});

class InventoryMastersApi {
  final Dio _dio;
  InventoryMastersApi(this._dio);

  // Brands
  Future<List<dynamic>> getBrands() async {
    final response = await _dio.get('/inventory/masters/brands');
    return response.data as List;
  }

  Future<dynamic> createBrand(String name) async {
    final response = await _dio.post(
      '/inventory/masters/brands',
      data: {'name': name},
    );
    return response.data;
  }

  // Categories
  Future<List<dynamic>> getCategories() async {
    final response = await _dio.get('/inventory/masters/categories');
    return response.data as List;
  }

  Future<dynamic> createCategory(String name) async {
    final response = await _dio.post(
      '/inventory/masters/categories',
      data: {'name': name},
    );
    return response.data;
  }

  // Sub-Categories
  Future<List<dynamic>> getSubCategories(String categoryId) async {
    final response = await _dio.get(
      '/inventory/masters/sub-categories?categoryId=$categoryId',
    );
    return response.data as List;
  }

  Future<dynamic> createSubCategory(String categoryId, String name) async {
    final response = await _dio.post(
      '/inventory/masters/sub-categories',
      data: {'categoryId': categoryId, 'name': name},
    );
    return response.data;
  }
}

// Vehicle Masters API
final vehicleMastersApiProvider = Provider<VehicleMastersApi>((ref) {
  final dio = ref.watch(dioProvider);
  return VehicleMastersApi(dio);
});

class VehicleMastersApi {
  final Dio _dio;
  VehicleMastersApi(this._dio);

  // Makes
  Future<List<dynamic>> getMakes() async {
    final response = await _dio.get('/vehicle/masters/makes');
    return response.data as List;
  }

  Future<dynamic> createMake(String name) async {
    final response = await _dio.post(
      '/vehicle/masters/makes',
      data: {'name': name},
    );
    return response.data;
  }

  // Models
  Future<List<dynamic>> getModels(String makeId) async {
    final response = await _dio.get('/vehicle/masters/models?makeId=$makeId');
    return response.data as List;
  }

  Future<dynamic> createModel(String makeId, String name) async {
    final response = await _dio.post(
      '/vehicle/masters/models',
      data: {'makeId': makeId, 'name': name},
    );
    return response.data;
  }

  // Variants
  Future<List<dynamic>> getVariants(String modelId) async {
    final response = await _dio.get(
      '/vehicle/masters/variants?modelId=$modelId',
    );
    return response.data as List;
  }

  Future<dynamic> createVariant(
    String modelId,
    String name,
    String fuelType,
  ) async {
    final response = await _dio.post(
      '/vehicle/masters/variants',
      data: {'modelId': modelId, 'name': name, 'fuelType': fuelType},
    );
    return response.data;
  }
}

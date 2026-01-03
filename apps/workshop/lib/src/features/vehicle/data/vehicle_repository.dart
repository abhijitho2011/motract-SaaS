import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/core/api/api_client.dart';

part 'vehicle_repository.g.dart';

@RestApi()
abstract class VehicleApi {
  factory VehicleApi(Dio dio) = _VehicleApi;

  @GET('/vehicle/lookup/{regNumber}')
  Future<dynamic> lookupVehicle(@Path('regNumber') String regNumber);

  @POST('/vehicle/register')
  Future<dynamic> registerVehicle(@Body() Map<String, dynamic> body);

  @GET('/vehicle/masters/models')
  Future<dynamic> getModels();
}

@riverpod
VehicleApi vehicleApi(Ref ref) {
  final dio = ref.watch(dioProvider);
  return VehicleApi(dio);
}

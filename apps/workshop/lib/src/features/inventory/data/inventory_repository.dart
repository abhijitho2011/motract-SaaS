import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workshop/src/core/api/api_client.dart';

part 'inventory_repository.g.dart';

@RestApi()
abstract class InventoryApi {
  factory InventoryApi(Dio dio) = _InventoryApi;

  @GET('/inventory/items')
  Future<dynamic> getInventoryItems(@Query('workshopId') String workshopId);

  @POST('/inventory/items')
  Future<dynamic> createItem(@Body() Map<String, dynamic> body);

  @POST('/inventory/items/{itemId}/skus')
  Future<dynamic> addSku(
    @Path('itemId') String itemId,
    @Body() Map<String, dynamic> body,
  );

  @POST('/inventory/items/{itemId}/batches')
  Future<dynamic> addBatch(
    @Path('itemId') String itemId,
    @Body() Map<String, dynamic> body,
  );

  @POST('/inventory/items/{itemId}/adjust')
  Future<dynamic> adjustStock(
    @Path('itemId') String itemId,
    @Body() Map<String, dynamic> body,
  );
}

@riverpod
InventoryApi inventoryApi(Ref ref) {
  final dio = ref.watch(dioProvider);
  return InventoryApi(dio);
}

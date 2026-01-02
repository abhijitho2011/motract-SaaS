import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workshop/src/core/api/api_client.dart';

part 'purchase_repository.g.dart';

@RestApi()
abstract class PurchaseApi {
  factory PurchaseApi(Dio dio) = _PurchaseApi;

  // Suppliers
  @GET('/purchase/suppliers')
  Future<dynamic> getSuppliers(@Query('workshopId') String workshopId);

  @POST('/purchase/suppliers')
  Future<dynamic> createSupplier(@Body() Map<String, dynamic> body);

  @GET('/purchase/suppliers/{id}/ledger')
  Future<dynamic> getSupplierLedger(@Path('id') String id);

  // Orders
  @GET('/purchase/orders')
  Future<dynamic> getOrders(@Query('workshopId') String workshopId);

  @POST('/purchase/orders')
  Future<dynamic> createOrder(@Body() Map<String, dynamic> body);

  @POST('/purchase/orders/{id}/receive')
  Future<dynamic> receiveOrder(@Path('id') String id);

  @GET('/purchase/orders/{id}')
  Future<dynamic> getOrder(@Path('id') String id);
}

final purchaseApiProvider = Provider<PurchaseApi>((ref) {
  final dio = ref.watch(dioProvider);
  return PurchaseApi(dio);
});

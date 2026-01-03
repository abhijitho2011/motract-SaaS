import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/core/api/api_client.dart';

part 'billing_repository.g.dart';

@RestApi()
abstract class BillingApi {
  factory BillingApi(Dio dio) = _BillingApi;

  @POST('/billing/generate/{jobCardId}')
  Future<dynamic> generateInvoice(@Path('jobCardId') String jobCardId);

  @GET('/billing/invoices/{id}')
  Future<dynamic> getInvoice(@Path('id') String id);
}

@riverpod
BillingApi billingApi(Ref ref) {
  final dio = ref.watch(dioProvider);
  return BillingApi(dio);
}

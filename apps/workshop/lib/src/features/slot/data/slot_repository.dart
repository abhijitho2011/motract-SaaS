import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/core/api/api_client.dart';

part 'slot_repository.g.dart';

@RestApi()
abstract class SlotApi {
  factory SlotApi(Dio dio) = _SlotApi;

  @GET('/slots/bays')
  Future<dynamic> getBays(@Query('workshopId') String workshopId);

  @POST('/slots/bays')
  Future<dynamic> createBay(@Body() Map<String, dynamic> body);

  @POST('/slots/book')
  Future<dynamic> bookSlot(@Body() Map<String, dynamic> body);
}

@riverpod
SlotApi slotApi(Ref ref) {
  final dio = ref.watch(dioProvider);
  return SlotApi(dio);
}

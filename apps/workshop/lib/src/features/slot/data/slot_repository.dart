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

  // Enhanced Slot Management
  @POST('/slots/generate')
  Future<dynamic> generateDailySlots(@Body() Map<String, dynamic> body);

  @GET('/slots/grid')
  Future<dynamic> getSlotGrid(@Query('date') String date);

  @PUT('/slots/{slotId}/status')
  Future<dynamic> updateSlotStatus(
    @Path('slotId') String slotId,
    @Body() Map<String, dynamic> body,
  );

  @GET('/slots/bookings')
  Future<dynamic> getWorkshopBookings();

  @PUT('/slots/bookings/{bookingId}/status')
  Future<dynamic> updateBookingStatus(
    @Path('bookingId') String bookingId,
    @Body() Map<String, dynamic> body,
  );

  // Holiday Management
  @POST('/slots/holidays')
  Future<dynamic> blockEntireDay(@Body() Map<String, dynamic> body);

  @DELETE('/slots/holidays/{date}')
  Future<dynamic> unblockDay(@Path('date') String date);

  @GET('/slots/holidays')
  Future<dynamic> getWorkshopHolidays();

  // Bay Templates (for dropdown)
  @GET('/slots/bay-templates')
  Future<dynamic> getBayNameTemplates();

  @DELETE('/slots/bays/{id}')
  Future<dynamic> deleteBay(@Path('id') String bayId);

  @POST('/slots/create')
  Future<dynamic> createManualSlot(@Body() Map<String, dynamic> data);
}

@riverpod
SlotApi slotApi(Ref ref) {
  final dio = ref.watch(dioProvider);
  return SlotApi(dio);
}

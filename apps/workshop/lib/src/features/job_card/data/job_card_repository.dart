import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workshop/src/core/api/api_client.dart';

part 'job_card_repository.g.dart';

@RestApi()
abstract class JobCardApi {
  factory JobCardApi(Dio dio) = _JobCardApi;

  @POST('/job-cards')
  Future<dynamic> createJobCard(@Body() Map<String, dynamic> body);

  @GET('/job-cards')
  Future<dynamic> getJobCards({
    @Query('workshopId') required String workshopId,
  });

  @GET('/job-cards/{id}')
  Future<dynamic> getJobCard(@Path('id') String id);

  @PUT('/job-cards/{id}/inspection')
  Future<dynamic> saveInspection(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );

  @POST('/job-cards/{id}/tasks')
  Future<dynamic> addTask(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );

  @POST('/job-cards/{id}/parts')
  Future<dynamic> addPart(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );

  @PATCH('/job-cards/{id}/stage')
  Future<dynamic> updateStage(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );

  @PATCH('/job-cards/{id}/technician')
  Future<dynamic> assignTechnician(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );

  @PATCH('/job-cards/{id}/tasks/{taskId}/status')
  Future<dynamic> updateTaskStatus(
    @Path('id') String id,
    @Path('taskId') String taskId,
    @Body() Map<String, dynamic> body,
  );
}

@riverpod
JobCardApi jobCardApi(Ref ref) {
  final dio = ref.watch(dioProvider);
  return JobCardApi(dio);
}

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workshop/src/core/api/api_client.dart';

part 'dashboard_repository.g.dart';

@RestApi()
abstract class DashboardApi {
  factory DashboardApi(Dio dio) = _DashboardApi;

  @GET('/dashboard/kpis')
  Future<dynamic> getKpis(@Query('workshopId') String workshopId);

  @GET('/dashboard/job-funnel')
  Future<dynamic> getJobFunnel(@Query('workshopId') String workshopId);

  @GET('/dashboard/revenue-graph')
  Future<dynamic> getRevenueGraph(
    @Query('workshopId') String workshopId,
    @Query('days') int days,
  );
}

@riverpod
DashboardApi dashboardApi(Ref ref) {
  final dio = ref.watch(dioProvider);
  return DashboardApi(dio);
}

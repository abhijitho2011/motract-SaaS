import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workshop/src/core/api/api_client.dart';

part 'reports_repository.g.dart';

@RestApi()
abstract class ReportsApi {
  factory ReportsApi(Dio dio) = _ReportsApi;

  @GET('/reports/sales')
  Future<dynamic> getSalesReport(
    @Query('startDate') String startDate,
    @Query('endDate') String endDate,
  );

  @GET('/reports/gst')
  Future<dynamic> getGSTReport(
    @Query('month') String month,
    @Query('year') String year,
  );

  @GET('/reports/pnl')
  Future<dynamic> getPnLReport(
    @Query('startDate') String startDate,
    @Query('endDate') String endDate,
  );
}

final reportsApiProvider = Provider<ReportsApi>((ref) {
  final dio = ref.watch(dioProvider);
  return ReportsApi(dio);
});

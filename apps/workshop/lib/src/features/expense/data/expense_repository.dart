import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workshop/src/core/api/api_client.dart';

part 'expense_repository.g.dart';

@RestApi()
abstract class ExpenseApi {
  factory ExpenseApi(Dio dio) = _ExpenseApi;

  @GET('/expenses')
  Future<dynamic> getExpenses(@Query('workshopId') String workshopId);

  @POST('/expenses')
  Future<dynamic> createExpense(@Body() Map<String, dynamic> body);

  @DELETE('/expenses/{id}')
  Future<dynamic> deleteExpense(@Path('id') String id);
}

@riverpod
ExpenseApi expenseApi(Ref ref) {
  final dio = ref.watch(dioProvider);
  return ExpenseApi(dio);
}

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/features/dashboard/data/dashboard_repository.dart';

part 'dashboard_controller.g.dart';

@riverpod
class DashboardController extends _$DashboardController {
  @override
  FutureOr<Map<String, dynamic>> build() async {
    // TODO: Get actual workshop ID from auth state
    const workshopId = 'test-id';
    final api = ref.watch(dashboardApiProvider);
    return api
        .getKpis(workshopId)
        .then((value) => value as Map<String, dynamic>);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      // TODO: Get actual workshop ID from auth state
      const workshopId = 'test-id';
      final api = ref.read(dashboardApiProvider);
      return api
          .getKpis(workshopId)
          .then((value) => value as Map<String, dynamic>);
    });
  }
}

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/features/dashboard/data/dashboard_repository.dart';
import 'package:workshop/src/features/settings/data/settings_repository.dart';

part 'dashboard_controller.g.dart';

@riverpod
class DashboardController extends _$DashboardController {
  @override
  FutureOr<Map<String, dynamic>> build() async {
    final workshopId = await ref
        .watch(workshopProvider.future)
        .then((w) => w['id'] as String);
    final api = ref.watch(dashboardApiProvider);
    return api
        .getKpis(workshopId)
        .then((value) => value as Map<String, dynamic>);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final workshopId = await ref
          .read(workshopProvider.future)
          .then((w) => w['id'] as String);
      final api = ref.read(dashboardApiProvider);
      return api
          .getKpis(workshopId)
          .then((value) => value as Map<String, dynamic>);
    });
  }
}

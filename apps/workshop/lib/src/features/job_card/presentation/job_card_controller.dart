import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/features/job_card/data/job_card_repository.dart';

part 'job_card_controller.g.dart';

@riverpod
class JobCardController extends _$JobCardController {
  @override
  FutureOr<void> build() {}

  Future<void> createJobCard({
    required String vehicleId,
    required String customerName,
    required String customerMobile,
    required int odometer,
    required int fuelLevel,
    required List<String> complaints,
    String? notes,
  }) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final api = ref.read(jobCardApiProvider);

      // TODO: Get actual workshop ID and user ID
      const workshopId = 'test-id';
      const advisorId = 'advisor-id';

      await api.createJobCard({
        'workshopId': workshopId,
        'vehicleId': vehicleId,
        'customerName': customerName,
        'customerMobile': customerMobile,
        'advisorId': advisorId,
        'odometer': odometer,
        'fuelLevel': fuelLevel,
        'notes': notes,
        'complaints': complaints
            .map((c) => c)
            .toList(), // Backend expects string[] now
      });
    });
  }
}

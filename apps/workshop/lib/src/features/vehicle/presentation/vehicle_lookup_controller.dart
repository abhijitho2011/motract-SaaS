import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/features/vehicle/data/vehicle_repository.dart';

part 'vehicle_lookup_controller.g.dart';

@riverpod
class VehicleLookupController extends _$VehicleLookupController {
  @override
  FutureOr<Map<String, dynamic>?> build() {
    return null;
  }

  Future<void> search(String regNumber) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final api = ref.read(vehicleApiProvider);
      try {
        return (await api.lookupVehicle(regNumber)) as Map<String, dynamic>?;
      } catch (e) {
        // If 404, return null (not found) instead of throwing
        return null;
      }
    });
  }
}

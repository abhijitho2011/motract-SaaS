import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/features/vehicle/data/vehicle_repository.dart';

part 'vehicle_register_controller.g.dart';

@riverpod
class VehicleRegisterController extends _$VehicleRegisterController {
  @override
  FutureOr<void> build() {
    // Initial state is void (idle)
  }

  Future<void> register({
    required String regNumber,
    required String make,
    required String model,
    required String variant,
    String? engineNumber,
    String? vin,
  }) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final api = ref.read(vehicleApiProvider);
      await api.registerVehicle({
        'regNumber': regNumber,
        'make': make,
        'model': model,
        'variant': variant,
        'year': 2024,
        'engineNumber': engineNumber,
        'vin': vin,
      });
    });
  }
}

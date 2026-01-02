import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/features/slot/data/slot_repository.dart';

part 'slot_controller.g.dart';

@riverpod
class SlotController extends _$SlotController {
  @override
  FutureOr<List<Map<String, dynamic>>> build() async {
    // TODO: Get actual workshop ID
    const workshopId = 'test-id';
    final api = ref.watch(slotApiProvider);
    final response = await api.getBays(workshopId);
    return (response as List).cast<Map<String, dynamic>>();
  }

  Future<void> createBay(String name, String type) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final api = ref.read(slotApiProvider);
      const workshopId = 'test-id';

      await api.createBay({
        'workshopId': workshopId,
        'name': name,
        'type': type, // SERVICE, WASHING, etc.
      });

      // Refresh list
      ref.invalidateSelf();
      await future;
      return state.value!;
    });
  }
}

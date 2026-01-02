import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/features/slot/data/slot_repository.dart';
import 'package:workshop/src/features/settings/data/settings_repository.dart';

part 'slot_controller.g.dart';

@riverpod
class SlotController extends _$SlotController {
  @override
  FutureOr<List<Map<String, dynamic>>> build() async {
    final workshopId = await ref
        .watch(workshopProvider.future)
        .then((w) => w['id'] as String);
    final api = ref.watch(slotApiProvider);
    final response = await api.getBays(workshopId);
    return (response as List).cast<Map<String, dynamic>>();
  }

  Future<void> createBay(String name, String type) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final api = ref.read(slotApiProvider);
      final workshopId = await ref
          .read(workshopProvider.future)
          .then((w) => w['id'] as String);

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

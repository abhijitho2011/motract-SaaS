import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/features/inventory/data/inventory_repository.dart';
import 'package:workshop/src/features/settings/data/settings_repository.dart';

part 'inventory_controller.g.dart';

@riverpod
class InventoryController extends _$InventoryController {
  @override
  FutureOr<List<Map<String, dynamic>>> build() async {
    final workshopId = await ref
        .watch(workshopProvider.future)
        .then((w) => w['id'] as String);
    final api = ref.watch(inventoryApiProvider);
    final response = await api.getInventoryItems(workshopId);
    return (response as List).cast<Map<String, dynamic>>();
  }

  Future<void> addItem({
    required String name,
    required String category,
    required String brand,
    required String unit,
    required String hsnCode,
    required double taxRate,
  }) async {
    // state = const AsyncValue.loading(); // Don't wipe the list logic yet, maybe just show overlay loading or similar
    // For simplicity, we can just reload after add
    await AsyncValue.guard(() async {
      final api = ref.read(inventoryApiProvider);
      final workshopId = await ref
          .read(workshopProvider.future)
          .then((w) => w['id'] as String);

      await api.createItem({
        'workshopId': workshopId,
        'name': name,
        'category': category,
        'brand': brand,
        'unit': unit,
        'hsnCode': hsnCode,
        'taxPercent': taxRate,
      });

      // Refresh list
      ref.invalidateSelf();
    });
  }

  Future<void> addBatch({
    required String itemId,
    required double quantity,
    required double purchasePrice,
    required double salePrice,
  }) async {
    await AsyncValue.guard(() async {
      final api = ref.read(inventoryApiProvider);

      await api.addBatch(itemId, {
        'quantity': quantity,
        'purchasePrice': purchasePrice,
        'salePrice': salePrice,
      });

      ref.invalidateSelf();
    });
  }
}

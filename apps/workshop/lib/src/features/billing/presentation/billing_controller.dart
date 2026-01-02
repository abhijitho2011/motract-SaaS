import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/features/billing/data/billing_repository.dart';

part 'billing_controller.g.dart';

@riverpod
class BillingController extends _$BillingController {
  @override
  FutureOr<Map<String, dynamic>?> build() {
    return null;
  }

  Future<void> generateInvoice(String jobCardId) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final api = ref.read(billingApiProvider);
      return (await api.generateInvoice(jobCardId)) as Map<String, dynamic>;
    });
  }
}

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/features/job_card/data/job_card_repository.dart';
import 'package:workshop/src/features/settings/data/settings_repository.dart';

part 'job_card_list_controller.g.dart';

@riverpod
class JobCardListController extends _$JobCardListController {
  @override
  FutureOr<List<Map<String, dynamic>>> build() async {
    final workshopId = await ref
        .watch(workshopProvider.future)
        .then((w) => w['id'] as String);
    final api = ref.watch(jobCardApiProvider);
    final response = await api.getJobCards(
      workshopId: workshopId,
    ); // Returns dynamic
    return (response as List).cast<Map<String, dynamic>>();
  }
}

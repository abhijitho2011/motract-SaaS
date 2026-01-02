import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:workshop/src/features/job_card/data/job_card_repository.dart';

part 'job_card_list_controller.g.dart';

@riverpod
class JobCardListController extends _$JobCardListController {
  @override
  FutureOr<List<Map<String, dynamic>>> build() async {
    // TODO: Get actual workshop ID
    const workshopId = 'test-id';
    final api = ref.watch(jobCardApiProvider);
    final response = await api.getJobCards(
      workshopId: workshopId,
    ); // Returns dynamic
    return (response as List).cast<Map<String, dynamic>>();
  }
}

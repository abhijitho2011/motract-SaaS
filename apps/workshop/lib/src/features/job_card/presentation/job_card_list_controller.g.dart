// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'job_card_list_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(JobCardListController)
final jobCardListControllerProvider = JobCardListControllerProvider._();

final class JobCardListControllerProvider
    extends
        $AsyncNotifierProvider<
          JobCardListController,
          List<Map<String, dynamic>>
        > {
  JobCardListControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'jobCardListControllerProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$jobCardListControllerHash();

  @$internal
  @override
  JobCardListController create() => JobCardListController();
}

String _$jobCardListControllerHash() =>
    r'82cce1c1b84459048599eb72652bb24578aae50f';

abstract class _$JobCardListController
    extends $AsyncNotifier<List<Map<String, dynamic>>> {
  FutureOr<List<Map<String, dynamic>>> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref =
        this.ref
            as $Ref<
              AsyncValue<List<Map<String, dynamic>>>,
              List<Map<String, dynamic>>
            >;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<
                AsyncValue<List<Map<String, dynamic>>>,
                List<Map<String, dynamic>>
              >,
              AsyncValue<List<Map<String, dynamic>>>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'job_card_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(JobCardController)
final jobCardControllerProvider = JobCardControllerProvider._();

final class JobCardControllerProvider
    extends $AsyncNotifierProvider<JobCardController, void> {
  JobCardControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'jobCardControllerProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$jobCardControllerHash();

  @$internal
  @override
  JobCardController create() => JobCardController();
}

String _$jobCardControllerHash() => r'5286d81e70255b3e3ad4d1613d3a8fced5f4ab7b';

abstract class _$JobCardController extends $AsyncNotifier<void> {
  FutureOr<void> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<AsyncValue<void>, void>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<void>, void>,
              AsyncValue<void>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}

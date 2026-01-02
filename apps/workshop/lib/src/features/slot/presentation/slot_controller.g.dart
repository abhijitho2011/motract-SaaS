// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'slot_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(SlotController)
final slotControllerProvider = SlotControllerProvider._();

final class SlotControllerProvider
    extends $AsyncNotifierProvider<SlotController, List<Map<String, dynamic>>> {
  SlotControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'slotControllerProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$slotControllerHash();

  @$internal
  @override
  SlotController create() => SlotController();
}

String _$slotControllerHash() => r'cc35a9bf03e22372d71bb99035c02ba299a3a038';

abstract class _$SlotController
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

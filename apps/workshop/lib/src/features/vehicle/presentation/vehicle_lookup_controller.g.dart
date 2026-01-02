// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vehicle_lookup_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(VehicleLookupController)
final vehicleLookupControllerProvider = VehicleLookupControllerProvider._();

final class VehicleLookupControllerProvider
    extends
        $AsyncNotifierProvider<VehicleLookupController, Map<String, dynamic>?> {
  VehicleLookupControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'vehicleLookupControllerProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$vehicleLookupControllerHash();

  @$internal
  @override
  VehicleLookupController create() => VehicleLookupController();
}

String _$vehicleLookupControllerHash() =>
    r'a2d366469af6a998673071d5668fe72af0f17672';

abstract class _$VehicleLookupController
    extends $AsyncNotifier<Map<String, dynamic>?> {
  FutureOr<Map<String, dynamic>?> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref =
        this.ref
            as $Ref<AsyncValue<Map<String, dynamic>?>, Map<String, dynamic>?>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<
                AsyncValue<Map<String, dynamic>?>,
                Map<String, dynamic>?
              >,
              AsyncValue<Map<String, dynamic>?>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}

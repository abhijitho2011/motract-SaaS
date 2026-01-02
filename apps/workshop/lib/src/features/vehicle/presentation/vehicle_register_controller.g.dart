// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vehicle_register_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(VehicleRegisterController)
final vehicleRegisterControllerProvider = VehicleRegisterControllerProvider._();

final class VehicleRegisterControllerProvider
    extends $AsyncNotifierProvider<VehicleRegisterController, void> {
  VehicleRegisterControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'vehicleRegisterControllerProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$vehicleRegisterControllerHash();

  @$internal
  @override
  VehicleRegisterController create() => VehicleRegisterController();
}

String _$vehicleRegisterControllerHash() =>
    r'fa8a51ba3118b0fbfc8fe05db4cdd7b145cbca3d';

abstract class _$VehicleRegisterController extends $AsyncNotifier<void> {
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

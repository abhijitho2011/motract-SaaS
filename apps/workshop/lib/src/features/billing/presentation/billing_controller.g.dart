// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'billing_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(BillingController)
final billingControllerProvider = BillingControllerProvider._();

final class BillingControllerProvider
    extends $AsyncNotifierProvider<BillingController, Map<String, dynamic>?> {
  BillingControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'billingControllerProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$billingControllerHash();

  @$internal
  @override
  BillingController create() => BillingController();
}

String _$billingControllerHash() => r'7a42c7756be543465fefc5092153f5ad0fe05c2f';

abstract class _$BillingController
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

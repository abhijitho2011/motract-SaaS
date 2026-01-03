// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'workshop_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(currentWorkshopId)
final currentWorkshopIdProvider = CurrentWorkshopIdProvider._();

final class CurrentWorkshopIdProvider
    extends $FunctionalProvider<String, String, String>
    with $Provider<String> {
  CurrentWorkshopIdProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'currentWorkshopIdProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$currentWorkshopIdHash();

  @$internal
  @override
  $ProviderElement<String> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  String create(Ref ref) {
    return currentWorkshopId(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(String value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<String>(value),
    );
  }
}

String _$currentWorkshopIdHash() => r'4ef2d1ade08fc298b3d847638f2ecc42851b817f';

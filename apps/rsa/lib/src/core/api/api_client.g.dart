// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'api_client.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(dio)
final dioProvider = DioProvider._();

final class DioProvider extends $FunctionalProvider<Dio, Dio, Dio>
    with $Provider<Dio> {
  DioProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'dioProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$dioHash();

  @$internal
  @override
  $ProviderElement<Dio> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  Dio create(Ref ref) {
    return dio(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(Dio value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<Dio>(value),
    );
  }
}

String _$dioHash() => r'413f9378a1857d436f3b8f3b658c2f24c2a194cc';

@ProviderFor(rsaApi)
final rsaApiProvider = RsaApiProvider._();

final class RsaApiProvider extends $FunctionalProvider<RsaApi, RsaApi, RsaApi>
    with $Provider<RsaApi> {
  RsaApiProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'rsaApiProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$rsaApiHash();

  @$internal
  @override
  $ProviderElement<RsaApi> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  RsaApi create(Ref ref) {
    return rsaApi(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(RsaApi value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<RsaApi>(value),
    );
  }
}

String _$rsaApiHash() => r'e1d77d5abccab5d41269564519deeb3fe969c537';

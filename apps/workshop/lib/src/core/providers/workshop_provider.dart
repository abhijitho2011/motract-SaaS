import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'workshop_provider.g.dart';

// Hardcoded workshop ID for now
// In production, this would come from auth/user session
@riverpod
String currentWorkshopId(Ref ref) {
  // TODO: Get from authenticated user's workshop
  return 'test-workshop-id';
}

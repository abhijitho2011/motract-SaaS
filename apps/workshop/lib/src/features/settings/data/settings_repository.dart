import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'settings_repository.g.dart';

@riverpod
Future<Map<String, dynamic>> workshop(WorkshopRef ref) async {
  // Mock workshop for now
  return {
    'id': 'test-id',
    'name': 'Motract Demo Workshop',
    'address': '123 Auto Street',
    'mobile': '9876543210',
  };
}

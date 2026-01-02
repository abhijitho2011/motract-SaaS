import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final workshopProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final prefs = await SharedPreferences.getInstance();
  final workshopId = prefs.getString('workshopId');
  final workshopName = prefs.getString('workshopName') ?? 'Demo Workshop';

  if (workshopId == null) {
    throw Exception('No workshop found. Please log in again.');
  }

  return {
    'id': workshopId,
    'name': workshopName,
    'address': '123 Auto Street',
    'mobile': '9876543210',
  };
});

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/features/vehicle/presentation/vehicle_lookup_controller.dart';
import 'package:go_router/go_router.dart';

class VehicleLookupScreen extends ConsumerStatefulWidget {
  const VehicleLookupScreen({super.key});

  @override
  ConsumerState<VehicleLookupScreen> createState() =>
      _VehicleLookupScreenState();
}

class _VehicleLookupScreenState extends ConsumerState<VehicleLookupScreen> {
  final _searchController = TextEditingController();

  void _onSearch() {
    if (_searchController.text.isNotEmpty) {
      ref
          .read(vehicleLookupControllerProvider.notifier)
          .search(_searchController.text.trim().toUpperCase());
    }
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(vehicleLookupControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('New Job Card')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Step 1: Identify Vehicle',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const Gap(16),
            TextField(
              controller: _searchController,
              textCapitalization: TextCapitalization.characters,
              decoration: InputDecoration(
                labelText: 'Registration Number',
                hintText: 'e.g. MH01AB1234',
                suffixIcon: IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: _onSearch,
                ),
              ),
              onSubmitted: (_) => _onSearch(),
            ),
            const Gap(24),
            Expanded(
              child: searchState.when(
                data: (data) {
                  if (data == null && _searchController.text.isNotEmpty) {
                    return _buildNotFound(context);
                  } else if (data != null) {
                    return _buildVehicleDetails(context, data);
                  }
                  return const Center(
                    child: Text('Enter registration number to search'),
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => Center(child: Text('Error: $err')),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotFound(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.search_off, size: 64, color: Colors.grey),
        const Gap(16),
        Text(
          'Vehicle not found',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const Gap(8),
        const Text('This vehicle is not registered in the system.'),
        const Gap(24),
        FilledButton.icon(
          onPressed: () {
            // TODO: Navigate to Registration Screen
            context.push('/vehicle/register?reg=${_searchController.text}');
          },
          icon: const Icon(Icons.add),
          label: const Text('Register New Vehicle'),
        ),
      ],
    );
  }

  Widget _buildVehicleDetails(BuildContext context, Map<String, dynamic> data) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.directions_car, size: 32, color: Colors.blue),
                const Gap(16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      data['regNumber'] ?? '',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    Text(
                      '${data['make']} ${data['model']} ${data['variant']}',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                ),
              ],
            ),
            const Divider(height: 32),
            _DetailRow(label: 'Owner', value: data['owner']?['name'] ?? 'N/A'),
            _DetailRow(
              label: 'Mobile',
              value: data['owner']?['mobile'] ?? 'N/A',
            ),
            const Gap(24),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  // TODO: Navigate to Create Job Card Form
                  context.push('/job-card/create?vehicleId=${data['id']}');
                },
                child: const Text('Create Job Card'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

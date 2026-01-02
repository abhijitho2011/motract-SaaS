import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/features/slot/presentation/slot_controller.dart';

class SlotScreen extends ConsumerWidget {
  const SlotScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final slotState = ref.watch(slotControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Bay Management')),
      body: slotState.when(
        data: (bays) => bays.isEmpty
            ? const Center(child: Text('No bays configured.'))
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: bays.length,
                separatorBuilder: (_, __) => const Gap(12),
                itemBuilder: (context, index) {
                  final bay = bays[index];
                  return Card(
                    child: ListTile(
                      leading: CircleAvatar(child: Text('${index + 1}')),
                      title: Text(bay['name'] ?? 'Unknown Bay'),
                      subtitle: Text('Type: ${bay['type']}'),
                      trailing: const Icon(
                        Icons.check_circle_outline,
                        color: Colors.green,
                      ),
                    ),
                  );
                },
              ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add a test bay
          ref
              .read(slotControllerProvider.notifier)
              .createBay('New Bay ${DateTime.now().second}', 'SERVICE');
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}

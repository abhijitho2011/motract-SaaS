import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/features/job_card/data/job_card_repository.dart';

class InspectionSettingsScreen extends ConsumerStatefulWidget {
  const InspectionSettingsScreen({super.key});

  @override
  ConsumerState<InspectionSettingsScreen> createState() =>
      _InspectionSettingsScreenState();
}

class _InspectionSettingsScreenState
    extends ConsumerState<InspectionSettingsScreen> {
  @override
  Widget build(BuildContext context) {
    final listAsync = ref.watch(_inspectionMastersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Inspection Settings')),
      body: listAsync.when(
        data: (items) {
          final exterior = items
              .where((i) => i['category'] == 'EXTERIOR')
              .toList();
          final interior = items
              .where((i) => i['category'] == 'INTERIOR')
              .toList();

          return DefaultTabController(
            length: 2,
            child: Column(
              children: [
                const TabBar(
                  tabs: [
                    Tab(text: 'Exterior'),
                    Tab(text: 'Interior'),
                  ],
                ),
                Expanded(
                  child: TabBarView(
                    children: [_buildList(exterior), _buildList(interior)],
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildList(List items) {
    if (items.isEmpty) {
      return const Center(child: Text('No items found.'));
    }
    return ListView.separated(
      itemCount: items.length,
      separatorBuilder: (_, __) => const Divider(),
      itemBuilder: (context, index) {
        final item = items[index];
        return ListTile(
          title: Text(item['name']),
          trailing: IconButton(
            icon: const Icon(Icons.delete, color: Colors.red),
            onPressed: () => _deleteItem(item['id']),
          ),
        );
      },
    );
  }

  Future<void> _deleteItem(String id) async {
    try {
      await ref.read(jobCardApiProvider).deleteInspectionMaster(id);
      ref.invalidate(_inspectionMastersProvider);
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  void _showAddDialog() {
    final nameCtrl = TextEditingController();
    String category = 'EXTERIOR';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Add Inspection Item'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Item Name (e.g. Scratches)',
                ),
              ),
              const Gap(16),
              DropdownButtonFormField<String>(
                value: category,
                items: const [
                  DropdownMenuItem(value: 'EXTERIOR', child: Text('Exterior')),
                  DropdownMenuItem(value: 'INTERIOR', child: Text('Interior')),
                ],
                onChanged: (v) => setState(() => category = v!),
                decoration: const InputDecoration(labelText: 'Category'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                try {
                  await ref.read(jobCardApiProvider).createInspectionMaster({
                    'name': nameCtrl.text,
                    'category': category,
                  });
                  if (mounted) Navigator.pop(ctx);
                  ref.invalidate(_inspectionMastersProvider);
                } catch (e) {
                  // Error
                }
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }
}

final _inspectionMastersProvider = FutureProvider.autoDispose<List>((
  ref,
) async {
  final api = ref.watch(jobCardApiProvider);
  final res = await api.getInspectionMasters();
  return res as List;
});

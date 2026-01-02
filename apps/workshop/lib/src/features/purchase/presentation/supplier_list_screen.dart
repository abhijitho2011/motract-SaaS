import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:workshop/src/features/purchase/data/purchase_repository.dart';
import 'package:workshop/src/features/settings/data/settings_repository.dart';

class SupplierListScreen extends ConsumerStatefulWidget {
  const SupplierListScreen({super.key});

  @override
  ConsumerState<SupplierListScreen> createState() => _SupplierListScreenState();
}

class _SupplierListScreenState extends ConsumerState<SupplierListScreen> {
  @override
  Widget build(BuildContext context) {
    final workshopId = ref.watch(workshopProvider).asData?.value?['id'];
    if (workshopId == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final suppliersAsync = ref
        .watch(purchaseApiProvider)
        .getSuppliers(workshopId: workshopId);

    return Scaffold(
      appBar: AppBar(title: const Text('Suppliers')),
      body: FutureBuilder(
        future: suppliersAsync,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final suppliers = (snapshot.data as List?) ?? [];
          if (suppliers.isEmpty) {
            return const Center(child: Text('No suppliers found.'));
          }

          return ListView.separated(
            itemCount: suppliers.length,
            separatorBuilder: (_, __) => const Divider(),
            itemBuilder: (context, index) {
              final s = suppliers[index];
              return ListTile(
                leading: CircleAvatar(child: Text(s['name'][0])),
                title: Text(s['name']),
                subtitle: Text(s['mobile']),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  // View Ledger? Out of scope for now
                },
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddSupplierDialog(context, workshopId),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddSupplierDialog(BuildContext context, String workshopId) {
    final nameCtrl = TextEditingController();
    final mobileCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Supplier'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(labelText: 'Name'),
            ),
            TextField(
              controller: mobileCtrl,
              decoration: const InputDecoration(labelText: 'Mobile'),
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
                await ref.read(purchaseApiProvider).createSupplier({
                  'workshopId': workshopId,
                  'name': nameCtrl.text,
                  'mobile': mobileCtrl.text,
                });
                if (mounted) Navigator.pop(ctx);
                setState(() {}); // Refresh
              } catch (e) {
                // Handle error
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}

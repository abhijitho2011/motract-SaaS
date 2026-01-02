import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:workshop/src/features/purchase/data/purchase_repository.dart';
import 'package:workshop/src/features/settings/data/settings_repository.dart';

class PurchaseOrderListScreen extends ConsumerWidget {
  const PurchaseOrderListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final workshopId = ref.watch(workshopProvider).asData?.value?['id'];
    if (workshopId == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final ordersAsync = ref.watch(purchaseApiProvider).getOrders(workshopId);

    return Scaffold(
      appBar: AppBar(title: const Text('Purchase Orders')),
      body: FutureBuilder(
        future: ordersAsync,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final orders = (snapshot.data as List?) ?? [];
          if (orders.isEmpty) {
            return const Center(child: Text('No purchase orders.'));
          }

          return ListView.separated(
            itemCount: orders.length,
            separatorBuilder: (_, __) => const Divider(),
            itemBuilder: (context, index) {
              final po = orders[index];
              final supplier = po['supplier'] ?? {};
              return ListTile(
                title: Text('${supplier['name']}'),
                subtitle: Text(
                  'Total: ₹${po['totalAmount']} | Status: ${po['status']}',
                ),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  context.push('/purchase/orders/details?id=${po['id']}');
                },
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/purchase/orders/create'),
        child: const Icon(Icons.add),
      ),
    );
  }
}

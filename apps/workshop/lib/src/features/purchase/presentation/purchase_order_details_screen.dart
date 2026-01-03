import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/features/purchase/data/purchase_repository.dart';

class PurchaseOrderDetailsScreen extends ConsumerStatefulWidget {
  final String orderId;
  const PurchaseOrderDetailsScreen({super.key, required this.orderId});

  @override
  ConsumerState<PurchaseOrderDetailsScreen> createState() =>
      _PurchaseOrderDetailsScreenState();
}

class _PurchaseOrderDetailsScreenState
    extends ConsumerState<PurchaseOrderDetailsScreen> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final orderAsync = ref.watch(purchaseApiProvider).getOrder(widget.orderId);

    return Scaffold(
      appBar: AppBar(title: const Text('PO Details')),
      body: FutureBuilder(
        future: orderAsync,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final po = snapshot.data as Map<String, dynamic>;
          final items = (po['items'] as List?) ?? [];
          final supplier = po['supplier'] ?? {};
          final status = po['status'];

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Supplier: ${supplier['name']}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Status: $status',
                        style: TextStyle(
                          color: status == 'RECEIVED'
                              ? Colors.green
                              : Colors.orange,
                        ),
                      ),
                      Text('Date: ${po['invoiceDate']}'),
                    ],
                  ),
                ),
              ),
              const Gap(16),
              const Text(
                'Items',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const Divider(),
              ...items.map(
                (item) => ListTile(
                  title: Text(item['itemName']),
                  subtitle: Text(
                    'Qty: ${item['quantity']} | Unit: ${item['unitCost']}',
                  ),
                  trailing: Text('Total: ${item['total']}'),
                ),
              ),
              const Gap(24),
              if (status == 'DRAFT')
                FilledButton.icon(
                  onPressed: _isLoading ? null : () => _receiveOrder(po['id']),
                  icon: const Icon(Icons.inventory),
                  label: _isLoading
                      ? const CircularProgressIndicator()
                      : const Text('Receive Items to Stock'),
                ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _receiveOrder(String id) async {
    setState(() => _isLoading = true);
    try {
      await ref.read(purchaseApiProvider).receiveOrder(id);
      setState(() {});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Items Received into Inventory')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}

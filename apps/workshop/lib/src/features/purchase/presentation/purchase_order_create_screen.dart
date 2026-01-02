import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/features/purchase/data/purchase_repository.dart';
import 'package:workshop/src/features/settings/data/settings_repository.dart';

class PurchaseOrderCreateScreen extends ConsumerStatefulWidget {
  const PurchaseOrderCreateScreen({super.key});

  @override
  ConsumerState<PurchaseOrderCreateScreen> createState() =>
      _PurchaseOrderCreateScreenState();
}

class _PurchaseOrderCreateScreenState
    extends ConsumerState<PurchaseOrderCreateScreen> {
  String? _selectedSupplierId;
  final List<Map<String, dynamic>> _items = [];
  bool _isLoading = false;

  void _addItem() {
    final nameCtrl = TextEditingController();
    final qtyCtrl = TextEditingController();
    final costCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Item'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(labelText: 'Item Name'),
            ),
            TextField(
              controller: qtyCtrl,
              decoration: const InputDecoration(labelText: 'Quantity'),
              keyboardType: TextInputType.number,
            ),
            TextField(
              controller: costCtrl,
              decoration: const InputDecoration(labelText: 'Unit Cost'),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              if (nameCtrl.text.isNotEmpty) {
                setState(() {
                  _items.add({
                    'itemName': nameCtrl.text,
                    'quantity': int.tryParse(qtyCtrl.text) ?? 1,
                    'unitCost': double.tryParse(costCtrl.text) ?? 0,
                    'taxPercent': 18.0, // Default tax
                  });
                });
                Navigator.pop(ctx);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final workshopId = ref.watch(workshopProvider).asData?.value?['id'];
    final suppliersAsync = workshopId != null
        ? ref.watch(purchaseApiProvider).getSuppliers(workshopId)
        : Future.value([]);

    return Scaffold(
      appBar: AppBar(title: const Text('New Purchase Order')),
      body: FutureBuilder(
        future: suppliersAsync,
        builder: (context, snapshot) {
          final suppliers = (snapshot.data as List?) ?? [];

          return Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                DropdownButtonFormField<String>(
                  decoration: const InputDecoration(
                    labelText: 'Select Supplier',
                  ),
                  value: _selectedSupplierId,
                  items: suppliers.map<DropdownMenuItem<String>>((s) {
                    return DropdownMenuItem(
                      value: s['id'],
                      child: Text(s['name']),
                    );
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedSupplierId = val),
                ),
                const Gap(16),
                const Text(
                  'Items',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                ..._items.map(
                  (item) => ListTile(
                    title: Text(item['itemName']),
                    subtitle: Text(
                      'Qty: ${item['quantity']} | Cost: ${item['unitCost']}',
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete),
                      onPressed: () => setState(() => _items.remove(item)),
                    ),
                  ),
                ),
                FilledButton.tonal(
                  onPressed: _addItem,
                  child: const Text('Add Item'),
                ),
                const Spacer(),
                FilledButton(
                  onPressed:
                      (_selectedSupplierId == null ||
                          _items.isEmpty ||
                          _isLoading)
                      ? null
                      : () => _saveOrder(workshopId!),
                  child: _isLoading
                      ? const CircularProgressIndicator()
                      : const Text('Create Order'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _saveOrder(String workshopId) async {
    setState(() => _isLoading = true);
    try {
      await ref.read(purchaseApiProvider).createOrder({
        'workshopId': workshopId,
        'supplierId': _selectedSupplierId,
        'invoiceDate': DateTime.now().toIso8601String(),
        'items': _items,
      });
      if (mounted) {
        context.pop();
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('PO Created')));
      }
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}

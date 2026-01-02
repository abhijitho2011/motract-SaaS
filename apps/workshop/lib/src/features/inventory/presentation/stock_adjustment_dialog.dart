import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workshop/src/features/inventory/data/inventory_repository.dart';

class StockAdjustmentDialog extends ConsumerStatefulWidget {
  final Map<String, dynamic> item;
  final String workshopId;

  const StockAdjustmentDialog({
    super.key,
    required this.item,
    required this.workshopId,
  });

  @override
  ConsumerState<StockAdjustmentDialog> createState() =>
      _StockAdjustmentDialogState();
}

class _StockAdjustmentDialogState extends ConsumerState<StockAdjustmentDialog> {
  final _qtyCtrl = TextEditingController();
  final _reasonCtrl = TextEditingController();
  bool _isLoading = false;
  String _mode = 'ADD'; // ADD or REDUCE

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Adjust Stock: ${widget.item['name']}'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text('Action: '),
                DropdownButton<String>(
                  value: _mode,
                  items: const [
                    DropdownMenuItem(value: 'ADD', child: Text('Add Stock')),
                    DropdownMenuItem(
                      value: 'REDUCE',
                      child: Text('Reduce Stock'),
                    ),
                  ],
                  onChanged: (val) => setState(() => _mode = val!),
                ),
              ],
            ),
            TextField(
              controller: _qtyCtrl,
              decoration: const InputDecoration(labelText: 'Quantity'),
              keyboardType: TextInputType.number,
            ),
            TextField(
              controller: _reasonCtrl,
              decoration: const InputDecoration(
                labelText: 'Reason (e.g. Found, Damaged)',
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _isLoading ? null : _submit,
          child: _isLoading
              ? const CircularProgressIndicator()
              : const Text('Confirm Adjustment'),
        ),
      ],
    );
  }

  Future<void> _submit() async {
    final qty = int.tryParse(_qtyCtrl.text);
    if (qty == null || qty <= 0) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Invalid Quantity')));
      return;
    }

    final reason = _reasonCtrl.text.trim();
    if (reason.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Reason required')));
      return;
    }

    setState(() => _isLoading = true);
    try {
      final adjustmentQty = _mode == 'ADD' ? qty : -qty;
      await ref.read(inventoryApiProvider).adjustStock(widget.item['id'], {
        'quantity': adjustmentQty,
        'reason': reason,
      });
      if (mounted) Navigator.pop(context, true);
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

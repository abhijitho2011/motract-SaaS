import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/features/job_card/data/job_card_repository.dart';
import 'package:workshop/src/features/inventory/data/inventory_repository.dart';

class EstimateScreen extends ConsumerStatefulWidget {
  final String jobCardId;
  const EstimateScreen({super.key, required this.jobCardId});

  @override
  ConsumerState<EstimateScreen> createState() => _EstimateScreenState();
}

class _EstimateScreenState extends ConsumerState<EstimateScreen> {
  // Local state to refresh list after adds
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    // Fetch fresh job card details
    final jobAsync = ref.watch(jobCardApiProvider).getJobCard(widget.jobCardId);

    return Scaffold(
      appBar: AppBar(title: const Text('Work Scope & Estimate')),
      body: FutureBuilder(
        future: jobAsync,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final job = snapshot.data as Map<String, dynamic>;
          final tasks = (job['tasks'] as List?) ?? [];
          final parts = (job['parts'] as List?) ?? [];
          final stage = job['stage'];

          double total = 0;
          for (var t in tasks) {
            total += (t['price'] as num).toDouble();
          }
          for (var p in parts) {
            total += (p['totalPrice'] as num).toDouble();
          }

          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _sectionHeader(
                      'Labor Tasks',
                      () => _addLaborDialog(context),
                    ),
                    ...tasks.map(
                      (t) => ListTile(
                        title: Text(t['description']),
                        trailing: Text('₹${t['price']}'),
                        subtitle: Text('GST: ${t['gstPercent']}%'),
                      ),
                    ),
                    if (tasks.isEmpty) const Text('No tasks added yet.'),
                    const Gap(24),
                    _sectionHeader(
                      'Parts Required',
                      () => _addPartDialog(context, job['workshopId']),
                    ),
                    ...parts.map(
                      (p) => ListTile(
                        title: Text(p['item']['name']),
                        subtitle: Text(
                          'Qty: ${p['quantity']} x ₹${p['unitPrice']}',
                        ),
                        trailing: Text('₹${p['totalPrice']}'),
                      ),
                    ),
                    if (parts.isEmpty) const Text('No parts added yet.'),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.all(16),
                color: Theme.of(context).cardColor,
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Grand Total:',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '₹${total.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const Gap(16),
                    if (stage == 'INSPECTION_COMPLETED' || stage == 'CREATED')
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: _isLoading ? null : _approveEstimate,
                          child: _isLoading
                              ? const CircularProgressIndicator()
                              : const Text('Approve & Start Work'),
                        ),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.all(8),
                        color: Colors.green.withValues(alpha: 0.1),
                        child: const Text(
                          'Estimate Approved',
                          style: TextStyle(color: Colors.green),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _sectionHeader(String title, VoidCallback onAdd) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        TextButton.icon(
          onPressed: onAdd,
          icon: const Icon(Icons.add),
          label: const Text('Add'),
        ),
      ],
    );
  }

  void _addLaborDialog(BuildContext context) {
    final descCtrl = TextEditingController();
    final priceCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Labor Task'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: descCtrl,
              decoration: const InputDecoration(labelText: 'Description'),
            ),
            TextField(
              controller: priceCtrl,
              decoration: const InputDecoration(labelText: 'Price'),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => ctx.pop(), child: const Text('Cancel')),
          FilledButton(
            onPressed: () async {
              try {
                await ref.read(jobCardApiProvider).addTask(widget.jobCardId, {
                  'description': descCtrl.text,
                  'price': double.parse(priceCtrl.text),
                  'gst': 18.0,
                });
                setState(() {});
                if (mounted) ctx.pop();
              } catch (e) {
                debugPrint(e.toString());
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _addPartDialog(BuildContext context, String workshopId) {
    // Show simple inventory list to pick from
    // For Phase 1, we pull top 50 items
    showModalBottomSheet(
      context: context,
      builder: (ctx) => Consumer(
        builder: (context, ref, _) {
          final itemsAsync = ref
              .watch(inventoryApiProvider)
              .getInventoryItems(workshopId);
          return FutureBuilder(
            future: itemsAsync,
            builder: (ctx, snap) {
              if (!snap.hasData) {
                return const Center(child: CircularProgressIndicator());
              }
              final items = snap.data as List;
              return ListView.builder(
                itemCount: items.length,
                itemBuilder: (ctx, i) {
                  final item = items[i];
                  return ListTile(
                    title: Text(item['name']),
                    subtitle: Text('Stock: ${item['stockQuantity'] ?? 0}'),
                    trailing: Text('₹${item['salePrice']}'),
                    onTap: () async {
                      await ref.read(jobCardApiProvider).addPart(
                        widget.jobCardId,
                        {
                          'itemId': item['id'],
                          'quantity': 1, // Default 1 for now
                          'unitPrice': (item['salePrice'] as num).toDouble(),
                          'gst': (item['taxPercent'] as num).toDouble(),
                        },
                      );
                      setState(() {});
                      if (mounted) Navigator.pop(ctx);
                    },
                  );
                },
              );
            },
          );
        },
      ),
    );
  }

  Future<void> _approveEstimate() async {
    setState(() => _isLoading = true);
    try {
      await ref.read(jobCardApiProvider).updateStage(widget.jobCardId, {
        'stage': 'WORK_IN_PROGRESS',
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Approved! Work Started.')),
        );
        context.pop();
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

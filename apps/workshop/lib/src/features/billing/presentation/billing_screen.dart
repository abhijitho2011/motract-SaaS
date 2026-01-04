import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:workshop/src/features/billing/presentation/billing_controller.dart';

class BillingScreen extends ConsumerStatefulWidget {
  const BillingScreen({super.key});

  @override
  ConsumerState<BillingScreen> createState() => _BillingScreenState();
}

class _BillingScreenState extends ConsumerState<BillingScreen> {
  final _jobCardIdController = TextEditingController();

  void _generate() {
    if (_jobCardIdController.text.isNotEmpty) {
      ref
          .read(billingControllerProvider.notifier)
          .generateInvoice(_jobCardIdController.text.trim());
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(billingControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Billing & Invoicing'),
        leading: IconButton(
          icon: const Icon(Icons.home),
          onPressed: () => context.go('/dashboard'),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Text(
              'Generate Invoice',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const Gap(16),
            TextField(
              controller: _jobCardIdController,
              decoration: const InputDecoration(
                labelText: 'Job Card ID / Number',
                hintText: 'Enter UUID or Job Card Number (e.g. JC-123)',
                border: OutlineInputBorder(),
              ),
            ),
            const Gap(16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: state.isLoading ? null : _generate,
                child: state.isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Generate Invoice'),
              ),
            ),
            const Gap(32),
            if (state.hasError) ...[
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const Gap(8),
              Text(
                'Error: ${state.error}',
                style: const TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),
            ],
            if (state.value != null) ...[
              const Divider(),
              const Gap(16),
              const Icon(Icons.receipt_long, size: 60, color: Colors.green),
              const Gap(8),
              Text(
                'Invoice Generated!',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const Gap(16),
              _InvoiceDetailRow(
                label: 'Invoice ID',
                value: state.value!['id'] ?? 'N/A',
              ),
              _InvoiceDetailRow(
                label: 'Amount (Excl. Tax)',
                value: '₹${state.value!['amount'] ?? 0}',
              ),
              _InvoiceDetailRow(
                label: 'GST',
                value: '₹${state.value!['taxAmount'] ?? 0}',
              ),
              const Divider(),
              _InvoiceDetailRow(
                label: 'Total Payable',
                value: '₹${state.value!['totalAmount'] ?? 0}',
                isBold: true,
                color: Colors.green,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _InvoiceDetailRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isBold;
  final Color? color;

  const _InvoiceDetailRow({
    required this.label,
    required this.value,
    this.isBold = false,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(
            value,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              fontSize: isBold ? 18 : 16,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

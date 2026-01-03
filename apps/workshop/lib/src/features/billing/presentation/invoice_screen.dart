import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/features/billing/data/billing_repository.dart';
import 'package:workshop/src/features/job_card/data/job_card_repository.dart';

class InvoiceScreen extends ConsumerStatefulWidget {
  final String jobCardId;
  const InvoiceScreen({super.key, required this.jobCardId});

  @override
  ConsumerState<InvoiceScreen> createState() => _InvoiceScreenState();
}

class _InvoiceScreenState extends ConsumerState<InvoiceScreen> {
  bool _isLoading = false;
  Map<String, dynamic>? _invoiceData;

  @override
  void initState() {
    super.initState();
    _loadInvoicePreview();
  }

  Future<void> _loadInvoicePreview() async {
    // Check if invoice exists or generate it
    // For now, we call generate which is idempotent in our backend logic (returns existing if found)
    // Wait, backend logic throws "Invoice already generated".
    // So we should first check JobCard stage.
    // Actually, distinct between 'Preview' and 'Commit' is better, but for MVP:
    // Let's first fetch JobCard. If stage is BILLING -> Fetch Invoice.
    // If QC -> Call Generate.

    // Simplification: We will try to fetch invoice. If 404, we ask user "Generate?".
    // But to make it smooth, let's just trigger generate on button press.
    // The screen should show Job Summary first.
  }

  @override
  Widget build(BuildContext context) {
    final jobAsync = ref.watch(jobCardApiProvider).getJobCard(widget.jobCardId);

    return Scaffold(
      appBar: AppBar(title: const Text('Computed Invoice')),
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
          final invoice =
              job['invoice']; // Relation included? Need to ensure backend includes it.
          // JobCardService.findOne usually includes basic relations.
          // If invoice is missing, we show "Generate" button.

          if (invoice != null || _invoiceData != null) {
            final inv = _invoiceData ?? invoice;
            return _buildInvoiceView(inv);
          }

          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'Job Card Ready for Billing',
                  style: TextStyle(fontSize: 18),
                ),
                const Gap(16),
                FilledButton.icon(
                  onPressed: _isLoading
                      ? null
                      : () => _generateInvoice(job['id']),
                  icon: const Icon(Icons.receipt_long),
                  label: _isLoading
                      ? const CircularProgressIndicator()
                      : const Text('Generate Invoice'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInvoiceView(Map<String, dynamic> inv) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Text(
                  'Invoice #${inv['invoiceNumber']}',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Divider(),
                _row('Total Labor (Base)', inv['totalLabor']),
                _row('Total Parts (Tax Inc)', inv['totalParts']),
                const Divider(),
                _row('CGST (9%)', inv['cgst']),
                _row('SGST (9%)', inv['sgst']),
                const Divider(),
                _row('Grand Total', inv['grandTotal'], isBold: true),
              ],
            ),
          ),
        ),
        const Gap(24),
        FilledButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Printer not connected')),
            );
          },
          icon: const Icon(Icons.print),
          label: const Text('Print Invoice'),
        ),
      ],
    );
  }

  Widget _row(String label, dynamic amount, {bool isBold = false}) {
    final style = TextStyle(
      fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
      fontSize: isBold ? 18 : 14,
    );
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: style),
          Text('₹${(amount as num).toStringAsFixed(2)}', style: style),
        ],
      ),
    );
  }

  Future<void> _generateInvoice(String jobCardId) async {
    setState(() => _isLoading = true);
    try {
      final res = await ref.read(billingApiProvider).generateInvoice(jobCardId);
      setState(() {
        _invoiceData = res;
      });
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

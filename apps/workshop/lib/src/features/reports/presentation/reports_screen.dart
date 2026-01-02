import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:intl/intl.dart';
import 'package:workshop/src/features/reports/data/reports_repository.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  DateTime _startDate = DateTime.now().subtract(const Duration(days: 30));
  DateTime _endDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reports'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Sales'),
            Tab(text: 'GST Tax'),
            Tab(text: 'P & L'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.date_range),
            onPressed: _pickDateRange,
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _SalesTab(startDate: _startDate, endDate: _endDate),
          _GstTab(month: _startDate.month, year: _startDate.year),
          _PnlTab(startDate: _startDate, endDate: _endDate),
        ],
      ),
    );
  }

  Future<void> _pickDateRange() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      initialDateRange: DateTimeRange(start: _startDate, end: _endDate),
    );
    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
      });
    }
  }
}

// -----------------------------------------------------------------------------
// Sales Tab
// -----------------------------------------------------------------------------

class _SalesTab extends ConsumerWidget {
  final DateTime startDate;
  final DateTime endDate;

  const _SalesTab({required this.startDate, required this.endDate});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final api = ref.watch(reportsApiProvider);
    final reportFuture = ref.watch(
      futureProviderForSales((api, startDate, endDate)),
    );

    return reportFuture.when(
      data: (data) {
        final summary = data['summary'];
        final transactions = data['transactions'] as List;

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildSummaryCard(summary),
            const Gap(16),
            const Text(
              'Transactions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const Gap(8),
            ...transactions.map(
              (txn) => Card(
                child: ListTile(
                  title: Text('#${txn['invoiceNumber']}'),
                  subtitle: Text(
                    DateFormat(
                      'dd MMM yyyy',
                    ).format(DateTime.parse(txn['invoiceDate'])),
                  ),
                  trailing: Text(
                    '₹${txn['grandTotal']}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => Center(child: Text('Error: $e')),
    );
  }

  Widget _buildSummaryCard(Map<String, dynamic> summary) {
    return Card(
      color: Colors.blue.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _row('Total Revenue', '₹${summary['totalRevenue']}'),
            const Divider(),
            _row('Labor', '₹${summary['laborRevenue']}'),
            _row('Parts', '₹${summary['partsRevenue']}'),
            _row('Tax Collected', '₹${summary['taxCollected']}'),
            const Divider(),
            _row('Total Invoices', '${summary['totalCount']}'),
          ],
        ),
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

// Helper Providers
final futureProviderForSales =
    FutureProvider.family<dynamic, (ReportsApi, DateTime, DateTime)>((
      ref,
      args,
    ) async {
      return args.$1.getSalesReport(
        args.$2.toIso8601String(),
        args.$3.toIso8601String(),
      );
    });

final futureProviderForGst =
    FutureProvider.family<dynamic, (ReportsApi, int, int)>((ref, args) async {
      return args.$1.getGSTReport(args.$2.toString(), args.$3.toString());
    });

final futureProviderForPnl =
    FutureProvider.family<dynamic, (ReportsApi, DateTime, DateTime)>((
      ref,
      args,
    ) async {
      return args.$1.getPnLReport(
        args.$2.toIso8601String(),
        args.$3.toIso8601String(),
      );
    });

// -----------------------------------------------------------------------------
// GST Tab
// -----------------------------------------------------------------------------

class _GstTab extends ConsumerWidget {
  final int month;
  final int year;

  const _GstTab({required this.month, required this.year});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final api = ref.watch(reportsApiProvider);
    final reportFuture = ref.watch(futureProviderForGst((api, month, year)));

    return reportFuture.when(
      data: (data) {
        final outTax = data['outputTax'];
        final inTax = data['inputTax'];
        final net = data['netPayable'];

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              'GST Return Period: $month/$year',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const Gap(16),
            _buildSection('Output Tax (Sales)', [
              _row('Taxable Value', '₹${outTax['taxableValue']}'),
              _row('CGST', '₹${outTax['cgst']}'),
              _row('SGST', '₹${outTax['sgst']}'),
              _row('IGST', '₹${outTax['igst']}'),
              _row(
                'Total Output Liability',
                '₹${outTax['total']}',
                isBold: true,
              ),
            ]),
            const Gap(16),
            _buildSection('Input Tax Credit (Purchases)', [
              _row('Purchase Value', '₹${inTax['purchaseValue']}'),
              _row('Total ITC Available', '₹${inTax['total']}', isBold: true),
            ]),
            const Gap(16),
            Card(
              color: net > 0 ? Colors.red.shade50 : Colors.green.shade50,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Net Payable / (Credit)',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '₹${net.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => Center(child: Text('Error: $e')),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const Divider(),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _row(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// P & L Tab
// -----------------------------------------------------------------------------

class _PnlTab extends ConsumerWidget {
  final DateTime startDate;
  final DateTime endDate;

  const _PnlTab({required this.startDate, required this.endDate});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final api = ref.watch(reportsApiProvider);
    final reportFuture = ref.watch(
      futureProviderForPnl((api, startDate, endDate)),
    );

    return reportFuture.when(
      data: (data) {
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildItem('Total Revenue', data['revenue'], isPositive: true),
            _buildItem(
              'Cost of Goods Sold (COGS)',
              -data['cogs'],
              isPositive: false,
            ),
            const Divider(),
            _buildItem('Gross Profit', data['grossProfit'], isTotal: true),
            const Gap(20),
            _buildItem(
              'Operating Expenses',
              -data['expenses'],
              isPositive: false,
            ),
            const Divider(),
            _buildItem(
              'Net Profit',
              data['netProfit'],
              isTotal: true,
              isFinal: true,
            ),
            const Gap(8),
            Text(
              'Net Margin: ${(data['marginPercent'] as num).toStringAsFixed(1)}%',
              textAlign: TextAlign.right,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => Center(child: Text('Error: $e')),
    );
  }

  Widget _buildItem(
    String label,
    num value, {
    bool isPositive = true,
    bool isTotal = false,
    bool isFinal = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      color: isFinal ? Colors.green.shade50 : null,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 18 : 16,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
            '₹${value.toStringAsFixed(0)}',
            style: TextStyle(
              fontSize: isTotal ? 18 : 16,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: isTotal
                  ? (value >= 0 ? Colors.green : Colors.red)
                  : Colors.black,
            ),
          ),
        ],
      ),
    );
  }
}

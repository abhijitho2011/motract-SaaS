import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/features/expense/data/expense_repository.dart';
import 'package:workshop/src/features/settings/data/settings_repository.dart';

class ExpenseListScreen extends ConsumerStatefulWidget {
  const ExpenseListScreen({super.key});

  @override
  ConsumerState<ExpenseListScreen> createState() => _ExpenseListScreenState();
}

class _ExpenseListScreenState extends ConsumerState<ExpenseListScreen> {
  @override
  Widget build(BuildContext context) {
    final workshopId = ref.watch(workshopProvider).asData?.value?['id'];
    // Handle loading workshopId properly
    if (workshopId == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final expensesAsync = ref
        .watch(expenseApiProvider)
        .getExpenses(workshopId: workshopId);

    return Scaffold(
      appBar: AppBar(title: const Text('Expenses')),
      body: FutureBuilder(
        future: expensesAsync,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final expenses = (snapshot.data as List?) ?? [];
          if (expenses.isEmpty) {
            return const Center(child: Text('No expenses recorded.'));
          }

          return ListView.builder(
            itemCount: expenses.length,
            itemBuilder: (context, index) {
              final e = expenses[index];
              return ListTile(
                leading: const Icon(Icons.money_off),
                title: Text(e['category']),
                subtitle: Text(e['date'].toString().split('T').first),
                trailing: Text('-₹${e['amount']}'),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _addExpenseDialog(context, workshopId),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _addExpenseDialog(BuildContext context, String workshopId) {
    final catCtrl = TextEditingController();
    final amtCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Expense'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: catCtrl,
              decoration: const InputDecoration(
                labelText: 'Category (Rent, Salary)',
              ),
            ),
            TextField(
              controller: amtCtrl,
              decoration: const InputDecoration(labelText: 'Amount'),
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
            onPressed: () async {
              if (catCtrl.text.isNotEmpty && amtCtrl.text.isNotEmpty) {
                await ref.read(expenseApiProvider).createExpense({
                  'workshopId': workshopId,
                  'category': catCtrl.text,
                  'amount': double.tryParse(amtCtrl.text) ?? 0,
                  'date': DateTime.now().toIso8601String(),
                });
                if (mounted) Navigator.pop(ctx);
                setState(() {});
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}

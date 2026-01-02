import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:workshop/src/features/job_card/presentation/job_card_list_controller.dart';

class JobCardListScreen extends ConsumerWidget {
  const JobCardListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobState = ref.watch(jobCardListControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Job Cards')),
      body: jobState.when(
        data: (jobs) => jobs.isEmpty
            ? const Center(child: Text('No active job cards.'))
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: jobs.length,
                separatorBuilder: (_, __) => const Gap(12),
                itemBuilder: (context, index) {
                  final job = jobs[index];
                  final vehicle = job['vehicle'] ?? {};
                  final customer = job['customer'] ?? {};

                  return Card(
                    child: ListTile(
                      leading: CircleAvatar(child: Text('${index + 1}')),
                      title: Text(
                        vehicle['regNumber'] ?? 'Unknown Vehicle',
                      ), // From relation
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(customer['name'] ?? 'Unknown Customer'),
                          const Gap(4),
                          Chip(
                            label: Text(
                              job['stage'] ?? 'UNKNOWN',
                              style: const TextStyle(fontSize: 10),
                            ),
                            padding: EdgeInsets.zero,
                          ),
                        ],
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(
                              Icons.assignment_turned_in_outlined,
                            ),
                            tooltip: 'Inspect',
                            onPressed: () {
                              context.push(
                                '/job-card/inspection?id=${job['id']}',
                              );
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.calculate_outlined),
                            tooltip: 'Estimate',
                            onPressed: () {
                              context.push(
                                '/job-card/estimate?id=${job['id']}',
                              );
                              // ScaffoldMessenger.of(context).showSnackBar(
                              //   const SnackBar(content: Text('Building...')),
                              // );
                            },
                          ),
                          if (job['stage'] == 'WORK_IN_PROGRESS' ||
                              job['stage'] == 'QC')
                            IconButton(
                              icon: const Icon(Icons.build_circle_outlined),
                              tooltip: 'Execute/QC',
                              onPressed: () {
                                context.push(
                                  '/job-card/execution?id=${job['id']}',
                                );
                              },
                            ),
                          if (job['stage'] == 'BILLING' ||
                              job['stage'] == 'DELIVERY' ||
                              job['stage'] == 'QC')
                            IconButton(
                              icon: const Icon(Icons.receipt_long_outlined),
                              tooltip: 'Bill',
                              onPressed: () {
                                context.push(
                                  '/billing/invoice?id=${job['id']}',
                                );
                              },
                            ),
                        ],
                      ),
                      isThreeLine: true,
                      onTap: () {
                        // TODO: Detail view
                      },
                    ),
                  );
                },
              ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/vehicle/lookup'),
        child: const Icon(Icons.add),
        tooltip: 'Create Job Card',
      ),
    );
  }
}

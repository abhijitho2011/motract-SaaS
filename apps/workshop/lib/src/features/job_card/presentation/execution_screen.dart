import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/features/job_card/data/job_card_repository.dart';

class ExecutionScreen extends ConsumerStatefulWidget {
  final String jobCardId;
  const ExecutionScreen({super.key, required this.jobCardId});

  @override
  ConsumerState<ExecutionScreen> createState() => _ExecutionScreenState();
}

class _ExecutionScreenState extends ConsumerState<ExecutionScreen> {
  bool _isLoading = false;
  final _techIdController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final jobAsync = ref.watch(jobCardApiProvider).getJobCard(widget.jobCardId);

    return Scaffold(
      appBar: AppBar(title: const Text('Execution & QC')),
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
          final technicianId = job['technicianId'];
          final stage = job['stage'];

          // Pre-fill if already assigned
          if (technicianId != null && _techIdController.text.isEmpty) {
            _techIdController.text = technicianId;
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildTechnicianSection(technicianId),
              const Gap(24),
              const Text(
                'Labor Tasks',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const Gap(8),
              if (tasks.isEmpty) const Text('No tasks defined.'),
              ...tasks.map((t) {
                final isDone = t['completionStatus'] == 'DONE';
                return CheckboxListTile(
                  title: Text(t['description']),
                  subtitle: Text(isDone ? 'Completed' : 'Pending'),
                  value: isDone,
                  onChanged: (val) async {
                    if (val == null) return;
                    await _updateTaskStatus(t['id'], val ? 'DONE' : 'PENDING');
                  },
                );
              }),
              const Gap(32),
              if (stage == 'WORK_IN_PROGRESS')
                FilledButton.icon(
                  onPressed: _isLoading ? null : _completeWork,
                  icon: const Icon(Icons.check_circle_outline),
                  label: _isLoading
                      ? const CircularProgressIndicator()
                      : const Text('Work Completed - Request QC'),
                )
              else if (stage == 'QC')
                Container(
                  padding: const EdgeInsets.all(16),
                  color: Colors.orange.withValues(alpha: 0.1),
                  child: Column(
                    children: [
                      const Text(
                        'QC in Progress',
                        style: TextStyle(
                          color: Colors.orange,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Gap(16),
                      FilledButton(
                        onPressed: _isLoading ? null : _passQC,
                        style: FilledButton.styleFrom(
                          backgroundColor: Colors.green,
                        ),
                        child: const Text('QC Passed - Move to Billing'),
                      ),
                    ],
                  ),
                )
              else
                Center(
                  child: Chip(
                    label: Text('Stage: $stage'),
                    backgroundColor: Colors.grey.shade200,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildTechnicianSection(String? currentTechId) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Technician Assignment',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const Gap(8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _techIdController,
                    decoration: const InputDecoration(
                      labelText: 'Technician ID / Name',
                      hintText: 'Enter ID',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const Gap(8),
                FilledButton(
                  onPressed: _assignTechnician,
                  child: const Text('Assign'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _assignTechnician() async {
    final id = _techIdController.text.trim();
    if (id.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      await ref.read(jobCardApiProvider).assignTechnician(widget.jobCardId, {
        'technicianId': id,
      });
      setState(() {}); // Refresh
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Technician Assigned')));
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

  Future<void> _updateTaskStatus(String taskId, String status) async {
    try {
      await ref.read(jobCardApiProvider).updateTaskStatus(
        widget.jobCardId,
        taskId,
        {'status': status},
      );
      setState(() {});
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _completeWork() async {
    setState(() => _isLoading = true);
    try {
      // Move to QC
      await ref.read(jobCardApiProvider).updateStage(widget.jobCardId, {
        'stage': 'QC',
      });
      setState(() {});
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Moved to QC')));
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

  Future<void> _passQC() async {
    setState(() => _isLoading = true);
    try {
      // Move to BILLING
      await ref.read(jobCardApiProvider).updateStage(widget.jobCardId, {
        'stage': 'BILLING',
      });
      setState(() {});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('QC Passed! Ready for Billing.')),
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

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:workshop/src/features/job_card/data/job_card_repository.dart';

class InspectionScreen extends ConsumerStatefulWidget {
  final String jobCardId;
  const InspectionScreen({super.key, required this.jobCardId});

  @override
  ConsumerState<InspectionScreen> createState() => _InspectionScreenState();
}

class _InspectionScreenState extends ConsumerState<InspectionScreen> {
  Map<String, bool> _exteriorChecks = {};
  Map<String, bool> _interiorChecks = {};

  final _fuelController = TextEditingController();
  final _odoController = TextEditingController();
  bool _isLoading = true;
  bool _inspectionLocked = false;
  Map<String, dynamic>? _jobCardData;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final api = ref.read(jobCardApiProvider);

      // Load Masters
      final masters = await api.getInspectionMasters() as List;
      final exteriorMaster = masters
          .where((i) => i['category'] == 'EXTERIOR')
          .map((i) => i['name'] as String)
          .toList();
      final interiorMaster = masters
          .where((i) => i['category'] == 'INTERIOR')
          .map((i) => i['name'] as String)
          .toList();

      // Initialize with false
      final extMap = {for (var e in exteriorMaster) e: false};
      final intMap = {for (var e in interiorMaster) e: false};

      // Load Job Card
      final data = await api.getJobCard(widget.jobCardId);

      if (data['inspection'] != null) {
        // Merge saved data
        final savedExt = Map<String, dynamic>.from(
          data['inspection']['exterior'] ?? {},
        );
        final savedInt = Map<String, dynamic>.from(
          data['inspection']['interior'] ?? {},
        );

        savedExt.forEach((k, v) => extMap[k] = v == true);
        savedInt.forEach((k, v) => intMap[k] = v == true);

        // Also ensure any NEW masters are present (false by default) but if saved didn't have them, they are false.
        // However, if inspection is LOCKED, maybe we shouldn't show new items?
        // Logic: allow view of what was saved + potentially new items if we want (but locked so uneditable).

        if (data['inspection']['fuelLevel'] != null) {
          _fuelController.text = data['inspection']['fuelLevel'].toString();
        }
        if (data['inspection']['odometer'] != null) {
          _odoController.text = data['inspection']['odometer'].toString();
        }
      }

      setState(() {
        _exteriorChecks = extMap;
        _interiorChecks = intMap;
        _jobCardData = data;
        _inspectionLocked = data['inspection'] != null;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Inspection')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_inspectionLocked ? 'View Inspection' : 'New Inspection'),
      ),
      body: DefaultTabController(
        length: 2,
        child: Column(
          children: [
            if (_inspectionLocked)
              Container(
                color: Colors.orange.shade100,
                padding: const EdgeInsets.all(8),
                child: const Row(
                  children: [
                    Icon(Icons.lock, size: 16),
                    Gap(8),
                    Text(
                      'Inspection completed. Editing disabled.',
                      style: TextStyle(fontSize: 12),
                    ),
                  ],
                ),
              ),
            const TabBar(
              tabs: [
                Tab(text: 'Exterior'),
                Tab(text: 'Interior'),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  _buildChecklist(_exteriorChecks),
                  _buildChecklist(_interiorChecks),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _fuelController,
                          decoration: const InputDecoration(
                            labelText: 'Fuel Level (%)',
                          ),
                          keyboardType: TextInputType.number,
                          enabled: !_inspectionLocked,
                        ),
                      ),
                      const Gap(16),
                      Expanded(
                        child: TextField(
                          controller: _odoController,
                          decoration: const InputDecoration(
                            labelText: 'Odometer (km)',
                          ),
                          keyboardType: TextInputType.number,
                          enabled: !_inspectionLocked,
                        ),
                      ),
                    ],
                  ),
                  const Gap(16),
                  if (!_inspectionLocked)
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: _submit,
                        child: const Text('Save & Complete Inspection'),
                      ),
                    ),
                  if (_inspectionLocked)
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: _closeJobCard,
                        child: const Text('Close & Move to Billing'),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChecklist(Map<String, bool> checks) {
    return ListView(
      children: checks.keys.map((key) {
        return CheckboxListTile(
          title: Text(key),
          value: checks[key],
          onChanged: _inspectionLocked
              ? null
              : (v) {
                  setState(() {
                    checks[key] = v!;
                  });
                },
        );
      }).toList(),
    );
  }

  Future<void> _submit() async {
    final api = ref.read(jobCardApiProvider);

    try {
      await api.saveInspection(widget.jobCardId, {
        'exterior': _exteriorChecks,
        'interior': _interiorChecks,
        'tyres': {}, // Placeholder
        'photos': [], // Placeholder
        'fuelLevel': int.tryParse(_fuelController.text),
        'odometer': int.tryParse(_odoController.text),
      });

      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Inspection Saved!')));
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _closeJobCard() async {
    final api = ref.read(jobCardApiProvider);

    try {
      await api.updateStage(widget.jobCardId, {'stage': 'BILLING'});

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Job Card moved to Billing!')),
        );
        context.go('/billing');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }
}

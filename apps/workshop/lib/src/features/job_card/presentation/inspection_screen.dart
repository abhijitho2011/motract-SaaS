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
  final Map<String, bool> _exteriorChecks = {
    'Scratches': false,
    'Dents': false,
    'Broken Glass': false,
    'Lights Broken': false,
  };

  final Map<String, bool> _interiorChecks = {
    'Dirty Seats': false,
    'Floor Mats Missing': false,
    'AC Not Working': false,
    'Music System Issue': false,
  };

  final _fuelController = TextEditingController();
  final _odoController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Inspection')),
      body: DefaultTabController(
        length: 2,
        child: Column(
          children: [
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
                        ),
                      ),
                    ],
                  ),
                  const Gap(16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _submit,
                      child: const Text('Save & Complete Inspection'),
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
          onChanged: (v) {
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
}

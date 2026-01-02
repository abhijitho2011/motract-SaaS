import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/features/job_card/presentation/job_card_controller.dart';

class CreateJobCardScreen extends ConsumerStatefulWidget {
  final String vehicleId;
  const CreateJobCardScreen({super.key, required this.vehicleId});

  @override
  ConsumerState<CreateJobCardScreen> createState() =>
      _CreateJobCardScreenState();
}

class _CreateJobCardScreenState extends ConsumerState<CreateJobCardScreen> {
  final _formKey = GlobalKey<FormState>();
  final _odometerController = TextEditingController();
  final _customerNameController = TextEditingController();
  final _customerMobileController = TextEditingController();
  final _notesController = TextEditingController();

  // Simple complaint list management
  final _complaintController = TextEditingController();
  final List<String> _complaints = [];
  double _fuelLevel = 50;

  void _addComplaint() {
    if (_complaintController.text.isNotEmpty) {
      setState(() {
        _complaints.add(_complaintController.text);
        _complaintController.clear();
      });
    }
  }

  void _removeComplaint(int index) {
    setState(() {
      _complaints.removeAt(index);
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_complaints.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add at least one complaint')),
      );
      return;
    }

    await ref
        .read(jobCardControllerProvider.notifier)
        .createJobCard(
          vehicleId: widget.vehicleId,
          customerName: _customerNameController.text,
          customerMobile: _customerMobileController.text,
          odometer: int.tryParse(_odometerController.text) ?? 0,
          fuelLevel: _fuelLevel.round(),
          complaints: _complaints,
          notes: _notesController.text,
        );

    if (ref.read(jobCardControllerProvider).hasError == false) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Job Card Created!')));
        context.go('/dashboard'); // Reset flow
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(jobCardControllerProvider);
    final isLoading = state.isLoading;

    ref.listen(jobCardControllerProvider, (previous, next) {
      if (next.hasError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${next.error}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text('Create Job Card')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Vehicle Intake Details',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const Gap(16),

              // Odometer
              TextFormField(
                controller: _odometerController,
                decoration: const InputDecoration(
                  labelText: 'Odometer Reading (km)',
                  suffixText: 'km',
                ),
                keyboardType: TextInputType.number,
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const Gap(16),

              const Text(
                'Customer Details',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const Gap(16),
              TextFormField(
                controller: _customerNameController,
                decoration: const InputDecoration(labelText: 'Customer Name'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const Gap(16),
              TextFormField(
                controller: _customerMobileController,
                decoration: const InputDecoration(labelText: 'Mobile Number'),
                keyboardType: TextInputType.phone,
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const Gap(24),

              // Fuel Level Slider
              Text('Fuel Level: ${_fuelLevel.round()}%'),
              Slider(
                value: _fuelLevel,
                min: 0,
                max: 100,
                divisions: 4,
                label: '${_fuelLevel.round()}%',
                onChanged: (v) => setState(() => _fuelLevel = v),
              ),
              const Gap(24),

              // Complaints
              const Text(
                'Customer Complaints',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const Gap(8),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _complaintController,
                      decoration: const InputDecoration(
                        hintText: 'Enter complaint (e.g. Engine noise)',
                      ),
                      onSubmitted: (_) => _addComplaint(),
                    ),
                  ),
                  IconButton(
                    onPressed: _addComplaint,
                    icon: const Icon(Icons.add_circle, color: Colors.blue),
                  ),
                ],
              ),
              const Gap(8),
              if (_complaints.isEmpty)
                const Text(
                  'No complaints added',
                  style: TextStyle(
                    color: Colors.grey,
                    fontStyle: FontStyle.italic,
                  ),
                ),

              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _complaints.length,
                itemBuilder: (context, index) => ListTile(
                  dense: true,
                  title: Text(_complaints[index]),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red, size: 20),
                    onPressed: () => _removeComplaint(index),
                  ),
                ),
              ),
              const Gap(24),

              // Notes
              TextFormField(
                controller: _notesController,
                decoration: const InputDecoration(
                  labelText: 'Advisor Notes (Optional)',
                ),
                maxLines: 3,
              ),

              const Gap(32),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: isLoading ? null : _submit,
                  icon: isLoading
                      ? const SizedBox.shrink()
                      : const Icon(Icons.check),
                  label: isLoading
                      ? const CircularProgressIndicator()
                      : const Text('Create Job Card'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/features/vehicle/presentation/vehicle_register_controller.dart';

class VehicleRegisterScreen extends ConsumerStatefulWidget {
  final String? initialRegNumber;

  const VehicleRegisterScreen({super.key, this.initialRegNumber});

  @override
  ConsumerState<VehicleRegisterScreen> createState() =>
      _VehicleRegisterScreenState();
}

class _VehicleRegisterScreenState extends ConsumerState<VehicleRegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _regController;
  final _makeController = TextEditingController(); // TODO: Use Dropdown
  final _modelController = TextEditingController(); // TODO: Use Dropdown
  final _variantController = TextEditingController();
  final _engineController = TextEditingController();
  final _vinController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _regController = TextEditingController(text: widget.initialRegNumber);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    await ref
        .read(vehicleRegisterControllerProvider.notifier)
        .register(
          regNumber: _regController.text,
          make: _makeController.text,
          model: _modelController.text,
          variant: _variantController.text,
          engineNumber: _engineController.text,
          vin: _vinController.text,
        );

    // Check for success
    if (ref.read(vehicleRegisterControllerProvider).hasError == false) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Vehicle Registered!')));
        // Navigate back to lookup or directly to job card
        context.pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(vehicleRegisterControllerProvider);
    final isLoading = state.isLoading;

    ref.listen(vehicleRegisterControllerProvider, (previous, next) {
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
      appBar: AppBar(title: const Text('Register New Vehicle')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              _buildSectionTitle('Vehicle Details'),
              const Gap(16),
              TextFormField(
                controller: _regController,
                decoration: const InputDecoration(
                  labelText: 'Registration Number',
                ),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const Gap(16),
              TextFormField(
                controller: _makeController,
                decoration: const InputDecoration(
                  labelText: 'Make (e.g. Maruti)',
                ),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const Gap(16),
              TextFormField(
                controller: _modelController,
                decoration: const InputDecoration(
                  labelText: 'Model (e.g. Swift)',
                ),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const Gap(16),
              TextFormField(
                controller: _variantController,
                decoration: const InputDecoration(
                  labelText: 'Variant (e.g. VXI)',
                ),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const Gap(16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _engineController,
                      decoration: const InputDecoration(
                        labelText: 'Engine Number',
                      ),
                    ),
                  ),
                  const Gap(16),
                  Expanded(
                    child: TextFormField(
                      controller: _vinController,
                      decoration: const InputDecoration(
                        labelText: 'VIN / Chassis',
                      ),
                    ),
                  ),
                ],
              ),
              const Gap(32),

              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: isLoading ? null : _submit,
                  child: isLoading
                      ? const CircularProgressIndicator()
                      : const Text('Register Vehicle'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Colors.blueAccent,
        ),
      ),
    );
  }
}

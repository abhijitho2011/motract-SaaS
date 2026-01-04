import 'package:flutter/material.dart';
import 'package:client/src/core/api/api_client.dart';

class AddVehicleScreen extends StatefulWidget {
  const AddVehicleScreen({super.key});

  @override
  State<AddVehicleScreen> createState() => _AddVehicleScreenState();
}

class _AddVehicleScreenState extends State<AddVehicleScreen> {
  final _api = ClientApi();
  final _regNumberController = TextEditingController();
  final _vinController = TextEditingController();

  bool _isLoading = false;
  bool _needsVinVerification = false;
  Map<String, dynamic>? _vehicleData;
  String? _vehicleId;

  @override
  void dispose() {
    _regNumberController.dispose();
    _vinController.dispose();
    super.dispose();
  }

  Future<void> _searchVehicle() async {
    if (_regNumberController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter registration number')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final result = await _api.addVehicle(_regNumberController.text.trim());

      if (mounted) {
        setState(() {
          _vehicleId = result['vehicleId'];
          _needsVinVerification = result['needsVinVerification'] ?? false;
          _vehicleData = result['vehicle'];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _verifyAndAdd() async {
    if (_vinController.text.trim().isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please enter VIN number')));
      return;
    }

    setState(() => _isLoading = true);

    try {
      await _api.verifyAndAddVehicle(_vehicleId!, _vinController.text.trim());

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Vehicle added successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Vehicle')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Step 1: Enter reg number
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Step 1: Enter Vehicle Registration Number',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _regNumberController,
                      textCapitalization: TextCapitalization.characters,
                      decoration: const InputDecoration(
                        labelText: 'Registration Number',
                        hintText: 'e.g., KA01AB1234',
                        prefixIcon: Icon(Icons.directions_car),
                      ),
                      enabled: !_needsVinVerification,
                    ),
                    const SizedBox(height: 16),
                    if (!_needsVinVerification)
                      ElevatedButton(
                        onPressed: _isLoading ? null : _searchVehicle,
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text('Search Vehicle'),
                      ),
                  ],
                ),
              ),
            ),

            // Step 2: Show vehicle info and VIN verification
            if (_needsVinVerification && _vehicleData != null) ...[
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Vehicle Found!',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.green,
                            ),
                      ),
                      const SizedBox(height: 12),
                      _buildInfoRow(
                        'Registration',
                        _vehicleData!['regNumber'] ?? '',
                      ),
                      _buildInfoRow('Make', _vehicleData!['make'] ?? ''),
                      _buildInfoRow('Model', _vehicleData!['model'] ?? ''),
                      _buildInfoRow('Variant', _vehicleData!['variant'] ?? ''),
                      _buildInfoRow(
                        'Fuel Type',
                        _vehicleData!['fuelType'] ?? '',
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Step 2: Verify Ownership',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'To add this vehicle to your dashboard, please enter the VIN number to verify ownership.',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _vinController,
                        textCapitalization: TextCapitalization.characters,
                        decoration: const InputDecoration(
                          labelText: 'VIN Number',
                          hintText: 'Enter last 5 characters of VIN',
                          prefixIcon: Icon(Icons.confirmation_number),
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _isLoading ? null : _verifyAndAdd,
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text('Verify & Add Vehicle'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600])),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

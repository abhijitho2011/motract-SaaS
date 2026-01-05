import 'package:flutter/material.dart';
import 'package:client/src/core/api/api_client.dart';
import 'package:client/src/features/rsa/rsa_tracking_screen.dart';

class RequestRsaScreen extends StatefulWidget {
  final List<dynamic> vehicles;
  final String? preselectedVehicleId;

  const RequestRsaScreen({
    super.key,
    required this.vehicles,
    this.preselectedVehicleId,
  });

  @override
  State<RequestRsaScreen> createState() => _RequestRsaScreenState();
}

class _RequestRsaScreenState extends State<RequestRsaScreen> {
  final _api = ClientApi();

  String? _selectedVehicleId;
  String? _selectedServiceType;
  // Hardcoded location for testing (Bangalore coordinates)
  final double _lat = 12.9716;
  final double _lng = 77.5946;
  bool _isRequesting = false;

  // RSA Service Types
  final List<Map<String, dynamic>> _serviceTypes = [
    {
      'id': 'JUMPSTART',
      'name': 'Jump Start',
      'icon': Icons.battery_charging_full,
      'description': 'Battery dead? Get a quick jump start',
    },
    {
      'id': 'FLAT_TIRE',
      'name': 'Flat Tire',
      'icon': Icons.tire_repair,
      'description': 'Tire puncture or replacement',
    },
    {
      'id': 'FUEL_DELIVERY',
      'name': 'Fuel Delivery',
      'icon': Icons.local_gas_station,
      'description': 'Ran out of fuel? We deliver',
    },
    {
      'id': 'TOWING',
      'name': 'Towing Service',
      'icon': Icons.local_shipping,
      'description': 'Vehicle towing to workshop',
    },
    {
      'id': 'LOCKOUT',
      'name': 'Lockout Assistance',
      'icon': Icons.lock_open,
      'description': 'Locked out of your car?',
    },
    {
      'id': 'BREAKDOWN',
      'name': 'General Breakdown',
      'icon': Icons.build,
      'description': 'On-spot mechanical repairs',
    },
  ];

  @override
  void initState() {
    super.initState();
    _selectedVehicleId = widget.preselectedVehicleId;
  }

  Future<void> _requestRsa() async {
    if (_selectedVehicleId == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a vehicle')));
      return;
    }

    if (_selectedServiceType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a service type')),
      );
      return;
    }

    setState(() => _isRequesting = true);

    try {
      final result = await _api.requestRsa(
        vehicleId: _selectedVehicleId!,
        serviceType: _selectedServiceType!,
        lat: _lat,
        lng: _lng,
      );

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => RsaTrackingScreen(
              jobId: result['id'],
              serviceType: _selectedServiceType!,
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isRequesting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Request RSA')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Location Card
            _buildLocationCard(),
            const SizedBox(height: 16),

            // Select Vehicle
            _buildSectionHeader('Select Vehicle'),
            const SizedBox(height: 8),
            _buildVehicleSelection(),
            const SizedBox(height: 24),

            // Select Service Type
            _buildSectionHeader('What do you need?'),
            const SizedBox(height: 8),
            _buildServiceTypeGrid(),
            const SizedBox(height: 32),

            // Request Button
            ElevatedButton(
              onPressed: _isRequesting ? null : _requestRsa,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isRequesting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.local_shipping),
                        SizedBox(width: 8),
                        Text('Request RSA Now', style: TextStyle(fontSize: 16)),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationCard() {
    return Card(
      color: Colors.green[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const Icon(Icons.location_on, color: Colors.green, size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Location detected',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'Lat: ${_lat.toStringAsFixed(4)}, Lng: ${_lng.toStringAsFixed(4)}',
                    style: TextStyle(color: Colors.grey[600], fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: Theme.of(
        context,
      ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
    );
  }

  Widget _buildVehicleSelection() {
    return Card(
      child: Column(
        children: widget.vehicles.map((vehicle) {
          final isSelected = _selectedVehicleId == vehicle['id'];
          return RadioListTile<String>(
            title: Text(
              vehicle['regNumber'] ?? 'Unknown',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Text(
              '${vehicle['make'] ?? ''} ${vehicle['model'] ?? ''}'.trim(),
            ),
            value: vehicle['id'],
            groupValue: _selectedVehicleId,
            onChanged: (value) => setState(() => _selectedVehicleId = value),
            secondary: Icon(
              Icons.directions_car,
              color: isSelected
                  ? Theme.of(context).colorScheme.primary
                  : Colors.grey,
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildServiceTypeGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 1.3,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: _serviceTypes.length,
      itemBuilder: (context, index) {
        final service = _serviceTypes[index];
        final isSelected = _selectedServiceType == service['id'];

        return Card(
          elevation: isSelected ? 4 : 1,
          color: isSelected
              ? Theme.of(context).colorScheme.primaryContainer
              : null,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: isSelected
                ? BorderSide(
                    color: Theme.of(context).colorScheme.primary,
                    width: 2,
                  )
                : BorderSide.none,
          ),
          child: InkWell(
            onTap: () => setState(() => _selectedServiceType = service['id']),
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    service['icon'],
                    size: 32,
                    color: isSelected
                        ? Theme.of(context).colorScheme.primary
                        : Colors.grey[600],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    service['name'],
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: isSelected
                          ? Theme.of(context).colorScheme.primary
                          : null,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

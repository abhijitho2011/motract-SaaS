import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';

class VehicleDatabaseScreen extends ConsumerStatefulWidget {
  const VehicleDatabaseScreen({super.key});

  @override
  ConsumerState<VehicleDatabaseScreen> createState() =>
      _VehicleDatabaseScreenState();
}

class _VehicleDatabaseScreenState extends ConsumerState<VehicleDatabaseScreen> {
  List<dynamic> _vehicles = [];
  List<dynamic> _filteredVehicles = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadVehicles();
  }

  Future<void> _loadVehicles() async {
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get('/vehicle/all');
      final vehicles = response.data as List<dynamic>;
      setState(() {
        _vehicles = vehicles;
        _filteredVehicles = vehicles;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading vehicles: $e')));
      }
    }
  }

  void _filterVehicles(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredVehicles = _vehicles;
      } else {
        _filteredVehicles = _vehicles.where((v) {
          final regNumber = (v['regNumber'] ?? '').toString().toLowerCase();
          final make = (v['variant']?['model']?['make']?['name'] ?? '')
              .toString()
              .toLowerCase();
          final model = (v['variant']?['model']?['name'] ?? '')
              .toString()
              .toLowerCase();
          final q = query.toLowerCase();
          return regNumber.contains(q) || make.contains(q) || model.contains(q);
        }).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Vehicle Database'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadVehicles,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                labelText: 'Search by Reg No, Make, or Model',
                prefixIcon: const Icon(Icons.search),
                border: const OutlineInputBorder(),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _filterVehicles('');
                        },
                      )
                    : null,
              ),
              onChanged: _filterVehicles,
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredVehicles.isEmpty
                ? const Center(child: Text('No vehicles found'))
                : ListView.builder(
                    itemCount: _filteredVehicles.length,
                    itemBuilder: (context, index) {
                      final v = _filteredVehicles[index];
                      return _buildVehicleCard(v);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleCard(Map<String, dynamic> v) {
    final make = v['variant']?['model']?['make']?['name'] ?? 'N/A';
    final model = v['variant']?['model']?['name'] ?? 'N/A';
    final variant = v['variant']?['name'] ?? 'N/A';
    final engineNumber = v['engineNumber'] ?? 'N/A';
    final vin = v['vin'] ?? 'N/A';
    final pollutionExpiry = v['pollutionExpiryDate'];
    final insuranceExpiry = v['insuranceExpiryDate'];

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ExpansionTile(
        leading: const CircleAvatar(child: Icon(Icons.directions_car)),
        title: Text(
          v['regNumber'] ?? 'No Reg',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        subtitle: Text('$make $model $variant'),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _detailRow('Make', make),
                _detailRow('Model', model),
                _detailRow('Variant', variant),
                _detailRow('Engine Number', engineNumber),
                _detailRow('VIN', vin),
                const Divider(),
                _detailRow('Pollution Expiry', _formatDate(pollutionExpiry)),
                _detailRow('Insurance Expiry', _formatDate(insuranceExpiry)),
                const Gap(16),
                const Text(
                  'View Only - Contact Admin to edit vehicle details',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'Not Set';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd MMM yyyy').format(date);
    } catch (e) {
      return dateStr;
    }
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

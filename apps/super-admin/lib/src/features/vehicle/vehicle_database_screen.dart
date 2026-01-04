import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/api/api_client.dart';
import 'package:gap/gap.dart';

class VehicleDatabaseScreen extends StatefulWidget {
  const VehicleDatabaseScreen({super.key});

  @override
  State<VehicleDatabaseScreen> createState() => _VehicleDatabaseScreenState();
}

class _VehicleDatabaseScreenState extends State<VehicleDatabaseScreen> {
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
      final vehicles = await ApiClient.getAllVehicles();
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
    final workshop = v['workshop']?['businessName'] ?? 'Unknown Workshop';
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
                _detailRow('Workshop', workshop),
                const Divider(),
                _detailRow('Pollution Expiry', _formatDate(pollutionExpiry)),
                _detailRow('Insurance Expiry', _formatDate(insuranceExpiry)),
                const Gap(16),
                Row(
                  children: [
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: () => _showEditDialog(v),
                        icon: const Icon(Icons.edit),
                        label: const Text('Edit'),
                      ),
                    ),
                    const Gap(8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _showServiceHistory(v),
                        icon: const Icon(Icons.history),
                        label: const Text('Service History'),
                      ),
                    ),
                  ],
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

  void _showEditDialog(Map<String, dynamic> vehicle) {
    final regController = TextEditingController(
      text: vehicle['regNumber'] ?? '',
    );
    final engineController = TextEditingController(
      text: vehicle['engineNumber'] ?? '',
    );
    final vinController = TextEditingController(text: vehicle['vin'] ?? '');
    DateTime? pollutionDate = vehicle['pollutionExpiryDate'] != null
        ? DateTime.tryParse(vehicle['pollutionExpiryDate'])
        : null;
    DateTime? insuranceDate = vehicle['insuranceExpiryDate'] != null
        ? DateTime.tryParse(vehicle['insuranceExpiryDate'])
        : null;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text('Edit Vehicle'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: regController,
                  decoration: const InputDecoration(
                    labelText: 'Registration Number',
                    border: OutlineInputBorder(),
                  ),
                ),
                const Gap(12),
                TextField(
                  controller: engineController,
                  decoration: const InputDecoration(
                    labelText: 'Engine Number',
                    border: OutlineInputBorder(),
                  ),
                ),
                const Gap(12),
                TextField(
                  controller: vinController,
                  decoration: const InputDecoration(
                    labelText: 'VIN',
                    border: OutlineInputBorder(),
                  ),
                ),
                const Gap(12),
                ListTile(
                  title: const Text('Pollution Expiry'),
                  subtitle: Text(
                    pollutionDate != null
                        ? DateFormat('dd MMM yyyy').format(pollutionDate!)
                        : 'Not Set',
                  ),
                  trailing: const Icon(Icons.calendar_today),
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: pollutionDate ?? DateTime.now(),
                      firstDate: DateTime(2020),
                      lastDate: DateTime(2100),
                    );
                    if (picked != null) {
                      setDialogState(() => pollutionDate = picked);
                    }
                  },
                ),
                ListTile(
                  title: const Text('Insurance Expiry'),
                  subtitle: Text(
                    insuranceDate != null
                        ? DateFormat('dd MMM yyyy').format(insuranceDate!)
                        : 'Not Set',
                  ),
                  trailing: const Icon(Icons.calendar_today),
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: insuranceDate ?? DateTime.now(),
                      firstDate: DateTime(2020),
                      lastDate: DateTime(2100),
                    );
                    if (picked != null) {
                      setDialogState(() => insuranceDate = picked);
                    }
                  },
                ),
                const Gap(8),
                const Text(
                  'Note: Make/Model changes require variant selection in Workshop App.',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                Navigator.pop(context);
                await _updateVehicle(
                  vehicle['id'],
                  regController.text,
                  engineController.text,
                  vinController.text,
                  pollutionDate,
                  insuranceDate,
                );
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _updateVehicle(
    String id,
    String regNumber,
    String engineNumber,
    String vin,
    DateTime? pollutionDate,
    DateTime? insuranceDate,
  ) async {
    try {
      await ApiClient.updateVehicle(id, {
        'regNumber': regNumber,
        'engineNumber': engineNumber,
        'vin': vin,
        if (pollutionDate != null)
          'pollutionExpiryDate': pollutionDate.toIso8601String(),
        if (insuranceDate != null)
          'insuranceExpiryDate': insuranceDate.toIso8601String(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Vehicle updated successfully!')),
        );
      }
      _loadVehicles();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error updating vehicle: $e')));
      }
    }
  }

  void _showServiceHistory(Map<String, dynamic> vehicle) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => ServiceHistorySheet(
        vehicleId: vehicle['id'],
        regNumber: vehicle['regNumber'],
      ),
    );
  }
}

class ServiceHistorySheet extends StatefulWidget {
  final String vehicleId;
  final String regNumber;

  const ServiceHistorySheet({
    super.key,
    required this.vehicleId,
    required this.regNumber,
  });

  @override
  State<ServiceHistorySheet> createState() => _ServiceHistorySheetState();
}

class _ServiceHistorySheetState extends State<ServiceHistorySheet> {
  List<dynamic> _invoices = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    try {
      final invoices = await ApiClient.getVehicleServiceHistory(
        widget.vehicleId,
      );
      setState(() {
        _invoices = invoices;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Text(
              'Service History: ${widget.regNumber}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const Gap(16),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _invoices.isEmpty
                  ? const Center(child: Text('No service history found'))
                  : ListView.builder(
                      controller: scrollController,
                      itemCount: _invoices.length,
                      itemBuilder: (context, index) {
                        final inv = _invoices[index];
                        return Card(
                          child: ListTile(
                            leading: const CircleAvatar(
                              child: Icon(Icons.receipt),
                            ),
                            title: Text(inv['invoiceNumber'] ?? 'Invoice'),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Workshop: ${inv['workshopName'] ?? 'Unknown'}',
                                ),
                                Text(
                                  'Job Card: ${inv['jobCardNumber'] ?? 'N/A'}',
                                ),
                                Text(
                                  'Total: ₹${(inv['grandTotal'] as num?)?.toStringAsFixed(2) ?? '0.00'}',
                                ),
                              ],
                            ),
                            trailing: Text(
                              _formatDate(inv['createdAt']),
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd/MM/yy').format(date);
    } catch (e) {
      return dateStr;
    }
  }
}

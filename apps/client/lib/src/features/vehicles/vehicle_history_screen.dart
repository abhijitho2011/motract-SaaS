import 'package:flutter/material.dart';
import 'package:client/src/core/api/api_client.dart';

class VehicleHistoryScreen extends StatefulWidget {
  final String vehicleId;
  final String? regNumber;

  const VehicleHistoryScreen({
    super.key,
    required this.vehicleId,
    this.regNumber,
  });

  @override
  State<VehicleHistoryScreen> createState() => _VehicleHistoryScreenState();
}

class _VehicleHistoryScreenState extends State<VehicleHistoryScreen> {
  final _api = ClientApi();
  List<dynamic> _history = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() => _isLoading = true);
    try {
      final history = await _api.getVehicleHistory(widget.vehicleId);
      if (mounted) {
        setState(() {
          _history = history;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('History: ${widget.regNumber ?? "Vehicle"}')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _history.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.history, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  const Text('No service history found'),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadHistory,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _history.length,
                itemBuilder: (context, index) {
                  final record = _history[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: _getTypeColor(
                          record['performedBy'],
                        ).withOpacity(0.2),
                        child: Icon(
                          _getTypeIcon(record['performedBy']),
                          color: _getTypeColor(record['performedBy']),
                        ),
                      ),
                      title: Text(
                        record['serviceType'] ?? 'Service',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (record['workshopName'] != null)
                            Text('Workshop: ${record['workshopName']}'),
                          if (record['rsaProviderName'] != null)
                            Text('RSA: ${record['rsaProviderName']}'),
                          Text(
                            record['serviceDate']?.toString().split('T')[0] ??
                                '',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                      isThreeLine: true,
                    ),
                  );
                },
              ),
            ),
    );
  }

  IconData _getTypeIcon(String? performedBy) {
    switch (performedBy) {
      case 'RSA':
        return Icons.local_shipping;
      case 'WORKSHOP':
        return Icons.build;
      default:
        return Icons.history;
    }
  }

  Color _getTypeColor(String? performedBy) {
    switch (performedBy) {
      case 'RSA':
        return Colors.orange;
      case 'WORKSHOP':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }
}

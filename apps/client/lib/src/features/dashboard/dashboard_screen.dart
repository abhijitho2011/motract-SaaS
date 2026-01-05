import 'package:flutter/material.dart';
import 'package:client/src/core/api/api_client.dart';
import 'package:client/src/features/auth/login_screen.dart';
import 'package:client/src/features/vehicles/add_vehicle_screen.dart';
import 'package:client/src/features/vehicles/vehicle_history_screen.dart';
import 'package:client/src/features/booking/enhanced_book_service_screen.dart';
import 'package:client/src/features/rsa/request_rsa_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _api = ClientApi();
  List<dynamic> _vehicles = [];
  List<dynamic> _bookings = [];
  bool _isLoading = true;
  String? _userName;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      _userName = prefs.getString('user_name');

      await _api.loadToken();
      final vehicles = await _api.getMyVehicles();
      final bookings = await _api.getMyBookings();

      if (mounted) {
        setState(() {
          _vehicles = vehicles;
          _bookings = bookings;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading data: $e')));
      }
    }
  }

  Future<void> _logout() async {
    await _api.clearToken();
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Dashboard'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadData),
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'logout') _logout();
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout, color: Colors.red),
                    SizedBox(width: 8),
                    Text('Logout'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Quick Actions
                    _buildQuickActions(),
                    const SizedBox(height: 24),

                    // My Vehicles Section
                    _buildSectionHeader('My Vehicles', onAdd: _addVehicle),
                    const SizedBox(height: 12),
                    _buildVehiclesList(),
                    const SizedBox(height: 24),

                    // Recent Bookings Section
                    _buildSectionHeader('Recent Bookings'),
                    const SizedBox(height: 12),
                    _buildBookingsList(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        Expanded(
          child: _ActionCard(
            icon: Icons.build,
            title: 'Book Service',
            color: Colors.blue,
            onTap: _vehicles.isEmpty ? null : () => _bookService(),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _ActionCard(
            icon: Icons.local_shipping,
            title: 'Request RSA',
            color: Colors.orange,
            onTap: _vehicles.isEmpty ? null : () => _requestRSA(),
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title, {VoidCallback? onAdd}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
        if (onAdd != null)
          TextButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add),
            label: const Text('Add'),
          ),
      ],
    );
  }

  Widget _buildVehiclesList() {
    if (_vehicles.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            children: [
              Icon(Icons.directions_car, size: 48, color: Colors.grey[400]),
              const SizedBox(height: 16),
              const Text('No vehicles added yet'),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _addVehicle,
                icon: const Icon(Icons.add),
                label: const Text('Add Your First Vehicle'),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: _vehicles.map((vehicle) {
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Theme.of(context).colorScheme.primaryContainer,
              child: Icon(
                Icons.directions_car,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            title: Text(
              vehicle['regNumber'] ?? 'Unknown',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Text(
              '${vehicle['make'] ?? ''} ${vehicle['model'] ?? ''} ${vehicle['variant'] ?? ''}'
                  .trim(),
            ),
            trailing: PopupMenuButton<String>(
              onSelected: (value) {
                if (value == 'history') {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => VehicleHistoryScreen(
                        vehicleId: vehicle['id'],
                        regNumber: vehicle['regNumber'],
                      ),
                    ),
                  );
                } else if (value == 'book') {
                  _bookService(vehicleId: vehicle['id']);
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'history',
                  child: Row(
                    children: [
                      Icon(Icons.history),
                      SizedBox(width: 8),
                      Text('Service History'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'book',
                  child: Row(
                    children: [
                      Icon(Icons.build),
                      SizedBox(width: 8),
                      Text('Book Service'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildBookingsList() {
    if (_bookings.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            children: [
              Icon(Icons.event_note, size: 48, color: Colors.grey[400]),
              const SizedBox(height: 16),
              const Text('No bookings yet'),
            ],
          ),
        ),
      );
    }

    return Column(
      children: _bookings.take(3).map((booking) {
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: _getStatusColor(
                booking['status'],
              ).withOpacity(0.2),
              child: Icon(
                Icons.event,
                color: _getStatusColor(booking['status']),
              ),
            ),
            title: Text(booking['workshopName'] ?? 'Unknown Workshop'),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(booking['vehicleRegNumber'] ?? ''),
                Text(
                  '${booking['bookingDate']?.toString().split('T')[0] ?? ''} at ${booking['slotTime'] ?? ''}',
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ],
            ),
            trailing: Chip(
              label: Text(
                booking['status'] ?? 'PENDING',
                style: TextStyle(
                  color: _getStatusColor(booking['status']),
                  fontSize: 12,
                ),
              ),
              backgroundColor: _getStatusColor(
                booking['status'],
              ).withOpacity(0.1),
            ),
            isThreeLine: true,
          ),
        );
      }).toList(),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'CONFIRMED':
        return Colors.green;
      case 'PENDING':
        return Colors.orange;
      case 'CANCELLED':
        return Colors.red;
      case 'COMPLETED':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  void _addVehicle() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const AddVehicleScreen()),
    );
    if (result == true) {
      _loadData();
    }
  }

  void _bookService({String? vehicleId}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => EnhancedBookServiceScreen(vehicles: _vehicles),
      ),
    ).then((_) => _loadData());
  }

  void _requestRSA() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => RequestRsaScreen(vehicles: _vehicles)),
    ).then((_) => _loadData());
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;
  final VoidCallback? onTap;

  const _ActionCard({
    required this.icon,
    required this.title,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 32, color: color),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: onTap == null ? Colors.grey : null,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

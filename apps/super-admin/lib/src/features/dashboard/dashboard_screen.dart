import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../core/api/api_client.dart';
import '../partners/partners_screen.dart';
import '../vehicle/vehicle_database_screen.dart';
import '../map/map_view_screen.dart';
import '../settings/partner_settings_screen.dart';
import '../bookings/bookings_screen.dart';
import '../../core/theme/theme_controller.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? _stats;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final stats = await ApiClient.getDashboardStats();

      setState(() {
        _stats = stats;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Super Admin Dashboard'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadStats),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: Colors.blue),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'Motract',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Gap(8),
                  Text(
                    'Super Admin Panel',
                    style: TextStyle(color: Colors.white70, fontSize: 16),
                  ),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.dashboard),
              title: const Text('Dashboard'),
              selected: true,
              onTap: () {
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.business),
              title: const Text('Partners'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const PartnersScreen(),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.directions_car),
              title: const Text('Vehicle Database'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const VehicleDatabaseScreen(),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.map),
              title: const Text('Map View'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const MapViewScreen(),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.settings),
              title: const Text('Partner Settings'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const PartnerSettingsScreen(),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.book_online),
              title: const Text('Bookings'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const BookingsScreen(),
                  ),
                );
              },
            ),
            const Divider(),
            SwitchListTile(
              title: const Text('Night Mode'),
              secondary: const Icon(Icons.dark_mode),
              value: ThemeController.instance.value == ThemeMode.dark,
              onChanged: (val) {
                ThemeController.instance.toggle();
              },
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error, size: 64, color: Colors.red),
                  const Gap(16),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text('Error: $_error', textAlign: TextAlign.center),
                  ),
                  const Gap(16),
                  FilledButton(
                    onPressed: _loadStats,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : _buildDashboard(),
    );
  }

  Widget _buildDashboard() {
    if (_stats == null) return const SizedBox();

    final byType = _stats!['byType'] as Map<String, dynamic>? ?? {};
    final bookings = _stats!['bookings'] as Map<String, dynamic>? ?? {};

    return RefreshIndicator(
      onRefresh: _loadStats,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Overview', style: Theme.of(context).textTheme.headlineMedium),
            const Gap(24),
            // Stats cards
            LayoutBuilder(
              builder: (context, constraints) {
                final crossAxisCount = constraints.maxWidth > 1200 ? 4 : 2;
                return GridView.count(
                  crossAxisCount: crossAxisCount,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 2,
                  children: [
                    _buildStatCard(
                      'Total Organizations',
                      '${_stats!['totalOrganizations'] ?? 0}',
                      Icons.business,
                      Colors.blue,
                    ),
                    _buildStatCard(
                      'Workshops',
                      '${byType['workshop'] ?? 0}',
                      Icons.build,
                      Colors.orange,
                    ),
                    _buildStatCard(
                      'RSA Providers',
                      '${byType['rsa'] ?? 0}',
                      Icons.local_shipping,
                      Colors.red,
                    ),
                    _buildStatCard(
                      'Suppliers',
                      '${byType['supplier'] ?? 0}',
                      Icons.inventory,
                      Colors.green,
                    ),
                    _buildStatCard(
                      'Rebuild Centers',
                      '${byType['rebuildCenter'] ?? 0}',
                      Icons.settings,
                      Colors.purple,
                    ),
                    _buildStatCard(
                      'Authorized',
                      '${_stats!['authorized'] ?? 0}',
                      Icons.verified,
                      Colors.teal,
                    ),
                    _buildStatCard(
                      'Active',
                      '${_stats!['active'] ?? 0}',
                      Icons.check_circle,
                      Colors.lightGreen,
                    ),
                    _buildStatCard(
                      'Total Bookings',
                      '${bookings['total'] ?? 0}',
                      Icons.book_online,
                      Colors.indigo,
                    ),
                  ],
                );
              },
            ),
            const Gap(32),
            Text(
              'Bookings Status',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const Gap(16),
            LayoutBuilder(
              builder: (context, constraints) {
                return Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        'Pending',
                        '${bookings['pending'] ?? 0}',
                        Icons.pending,
                        Colors.amber,
                      ),
                    ),
                    const Gap(16),
                    Expanded(
                      child: _buildStatCard(
                        'Confirmed',
                        '${bookings['confirmed'] ?? 0}',
                        Icons.check,
                        Colors.blue,
                      ),
                    ),
                    const Gap(16),
                    Expanded(
                      child: _buildStatCard(
                        'Completed',
                        '${bookings['completed'] ?? 0}',
                        Icons.done_all,
                        Colors.green,
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: color, size: 32),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
            Text(
              title,
              style: const TextStyle(fontSize: 14, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}

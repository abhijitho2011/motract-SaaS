import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import 'package:gap/gap.dart';

class VehicleDatabaseScreen extends StatefulWidget {
  const VehicleDatabaseScreen({super.key});

  @override
  State<VehicleDatabaseScreen> createState() => _VehicleDatabaseScreenState();
}

class _VehicleDatabaseScreenState extends State<VehicleDatabaseScreen> {
  List<dynamic> _makes = [];
  List<dynamic> _filteredMakes = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadMakes();
  }

  Future<void> _loadMakes() async {
    try {
      final makes = await ApiClient.getMakes();
      setState(() {
        _makes = makes;
        _filteredMakes = makes;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      // Handle error cleanly
    }
  }

  void _filterMakes(String query) {
    setState(() {
      _filteredMakes = _makes
          .where(
            (make) => make['name'].toString().toLowerCase().contains(
              query.toLowerCase(),
            ),
          )
          .toList();
    });
  }

  void _openSettings() {
    // Placeholder for "Vehicle Database Settings"
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Vehicle Database Settings',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const Gap(16),
            ListTile(
              leading: const Icon(Icons.download),
              title: const Text('Export Data'),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.upload),
              title: const Text('Import Data'),
              onTap: () {},
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Vehicle Database'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: _openSettings,
            tooltip: 'Settings',
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Search Makes',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: _filterMakes,
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredMakes.isEmpty
                ? const Center(child: Text('No vehicles found'))
                : ListView.builder(
                    itemCount: _filteredMakes.length,
                    itemBuilder: (context, index) {
                      final make = _filteredMakes[index];
                      return ListTile(
                        leading: const CircleAvatar(
                          child: Icon(Icons.directions_car),
                        ),
                        title: Text(make['name'] ?? 'Unknown'),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () {
                          // Navigate to Models
                          // Navigator.push(...)
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add Make
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}

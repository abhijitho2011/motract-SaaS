import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../core/api/api_client.dart';
import 'create_organization_screen.dart';
import 'organization_details_screen.dart';

class OrganizationsScreen extends StatefulWidget {
  const OrganizationsScreen({super.key});

  @override
  State<OrganizationsScreen> createState() => _OrganizationsScreenState();
}

class _OrganizationsScreenState extends State<OrganizationsScreen> {
  List<dynamic> _organizations = [];
  bool _isLoading = true;
  String? _error;
  String? _selectedCategory;
  bool? _filterAuthorized;
  bool? _filterActive;
  String _searchQuery = '';

  final List<String> _categories = [
    'All',
    'WORKSHOP',
    'SUPPLIER',
    'RSA',
    'REBUILD_CENTER',
  ];

  @override
  void initState() {
    super.initState();
    _loadOrganizations();
  }

  Future<void> _loadOrganizations() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final orgs = await ApiClient.getOrganizations(
        accountType: _selectedCategory == 'All' ? null : _selectedCategory,
        isAuthorized: _filterAuthorized,
        isActive: _filterActive,
      );

      setState(() {
        _organizations = orgs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  List<dynamic> get _filteredOrganizations {
    if (_searchQuery.isEmpty) return _organizations;
    return _organizations.where((org) {
      final name = (org['businessName'] ?? org['name'] ?? '')
          .toString()
          .toLowerCase();
      final email = (org['email'] ?? '').toString().toLowerCase();
      final query = _searchQuery.toLowerCase();
      return name.contains(query) || email.contains(query);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Organizations'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadOrganizations,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const CreateOrganizationScreen(),
            ),
          );
          if (result == true) {
            _loadOrganizations();
          }
        },
        icon: const Icon(Icons.add),
        label: const Text('Add Organization'),
      ),
      body: Column(
        children: [
          // Filters
          Container(
            padding: const EdgeInsets.all(16),
            color: Theme.of(context).colorScheme.surfaceVariant,
            child: Column(
              children: [
                // Search
                TextField(
                  decoration: const InputDecoration(
                    hintText: 'Search by name or email',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value;
                    });
                  },
                ),
                const Gap(12),
                // Filter chips
                Wrap(
                  spacing: 8,
                  children: [
                    DropdownButton<String>(
                      value: _selectedCategory ?? 'All',
                      items: _categories.map((cat) {
                        return DropdownMenuItem(value: cat, child: Text(cat));
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedCategory = value == 'All' ? null : value;
                        });
                        _loadOrganizations();
                      },
                    ),
                    const Gap(8),
                    FilterChip(
                      label: const Text('Authorized'),
                      selected: _filterAuthorized == true,
                      onSelected: (selected) {
                        setState(() {
                          _filterAuthorized = selected ? true : null;
                        });
                        _loadOrganizations();
                      },
                    ),
                    FilterChip(
                      label: const Text('Active'),
                      selected: _filterActive == true,
                      onSelected: (selected) {
                        setState(() {
                          _filterActive = selected ? true : null;
                        });
                        _loadOrganizations();
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
          // List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error, size: 64, color: Colors.red),
                        const Gap(16),
                        Text('Error: $_error'),
                        const Gap(16),
                        FilledButton(
                          onPressed: _loadOrganizations,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : _filteredOrganizations.isEmpty
                ? const Center(child: Text('No organizations found'))
                : RefreshIndicator(
                    onRefresh: _loadOrganizations,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _filteredOrganizations.length,
                      itemBuilder: (context, index) {
                        final org = _filteredOrganizations[index];
                        return _buildOrganizationCard(org);
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrganizationCard(Map<String, dynamic> org) {
    final accountType = org['accountType'] ?? '';
    final isAuthorized = org['isAuthorized'] == true;
    final isActive = org['isActive'] == true;

    Color categoryColor = Colors.blue;
    IconData categoryIcon = Icons.business;

    switch (accountType) {
      case 'WORKSHOP':
        categoryColor = Colors.orange;
        categoryIcon = Icons.build;
        break;
      case 'RSA':
        categoryColor = Colors.red;
        categoryIcon = Icons.local_shipping;
        break;
      case 'SUPPLIER':
        categoryColor = Colors.green;
        categoryIcon = Icons.inventory;
        break;
      case 'REBUILD_CENTER':
        categoryColor = Colors.purple;
        categoryIcon = Icons.settings;
        break;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: categoryColor.withOpacity(0.2),
          child: Icon(categoryIcon, color: categoryColor),
        ),
        title: Text(
          org['businessName'] ?? org['name'] ?? 'Unknown',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Gap(4),
            Text(org['email'] ?? ''),
            Text(org['phone'] ?? ''),
            const Gap(4),
            Wrap(
              spacing: 4,
              children: [
                Chip(
                  label: Text(accountType),
                  backgroundColor: categoryColor.withOpacity(0.2),
                  labelStyle: TextStyle(color: categoryColor, fontSize: 12),
                ),
                if (org['subCategory'] != null)
                  Chip(
                    label: Text(org['subCategory']),
                    labelStyle: const TextStyle(fontSize: 12),
                  ),
                if (isAuthorized)
                  const Chip(
                    label: Text('Authorized'),
                    backgroundColor: Colors.green,
                    labelStyle: TextStyle(color: Colors.white, fontSize: 12),
                  ),
                if (!isActive)
                  const Chip(
                    label: Text('Inactive'),
                    backgroundColor: Colors.grey,
                    labelStyle: TextStyle(color: Colors.white, fontSize: 12),
                  ),
              ],
            ),
          ],
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  OrganizationDetailsScreen(organizationId: org['id']),
            ),
          );
          if (result == true) {
            _loadOrganizations();
          }
        },
      ),
    );
  }
}

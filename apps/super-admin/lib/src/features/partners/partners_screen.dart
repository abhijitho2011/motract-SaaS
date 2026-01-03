import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../core/api/api_client.dart';
import 'create_partner_screen.dart';
import 'partner_details_screen.dart';

class PartnersScreen extends StatefulWidget {
  const PartnersScreen({super.key});

  @override
  State<PartnersScreen> createState() => _PartnersScreenState();
}

class _PartnersScreenState extends State<PartnersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final Map<String, List<dynamic>> _partnersByCategory = {
    'WORKSHOP': [],
    'SUPPLIER': [],
    'RSA': [],
    'REBUILD_CENTER': [],
  };

  bool _isLoading = true;
  String? _error;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadPartners();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadPartners() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final partners = await ApiClient.getOrganizations();

      // Group by category
      final grouped = {
        'WORKSHOP': <dynamic>[],
        'SUPPLIER': <dynamic>[],
        'RSA': <dynamic>[],
        'REBUILD_CENTER': <dynamic>[],
      };

      for (final partner in partners) {
        String category = (partner['accountType'] ?? '')
            .toString()
            .toUpperCase();

        // Handle variations just in case
        if (category.contains('WORKSHOP'))
          category = 'WORKSHOP';
        else if (category.contains('SUPPLIER'))
          category = 'SUPPLIER';
        else if (category.contains('RSA'))
          category = 'RSA';
        else if (category.contains('REBUILD'))
          category = 'REBUILD_CENTER';

        if (grouped.containsKey(category)) {
          grouped[category]!.add(partner);
        }
      }

      setState(() {
        _partnersByCategory.addAll(grouped);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  String get _currentCategory {
    switch (_tabController.index) {
      case 0:
        return 'WORKSHOP';
      case 1:
        return 'SUPPLIER';
      case 2:
        return 'RSA';
      case 3:
        return 'REBUILD_CENTER';
      default:
        return 'WORKSHOP';
    }
  }

  List<dynamic> get _currentPartners {
    final partners = _partnersByCategory[_currentCategory] ?? [];
    if (_searchQuery.isEmpty) return partners;

    return partners.where((partner) {
      final name = (partner['businessName'] ?? partner['name'] ?? '')
          .toString()
          .toLowerCase();
      final email = (partner['email'] ?? '').toString().toLowerCase();
      final phone = (partner['phone'] ?? '').toString().toLowerCase();
      final query = _searchQuery.toLowerCase();
      return name.contains(query) ||
          email.contains(query) ||
          phone.contains(query);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Partners'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Workshop'),
            Tab(text: 'Suppliers'),
            Tab(text: 'RSA'),
            Tab(text: 'Rebuild Centers'),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadPartners),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  CreatePartnerScreen(initialCategory: _currentCategory),
            ),
          );
          if (result == true) {
            _loadPartners();
          }
        },
        icon: const Icon(Icons.add),
        label: const Text('Add Partner'),
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Search by name, email, or phone',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
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
                          onPressed: _loadPartners,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildPartnerList('WORKSHOP'),
                      _buildPartnerList('SUPPLIER'),
                      _buildPartnerList('RSA'),
                      _buildPartnerList('REBUILD_CENTER'),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildPartnerList(String category) {
    final partners = _currentPartners;

    if (partners.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.business_outlined, size: 64, color: Colors.grey[400]),
            const Gap(16),
            Text(
              'No ${_getCategoryDisplayName(category)} partners yet',
              style: TextStyle(color: Colors.grey[600]),
            ),
            const Gap(8),
            Text(
              'Tap the + button to add one',
              style: TextStyle(color: Colors.grey[500], fontSize: 14),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadPartners,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: partners.length,
        itemBuilder: (context, index) {
          final partner = partners[index];
          return _buildPartnerCard(partner);
        },
      ),
    );
  }

  String _getCategoryDisplayName(String category) {
    switch (category) {
      case 'WORKSHOP':
        return 'Workshop';
      case 'SUPPLIER':
        return 'Supplier';
      case 'RSA':
        return 'RSA';
      case 'REBUILD_CENTER':
        return 'Rebuild Center';
      default:
        return category;
    }
  }

  Widget _buildPartnerCard(Map<String, dynamic> partner) {
    final accountType = partner['accountType'] ?? '';
    final isAuthorized = partner['isAuthorized'] == true;
    final isActive = partner['isActive'] == true;

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
          partner['businessName'] ?? partner['name'] ?? 'Unknown',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Gap(4),
            if (partner['phone'] != null)
              Row(
                children: [
                  const Icon(Icons.phone, size: 14),
                  const Gap(4),
                  Text(partner['phone']),
                ],
              ),
            if (partner['email'] != null) ...[
              const Gap(2),
              Row(
                children: [
                  const Icon(Icons.email, size: 14),
                  const Gap(4),
                  Text(partner['email']),
                ],
              ),
            ],
            const Gap(4),
            Wrap(
              spacing: 4,
              children: [
                if (partner['subCategory'] != null)
                  ...(partner['subCategory'] as String)
                      .split(',')
                      .map((e) => e.trim())
                      .where((e) => e.isNotEmpty)
                      .map(
                        (sub) => Chip(
                          label: Text(sub),
                          labelStyle: const TextStyle(fontSize: 11),
                        ),
                      ),
                if (isAuthorized)
                  const Chip(
                    label: Text('Authorized'),
                    backgroundColor: Colors.green,
                    labelStyle: TextStyle(color: Colors.white, fontSize: 11),
                  ),
                if (!isActive)
                  const Chip(
                    label: Text('Inactive'),
                    backgroundColor: Colors.grey,
                    labelStyle: TextStyle(color: Colors.white, fontSize: 11),
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
                  PartnerDetailsScreen(partnerId: partner['id']),
            ),
          );
          if (result == true) {
            _loadPartners();
          }
        },
      ),
    );
  }
}

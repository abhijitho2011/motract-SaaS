import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../core/api/api_client.dart';

class PartnerDetailsScreen extends StatefulWidget {
  final String partnerId;

  const PartnerDetailsScreen({super.key, required this.partnerId});

  @override
  State<PartnerDetailsScreen> createState() => _PartnerDetailsScreenState();
}

class _PartnerDetailsScreenState extends State<PartnerDetailsScreen> {
  Map<String, dynamic>? _partner;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPartner();
  }

  Future<void> _loadPartner() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final partner = await ApiClient.getOrganization(widget.partnerId);

      setState(() {
        _partner = partner;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _deletePartner() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Partner'),
        content: const Text(
          'Are you sure you want to delete this Partner? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      await ApiClient.deleteOrganization(widget.partnerId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Partner deleted successfully')),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Partner Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete, color: Colors.red),
            onPressed: _deletePartner,
          ),
        ],
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
                  Text('Error: $_error'),
                  const Gap(16),
                  FilledButton(
                    onPressed: _loadPartner,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : _buildDetails(),
    );
  }

  Widget _buildDetails() {
    if (_partner == null) return const SizedBox();

    final org = _partner!;
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

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: categoryColor.withOpacity(0.2),
                    child: Icon(categoryIcon, color: categoryColor, size: 40),
                  ),
                  const Gap(20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          org['businessName'] ?? org['name'] ?? 'Unknown',
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const Gap(8),
                        Wrap(
                          spacing: 8,
                          children: [
                            Chip(
                              label: Text(accountType),
                              backgroundColor: categoryColor.withOpacity(0.2),
                              labelStyle: TextStyle(color: categoryColor),
                            ),
                            if (org['subCategory'] != null)
                              ...(org['subCategory'] as String)
                                  .split(',')
                                  .map((e) => e.trim())
                                  .where((e) => e.isNotEmpty)
                                  .map((sub) => Chip(label: Text(sub))),
                            if (isAuthorized)
                              const Chip(
                                label: Text('Authorized'),
                                backgroundColor: Colors.green,
                                labelStyle: TextStyle(color: Colors.white),
                              ),
                            if (!isActive)
                              const Chip(
                                label: Text('Inactive'),
                                backgroundColor: Colors.grey,
                                labelStyle: TextStyle(color: Colors.white),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const Gap(24),

          // Contact Information
          Text(
            'Contact Information',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const Gap(12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildDetailRow(Icons.email, 'Email', org['email'] ?? 'N/A'),
                  const Divider(),
                  _buildDetailRow(Icons.phone, 'Phone', org['phone'] ?? 'N/A'),
                  const Divider(),
                  _buildDetailRow(
                    Icons.location_on,
                    'Address',
                    org['address'] ?? 'N/A',
                  ),
                  if (org['city'] != null) ...[
                    const Divider(),
                    _buildDetailRow(Icons.location_city, 'City', org['city']),
                  ],
                  if (org['state'] != null) ...[
                    const Divider(),
                    _buildDetailRow(Icons.map, 'State', org['state']),
                  ],
                  if (org['pincode'] != null) ...[
                    const Divider(),
                    _buildDetailRow(Icons.pin_drop, 'Pincode', org['pincode']),
                  ],
                  if (org['gstin'] != null) ...[
                    const Divider(),
                    _buildDetailRow(Icons.receipt, 'GSTIN', org['gstin']),
                  ],
                ],
              ),
            ),
          ),
          const Gap(24),

          // Location
          if (org['latitude'] != null && org['longitude'] != null) ...[
            Text('Location', style: Theme.of(context).textTheme.titleLarge),
            const Gap(12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildDetailRow(
                      Icons.location_on,
                      'Coordinates',
                      '${org['latitude']}, ${org['longitude']}',
                    ),
                  ],
                ),
              ),
            ),
            const Gap(24),
          ],

          // Metadata
          Text('Metadata', style: Theme.of(context).textTheme.titleLarge),
          const Gap(12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildDetailRow(Icons.badge, 'ID', org['id'] ?? 'N/A'),
                  const Divider(),
                  _buildDetailRow(
                    Icons.person,
                    'Created By',
                    org['createdBy'] ?? 'N/A',
                  ),
                  const Divider(),
                  _buildDetailRow(
                    Icons.calendar_today,
                    'Created At',
                    org['createdAt'] ?? 'N/A',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Colors.grey),
          const Gap(12),
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}

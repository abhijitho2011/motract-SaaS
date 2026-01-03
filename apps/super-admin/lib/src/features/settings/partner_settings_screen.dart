import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../core/api/api_client.dart';

class PartnerSettingsScreen extends StatefulWidget {
  const PartnerSettingsScreen({super.key});

  @override
  State<PartnerSettingsScreen> createState() => _PartnerSettingsScreenState();
}

class _PartnerSettingsScreenState extends State<PartnerSettingsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final Map<String, List<String>> _subCategories = {
    'WORKSHOP': [
      'General Workshop',
      'Wheel Alignment',
      'Water Wash',
      'Battery Service',
      'AC Service',
      'Denting & Painting',
    ],
    'SUPPLIER': ['Parts Supplier', 'Accessories Supplier', 'Tire Supplier'],
    'RSA': [
      'Recovery Truck',
      'Mobile Mechanic',
      'Mobile Waterwash',
      'Mobile Battery Service',
      'Mobile Wheel Repair',
      'Puncture Repair',
    ],
    'REBUILD_CENTER': [
      'Engine Rebuild',
      'Transmission Rebuild',
      'General Rebuild',
    ],
  };

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
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

  String _getCategoryDisplayName(String category) {
    switch (category) {
      case 'WORKSHOP':
        return 'Workshop';
      case 'SUPPLIER':
        return 'Supplier';
      case 'RSA':
        return 'RSA';
      case 'REBUILD_CENTER':
        return 'Rebuild Centers';
      default:
        return category;
    }
  }

  Future<void> _addSubCategory() async {
    final nameController = TextEditingController();

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Add ${_getCategoryDisplayName(_currentCategory)} Sub-Category',
        ),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(
            labelText: 'Sub-Category Name',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              if (nameController.text.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please enter a name')),
                );
                return;
              }
              setState(() {
                _subCategories[_currentCategory]!.add(nameController.text);
              });
              Navigator.pop(context, true);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );

    if (result == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sub-category added successfully')),
      );
    }
  }

  Future<void> _editSubCategory(int index, String currentName) async {
    final nameController = TextEditingController(text: currentName);

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Sub-Category'),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(
            labelText: 'Sub-Category Name',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              if (nameController.text.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please enter a name')),
                );
                return;
              }
              setState(() {
                _subCategories[_currentCategory]![index] = nameController.text;
              });
              Navigator.pop(context, true);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );

    if (result == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sub-category updated successfully')),
      );
    }
  }

  Future<void> _deleteSubCategory(int index, String name) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Sub-Category'),
        content: Text('Are you sure you want to delete "$name"?'),
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

    if (confirmed == true) {
      setState(() {
        _subCategories[_currentCategory]!.removeAt(index);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sub-category deleted successfully')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Partner Settings - Category Management'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Workshop'),
            Tab(text: 'Supplier'),
            Tab(text: 'RSA'),
            Tab(text: 'Rebuild Centers'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addSubCategory,
        icon: const Icon(Icons.add),
        label: const Text('Add Sub-Category'),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildSubCategoryList('WORKSHOP'),
          _buildSubCategoryList('SUPPLIER'),
          _buildSubCategoryList('RSA'),
          _buildSubCategoryList('REBUILD_CENTER'),
        ],
      ),
    );
  }

  Widget _buildSubCategoryList(String category) {
    final subCats = _subCategories[category] ?? [];

    if (subCats.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.category_outlined, size: 64, color: Colors.grey[400]),
            const Gap(16),
            Text(
              'No sub-categories for ${_getCategoryDisplayName(category)} yet',
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

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: subCats.length,
      itemBuilder: (context, index) {
        final subCat = subCats[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: const CircleAvatar(
              child: Icon(Icons.subdirectory_arrow_right),
            ),
            title: Text(
              subCat,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Text(_getCategoryDisplayName(category)),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.edit, color: Colors.blue),
                  onPressed: () => _editSubCategory(index, subCat),
                ),
                IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () => _deleteSubCategory(index, subCat),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

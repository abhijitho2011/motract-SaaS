import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../core/api/api_client.dart';

class CategorySettingsScreen extends StatefulWidget {
  const CategorySettingsScreen({super.key});

  @override
  State<CategorySettingsScreen> createState() => _CategorySettingsScreenState();
}

class _CategorySettingsScreenState extends State<CategorySettingsScreen> {
  List<dynamic> _categories = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final categories = await ApiClient.getCategories();

      setState(() {
        _categories = categories;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _showAddCategoryDialog() async {
    final nameController = TextEditingController();
    final descController = TextEditingController();
    bool canHaveSubCategories = false;

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add Category'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Name',
                  border: OutlineInputBorder(),
                ),
              ),
              const Gap(16),
              TextField(
                controller: descController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
              const Gap(16),
              CheckboxListTile(
                title: const Text('Can have sub-categories'),
                value: canHaveSubCategories,
                onChanged: (value) {
                  setDialogState(() {
                    canHaveSubCategories = value ?? false;
                  });
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                if (nameController.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please enter name')),
                  );
                  return;
                }

                try {
                  await ApiClient.createCategory({
                    'name': nameController.text,
                    'description': descController.text.isEmpty
                        ? null
                        : descController.text,
                    'canHaveSubCategories': canHaveSubCategories,
                  });
                  if (context.mounted) {
                    Navigator.pop(context, true);
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(
                      context,
                    ).showSnackBar(SnackBar(content: Text('Error: $e')));
                  }
                }
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );

    if (result == true) {
      _loadCategories();
    }
  }

  Future<void> _showSubCategories(
    String categoryId,
    String categoryName,
  ) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SubCategoriesScreen(
          categoryId: categoryId,
          categoryName: categoryName,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Category Settings'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadCategories,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddCategoryDialog,
        icon: const Icon(Icons.add),
        label: const Text('Add Category'),
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
                    onPressed: _loadCategories,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : _categories.isEmpty
          ? const Center(child: Text('No categories found'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final category = _categories[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: const CircleAvatar(child: Icon(Icons.category)),
                    title: Text(
                      category['name'] ?? 'Unknown',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (category['description'] != null) ...[
                          const Gap(4),
                          Text(category['description']),
                        ],
                        const Gap(4),
                        if (category['canHaveSubCategories'] == true)
                          const Chip(
                            label: Text('Has Sub-Categories'),
                            labelStyle: TextStyle(fontSize: 12),
                          ),
                      ],
                    ),
                    trailing: category['canHaveSubCategories'] == true
                        ? const Icon(Icons.chevron_right)
                        : null,
                    onTap: category['canHaveSubCategories'] == true
                        ? () => _showSubCategories(
                            category['id'],
                            category['name'],
                          )
                        : null,
                  ),
                );
              },
            ),
    );
  }
}

// Sub-Categories Screen
class SubCategoriesScreen extends StatefulWidget {
  final String categoryId;
  final String categoryName;

  const SubCategoriesScreen({
    super.key,
    required this.categoryId,
    required this.categoryName,
  });

  @override
  State<SubCategoriesScreen> createState() => _SubCategoriesScreenState();
}

class _SubCategoriesScreenState extends State<SubCategoriesScreen> {
  List<dynamic> _subCategories = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSubCategories();
  }

  Future<void> _loadSubCategories() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final subs = await ApiClient.getSubCategories(widget.categoryId);

      setState(() {
        _subCategories = subs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _showAddSubCategoryDialog() async {
    final nameController = TextEditingController();
    final descController = TextEditingController();

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Sub-Category'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Name',
                border: OutlineInputBorder(),
              ),
            ),
            const Gap(16),
            TextField(
              controller: descController,
              decoration: const InputDecoration(
                labelText: 'Description',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              if (nameController.text.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please enter name')),
                );
                return;
              }

              try {
                await ApiClient.createSubCategory(widget.categoryId, {
                  'name': nameController.text,
                  'description': descController.text.isEmpty
                      ? null
                      : descController.text,
                });
                if (context.mounted) {
                  Navigator.pop(context, true);
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text('Error: $e')));
                }
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );

    if (result == true) {
      _loadSubCategories();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${widget.categoryName} - Sub-Categories')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddSubCategoryDialog,
        icon: const Icon(Icons.add),
        label: const Text('Add Sub-Category'),
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
                    onPressed: _loadSubCategories,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : _subCategories.isEmpty
          ? const Center(child: Text('No sub-categories found'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _subCategories.length,
              itemBuilder: (context, index) {
                final sub = _subCategories[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: const Icon(Icons.subdirectory_arrow_right),
                    title: Text(
                      sub['name'] ?? 'Unknown',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: sub['description'] != null
                        ? Text(sub['description'])
                        : null,
                  ),
                );
              },
            ),
    );
  }
}

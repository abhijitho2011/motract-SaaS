import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/features/settings/data/masters_api.dart';

class InventorySettingsScreen extends ConsumerStatefulWidget {
  const InventorySettingsScreen({super.key});

  @override
  ConsumerState<InventorySettingsScreen> createState() =>
      _InventorySettingsScreenState();
}

class _InventorySettingsScreenState
    extends ConsumerState<InventorySettingsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Inventory Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionCard(
            title: 'Brands',
            icon: Icons.branding_watermark,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const BrandManagementScreen()),
            ),
          ),
          const Gap(12),
          _buildSectionCard(
            title: 'Vehicle Makes',
            icon: Icons.directions_car,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const MakeManagementScreen()),
            ),
          ),
          const Gap(12),
          _buildSectionCard(
            title: 'Categories',
            icon: Icons.category,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const CategoryManagementScreen(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Card(
      child: ListTile(
        leading: Icon(icon, size: 32),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}

// Brand Management Screen
class BrandManagementScreen extends ConsumerStatefulWidget {
  const BrandManagementScreen({super.key});

  @override
  ConsumerState<BrandManagementScreen> createState() =>
      _BrandManagementScreenState();
}

class _BrandManagementScreenState extends ConsumerState<BrandManagementScreen> {
  List<dynamic> _brands = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadBrands();
  }

  Future<void> _loadBrands() async {
    try {
      final api = ref.read(inventoryMastersApiProvider);
      final brands = await api.getBrands();
      setState(() {
        _brands = brands;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading brands: $e')));
      }
    }
  }

  Future<void> _addBrand() async {
    final controller = TextEditingController();
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Brand'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(labelText: 'Brand Name'),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Add'),
          ),
        ],
      ),
    );

    if (result == true && controller.text.isNotEmpty) {
      try {
        final api = ref.read(inventoryMastersApiProvider);
        await api.createBrand(controller.text);
        _loadBrands();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Brand added successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manage Brands')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _brands.isEmpty
          ? const Center(child: Text('No brands added yet'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _brands.length,
              itemBuilder: (context, index) {
                final brand = _brands[index];
                return Card(
                  child: ListTile(
                    leading: const Icon(Icons.branding_watermark),
                    title: Text(brand['name']),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addBrand,
        child: const Icon(Icons.add),
      ),
    );
  }
}

// Category Management Screen
class CategoryManagementScreen extends ConsumerStatefulWidget {
  const CategoryManagementScreen({super.key});

  @override
  ConsumerState<CategoryManagementScreen> createState() =>
      _CategoryManagementScreenState();
}

class _CategoryManagementScreenState
    extends ConsumerState<CategoryManagementScreen> {
  List<dynamic> _categories = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    try {
      final api = ref.read(inventoryMastersApiProvider);
      final categories = await api.getCategories();
      setState(() {
        _categories = categories;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _addCategory() async {
    final controller = TextEditingController();
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Category'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(labelText: 'Category Name'),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Add'),
          ),
        ],
      ),
    );

    if (result == true && controller.text.isNotEmpty) {
      try {
        final api = ref.read(inventoryMastersApiProvider);
        await api.createCategory(controller.text);
        _loadCategories();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Category added successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      }
    }
  }

  Future<void> _manageSubCategories(dynamic category) async {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SubCategoryManagementScreen(category: category),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manage Categories')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _categories.isEmpty
          ? const Center(child: Text('No categories added yet'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final category = _categories[index];
                return Card(
                  child: ListTile(
                    leading: const Icon(Icons.category),
                    title: Text(category['name']),
                    trailing: IconButton(
                      icon: const Icon(Icons.arrow_forward),
                      onPressed: () => _manageSubCategories(category),
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addCategory,
        child: const Icon(Icons.add),
      ),
    );
  }
}

// Sub-Category Management Screen
class SubCategoryManagementScreen extends ConsumerStatefulWidget {
  final dynamic category;
  const SubCategoryManagementScreen({super.key, required this.category});

  @override
  ConsumerState<SubCategoryManagementScreen> createState() =>
      _SubCategoryManagementScreenState();
}

class _SubCategoryManagementScreenState
    extends ConsumerState<SubCategoryManagementScreen> {
  List<dynamic> _subCategories = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSubCategories();
  }

  Future<void> _loadSubCategories() async {
    try {
      final api = ref.read(inventoryMastersApiProvider);
      final subs = await api.getSubCategories(widget.category['id']);
      setState(() {
        _subCategories = subs;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _addSubCategory() async {
    final controller = TextEditingController();
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Sub-Category'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(labelText: 'Sub-Category Name'),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Add'),
          ),
        ],
      ),
    );

    if (result == true && controller.text.isNotEmpty) {
      try {
        final api = ref.read(inventoryMastersApiProvider);
        await api.createSubCategory(widget.category['id'], controller.text);
        _loadSubCategories();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Sub-category added successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.category['name']} - Sub-Categories'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _subCategories.isEmpty
          ? const Center(child: Text('No sub-categories added yet'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _subCategories.length,
              itemBuilder: (context, index) {
                final sub = _subCategories[index];
                return Card(
                  child: ListTile(
                    leading: const Icon(Icons.subdirectory_arrow_right),
                    title: Text(sub['name']),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addSubCategory,
        child: const Icon(Icons.add),
      ),
    );
  }
}

// Make Management Screen
class MakeManagementScreen extends ConsumerStatefulWidget {
  const MakeManagementScreen({super.key});

  @override
  ConsumerState<MakeManagementScreen> createState() =>
      _MakeManagementScreenState();
}

class _MakeManagementScreenState extends ConsumerState<MakeManagementScreen> {
  List<dynamic> _makes = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadMakes();
  }

  Future<void> _loadMakes() async {
    try {
      final api = ref.read(vehicleMastersApiProvider);
      final makes = await api.getMakes();
      setState(() {
        _makes = makes;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _addMake() async {
    final controller = TextEditingController();
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Make'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Make Name (e.g., BMW, Audi)',
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Add'),
          ),
        ],
      ),
    );

    if (result == true && controller.text.isNotEmpty) {
      try {
        final api = ref.read(vehicleMastersApiProvider);
        await api.createMake(controller.text);
        _loadMakes();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Make added successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      }
    }
  }

  Future<void> _manageModels(dynamic make) async {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => ModelManagementScreen(make: make)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manage Makes')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _makes.isEmpty
          ? const Center(child: Text('No makes added yet'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _makes.length,
              itemBuilder: (context, index) {
                final make = _makes[index];
                return Card(
                  child: ListTile(
                    leading: const Icon(Icons.directions_car),
                    title: Text(make['name']),
                    trailing: IconButton(
                      icon: const Icon(Icons.arrow_forward),
                      onPressed: () => _manageModels(make),
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addMake,
        child: const Icon(Icons.add),
      ),
    );
  }
}

// Model Management Screen (similar pattern)
class ModelManagementScreen extends ConsumerStatefulWidget {
  final dynamic make;
  const ModelManagementScreen({super.key, required this.make});

  @override
  ConsumerState<ModelManagementScreen> createState() =>
      _ModelManagementScreenState();
}

class _ModelManagementScreenState extends ConsumerState<ModelManagementScreen> {
  List<dynamic> _models = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadModels();
  }

  Future<void> _loadModels() async {
    try {
      final api = ref.read(vehicleMastersApiProvider);
      final models = await api.getModels(widget.make['id']);
      setState(() {
        _models = models;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _addModel() async {
    final controller = TextEditingController();
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Add Model for ${widget.make['name']}'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Model Name (e.g., 3 Series, A4)',
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Add'),
          ),
        ],
      ),
    );

    if (result == true && controller.text.isNotEmpty) {
      try {
        final api = ref.read(vehicleMastersApiProvider);
        await api.createModel(widget.make['id'], controller.text);
        _loadModels();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Model added successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      }
    }
  }

  Future<void> _manageVariants(dynamic model) async {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => VariantManagementScreen(model: model)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${widget.make['name']} - Models')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _models.isEmpty
          ? const Center(child: Text('No models added yet'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _models.length,
              itemBuilder: (context, index) {
                final model = _models[index];
                return Card(
                  child: ListTile(
                    leading: const Icon(Icons.car_rental),
                    title: Text(model['name']),
                    trailing: IconButton(
                      icon: const Icon(Icons.arrow_forward),
                      onPressed: () => _manageVariants(model),
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addModel,
        child: const Icon(Icons.add),
      ),
    );
  }
}

// Variant Management Screen
class VariantManagementScreen extends ConsumerStatefulWidget {
  final dynamic model;
  const VariantManagementScreen({super.key, required this.model});

  @override
  ConsumerState<VariantManagementScreen> createState() =>
      _VariantManagementScreenState();
}

class _VariantManagementScreenState
    extends ConsumerState<VariantManagementScreen> {
  List<dynamic> _variants = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadVariants();
  }

  Future<void> _loadVariants() async {
    try {
      final api = ref.read(vehicleMastersApiProvider);
      final variants = await api.getVariants(widget.model['id']);
      setState(() {
        _variants = variants;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _addVariant() async {
    final nameController = TextEditingController();
    String selectedFuelType = 'PETROL';

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text('Add Variant for ${widget.model['name']}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Variant Name (e.g., F30 330D)',
                ),
                autofocus: true,
              ),
              const Gap(16),
              DropdownButtonFormField<String>(
                value: selectedFuelType,
                decoration: const InputDecoration(labelText: 'Fuel Type'),
                items: const [
                  DropdownMenuItem(value: 'PETROL', child: Text('Petrol')),
                  DropdownMenuItem(value: 'DIESEL', child: Text('Diesel')),
                  DropdownMenuItem(value: 'CNG', child: Text('CNG')),
                  DropdownMenuItem(value: 'ELECTRIC', child: Text('Electric')),
                  DropdownMenuItem(value: 'HYBRID', child: Text('Hybrid')),
                ],
                onChanged: (value) {
                  setState(() => selectedFuelType = value!);
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
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );

    if (result == true && nameController.text.isNotEmpty) {
      try {
        final api = ref.read(vehicleMastersApiProvider);
        await api.createVariant(
          widget.model['id'],
          nameController.text,
          selectedFuelType,
        );
        _loadVariants();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Variant added successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${widget.model['name']} - Variants')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _variants.isEmpty
          ? const Center(child: Text('No variants added yet'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _variants.length,
              itemBuilder: (context, index) {
                final variant = _variants[index];
                return Card(
                  child: ListTile(
                    leading: const Icon(Icons.settings),
                    title: Text(variant['name']),
                    subtitle: Text(variant['fuelType']),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addVariant,
        child: const Icon(Icons.add),
      ),
    );
  }
}

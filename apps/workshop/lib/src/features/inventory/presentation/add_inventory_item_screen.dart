import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:workshop/src/features/settings/data/masters_api.dart';
import 'package:workshop/src/features/inventory/data/inventory_repository.dart';
import 'package:workshop/src/core/providers/workshop_provider.dart';

class AddInventoryItemScreen extends ConsumerStatefulWidget {
  const AddInventoryItemScreen({super.key});

  @override
  ConsumerState<AddInventoryItemScreen> createState() =>
      _AddInventoryItemScreenState();
}

class _AddInventoryItemScreenState
    extends ConsumerState<AddInventoryItemScreen> {
  final _formKey = GlobalKey<FormState>();

  // Controllers
  final _nameController = TextEditingController();
  final _hsnController = TextEditingController();
  final _taxController = TextEditingController(text: '18');
  final _purchasePriceController = TextEditingController();
  final _salePriceController = TextEditingController();
  final _quantityController = TextEditingController();

  // SKU Management
  final List<TextEditingController> _skuControllers = [TextEditingController()];

  // Master Data
  List<dynamic> _brands = [];
  List<dynamic> _makes = [];
  List<dynamic> _models = [];
  List<dynamic> _variants = [];
  List<dynamic> _categories = [];
  List<dynamic> _subCategories = [];

  // Selected Values
  String? _selectedBrandId;
  String? _selectedMakeId;
  String? _selectedModelId;
  String? _selectedVariantId;
  String? _selectedCategoryId;
  String? _selectedSubCategoryId;

  bool _isLoading = true;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadMasterData();
  }

  Future<void> _loadMasterData() async {
    try {
      final inventoryApi = ref.read(inventoryMastersApiProvider);
      final vehicleApi = ref.read(vehicleMastersApiProvider);

      final brands = await inventoryApi.getBrands();
      final makes = await vehicleApi.getMakes();
      final categories = await inventoryApi.getCategories();

      setState(() {
        _brands = brands;
        _makes = makes;
        _categories = categories;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading data: $e')));
      }
    }
  }

  Future<void> _loadModels(String makeId) async {
    try {
      final api = ref.read(vehicleMastersApiProvider);
      final models = await api.getModels(makeId);
      setState(() {
        _models = models;
        _selectedModelId = null;
        _variants = [];
        _selectedVariantId = null;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading models: $e')));
      }
    }
  }

  Future<void> _loadVariants(String modelId) async {
    try {
      final api = ref.read(vehicleMastersApiProvider);
      final variants = await api.getVariants(modelId);
      setState(() {
        _variants = variants;
        _selectedVariantId = null;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading variants: $e')));
      }
    }
  }

  Future<void> _loadSubCategories(String categoryId) async {
    try {
      final api = ref.read(inventoryMastersApiProvider);
      final subs = await api.getSubCategories(categoryId);
      setState(() {
        _subCategories = subs;
        _selectedSubCategoryId = null;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading sub-categories: $e')),
        );
      }
    }
  }

  void _addSkuField() {
    setState(() {
      _skuControllers.add(TextEditingController());
    });
  }

  void _removeSkuField(int index) {
    if (_skuControllers.length > 1) {
      setState(() {
        _skuControllers[index].dispose();
        _skuControllers.removeAt(index);
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedBrandId == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a brand')));
      return;
    }

    if (_selectedCategoryId == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a category')));
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final workshopId = ref.read(currentWorkshopIdProvider);
      final api = ref.read(inventoryApiProvider);

      // Get SKUs
      final partNumbers = _skuControllers
          .map((c) => c.text.trim())
          .where((s) => s.isNotEmpty)
          .toList();

      // Build payload
      final payload = {
        'workshopId': workshopId,
        'name': _nameController.text,
        'brand': _brands.firstWhere((b) => b['id'] == _selectedBrandId)['name'],
        'partNumbers': partNumbers,
        'categoryId': _selectedCategoryId,
        'subCategoryId': _selectedSubCategoryId,
        'hsnCode': _hsnController.text,
        'taxPercent': double.tryParse(_taxController.text) ?? 18.0,
        'reorderLevel': 10,
        if (_selectedVariantId != null)
          'compatibleVehicles': [
            {'modelId': _selectedModelId, 'variantId': _selectedVariantId},
          ],
        if (_quantityController.text.isNotEmpty)
          'initialStock': {
            'quantity': double.tryParse(_quantityController.text) ?? 0,
            'purchasePrice':
                double.tryParse(_purchasePriceController.text) ?? 0,
            'salePrice': double.tryParse(_salePriceController.text) ?? 0,
          },
      };

      await api.createItem(payload);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Item added successfully!')),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _hsnController.dispose();
    _taxController.dispose();
    _purchasePriceController.dispose();
    _salePriceController.dispose();
    _quantityController.dispose();
    for (var controller in _skuControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Add Inventory Item')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Inventory Item'),
        actions: [
          if (_isSubmitting)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Item Name
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Item Name *',
                border: OutlineInputBorder(),
              ),
              validator: (v) => v?.isEmpty ?? true ? 'Required' : null,
            ),
            const Gap(16),

            // SKU Section
            const Text(
              'Part Numbers (SKU)',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const Gap(8),
            ..._skuControllers.asMap().entries.map((entry) {
              final index = entry.key;
              final controller = entry.value;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: controller,
                        decoration: InputDecoration(
                          labelText: 'SKU ${index + 1}',
                          border: const OutlineInputBorder(),
                        ),
                        validator: (v) => index == 0 && (v?.isEmpty ?? true)
                            ? 'At least one SKU required'
                            : null,
                      ),
                    ),
                    if (_skuControllers.length > 1) ...[
                      const Gap(8),
                      IconButton(
                        icon: const Icon(
                          Icons.remove_circle,
                          color: Colors.red,
                        ),
                        onPressed: () => _removeSkuField(index),
                      ),
                    ],
                  ],
                ),
              );
            }),
            OutlinedButton.icon(
              onPressed: _addSkuField,
              icon: const Icon(Icons.add),
              label: const Text('Add Another SKU'),
            ),
            const Gap(16),

            // Brand Dropdown
            DropdownButtonFormField<String>(
              value: _selectedBrandId,
              decoration: const InputDecoration(
                labelText: 'Brand *',
                border: OutlineInputBorder(),
              ),
              items: _brands.map<DropdownMenuItem<String>>((brand) {
                return DropdownMenuItem<String>(
                  value: brand['id'],
                  child: Text(brand['name']),
                );
              }).toList(),
              onChanged: (value) => setState(() => _selectedBrandId = value),
              validator: (v) => v == null ? 'Required' : null,
            ),
            const Gap(16),

            // Make Dropdown
            DropdownButtonFormField<String>(
              value: _selectedMakeId,
              decoration: const InputDecoration(
                labelText: 'Vehicle Make (Optional)',
                border: OutlineInputBorder(),
              ),
              items: _makes.map<DropdownMenuItem<String>>((make) {
                return DropdownMenuItem<String>(
                  value: make['id'],
                  child: Text(make['name']),
                );
              }).toList(),
              onChanged: (value) {
                setState(() => _selectedMakeId = value);
                if (value != null) _loadModels(value);
              },
            ),
            const Gap(16),

            // Model Dropdown
            if (_selectedMakeId != null)
              DropdownButtonFormField<String>(
                value: _selectedModelId,
                decoration: const InputDecoration(
                  labelText: 'Model',
                  border: OutlineInputBorder(),
                ),
                items: _models.map<DropdownMenuItem<String>>((model) {
                  return DropdownMenuItem<String>(
                    value: model['id'],
                    child: Text(model['name']),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() => _selectedModelId = value);
                  if (value != null) _loadVariants(value);
                },
              ),
            if (_selectedMakeId != null) const Gap(16),

            // Variant Dropdown
            if (_selectedModelId != null)
              DropdownButtonFormField<String>(
                value: _selectedVariantId,
                decoration: const InputDecoration(
                  labelText: 'Variant',
                  border: OutlineInputBorder(),
                ),
                items: _variants.map<DropdownMenuItem<String>>((variant) {
                  return DropdownMenuItem<String>(
                    value: variant['id'],
                    child: Text('${variant['name']} (${variant['fuelType']})'),
                  );
                }).toList(),
                onChanged: (value) =>
                    setState(() => _selectedVariantId = value),
              ),
            if (_selectedModelId != null) const Gap(16),

            // Category Dropdown
            DropdownButtonFormField<String>(
              value: _selectedCategoryId,
              decoration: const InputDecoration(
                labelText: 'Category *',
                border: OutlineInputBorder(),
              ),
              items: _categories.map<DropdownMenuItem<String>>((cat) {
                return DropdownMenuItem<String>(
                  value: cat['id'],
                  child: Text(cat['name']),
                );
              }).toList(),
              onChanged: (value) {
                setState(() => _selectedCategoryId = value);
                if (value != null) _loadSubCategories(value);
              },
              validator: (v) => v == null ? 'Required' : null,
            ),
            const Gap(16),

            // Sub-Category Dropdown
            if (_selectedCategoryId != null)
              DropdownButtonFormField<String>(
                value: _selectedSubCategoryId,
                decoration: const InputDecoration(
                  labelText: 'Sub-Category',
                  border: OutlineInputBorder(),
                ),
                items: _subCategories.map<DropdownMenuItem<String>>((sub) {
                  return DropdownMenuItem<String>(
                    value: sub['id'],
                    child: Text(sub['name']),
                  );
                }).toList(),
                onChanged: (value) =>
                    setState(() => _selectedSubCategoryId = value),
              ),
            if (_selectedCategoryId != null) const Gap(16),

            // HS Code
            TextFormField(
              controller: _hsnController,
              decoration: const InputDecoration(
                labelText: 'HS Code',
                border: OutlineInputBorder(),
              ),
            ),
            const Gap(16),

            // Tax %
            TextFormField(
              controller: _taxController,
              decoration: const InputDecoration(
                labelText: 'Tax % *',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              validator: (v) => v?.isEmpty ?? true ? 'Required' : null,
            ),
            const Gap(16),

            const Divider(),
            const Text(
              'Initial Stock (Optional)',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const Gap(8),

            // Quantity
            TextFormField(
              controller: _quantityController,
              decoration: const InputDecoration(
                labelText: 'Quantity',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const Gap(16),

            // Purchase Price
            TextFormField(
              controller: _purchasePriceController,
              decoration: const InputDecoration(
                labelText: 'Purchase Price (incl. tax)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const Gap(16),

            // Sale Price
            TextFormField(
              controller: _salePriceController,
              decoration: const InputDecoration(
                labelText: 'Sale Price (incl. tax)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const Gap(32),

            // Submit Button
            FilledButton(
              onPressed: _isSubmitting ? null : _submit,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(_isSubmitting ? 'Saving...' : 'Add Item'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

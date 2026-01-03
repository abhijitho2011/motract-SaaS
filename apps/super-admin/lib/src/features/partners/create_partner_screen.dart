import 'package:flutter/material.dart';
import 'package:gap/gap.dart';

import '../../core/api/api_client.dart';

class CreatePartnerScreen extends StatefulWidget {
  final String initialCategory;

  const CreatePartnerScreen({super.key, required this.initialCategory});

  @override
  State<CreatePartnerScreen> createState() => _CreatePartnerScreenState();
}

class _CreatePartnerScreenState extends State<CreatePartnerScreen> {
  final _formKey = GlobalKey<FormState>();
  final _companyNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _gstController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  late String _selectedCategory;
  final Set<String> _selectedSubCategories = {};
  double? _latitude;
  double? _longitude;
  bool _isSubmitting = false;

  final List<String> _categories = [
    'WORKSHOP',
    'SUPPLIER',
    'RSA',
    'REBUILD_CENTER',
  ];
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
    _selectedCategory = widget.initialCategory;
  }

  @override
  void dispose() {
    _companyNameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _gstController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    // Check location for non-RSA partners
    if (_selectedCategory != 'RSA' &&
        (_latitude == null || _longitude == null)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter valid latitude & longitude'),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      // Generate email from company name and phone
      final email =
          '${_companyNameController.text.toLowerCase().replaceAll(' ', '_')}_${_phoneController.text}@motract.com';

      await ApiClient.createOrganization({
        'accountType': _selectedCategory,
        'subCategory': _selectedSubCategories.isNotEmpty
            ? _selectedSubCategories.join(', ')
            : null,
        'businessName': _companyNameController.text,
        'email': email,
        'phone': _phoneController.text,
        'address': _addressController.text,
        'gstin': _gstController.text.isEmpty ? null : _gstController.text,
        'latitude': _latitude,
        'longitude': _longitude,
        'isAuthorized': _selectedCategory == 'RSA' ? true : false,
        'createdBy': 'super-admin-1',
        'adminUser': {
          'name': _companyNameController.text,
          'email': email,
          'password': _passwordController.text,
        },
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Partner added successfully')),
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
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Partner')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            // Category
            DropdownButtonFormField<String>(
              value: _selectedCategory,
              decoration: const InputDecoration(
                labelText: 'Category *',
                border: OutlineInputBorder(),
              ),
              items: _categories.map((cat) {
                return DropdownMenuItem(
                  value: cat,
                  child: Text(_getCategoryDisplayName(cat)),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedCategory = value!;
                  _selectedSubCategories.clear();
                });
              },
            ),
            const Gap(16),

            // Sub-category
            // Sub-category (Toggle Buttons)
            if (_subCategories.containsKey(_selectedCategory))
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Services (Select multiple)',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const Gap(8),
                  Wrap(
                    spacing: 8.0,
                    runSpacing: 4.0,
                    children: _subCategories[_selectedCategory]!.map((sub) {
                      final isSelected = _selectedSubCategories.contains(sub);
                      return FilterChip(
                        label: Text(sub),
                        selected: isSelected,
                        onSelected: (bool selected) {
                          setState(() {
                            if (selected) {
                              _selectedSubCategories.add(sub);
                            } else {
                              _selectedSubCategories.remove(sub);
                            }
                          });
                        },
                      );
                    }).toList(),
                  ),
                  const Gap(16),
                ],
              ),

            // Company Name
            TextFormField(
              controller: _companyNameController,
              decoration: const InputDecoration(
                labelText: 'Company Name *',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter company name';
                }
                return null;
              },
            ),
            const Gap(16),

            // Phone
            TextFormField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Phone Number *',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.phone,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter phone number';
                }
                return null;
              },
            ),
            const Gap(16),

            // Address
            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(
                labelText: 'Address *',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter address';
                }
                return null;
              },
            ),
            const Gap(16),

            // GST (Optional)
            TextFormField(
              controller: _gstController,
              decoration: const InputDecoration(
                labelText: 'GST Number (Optional)',
                border: OutlineInputBorder(),
              ),
            ),
            const Gap(16),

            // Latitude & Longitude (Manual Entry)
            if (_selectedCategory != 'RSA')
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Latitude *',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      onChanged: (value) {
                        _latitude = double.tryParse(value);
                      },
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Required';
                        }
                        if (double.tryParse(value) == null) {
                          return 'Invalid';
                        }
                        return null;
                      },
                    ),
                  ),
                  const Gap(16),
                  Expanded(
                    child: TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Longitude *',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      onChanged: (value) {
                        _longitude = double.tryParse(value);
                      },
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Required';
                        }
                        if (double.tryParse(value) == null) {
                          return 'Invalid';
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),

            if (_selectedCategory != 'RSA') const Gap(16),

            // Password
            TextFormField(
              controller: _passwordController,
              decoration: const InputDecoration(
                labelText: 'Password *',
                border: OutlineInputBorder(),
              ),
              obscureText: true,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter password';
                }
                if (value.length < 6) {
                  return 'Password must be at least 6 characters';
                }
                return null;
              },
            ),
            const Gap(16),

            // Confirm Password
            TextFormField(
              controller: _confirmPasswordController,
              decoration: const InputDecoration(
                labelText: 'Confirm Password *',
                border: OutlineInputBorder(),
              ),
              obscureText: true,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please confirm password';
                }
                if (value != _passwordController.text) {
                  return 'Passwords do not match';
                }
                return null;
              },
            ),
            const Gap(32),

            // Submit Button
            FilledButton(
              onPressed: _isSubmitting ? null : _submit,
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Add Partner'),
            ),
          ],
        ),
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
}

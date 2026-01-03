import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../core/api/api_client.dart';

class CreateOrganizationScreen extends StatefulWidget {
  const CreateOrganizationScreen({super.key});

  @override
  State<CreateOrganizationScreen> createState() =>
      _CreateOrganizationScreenState();
}

class _CreateOrganizationScreenState extends State<CreateOrganizationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _businessNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _pincodeController = TextEditingController();
  final _gstinController = TextEditingController();
  final _adminNameController = TextEditingController();
  final _adminEmailController = TextEditingController();
  final _adminPasswordController = TextEditingController();

  String _selectedCategory = 'WORKSHOP';
  String? _selectedSubCategory;
  bool _isAuthorized = false;
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
    'RSA': [
      'Recovery Truck',
      'Mobile Mechanic',
      'Mobile Waterwash',
      'Mobile Battery Service',
      'Mobile Wheel Repair',
      'Puncture Repair',
    ],
  };

  @override
  void dispose() {
    _businessNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    _gstinController.dispose();
    _adminNameController.dispose();
    _adminEmailController.dispose();
    _adminPasswordController.dispose();
    super.dispose();
  }

  Future<void> _pickLocation() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => MapPickerScreen(
          initialLatitude: _latitude ?? 12.9716,
          initialLongitude: _longitude ?? 77.5946,
        ),
      ),
    );

    if (result != null) {
      setState(() {
        _latitude = result['latitude'];
        _longitude = result['longitude'];
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_latitude == null || _longitude == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select location on map')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await ApiClient.createOrganization({
        'accountType': _selectedCategory,
        'subCategory': _selectedSubCategory,
        'businessName': _businessNameController.text,
        'email': _emailController.text,
        'phone': _phoneController.text,
        'address': _addressController.text,
        'city': _cityController.text.isEmpty ? null : _cityController.text,
        'state': _stateController.text.isEmpty ? null : _stateController.text,
        'pincode': _pincodeController.text.isEmpty
            ? null
            : _pincodeController.text,
        'gstin': _gstinController.text.isEmpty ? null : _gstinController.text,
        'latitude': _latitude,
        'longitude': _longitude,
        'isAuthorized': _selectedCategory == 'RSA' ? true : _isAuthorized,
        'createdBy': 'super-admin-1', // TODO: Get from auth
        'adminUser': {
          'name': _adminNameController.text,
          'email': _adminEmailController.text,
          'password': _adminPasswordController.text,
        },
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Organization created successfully')),
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
      appBar: AppBar(title: const Text('Create Organization')),
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
                return DropdownMenuItem(value: cat, child: Text(cat));
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedCategory = value!;
                  _selectedSubCategory = null;
                  if (_selectedCategory == 'RSA') {
                    _isAuthorized = true;
                  }
                });
              },
            ),
            const Gap(16),

            // Sub-category (if applicable)
            if (_subCategories.containsKey(_selectedCategory))
              Column(
                children: [
                  DropdownButtonFormField<String>(
                    value: _selectedSubCategory,
                    decoration: const InputDecoration(
                      labelText: 'Sub-Category',
                      border: OutlineInputBorder(),
                    ),
                    items: _subCategories[_selectedCategory]!.map((sub) {
                      return DropdownMenuItem(value: sub, child: Text(sub));
                    }).toList(),
                    onChanged: (value) {
                      setState(() => _selectedSubCategory = value);
                    },
                  ),
                  const Gap(16),
                ],
              ),

            // Business Name
            TextFormField(
              controller: _businessNameController,
              decoration: const InputDecoration(
                labelText: 'Business Name *',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter business name';
                }
                return null;
              },
            ),
            const Gap(16),

            // Email
            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email *',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter email';
                }
                if (!value.contains('@')) {
                  return 'Please enter valid email';
                }
                return null;
              },
            ),
            const Gap(16),

            // Phone
            TextFormField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Phone *',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.phone,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter phone';
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

            // City, State, Pincode
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _cityController,
                    decoration: const InputDecoration(
                      labelText: 'City',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const Gap(12),
                Expanded(
                  child: TextFormField(
                    controller: _stateController,
                    decoration: const InputDecoration(
                      labelText: 'State',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const Gap(12),
                Expanded(
                  child: TextFormField(
                    controller: _pincodeController,
                    decoration: const InputDecoration(
                      labelText: 'Pincode',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            const Gap(16),

            // GSTIN
            TextFormField(
              controller: _gstinController,
              decoration: const InputDecoration(
                labelText: 'GSTIN (Optional)',
                border: OutlineInputBorder(),
              ),
            ),
            const Gap(16),

            // Location Picker
            OutlinedButton.icon(
              onPressed: _pickLocation,
              icon: const Icon(Icons.location_on),
              label: Text(
                _latitude != null && _longitude != null
                    ? 'Location: ${_latitude!.toStringAsFixed(4)}, ${_longitude!.toStringAsFixed(4)}'
                    : 'Pick Location on Map *',
              ),
            ),
            const Gap(16),

            // Authorized Toggle (disabled for RSA)
            SwitchListTile(
              title: const Text('Authorized'),
              subtitle: _selectedCategory == 'RSA'
                  ? const Text('RSA is always authorized')
                  : null,
              value: _isAuthorized,
              onChanged: _selectedCategory == 'RSA'
                  ? null
                  : (value) {
                      setState(() => _isAuthorized = value);
                    },
            ),
            const Gap(24),

            // Admin User Section
            Text(
              'Admin User Credentials',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const Gap(16),

            TextFormField(
              controller: _adminNameController,
              decoration: const InputDecoration(
                labelText: 'Admin Name *',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter admin name';
                }
                return null;
              },
            ),
            const Gap(16),

            TextFormField(
              controller: _adminEmailController,
              decoration: const InputDecoration(
                labelText: 'Admin Email *',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter admin email';
                }
                if (!value.contains('@')) {
                  return 'Please enter valid email';
                }
                return null;
              },
            ),
            const Gap(16),

            TextFormField(
              controller: _adminPasswordController,
              decoration: const InputDecoration(
                labelText: 'Admin Password *',
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
                  : const Text('Create Organization'),
            ),
          ],
        ),
      ),
    );
  }
}

// Simple Map Picker Screen
class MapPickerScreen extends StatefulWidget {
  final double initialLatitude;
  final double initialLongitude;

  const MapPickerScreen({
    super.key,
    required this.initialLatitude,
    required this.initialLongitude,
  });

  @override
  State<MapPickerScreen> createState() => _MapPickerScreenState();
}

class _MapPickerScreenState extends State<MapPickerScreen> {
  late LatLng _selectedLocation;
  GoogleMapController? _mapController;

  @override
  void initState() {
    super.initState();
    _selectedLocation = LatLng(widget.initialLatitude, widget.initialLongitude);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pick Location'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context, {
                'latitude': _selectedLocation.latitude,
                'longitude': _selectedLocation.longitude,
              });
            },
            child: const Text('DONE'),
          ),
        ],
      ),
      body: GoogleMap(
        initialCameraPosition: CameraPosition(
          target: _selectedLocation,
          zoom: 14,
        ),
        onMapCreated: (controller) {
          _mapController = controller;
        },
        onTap: (latLng) {
          setState(() {
            _selectedLocation = latLng;
          });
        },
        markers: {
          Marker(
            markerId: const MarkerId('selected'),
            position: _selectedLocation,
          ),
        },
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(16),
        color: Colors.white,
        child: Text(
          'Lat: ${_selectedLocation.latitude.toStringAsFixed(6)}, '
          'Lng: ${_selectedLocation.longitude.toStringAsFixed(6)}',
          style: const TextStyle(fontSize: 16),
        ),
      ),
    );
  }
}

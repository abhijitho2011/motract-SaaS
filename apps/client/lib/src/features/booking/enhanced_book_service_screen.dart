import 'package:flutter/material.dart';
import 'package:client/src/core/api/api_client.dart';
import 'package:intl/intl.dart';

class EnhancedBookServiceScreen extends StatefulWidget {
  final List<dynamic> vehicles;

  const EnhancedBookServiceScreen({super.key, required this.vehicles});

  @override
  State<EnhancedBookServiceScreen> createState() =>
      _EnhancedBookServiceScreenState();
}

class _EnhancedBookServiceScreenState extends State<EnhancedBookServiceScreen> {
  final _api = ClientApi();
  int _currentStep = 0;
  bool _isLoading = false;

  // Step 1: Service Category
  List<dynamic> _serviceCategories = [];
  String? _selectedCategoryId;
  String? _selectedCategoryName;

  // Step 2: Nearby Workshops
  List<dynamic> _nearbyWorkshops = [];
  String? _selectedWorkshopId;
  Map<String, dynamic>? _selectedWorkshop;

  // Step 3: Vehicle Selection
  String? _selectedVehicleId;

  // Step 4: Date and Slot
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  List<dynamic> _availableSlots = [];
  String? _selectedSlotTime;
  String? _selectedSlotId;

  // Step 5: Notes
  final _notesController = TextEditingController();

  // Service category icons
  final _categoryIcons = {
    'General Service': Icons.build_circle,
    'Water Wash': Icons.water_drop,
    'Wheel Alignment': Icons.tire_repair,
    'AC Service': Icons.ac_unit,
    'Engine Repair': Icons.engineering,
    'Battery': Icons.battery_charging_full,
    'Oil Change': Icons.oil_barrel,
    'Brake Service': Icons.pan_tool,
  };

  @override
  void initState() {
    super.initState();
    _loadServiceCategories();
  }

  Future<void> _loadServiceCategories() async {
    setState(() => _isLoading = true);
    try {
      final categories = await _api.getServiceCategories();
      setState(() {
        _serviceCategories = categories;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load categories: $e')),
        );
      }
    }
  }

  Future<void> _loadNearbyWorkshops() async {
    setState(() => _isLoading = true);
    try {
      // Using Bangalore default location (same as RSA)
      final workshops = await _api.getNearbyWorkshops(
        lat: 12.9716,
        lng: 77.5946,
        categoryId: _selectedCategoryId,
      );
      setState(() {
        _nearbyWorkshops = workshops;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to load workshops: $e')));
      }
    }
  }

  Future<void> _loadAvailableSlots() async {
    if (_selectedWorkshopId == null) return;
    setState(() => _isLoading = true);
    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final slots = await _api.getAvailableSlotsForWorkshop(
        _selectedWorkshopId!,
        dateStr,
        categoryId: _selectedCategoryId,
      );
      setState(() {
        _availableSlots = slots;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to load slots: $e')));
      }
    }
  }

  Future<void> _submitBooking() async {
    if (_selectedWorkshopId == null ||
        _selectedVehicleId == null ||
        _selectedCategoryId == null ||
        _selectedSlotTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all steps')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _api.createBookingWithSlot(
        workshopId: _selectedWorkshopId!,
        vehicleId: _selectedVehicleId!,
        serviceCategoryId: _selectedCategoryId!,
        date: DateFormat('yyyy-MM-dd').format(_selectedDate),
        slotTime: _selectedSlotTime!,
        slotId: _selectedSlotId,
        notes: _notesController.text.isEmpty ? null : _notesController.text,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Booking confirmed!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Booking failed: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _nextStep() {
    if (_currentStep == 0 && _selectedCategoryId == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a service')));
      return;
    }
    if (_currentStep == 1 && _selectedWorkshopId == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a workshop')));
      return;
    }
    if (_currentStep == 2 && _selectedVehicleId == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a vehicle')));
      return;
    }
    if (_currentStep == 3 && _selectedSlotTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a time slot')),
      );
      return;
    }

    setState(() {
      if (_currentStep < 4) _currentStep++;
    });

    // Load data for next step
    if (_currentStep == 1) _loadNearbyWorkshops();
    if (_currentStep == 3) _loadAvailableSlots();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Book Service')),
      body: _isLoading && _currentStep == 0
          ? const Center(child: CircularProgressIndicator())
          : Stepper(
              currentStep: _currentStep,
              onStepContinue: _currentStep == 4 ? _submitBooking : _nextStep,
              onStepCancel: _currentStep > 0
                  ? () => setState(() => _currentStep--)
                  : null,
              controlsBuilder: (context, details) {
                return Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Row(
                    children: [
                      ElevatedButton(
                        onPressed: _isLoading ? null : details.onStepContinue,
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : Text(
                                _currentStep == 4
                                    ? 'Confirm Booking'
                                    : 'Continue',
                              ),
                      ),
                      if (_currentStep > 0) ...[
                        const SizedBox(width: 8),
                        TextButton(
                          onPressed: details.onStepCancel,
                          child: const Text('Back'),
                        ),
                      ],
                    ],
                  ),
                );
              },
              steps: [
                // Step 1: Service Category
                Step(
                  title: const Text('Select Service'),
                  subtitle: _selectedCategoryName != null
                      ? Text(_selectedCategoryName!)
                      : null,
                  isActive: _currentStep >= 0,
                  content: _buildCategoryGrid(),
                ),
                // Step 2: Workshop
                Step(
                  title: const Text('Choose Workshop'),
                  subtitle: _selectedWorkshop != null
                      ? Text(_selectedWorkshop!['name'] ?? '')
                      : null,
                  isActive: _currentStep >= 1,
                  content: _buildWorkshopList(),
                ),
                // Step 3: Vehicle
                Step(
                  title: const Text('Select Vehicle'),
                  isActive: _currentStep >= 2,
                  content: _buildVehicleSelection(),
                ),
                // Step 4: Date & Slot
                Step(
                  title: const Text('Date & Time'),
                  subtitle: _selectedSlotTime != null
                      ? Text(
                          '${DateFormat('MMM dd').format(_selectedDate)} at $_selectedSlotTime',
                        )
                      : null,
                  isActive: _currentStep >= 3,
                  content: _buildDateSlotSelection(),
                ),
                // Step 5: Confirm
                Step(
                  title: const Text('Confirm'),
                  isActive: _currentStep >= 4,
                  content: _buildConfirmation(),
                ),
              ],
            ),
    );
  }

  Widget _buildCategoryGrid() {
    if (_serviceCategories.isEmpty) {
      return const Center(child: Text('No service categories available'));
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 0.9,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: _serviceCategories.length,
      itemBuilder: (context, index) {
        final category = _serviceCategories[index];
        final isSelected = _selectedCategoryId == category['id'];
        final name = category['name'] ?? 'Service';

        return Card(
          elevation: isSelected ? 4 : 1,
          color: isSelected
              ? Theme.of(context).colorScheme.primaryContainer
              : null,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: isSelected
                ? BorderSide(
                    color: Theme.of(context).colorScheme.primary,
                    width: 2,
                  )
                : BorderSide.none,
          ),
          child: InkWell(
            onTap: () => setState(() {
              _selectedCategoryId = category['id'];
              _selectedCategoryName = name;
            }),
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _categoryIcons[name] ?? Icons.miscellaneous_services,
                    size: 28,
                    color: isSelected
                        ? Theme.of(context).colorScheme.primary
                        : Colors.grey[600],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    name,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isSelected
                          ? Theme.of(context).colorScheme.primary
                          : null,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildWorkshopList() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_nearbyWorkshops.isEmpty) {
      return const Center(child: Text('No workshops found nearby'));
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _nearbyWorkshops.length,
      itemBuilder: (context, index) {
        final workshop = _nearbyWorkshops[index];
        final isSelected = _selectedWorkshopId == workshop['id'];
        final avgRating = (workshop['avgRating'] ?? 0.0).toDouble();
        final totalRatings = workshop['totalRatings'] ?? 0;

        return Card(
          elevation: isSelected ? 4 : 1,
          color: isSelected
              ? Theme.of(context).colorScheme.primaryContainer
              : null,
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            onTap: () => setState(() {
              _selectedWorkshopId = workshop['id'];
              _selectedWorkshop = workshop;
            }),
            leading: CircleAvatar(
              backgroundColor: isSelected
                  ? Theme.of(context).colorScheme.primary
                  : Colors.grey[300],
              child: Icon(
                Icons.car_repair,
                color: isSelected ? Colors.white : Colors.grey[600],
              ),
            ),
            title: Text(
              workshop['name'] ?? 'Workshop',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  workshop['address'] ?? '',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    // Rating
                    ...List.generate(
                      5,
                      (i) => Icon(
                        i < avgRating.round() ? Icons.star : Icons.star_border,
                        size: 14,
                        color: Colors.amber,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '(${totalRatings})',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                    const Spacer(),
                    // Distance
                    if (workshop['distance'] != null)
                      Text(
                        '${workshop['distance']} km',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                  ],
                ),
              ],
            ),
            trailing: isSelected
                ? Icon(
                    Icons.check_circle,
                    color: Theme.of(context).colorScheme.primary,
                  )
                : null,
          ),
        );
      },
    );
  }

  Widget _buildVehicleSelection() {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: widget.vehicles.length,
      itemBuilder: (context, index) {
        final vehicle = widget.vehicles[index];
        final isSelected = _selectedVehicleId == vehicle['id'];

        return RadioListTile<String>(
          title: Text(
            vehicle['regNumber'] ?? 'Unknown',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          subtitle: Text(
            '${vehicle['make'] ?? ''} ${vehicle['model'] ?? ''}'.trim(),
          ),
          value: vehicle['id'],
          groupValue: _selectedVehicleId,
          onChanged: (value) => setState(() => _selectedVehicleId = value),
          secondary: Icon(
            Icons.directions_car,
            color: isSelected
                ? Theme.of(context).colorScheme.primary
                : Colors.grey,
          ),
        );
      },
    );
  }

  Widget _buildDateSlotSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Date Picker
        const Text(
          'Select Date',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: () async {
            final picked = await showDatePicker(
              context: context,
              initialDate: _selectedDate,
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 30)),
            );
            if (picked != null) {
              setState(() {
                _selectedDate = picked;
                _selectedSlotTime = null;
                _selectedSlotId = null;
              });
              _loadAvailableSlots();
            }
          },
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.calendar_today),
                const SizedBox(width: 12),
                Text(DateFormat('EEEE, MMM dd, yyyy').format(_selectedDate)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Slots Grid (Movie-ticket style)
        const Text(
          'Select Time Slot',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        if (_isLoading)
          const Center(child: CircularProgressIndicator())
        else if (_availableSlots.isEmpty)
          const Text('No slots available for this date')
        else
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _availableSlots.map<Widget>((slotGroup) {
              final time = slotGroup['time'] as String;
              final slots = slotGroup['slots'] as List<dynamic>;
              final hasAvailable = slots.any((s) => s['status'] == 'AVAILABLE');
              final isSelected = _selectedSlotTime == time;

              return ChoiceChip(
                label: Text(time),
                selected: isSelected,
                onSelected: hasAvailable
                    ? (selected) {
                        if (selected) {
                          final availableSlot = slots.firstWhere(
                            (s) => s['status'] == 'AVAILABLE',
                            orElse: () => null,
                          );
                          setState(() {
                            _selectedSlotTime = time;
                            _selectedSlotId = availableSlot?['slotId'];
                          });
                        }
                      }
                    : null,
                backgroundColor: hasAvailable
                    ? Colors.green[50]
                    : Colors.red[50],
                selectedColor: Colors.green[200],
                labelStyle: TextStyle(
                  color: hasAvailable ? Colors.green[800] : Colors.red[800],
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              );
            }).toList(),
          ),
      ],
    );
  }

  Widget _buildConfirmation() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Summary Card
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSummaryRow('Service', _selectedCategoryName ?? 'N/A'),
                _buildSummaryRow(
                  'Workshop',
                  _selectedWorkshop?['name'] ?? 'N/A',
                ),
                _buildSummaryRow(
                  'Date',
                  DateFormat('MMM dd, yyyy').format(_selectedDate),
                ),
                _buildSummaryRow('Time', _selectedSlotTime ?? 'N/A'),
                _buildSummaryRow(
                  'Vehicle',
                  widget.vehicles.firstWhere(
                    (v) => v['id'] == _selectedVehicleId,
                    orElse: () => {'regNumber': 'N/A'},
                  )['regNumber'],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Notes
        TextField(
          controller: _notesController,
          decoration: const InputDecoration(
            labelText: 'Additional Notes (Optional)',
            hintText: 'Any specific issues or requests...',
            border: OutlineInputBorder(),
          ),
          maxLines: 3,
        ),
      ],
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600])),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

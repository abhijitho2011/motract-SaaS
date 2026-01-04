import 'package:flutter/material.dart';
import 'package:client/src/core/api/api_client.dart';
import 'package:intl/intl.dart';

class BookServiceScreen extends StatefulWidget {
  final List<dynamic> vehicles;
  final String? preselectedVehicleId;

  const BookServiceScreen({
    super.key,
    required this.vehicles,
    this.preselectedVehicleId,
  });

  @override
  State<BookServiceScreen> createState() => _BookServiceScreenState();
}

class _BookServiceScreenState extends State<BookServiceScreen> {
  final _api = ClientApi();
  int _currentStep = 0;

  // Step 1: Vehicle selection
  String? _selectedVehicleId;

  // Step 2: Workshop selection
  List<dynamic> _workshops = [];
  String? _selectedWorkshopId;
  String _searchQuery = '';
  bool _isLoadingWorkshops = false;

  // Step 3: Date & Slot selection
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  List<dynamic> _slots = [];
  String? _selectedSlot;
  bool _isLoadingSlots = false;

  // Step 4: Confirmation
  String? _notes;
  bool _isBooking = false;

  @override
  void initState() {
    super.initState();
    if (widget.preselectedVehicleId != null) {
      _selectedVehicleId = widget.preselectedVehicleId;
    }
  }

  Future<void> _searchWorkshops() async {
    setState(() => _isLoadingWorkshops = true);
    try {
      final workshops = await _api.searchWorkshops(
        query: _searchQuery.isEmpty ? null : _searchQuery,
      );
      if (mounted) {
        setState(() {
          _workshops = workshops;
          _isLoadingWorkshops = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingWorkshops = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _loadSlots() async {
    if (_selectedWorkshopId == null) return;

    setState(() => _isLoadingSlots = true);
    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final slots = await _api.getWorkshopSlots(_selectedWorkshopId!, dateStr);
      if (mounted) {
        setState(() {
          _slots = slots;
          _isLoadingSlots = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingSlots = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _bookService() async {
    if (_selectedVehicleId == null ||
        _selectedWorkshopId == null ||
        _selectedSlot == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all steps')),
      );
      return;
    }

    setState(() => _isBooking = true);
    try {
      await _api.createBooking(
        workshopId: _selectedWorkshopId!,
        vehicleId: _selectedVehicleId!,
        serviceCategories: ['GENERAL_SERVICE'],
        bookingDate: _selectedDate.toIso8601String(),
        slotTime: _selectedSlot!,
        notes: _notes,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Booking created successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isBooking = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Book Service')),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep == 0 && _selectedVehicleId == null) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Please select a vehicle')),
            );
            return;
          }
          if (_currentStep == 1 && _selectedWorkshopId == null) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Please select a workshop')),
            );
            return;
          }
          if (_currentStep == 2 && _selectedSlot == null) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Please select a time slot')),
            );
            return;
          }
          if (_currentStep == 3) {
            _bookService();
            return;
          }

          setState(() => _currentStep++);

          if (_currentStep == 1 && _workshops.isEmpty) {
            _searchWorkshops();
          }
          if (_currentStep == 2 && _slots.isEmpty) {
            _loadSlots();
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep--);
          } else {
            Navigator.pop(context);
          }
        },
        steps: [
          // Step 1: Select Vehicle
          Step(
            title: const Text('Select Vehicle'),
            isActive: _currentStep >= 0,
            state: _currentStep > 0 ? StepState.complete : StepState.indexed,
            content: Column(
              children: widget.vehicles.map((vehicle) {
                return RadioListTile<String>(
                  title: Text(vehicle['regNumber'] ?? 'Unknown'),
                  subtitle: Text(
                    '${vehicle['make'] ?? ''} ${vehicle['model'] ?? ''}'.trim(),
                  ),
                  value: vehicle['id'],
                  groupValue: _selectedVehicleId,
                  onChanged: (value) =>
                      setState(() => _selectedVehicleId = value),
                );
              }).toList(),
            ),
          ),

          // Step 2: Select Workshop
          Step(
            title: const Text('Select Workshop'),
            isActive: _currentStep >= 1,
            state: _currentStep > 1 ? StepState.complete : StepState.indexed,
            content: Column(
              children: [
                TextField(
                  decoration: const InputDecoration(
                    hintText: 'Search workshop by name...',
                    prefixIcon: Icon(Icons.search),
                  ),
                  onChanged: (value) {
                    _searchQuery = value;
                    _searchWorkshops();
                  },
                ),
                const SizedBox(height: 16),
                if (_isLoadingWorkshops)
                  const Center(child: CircularProgressIndicator())
                else if (_workshops.isEmpty)
                  const Text('No workshops found')
                else
                  ...(_workshops.take(5).map((workshop) {
                    return RadioListTile<String>(
                      title: Text(workshop['name'] ?? 'Unknown'),
                      subtitle: Text(workshop['address'] ?? ''),
                      value: workshop['id'],
                      groupValue: _selectedWorkshopId,
                      onChanged: (value) =>
                          setState(() => _selectedWorkshopId = value),
                    );
                  })),
              ],
            ),
          ),

          // Step 3: Select Date & Time
          Step(
            title: const Text('Select Date & Time'),
            isActive: _currentStep >= 2,
            state: _currentStep > 2 ? StepState.complete : StepState.indexed,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ListTile(
                  title: const Text('Select Date'),
                  subtitle: Text(
                    DateFormat('EEEE, MMM d, yyyy').format(_selectedDate),
                  ),
                  trailing: const Icon(Icons.calendar_today),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: _selectedDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 30)),
                    );
                    if (date != null) {
                      setState(() => _selectedDate = date);
                      _loadSlots();
                    }
                  },
                ),
                const Divider(),
                const Text(
                  'Available Slots:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                if (_isLoadingSlots)
                  const Center(child: CircularProgressIndicator())
                else
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _slots.map((slot) {
                      final time = slot['time'] as String;
                      final available = slot['available'] as bool;
                      final isSelected = _selectedSlot == time;
                      return ChoiceChip(
                        label: Text(time),
                        selected: isSelected,
                        onSelected: available
                            ? (selected) {
                                setState(
                                  () => _selectedSlot = selected ? time : null,
                                );
                              }
                            : null,
                      );
                    }).toList(),
                  ),
              ],
            ),
          ),

          // Step 4: Confirm
          Step(
            title: const Text('Confirm Booking'),
            isActive: _currentStep >= 3,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Notes (optional)',
                    hintText: 'Any special instructions...',
                  ),
                  maxLines: 3,
                  onChanged: (value) => _notes = value,
                ),
                const SizedBox(height: 16),
                if (_isBooking)
                  const Center(child: CircularProgressIndicator())
                else
                  const Text('Tap Continue to confirm your booking'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

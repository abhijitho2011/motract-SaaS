import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:intl/intl.dart';
import 'package:workshop/src/features/slot/data/slot_repository.dart';

class EnhancedSlotScreen extends ConsumerStatefulWidget {
  const EnhancedSlotScreen({super.key});

  @override
  ConsumerState<EnhancedSlotScreen> createState() => _EnhancedSlotScreenState();
}

class _EnhancedSlotScreenState extends ConsumerState<EnhancedSlotScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  DateTime _selectedDate = DateTime.now();
  bool _isLoading = false;
  List<dynamic> _bays = [];
  List<dynamic> _slotGrid = [];
  List<dynamic> _bookings = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(slotApiProvider);

      // Load bays - use workshopId from token, API handles it
      final baysResult = await api.getBays('');
      _bays = baysResult is List ? baysResult : [];

      // Load slot grid for selected date
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final gridResult = await api.getSlotGrid(dateStr);
      _slotGrid = gridResult['slots'] ?? [];

      // Load bookings
      final bookingsResult = await api.getWorkshopBookings();
      _bookings = bookingsResult is List ? bookingsResult : [];
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading data: $e')));
      }
    }
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _generateSlots() async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(slotApiProvider);
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final result = await api.generateDailySlots({'date': dateStr});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Slots generated'),
            backgroundColor: Colors.green,
          ),
        );
        _loadData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _updateBookingStatus(String bookingId, String status) async {
    try {
      final api = ref.read(slotApiProvider);
      await api.updateBookingStatus(bookingId, {'status': status});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Booking $status'),
            backgroundColor: Colors.green,
          ),
        );
        _loadData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Slot Management'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.garage), text: 'Bays'),
            Tab(icon: Icon(Icons.grid_view), text: 'Slots'),
            Tab(icon: Icon(Icons.book_online), text: 'Bookings'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildBaysTab(),
                _buildSlotsTab(),
                _buildBookingsTab(),
              ],
            ),
    );
  }

  // Bays Tab
  Widget _buildBaysTab() {
    return Column(
      children: [
        // Add Bay Button
        Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton.icon(
            onPressed: () => _showAddBayDialog(),
            icon: const Icon(Icons.add),
            label: const Text('Add Bay'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size.fromHeight(48),
            ),
          ),
        ),
        // Bay List
        Expanded(
          child: _bays.isEmpty
              ? const Center(child: Text('No bays configured'))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _bays.length,
                  itemBuilder: (context, index) {
                    final bay = _bays[index];
                    return Card(
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Theme.of(
                            context,
                          ).colorScheme.primaryContainer,
                          child: Text('${index + 1}'),
                        ),
                        title: Text(bay['name'] ?? 'Bay'),
                        subtitle: Text('Type: ${bay['type'] ?? 'N/A'}'),
                        trailing: Switch(
                          value: bay['isActive'] ?? true,
                          onChanged: (value) {
                            // Toggle bay active status
                          },
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  // Slots Tab
  Widget _buildSlotsTab() {
    return Column(
      children: [
        // Date Picker & Generate Button
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _selectedDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 30)),
                    );
                    if (picked != null) {
                      setState(() => _selectedDate = picked);
                      _loadData();
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today),
                        const Gap(8),
                        Text(DateFormat('MMM dd, yyyy').format(_selectedDate)),
                      ],
                    ),
                  ),
                ),
              ),
              const Gap(8),
              ElevatedButton(
                onPressed: _generateSlots,
                child: const Text('Generate'),
              ),
            ],
          ),
        ),
        // Slot Grid
        Expanded(
          child: _slotGrid.isEmpty
              ? const Center(
                  child: Text(
                    'No slots for this date\nTap "Generate" to create',
                  ),
                )
              : GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 4,
                    childAspectRatio: 1.5,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                  ),
                  itemCount: _slotGrid.length,
                  itemBuilder: (context, index) {
                    final slot = _slotGrid[index];
                    final status = slot['status'] ?? 'AVAILABLE';
                    final color = status == 'AVAILABLE'
                        ? Colors.green[100]
                        : status == 'BOOKED'
                        ? Colors.red[100]
                        : Colors.grey[300];

                    return Card(
                      color: color,
                      child: Center(
                        child: Text(
                          slot['startTime'] ?? '',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  // Bookings Tab
  Widget _buildBookingsTab() {
    return _bookings.isEmpty
        ? const Center(child: Text('No bookings yet'))
        : ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _bookings.length,
            itemBuilder: (context, index) {
              final booking = _bookings[index];
              final status = booking['status'] ?? 'PENDING';
              final statusColor = status == 'PENDING'
                  ? Colors.orange
                  : status == 'CONFIRMED'
                  ? Colors.blue
                  : status == 'COMPLETED'
                  ? Colors.green
                  : Colors.grey;

              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            booking['bookingDate'] ?? '',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Chip(
                            label: Text(
                              status,
                              style: const TextStyle(fontSize: 12),
                            ),
                            backgroundColor: statusColor.withOpacity(0.2),
                            labelStyle: TextStyle(color: statusColor),
                          ),
                        ],
                      ),
                      Text('Time: ${booking['slotTime'] ?? 'N/A'}'),
                      if (booking['notes'] != null)
                        Text('Notes: ${booking['notes']}', maxLines: 2),
                      const Gap(8),
                      // Action Buttons
                      if (status == 'PENDING')
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            TextButton(
                              onPressed: () => _updateBookingStatus(
                                booking['id'],
                                'CANCELLED',
                              ),
                              child: const Text(
                                'Cancel',
                                style: TextStyle(color: Colors.red),
                              ),
                            ),
                            const Gap(8),
                            ElevatedButton(
                              onPressed: () => _updateBookingStatus(
                                booking['id'],
                                'CONFIRMED',
                              ),
                              child: const Text('Confirm'),
                            ),
                          ],
                        ),
                      if (status == 'CONFIRMED')
                        Align(
                          alignment: Alignment.centerRight,
                          child: ElevatedButton(
                            onPressed: () => _updateBookingStatus(
                              booking['id'],
                              'COMPLETED',
                            ),
                            child: const Text('Mark Complete'),
                          ),
                        ),
                    ],
                  ),
                ),
              );
            },
          );
  }

  void _showAddBayDialog() {
    final nameController = TextEditingController();
    String selectedType = 'SERVICE';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Bay'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Bay Name'),
            ),
            const Gap(16),
            DropdownButtonFormField<String>(
              value: selectedType,
              decoration: const InputDecoration(labelText: 'Bay Type'),
              items: const [
                DropdownMenuItem(value: 'SERVICE', child: Text('Service')),
                DropdownMenuItem(value: 'WASHING', child: Text('Washing')),
                DropdownMenuItem(value: 'ALIGNMENT', child: Text('Alignment')),
                DropdownMenuItem(
                  value: 'ELECTRICAL',
                  child: Text('Electrical'),
                ),
                DropdownMenuItem(value: 'GENERAL', child: Text('General')),
              ],
              onChanged: (value) => selectedType = value ?? 'SERVICE',
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.isEmpty) return;
              Navigator.pop(context);
              try {
                final api = ref.read(slotApiProvider);
                await api.createBay({
                  'name': nameController.text,
                  'type': selectedType,
                });
                _loadData();
              } catch (e) {
                if (mounted) {
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
  }
}

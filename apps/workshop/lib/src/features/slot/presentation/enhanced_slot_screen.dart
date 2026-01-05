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
  List<dynamic> _holidays = [];
  List<dynamic> _bayTemplates = [];

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

      // Load bays
      final baysResult = await api.getBays('');
      _bays = baysResult is List ? baysResult : [];

      // Load bay templates for dropdown
      final templatesResult = await api.getBayNameTemplates();
      _bayTemplates = templatesResult is List ? templatesResult : [];

      // Load slot grid for selected date
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final gridResult = await api.getSlotGrid(dateStr);
      _slotGrid = gridResult['slots'] ?? [];

      // Load bookings
      final bookingsResult = await api.getWorkshopBookings();
      _bookings = bookingsResult is List ? bookingsResult : [];

      // Load holidays
      final holidaysResult = await api.getWorkshopHolidays();
      _holidays = holidaysResult is List ? holidaysResult : [];
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading data: $e')));
      }
    }
    if (mounted) setState(() => _isLoading = false);
  }

  bool _isHoliday(DateTime date) {
    final dateStr = DateFormat('yyyy-MM-dd').format(date);
    return _holidays.any((h) => h['date'] == dateStr);
  }

  String? _getHolidayReason(DateTime date) {
    final dateStr = DateFormat('yyyy-MM-dd').format(date);
    final holiday = _holidays.firstWhere(
      (h) => h['date'] == dateStr,
      orElse: () => null,
    );
    return holiday?['reason'];
  }

  Future<void> _generateSlots() async {
    if (_isHoliday(_selectedDate)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cannot generate slots for a holiday'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

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

  Future<void> _toggleHoliday() async {
    final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
    final isCurrentlyHoliday = _isHoliday(_selectedDate);

    if (isCurrentlyHoliday) {
      // Unblock
      try {
        final api = ref.read(slotApiProvider);
        await api.unblockDay(dateStr);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Day unblocked'),
            backgroundColor: Colors.green,
          ),
        );
        _loadData();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } else {
      // Show dialog to block with reason
      _showBlockDayDialog(dateStr);
    }
  }

  void _showBlockDayDialog(String dateStr) {
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Block Entire Day'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Block ${DateFormat('MMM dd, yyyy').format(_selectedDate)}?'),
            const Gap(16),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                labelText: 'Reason (optional)',
                hintText: 'e.g., Holiday, Maintenance',
              ),
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
              Navigator.pop(context);
              try {
                final api = ref.read(slotApiProvider);
                await api.blockEntireDay({
                  'date': dateStr,
                  'reason': reasonController.text.isEmpty
                      ? null
                      : reasonController.text,
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Day blocked'),
                    backgroundColor: Colors.green,
                  ),
                );
                _loadData();
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Error: $e'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
            child: const Text('Block Day'),
          ),
        ],
      ),
    );
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

  // Bays Tab with Dropdown
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
              ? const Center(
                  child: Text(
                    'No bays configured\nTap "Add Bay" to create one',
                  ),
                )
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
                        trailing: Icon(
                          bay['isActive'] == true
                              ? Icons.check_circle
                              : Icons.cancel,
                          color: bay['isActive'] == true
                              ? Colors.green
                              : Colors.red,
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  // Slots Tab with Holiday Support
  Widget _buildSlotsTab() {
    final isHoliday = _isHoliday(_selectedDate);
    final holidayReason = _getHolidayReason(_selectedDate);

    return Column(
      children: [
        // Date Picker & Buttons
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: _selectedDate,
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(
                            const Duration(days: 30),
                          ),
                        );
                        if (picked != null) {
                          setState(() => _selectedDate = picked);
                          _loadData();
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: isHoliday ? Colors.orange : Colors.grey,
                          ),
                          borderRadius: BorderRadius.circular(8),
                          color: isHoliday
                              ? Colors.orange.withOpacity(0.1)
                              : null,
                        ),
                        child: Row(
                          children: [
                            Icon(
                              isHoliday ? Icons.block : Icons.calendar_today,
                            ),
                            const Gap(8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    DateFormat(
                                      'MMM dd, yyyy',
                                    ).format(_selectedDate),
                                  ),
                                  if (isHoliday)
                                    Text(
                                      holidayReason ?? 'Blocked',
                                      style: const TextStyle(
                                        color: Colors.orange,
                                        fontSize: 12,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const Gap(8),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _toggleHoliday,
                      icon: Icon(isHoliday ? Icons.lock_open : Icons.block),
                      label: Text(isHoliday ? 'Unblock Day' : 'Block Day'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isHoliday
                            ? Colors.green
                            : Colors.orange,
                      ),
                    ),
                  ),
                  const Gap(8),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: isHoliday ? null : _generateSlots,
                      icon: const Icon(Icons.auto_awesome),
                      label: const Text('Generate'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        // Slot Grid Legend
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildLegendItem(Colors.green[100]!, '🟢 Available'),
              _buildLegendItem(Colors.red[100]!, '🔴 Booked'),
              _buildLegendItem(Colors.yellow[100]!, '🟡 Blocked'),
            ],
          ),
        ),
        const Gap(8),
        // Slot Grid
        Expanded(
          child: isHoliday
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.block, size: 64, color: Colors.orange),
                      const Gap(16),
                      Text(
                        'Workshop Closed',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      if (holidayReason != null)
                        Text(
                          holidayReason,
                          style: const TextStyle(color: Colors.grey),
                        ),
                    ],
                  ),
                )
              : _slotGrid.isEmpty
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
                        : Colors.yellow[100];

                    return InkWell(
                      onTap: status == 'AVAILABLE' || status == 'BLOCKED'
                          ? () => _toggleSlotBlock(slot)
                          : null,
                      child: Card(
                        color: color,
                        child: Center(
                          child: Text(
                            slot['startTime'] ?? '',
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const Gap(4),
        Text(label, style: const TextStyle(fontSize: 10)),
      ],
    );
  }

  Future<void> _toggleSlotBlock(Map<String, dynamic> slot) async {
    final newStatus = slot['status'] == 'BLOCKED' ? 'AVAILABLE' : 'BLOCKED';
    try {
      final api = ref.read(slotApiProvider);
      await api.updateSlotStatus(slot['slotId'], {'status': newStatus});
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Slot ${newStatus.toLowerCase()}'),
          backgroundColor: Colors.green,
        ),
      );
      _loadData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    }
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
    String? selectedTemplateId;
    String selectedType = 'SERVICE';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add Bay'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Bay Name Dropdown (from super admin templates)
              DropdownButtonFormField<String>(
                value: selectedTemplateId,
                decoration: const InputDecoration(labelText: 'Bay Name'),
                hint: const Text('Select bay name'),
                items: _bayTemplates.map<DropdownMenuItem<String>>((template) {
                  return DropdownMenuItem(
                    value: template['id'],
                    child: Text(template['name'] ?? 'Unknown'),
                  );
                }).toList(),
                onChanged: (value) =>
                    setDialogState(() => selectedTemplateId = value),
              ),
              const Gap(16),
              DropdownButtonFormField<String>(
                value: selectedType,
                decoration: const InputDecoration(labelText: 'Bay Type'),
                items: const [
                  DropdownMenuItem(value: 'SERVICE', child: Text('Service')),
                  DropdownMenuItem(value: 'WASHING', child: Text('Washing')),
                  DropdownMenuItem(
                    value: 'ALIGNMENT',
                    child: Text('Alignment'),
                  ),
                  DropdownMenuItem(
                    value: 'ELECTRICAL',
                    child: Text('Electrical'),
                  ),
                  DropdownMenuItem(value: 'GENERAL', child: Text('General')),
                ],
                onChanged: (value) =>
                    setDialogState(() => selectedType = value ?? 'SERVICE'),
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
                if (selectedTemplateId == null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please select a bay name')),
                  );
                  return;
                }
                Navigator.pop(context);
                try {
                  final template = _bayTemplates.firstWhere(
                    (t) => t['id'] == selectedTemplateId,
                  );
                  final api = ref.read(slotApiProvider);
                  await api.createBay({
                    'name': template['name'],
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
      ),
    );
  }
}

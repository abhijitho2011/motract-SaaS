import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../core/api/api_client.dart';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  List<dynamic> _bookings = [];
  bool _isLoading = true;
  String? _error;
  String? _filterStatus;
  String _searchQuery = '';

  final List<String> _statuses = [
    'All',
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
  ];

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final bookings = await ApiClient.getBookings(
        status: _filterStatus == 'All' ? null : _filterStatus,
      );

      setState(() {
        _bookings = bookings;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  List<dynamic> get _filteredBookings {
    if (_searchQuery.isEmpty) return _bookings;
    return _bookings.where((booking) {
      final orgId = (booking['organizationId'] ?? '').toString().toLowerCase();
      final query = _searchQuery.toLowerCase();
      return orgId.contains(query);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bookings'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadBookings),
        ],
      ),
      body: Column(
        children: [
          // Filters
          Container(
            padding: const EdgeInsets.all(16),
            color: Theme.of(context).colorScheme.surfaceVariant,
            child: Column(
              children: [
                // Search
                TextField(
                  decoration: const InputDecoration(
                    hintText: 'Search by organization ID',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value;
                    });
                  },
                ),
                const Gap(12),
                // Status filter
                Row(
                  children: [
                    const Text('Status: '),
                    const Gap(8),
                    DropdownButton<String>(
                      value: _filterStatus ?? 'All',
                      items: _statuses.map((status) {
                        return DropdownMenuItem(
                          value: status,
                          child: Text(status),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _filterStatus = value == 'All' ? null : value;
                        });
                        _loadBookings();
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
          // List
          Expanded(
            child: _isLoading
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
                          onPressed: _loadBookings,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : _filteredBookings.isEmpty
                ? const Center(child: Text('No bookings found'))
                : RefreshIndicator(
                    onRefresh: _loadBookings,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _filteredBookings.length,
                      itemBuilder: (context, index) {
                        final booking = _filteredBookings[index];
                        return _buildBookingCard(booking);
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingCard(Map<String, dynamic> booking) {
    final status = booking['status'] ?? 'UNKNOWN';

    Color statusColor = Colors.grey;
    switch (status) {
      case 'PENDING':
        statusColor = Colors.orange;
        break;
      case 'CONFIRMED':
        statusColor = Colors.blue;
        break;
      case 'COMPLETED':
        statusColor = Colors.green;
        break;
      case 'CANCELLED':
        statusColor = Colors.red;
        break;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: statusColor.withOpacity(0.2),
          child: Icon(Icons.book_online, color: statusColor),
        ),
        title: Text(
          'Booking #${booking['id']?.toString().substring(0, 8) ?? 'Unknown'}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Gap(4),
            Text('Organization: ${booking['organizationId'] ?? 'N/A'}'),
            const Gap(4),
            Chip(
              label: Text(status),
              backgroundColor: statusColor.withOpacity(0.2),
              labelStyle: TextStyle(color: statusColor, fontSize: 12),
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildDetailRow('ID', booking['id'] ?? 'N/A'),
                const Divider(),
                _buildDetailRow(
                  'Organization ID',
                  booking['organizationId'] ?? 'N/A',
                ),
                const Divider(),
                _buildDetailRow('Status', status),
                const Divider(),
                _buildDetailRow('Created At', booking['createdAt'] ?? 'N/A'),
                if (booking['notes'] != null) ...[
                  const Divider(),
                  _buildDetailRow('Notes', booking['notes']),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}

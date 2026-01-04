import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gap/gap.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api/api_client.dart';

class JobDetailsScreen extends ConsumerStatefulWidget {
  final String jobId;

  const JobDetailsScreen({super.key, required this.jobId});

  @override
  ConsumerState<JobDetailsScreen> createState() => _JobDetailsScreenState();
}

class _JobDetailsScreenState extends ConsumerState<JobDetailsScreen> {
  Map<String, dynamic>? _job;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadJob();
  }

  Future<void> _loadJob() async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(rsaApiProvider);
      _job = await api.getJobDetails(widget.jobId);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
    setState(() => _isLoading = false);
  }

  Future<void> _updateStatus(String newStatus) async {
    try {
      final api = ref.read(rsaApiProvider);
      await api.updateJobStatus(widget.jobId, newStatus);
      _loadJob();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Status updated to $newStatus')));
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  Future<void> _completeJob() async {
    try {
      final api = ref.read(rsaApiProvider);
      // Calculate distance (simplified - could use actual route distance)
      final position = await Geolocator.getCurrentPosition();
      final distance =
          Geolocator.distanceBetween(
            _job!['pickupLat'],
            _job!['pickupLng'],
            position.latitude,
            position.longitude,
          ) /
          1000; // Convert to km

      await api.completeJob(widget.jobId, distanceKm: distance);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Job completed successfully!')),
        );
        context.go('/home');
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  Future<void> _navigateToPickup() async {
    final lat = _job!['pickupLat'];
    final lng = _job!['pickupLng'];
    final url = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng',
    );
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Job Details')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _job == null
          ? const Center(child: Text('Job not found'))
          : RefreshIndicator(
              onRefresh: _loadJob,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Status Card
                  Card(
                    color: _getStatusColor(_job!['status']).withOpacity(0.1),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Icon(
                            _getStatusIcon(_job!['status']),
                            color: _getStatusColor(_job!['status']),
                            size: 32,
                          ),
                          const Gap(16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _job!['status'] ?? 'UNKNOWN',
                                style: TextStyle(
                                  color: _getStatusColor(_job!['status']),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                              Text(
                                _job!['serviceType'] ?? 'SERVICE',
                                style: const TextStyle(color: Colors.grey),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Gap(16),

                  // Vehicle Info
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Vehicle',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const Gap(8),
                          Text(
                            _job!['vehicle']?['regNumber'] ?? 'N/A',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '${_job!['vehicle']?['variant']?['model']?['make']?['name'] ?? ''} '
                            '${_job!['vehicle']?['variant']?['model']?['name'] ?? ''}',
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Gap(16),

                  // Pickup Location
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.location_on, color: Colors.red),
                      title: const Text('Pickup Location'),
                      subtitle: Text(
                        _job!['pickupAddress'] ?? 'Location available',
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.navigation),
                        onPressed: _navigateToPickup,
                      ),
                    ),
                  ),

                  if (_job!['destinationAddress'] != null) ...[
                    const Gap(8),
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.flag, color: Colors.green),
                        title: const Text('Destination'),
                        subtitle: Text(_job!['destinationAddress']),
                      ),
                    ),
                  ],

                  const Gap(24),

                  // Action Buttons based on status
                  ..._buildActionButtons(),
                ],
              ),
            ),
    );
  }

  List<Widget> _buildActionButtons() {
    final status = _job!['status'];

    switch (status) {
      case 'ACCEPTED':
        return [
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () => _updateStatus('ON_THE_WAY'),
              icon: const Icon(Icons.directions_car),
              label: const Text('Start Navigation'),
            ),
          ),
        ];
      case 'ON_THE_WAY':
        return [
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: _navigateToPickup,
              icon: const Icon(Icons.navigation),
              label: const Text('Navigate'),
            ),
          ),
          const Gap(12),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () => _updateStatus('ARRIVED'),
              icon: const Icon(Icons.location_on),
              label: const Text('I\'ve Arrived'),
              style: FilledButton.styleFrom(backgroundColor: Colors.teal),
            ),
          ),
        ];
      case 'ARRIVED':
        return [
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () => _updateStatus('IN_PROGRESS'),
              icon: const Icon(Icons.build),
              label: const Text('Start Work'),
            ),
          ),
        ];
      case 'IN_PROGRESS':
        return [
          SizedBox(
            width: double.infinity,
            height: 56,
            child: FilledButton.icon(
              onPressed: _completeJob,
              icon: const Icon(Icons.check_circle),
              label: const Text('Complete Job'),
              style: FilledButton.styleFrom(backgroundColor: Colors.green),
            ),
          ),
        ];
      default:
        return [];
    }
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'REQUESTED':
        return Colors.blue;
      case 'ACCEPTED':
        return Colors.orange;
      case 'ON_THE_WAY':
        return Colors.purple;
      case 'ARRIVED':
        return Colors.teal;
      case 'IN_PROGRESS':
        return Colors.amber;
      case 'COMPLETED':
        return Colors.green;
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String? status) {
    switch (status) {
      case 'REQUESTED':
        return Icons.pending;
      case 'ACCEPTED':
        return Icons.thumb_up;
      case 'ON_THE_WAY':
        return Icons.directions_car;
      case 'ARRIVED':
        return Icons.location_on;
      case 'IN_PROGRESS':
        return Icons.build;
      case 'COMPLETED':
        return Icons.check_circle;
      case 'CANCELLED':
        return Icons.cancel;
      default:
        return Icons.help;
    }
  }
}

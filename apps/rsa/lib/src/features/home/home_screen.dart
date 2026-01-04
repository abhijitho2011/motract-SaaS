import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gap/gap.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/api/api_client.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _isOnline = false;
  bool _isLoading = true;
  List<dynamic> _pendingJobs = [];
  List<dynamic> _activeJobs = [];
  Map<String, dynamic>? _profile;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(rsaApiProvider);
      _profile = await api.getProfile();
      _isOnline = _profile?['isOnline'] ?? false;

      if (_isOnline) {
        _pendingJobs = await api.getPendingJobs();
      }
      _activeJobs = await api.getMyJobs(status: 'ACCEPTED');
      _activeJobs.addAll(await api.getMyJobs(status: 'ON_THE_WAY'));
      _activeJobs.addAll(await api.getMyJobs(status: 'ARRIVED'));
      _activeJobs.addAll(await api.getMyJobs(status: 'IN_PROGRESS'));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading data: $e')));
      }
    }
    setState(() => _isLoading = false);
  }

  Future<void> _toggleOnline() async {
    try {
      final api = ref.read(rsaApiProvider);

      if (!_isOnline) {
        // Check location permission
        final permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          await Geolocator.requestPermission();
        }

        final position = await Geolocator.getCurrentPosition();
        await api.goOnline(position.latitude, position.longitude);
      } else {
        await api.goOffline();
      }

      setState(() => _isOnline = !_isOnline);
      _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _acceptJob(String jobId) async {
    try {
      final api = ref.read(rsaApiProvider);
      await api.acceptJob(jobId);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Job accepted!')));
      _loadData();
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error accepting job: $e')));
    }
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('userId');
    if (mounted) {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Motract RSA'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadData),
          IconButton(icon: const Icon(Icons.logout), onPressed: _logout),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Online/Offline Toggle
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Text(
                            _profile?['name'] ?? 'RSA Partner',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const Gap(8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _isOnline ? 'ONLINE' : 'OFFLINE',
                                style: TextStyle(
                                  color: _isOnline ? Colors.green : Colors.grey,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                              const Gap(16),
                              Switch.adaptive(
                                value: _isOnline,
                                onChanged: (_) => _toggleOnline(),
                                activeColor: Colors.green,
                              ),
                            ],
                          ),
                          const Gap(8),
                          Text(
                            _isOnline
                                ? 'You are visible to clients'
                                : 'Go online to receive job requests',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Gap(16),

                  // Active Jobs
                  if (_activeJobs.isNotEmpty) ...[
                    Text(
                      'Active Jobs',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const Gap(8),
                    ..._activeJobs.map(
                      (job) => _buildJobCard(job, isActive: true),
                    ),
                    const Gap(16),
                  ],

                  // Pending Jobs (for acceptance)
                  if (_isOnline && _pendingJobs.isNotEmpty) ...[
                    Text(
                      'Available Jobs',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const Gap(8),
                    ..._pendingJobs.map(
                      (job) => _buildJobCard(job, isPending: true),
                    ),
                  ],

                  if (_isOnline && _pendingJobs.isEmpty && _activeJobs.isEmpty)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: Column(
                          children: [
                            Icon(
                              Icons.hourglass_empty,
                              size: 64,
                              color: Colors.grey,
                            ),
                            Gap(16),
                            Text(
                              'Waiting for job requests...',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ),

                  if (!_isOnline)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: Column(
                          children: [
                            Icon(Icons.power_off, size: 64, color: Colors.grey),
                            Gap(16),
                            Text(
                              'Go online to start receiving jobs',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildJobCard(
    Map<String, dynamic> job, {
    bool isPending = false,
    bool isActive = false,
  }) {
    final vehicle = job['vehicle'];
    final make = vehicle?['variant']?['model']?['make']?['name'] ?? '';
    final model = vehicle?['variant']?['model']?['name'] ?? '';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: isActive ? () => context.push('/job/${job['id']}') : null,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor(job['status']).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      job['serviceType'] ?? 'SERVICE',
                      style: TextStyle(
                        color: _getStatusColor(job['status']),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const Spacer(),
                  if (isActive)
                    Chip(
                      label: Text(job['status'] ?? 'UNKNOWN'),
                      backgroundColor: _getStatusColor(
                        job['status'],
                      ).withOpacity(0.1),
                    ),
                ],
              ),
              const Gap(12),
              Text(
                vehicle?['regNumber'] ?? 'Unknown Vehicle',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              Text('$make $model'),
              const Gap(8),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 16, color: Colors.grey),
                  const Gap(4),
                  Expanded(
                    child: Text(
                      job['pickupAddress'] ?? 'Location available',
                      style: const TextStyle(color: Colors.grey),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              if (isPending) ...[
                const Gap(12),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => _acceptJob(job['id']),
                    child: const Text('Accept Job'),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
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
}

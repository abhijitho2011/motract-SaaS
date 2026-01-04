import 'dart:async';
import 'package:flutter/material.dart';
import 'package:client/src/core/api/api_client.dart';
import 'package:client/src/features/rsa/rsa_rating_screen.dart';

class RsaTrackingScreen extends StatefulWidget {
  final String jobId;
  final String serviceType;

  const RsaTrackingScreen({
    super.key,
    required this.jobId,
    required this.serviceType,
  });

  @override
  State<RsaTrackingScreen> createState() => _RsaTrackingScreenState();
}

class _RsaTrackingScreenState extends State<RsaTrackingScreen> {
  final _api = ClientApi();
  Timer? _pollingTimer;
  Map<String, dynamic>? _jobData;
  bool _isLoading = true;
  String? _error;

  // Job status constants
  static const String statusRequested = 'REQUESTED';
  static const String statusAccepted = 'ACCEPTED';
  static const String statusArrived = 'ARRIVED';
  static const String statusInProgress = 'IN_PROGRESS';
  static const String statusCompleted = 'COMPLETED';
  static const String statusCancelled = 'CANCELLED';

  @override
  void initState() {
    super.initState();
    _loadJobData();
    _startPolling();
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  void _startPolling() {
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      _loadJobData();
    });
  }

  Future<void> _loadJobData() async {
    try {
      final data = await _api.getRsaJobStatus(widget.jobId);
      if (mounted) {
        setState(() {
          _jobData = data;
          _isLoading = false;
          _error = null;
        });

        // Check if job completed - navigate to rating
        if (data['status'] == statusCompleted) {
          _pollingTimer?.cancel();
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => RsaRatingScreen(
                jobId: widget.jobId,
                serviceType: widget.serviceType,
                rsaName: data['rsaName'] ?? 'RSA Provider',
              ),
            ),
          );
        }

        // Stop polling if cancelled
        if (data['status'] == statusCancelled) {
          _pollingTimer?.cancel();
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  String _getStatusText(String? status) {
    switch (status) {
      case statusRequested:
        return 'Finding nearby RSA provider...';
      case statusAccepted:
        return 'RSA provider is on the way';
      case statusArrived:
        return 'RSA provider has arrived';
      case statusInProgress:
        return 'Work in progress';
      case statusCompleted:
        return 'Service completed';
      case statusCancelled:
        return 'Request cancelled';
      default:
        return 'Processing...';
    }
  }

  IconData _getStatusIcon(String? status) {
    switch (status) {
      case statusRequested:
        return Icons.search;
      case statusAccepted:
        return Icons.directions_car;
      case statusArrived:
        return Icons.where_to_vote;
      case statusInProgress:
        return Icons.build;
      case statusCompleted:
        return Icons.check_circle;
      case statusCancelled:
        return Icons.cancel;
      default:
        return Icons.hourglass_empty;
    }
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case statusRequested:
        return Colors.orange;
      case statusAccepted:
        return Colors.blue;
      case statusArrived:
        return Colors.green;
      case statusInProgress:
        return Colors.purple;
      case statusCompleted:
        return Colors.green;
      case statusCancelled:
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  int _getStatusStep(String? status) {
    switch (status) {
      case statusRequested:
        return 0;
      case statusAccepted:
        return 1;
      case statusArrived:
        return 2;
      case statusInProgress:
        return 3;
      case statusCompleted:
        return 4;
      default:
        return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('RSA Tracking'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => _showCancelDialog(),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error, size: 64, color: Colors.red[300]),
                  const SizedBox(height: 16),
                  Text('Error: $_error'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadJobData,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadJobData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Status Card
                    _buildStatusCard(),
                    const SizedBox(height: 24),

                    // Progress Stepper
                    _buildProgressStepper(),
                    const SizedBox(height: 24),

                    // RSA Provider Info (if assigned)
                    if (_jobData?['rsaName'] != null) ...[
                      _buildRsaProviderCard(),
                      const SizedBox(height: 24),
                    ],

                    // OTP Display (if arrived)
                    if (_jobData?['status'] == statusArrived ||
                        _jobData?['status'] == statusInProgress)
                      _buildOtpCard(),

                    const SizedBox(height: 24),

                    // Service Details
                    _buildServiceDetailsCard(),

                    // Cancel Button (if not completed)
                    if (_jobData?['status'] != statusCompleted &&
                        _jobData?['status'] != statusCancelled) ...[
                      const SizedBox(height: 32),
                      OutlinedButton(
                        onPressed: _showCancelDialog,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.red,
                          side: const BorderSide(color: Colors.red),
                        ),
                        child: const Text('Cancel Request'),
                      ),
                    ],
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildStatusCard() {
    final status = _jobData?['status'];
    return Card(
      color: _getStatusColor(status).withOpacity(0.1),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Icon(
              _getStatusIcon(status),
              size: 64,
              color: _getStatusColor(status),
            ),
            const SizedBox(height: 16),
            Text(
              _getStatusText(status),
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            if (status == statusRequested) ...[
              const SizedBox(height: 16),
              const LinearProgressIndicator(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildProgressStepper() {
    final currentStep = _getStatusStep(_jobData?['status']);
    final steps = ['Requested', 'Accepted', 'Arrived', 'Working', 'Done'];

    return Row(
      children: List.generate(steps.length, (index) {
        final isActive = index <= currentStep;
        final isLast = index == steps.length - 1;

        return Expanded(
          child: Row(
            children: [
              Column(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isActive ? Colors.green : Colors.grey[300],
                    ),
                    child: isActive
                        ? const Icon(Icons.check, size: 16, color: Colors.white)
                        : null,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    steps[index],
                    style: TextStyle(
                      fontSize: 10,
                      color: isActive ? Colors.green : Colors.grey,
                    ),
                  ),
                ],
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    height: 2,
                    color: index < currentStep
                        ? Colors.green
                        : Colors.grey[300],
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildRsaProviderCard() {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.orange[100],
          child: const Icon(Icons.person, color: Colors.orange),
        ),
        title: Text(
          _jobData?['rsaName'] ?? 'RSA Provider',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(_jobData?['rsaPhone'] ?? 'Contact details'),
        trailing: IconButton(
          icon: const Icon(Icons.phone, color: Colors.green),
          onPressed: () {
            // TODO: Implement call functionality
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Calling RSA provider...')),
            );
          },
        ),
      ),
    );
  }

  Widget _buildOtpCard() {
    final startOtp = _jobData?['startOtp'];
    return Card(
      color: Colors.amber[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Icon(Icons.key, size: 32, color: Colors.amber),
            const SizedBox(height: 8),
            const Text(
              'Share this OTP with RSA provider',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber, width: 2),
              ),
              child: Text(
                startOtp ?? '----',
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 8,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'RSA provider will ask for this code to start work',
              style: TextStyle(color: Colors.grey[600], fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceDetailsCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Service Details',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const Divider(),
            _buildDetailRow(
              'Service Type',
              widget.serviceType.replaceAll('_', ' '),
            ),
            _buildDetailRow('Job ID', widget.jobId.substring(0, 8)),
            if (_jobData?['createdAt'] != null)
              _buildDetailRow(
                'Requested At',
                _jobData!['createdAt'].toString().split('T')[1].substring(0, 5),
              ),
            if (_jobData?['fare'] != null)
              _buildDetailRow('Estimated Fare', '₹${_jobData!['fare']}'),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600])),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  void _showCancelDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Request?'),
        content: const Text(
          'Are you sure you want to cancel this RSA request?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No, Keep'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );
  }
}

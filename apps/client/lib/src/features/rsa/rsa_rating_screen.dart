import 'package:flutter/material.dart';
import 'package:client/src/core/api/api_client.dart';

class RsaRatingScreen extends StatefulWidget {
  final String jobId;
  final String serviceType;
  final String rsaName;

  const RsaRatingScreen({
    super.key,
    required this.jobId,
    required this.serviceType,
    required this.rsaName,
  });

  @override
  State<RsaRatingScreen> createState() => _RsaRatingScreenState();
}

class _RsaRatingScreenState extends State<RsaRatingScreen> {
  final _api = ClientApi();
  final _feedbackController = TextEditingController();

  int _rating = 0;
  bool _problemSolved = true;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _feedbackController.dispose();
    super.dispose();
  }

  Future<void> _submitRating() async {
    if (_rating == 0) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a rating')));
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await _api.submitRsaRating(
        widget.jobId,
        _rating,
        _feedbackController.text.trim().isEmpty
            ? null
            : _feedbackController.text.trim(),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Thank you for your feedback!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.popUntil(context, (route) => route.isFirst);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
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
        title: const Text('Rate Your Experience'),
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Success Icon
            const Icon(Icons.check_circle, size: 80, color: Colors.green),
            const SizedBox(height: 16),
            Text(
              'Service Completed!',
              textAlign: TextAlign.center,
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Your ${widget.serviceType.replaceAll('_', ' ')} service by ${widget.rsaName} has been completed.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600]),
            ),
            const SizedBox(height: 32),

            // Rating Stars
            const Text(
              'How was your experience?',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                final starValue = index + 1;
                return IconButton(
                  iconSize: 48,
                  onPressed: () => setState(() => _rating = starValue),
                  icon: Icon(
                    _rating >= starValue ? Icons.star : Icons.star_border,
                    color: _rating >= starValue
                        ? Colors.amber
                        : Colors.grey[400],
                  ),
                );
              }),
            ),
            Text(
              _getRatingText(),
              textAlign: TextAlign.center,
              style: TextStyle(
                color: _rating > 0 ? Colors.amber[700] : Colors.grey,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 32),

            // Problem Solved
            Card(
              child: SwitchListTile(
                title: const Text('Was your problem solved?'),
                subtitle: Text(
                  _problemSolved
                      ? 'Yes, my issue is fixed'
                      : 'No, I still have issues',
                ),
                value: _problemSolved,
                onChanged: (value) => setState(() => _problemSolved = value),
                secondary: Icon(
                  _problemSolved ? Icons.check_circle : Icons.error,
                  color: _problemSolved ? Colors.green : Colors.red,
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Feedback TextField
            TextField(
              controller: _feedbackController,
              maxLines: 4,
              decoration: InputDecoration(
                labelText: 'Additional Feedback (Optional)',
                hintText: 'Share your experience with us...',
                alignLabelWithHint: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 32),

            // Submit Button
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitRating,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Submit Rating'),
            ),
            const SizedBox(height: 16),

            // Skip Button
            TextButton(
              onPressed: _isSubmitting
                  ? null
                  : () {
                      Navigator.popUntil(context, (route) => route.isFirst);
                    },
              child: const Text('Skip for now'),
            ),
          ],
        ),
      ),
    );
  }

  String _getRatingText() {
    switch (_rating) {
      case 1:
        return 'Very Poor';
      case 2:
        return 'Poor';
      case 3:
        return 'Average';
      case 4:
        return 'Good';
      case 5:
        return 'Excellent!';
      default:
        return 'Tap to rate';
    }
  }
}

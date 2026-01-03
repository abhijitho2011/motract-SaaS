import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../api_client.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 1, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [Tab(text: 'Map Settings')],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [MapSettingsTab()],
      ),
    );
  }
}

class MapSettingsTab extends StatefulWidget {
  const MapSettingsTab({super.key});

  @override
  State<MapSettingsTab> createState() => _MapSettingsTabState();
}

class _MapSettingsTabState extends State<MapSettingsTab> {
  final _formKey = GlobalKey<FormState>();
  final _tokenController = TextEditingController();
  final _expiryController = TextEditingController();

  bool _isLoading = false;
  bool _isTesting = false;
  Map<String, dynamic>? _currentSettings;
  String? _testResult;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  @override
  void dispose() {
    _tokenController.dispose();
    _expiryController.dispose();
    super.dispose();
  }

  Future<void> _loadSettings() async {
    setState(() => _isLoading = true);
    try {
      final settings = await ApiClient.getMapSettings();
      setState(() {
        _currentSettings = settings;
        if (settings['fullToken'] != null) {
          _tokenController.text = settings['fullToken'];
        }
        if (settings['expiresAt'] != null) {
          _expiryController.text = settings['expiresAt'];
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading settings: $e')));
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testConnection() async {
    if (_tokenController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter an API token')),
      );
      return;
    }

    setState(() {
      _isTesting = true;
      _testResult = null;
    });

    try {
      final result = await ApiClient.testMapConnection(_tokenController.text);
      setState(() {
        _testResult = result['message'];
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message']),
            backgroundColor: result['success'] ? Colors.green : Colors.red,
          ),
        );
      }
    } catch (e) {
      setState(() {
        _testResult = 'Test failed: $e';
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Test failed: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _isTesting = false);
    }
  }

  Future<void> _saveSettings() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      await ApiClient.updateMapSettings(
        _tokenController.text,
        _expiryController.text.isNotEmpty ? _expiryController.text : null,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Settings saved successfully'),
            backgroundColor: Colors.green,
          ),
        );
      }

      await _loadSettings();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving settings: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _currentSettings == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Bhuvan Map API Configuration',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Gap(8),
                    const Text(
                      'Configure your Bhuvan API token for map routing services.',
                      style: TextStyle(color: Colors.grey),
                    ),
                    const Gap(24),

                    // API Token Field
                    TextFormField(
                      controller: _tokenController,
                      decoration: const InputDecoration(
                        labelText: 'API Token',
                        hintText: 'Enter your Bhuvan API token',
                        border: OutlineInputBorder(),
                        helperText: 'Token expires every 24 hours',
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter an API token';
                        }
                        return null;
                      },
                      maxLines: 2,
                    ),
                    const Gap(16),

                    // Expiry Date Field
                    TextFormField(
                      controller: _expiryController,
                      decoration: const InputDecoration(
                        labelText: 'Expires At (Optional)',
                        hintText: '2026-01-04T23:04:00Z',
                        border: OutlineInputBorder(),
                        helperText: 'ISO 8601 format',
                      ),
                      maxLines: 1,
                    ),
                    const Gap(24),

                    // Action Buttons
                    Row(
                      children: [
                        ElevatedButton.icon(
                          onPressed: _isTesting ? null : _testConnection,
                          icon: _isTesting
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.wifi_tethering),
                          label: const Text('Test Connection'),
                        ),
                        const Gap(12),
                        ElevatedButton.icon(
                          onPressed: _isLoading ? null : _saveSettings,
                          icon: _isLoading
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.save),
                          label: const Text('Save'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ],
                    ),

                    // Test Result
                    if (_testResult != null) ...[
                      const Gap(16),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: _testResult!.contains('successful')
                              ? Colors.green.withOpacity(0.1)
                              : Colors.orange.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: _testResult!.contains('successful')
                                ? Colors.green
                                : Colors.orange,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _testResult!.contains('successful')
                                  ? Icons.check_circle
                                  : Icons.warning,
                              color: _testResult!.contains('successful')
                                  ? Colors.green
                                  : Colors.orange,
                            ),
                            const Gap(12),
                            Expanded(child: Text(_testResult!)),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const Gap(24),

            // Current Settings Info
            if (_currentSettings != null) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Current Configuration',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Gap(16),
                      _buildInfoRow(
                        'Provider',
                        _currentSettings!['provider'] ?? 'Not set',
                      ),
                      _buildInfoRow(
                        'Status',
                        _currentSettings!['isActive'] == true
                            ? 'Active'
                            : 'Inactive',
                      ),
                      if (_currentSettings!['expiresAt'] != null)
                        _buildInfoRow(
                          'Expires',
                          _currentSettings!['expiresAt'],
                        ),
                      if (_currentSettings!['updatedAt'] != null)
                        _buildInfoRow(
                          'Last Updated',
                          _currentSettings!['updatedAt'],
                        ),
                    ],
                  ),
                ),
              ),
            ],

            // Help Card
            const Gap(24),
            Card(
              color: Colors.blue.withOpacity(0.1),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.info_outline, color: Colors.blue[700]),
                        const Gap(8),
                        Text(
                          'Important Notes',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue[700],
                          ),
                        ),
                      ],
                    ),
                    const Gap(12),
                    const Text('• Bhuvan API tokens expire every 24 hours'),
                    const Text(
                      '• Only supports intra-state routing (not interstate)',
                    ),
                    const Text(
                      '• Test connection before saving to verify token',
                    ),
                    const Text(
                      '• Update token daily for uninterrupted service',
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

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
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

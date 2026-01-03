import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../core/api/api_client.dart';

class MapViewScreen extends StatefulWidget {
  const MapViewScreen({super.key});

  @override
  State<MapViewScreen> createState() => _MapViewScreenState();
}

class _MapViewScreenState extends State<MapViewScreen> {
  GoogleMapController? _mapController;
  List<dynamic> _organizations = [];
  Set<Marker> _markers = {};
  bool _isLoading = true;
  String? _error;

  // Filters
  bool _showWorkshop = true;
  bool _showSupplier = true;
  bool _showRSA = true;
  bool _showRebuildCenter = true;

  @override
  void initState() {
    super.initState();
    _loadOrganizations();
  }

  Future<void> _loadOrganizations() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final orgs = await ApiClient.getMapData();

      setState(() {
        _organizations = orgs;
        _isLoading = false;
      });

      _updateMarkers();
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _updateMarkers() {
    final markers = <Marker>{};

    for (final org in _organizations) {
      final accountType = org['accountType'] ?? '';

      // Apply filters
      if (accountType == 'WORKSHOP' && !_showWorkshop) continue;
      if (accountType == 'SUPPLIER' && !_showSupplier) continue;
      if (accountType == 'RSA' && !_showRSA) continue;
      if (accountType == 'REBUILD_CENTER' && !_showRebuildCenter) continue;

      final lat = org['latitude'];
      final lng = org['longitude'];

      if (lat == null || lng == null) continue;

      // Marker color based on category
      BitmapDescriptor markerColor = BitmapDescriptor.defaultMarkerWithHue(
        accountType == 'WORKSHOP'
            ? BitmapDescriptor.hueOrange
            : accountType == 'RSA'
            ? BitmapDescriptor.hueRed
            : accountType == 'SUPPLIER'
            ? BitmapDescriptor.hueGreen
            : BitmapDescriptor.hueViolet,
      );

      markers.add(
        Marker(
          markerId: MarkerId(org['id']),
          position: LatLng(lat.toDouble(), lng.toDouble()),
          icon: markerColor,
          infoWindow: InfoWindow(
            title: org['businessName'] ?? org['name'] ?? 'Unknown',
            snippet:
                '$accountType${org['subCategory'] != null ? ' - ${org['subCategory']}' : ''}',
            onTap: () => _showOrganizationDetails(org),
          ),
        ),
      );
    }

    setState(() {
      _markers = markers;
    });

    // Move camera to show all markers
    if (_mapController != null && markers.isNotEmpty) {
      _fitMarkersInView();
    }
  }

  void _fitMarkersInView() {
    if (_markers.isEmpty) return;

    double minLat = _markers.first.position.latitude;
    double maxLat = _markers.first.position.latitude;
    double minLng = _markers.first.position.longitude;
    double maxLng = _markers.first.position.longitude;

    for (final marker in _markers) {
      if (marker.position.latitude < minLat) minLat = marker.position.latitude;
      if (marker.position.latitude > maxLat) maxLat = marker.position.latitude;
      if (marker.position.longitude < minLng)
        minLng = marker.position.longitude;
      if (marker.position.longitude > maxLng)
        maxLng = marker.position.longitude;
    }

    _mapController?.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(
          southwest: LatLng(minLat, minLng),
          northeast: LatLng(maxLat, maxLng),
        ),
        50, // padding
      ),
    );
  }

  void _showOrganizationDetails(Map<String, dynamic> org) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              org['businessName'] ?? org['name'] ?? 'Unknown',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const Gap(8),
            Text(
              '${org['accountType']}${org['subCategory'] != null ? ' - ${org['subCategory']}' : ''}',
            ),
            const Gap(16),
            Row(
              children: [
                const Icon(Icons.email, size: 16),
                const Gap(8),
                Text(org['email'] ?? 'N/A'),
              ],
            ),
            const Gap(8),
            Row(
              children: [
                const Icon(Icons.phone, size: 16),
                const Gap(8),
                Text(org['phone'] ?? 'N/A'),
              ],
            ),
            const Gap(8),
            Row(
              children: [
                const Icon(Icons.location_on, size: 16),
                const Gap(8),
                Expanded(child: Text(org['address'] ?? 'N/A')),
              ],
            ),
            const Gap(16),
            Wrap(
              spacing: 8,
              children: [
                if (org['isAuthorized'] == true)
                  const Chip(
                    label: Text('Authorized'),
                    backgroundColor: Colors.green,
                    labelStyle: TextStyle(color: Colors.white),
                  ),
                if (org['isActive'] == true) const Chip(label: Text('Active')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Map View'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadOrganizations,
          ),
        ],
      ),
      body: _isLoading
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
                    onPressed: _loadOrganizations,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : Stack(
              children: [
                GoogleMap(
                  initialCameraPosition: const CameraPosition(
                    target: LatLng(20.5937, 78.9629), // India center
                    zoom: 5,
                  ),
                  markers: _markers,
                  onMapCreated: (controller) {
                    _mapController = controller;
                    _fitMarkersInView();
                  },
                ),
                // Filter Panel
                Positioned(
                  top: 16,
                  right: 16,
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text(
                            'Filters',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const Gap(8),
                          _buildFilterChip(
                            'Workshop',
                            _showWorkshop,
                            Colors.orange,
                            (value) {
                              setState(() => _showWorkshop = value);
                              _updateMarkers();
                            },
                          ),
                          _buildFilterChip(
                            'Supplier',
                            _showSupplier,
                            Colors.green,
                            (value) {
                              setState(() => _showSupplier = value);
                              _updateMarkers();
                            },
                          ),
                          _buildFilterChip('RSA', _showRSA, Colors.red, (
                            value,
                          ) {
                            setState(() => _showRSA = value);
                            _updateMarkers();
                          }),
                          _buildFilterChip(
                            'Rebuild Center',
                            _showRebuildCenter,
                            Colors.purple,
                            (value) {
                              setState(() => _showRebuildCenter = value);
                              _updateMarkers();
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                // Stats
                Positioned(
                  bottom: 16,
                  left: 16,
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Text(
                        'Showing ${_markers.length} of ${_organizations.length} organizations',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildFilterChip(
    String label,
    bool value,
    Color color,
    Function(bool) onChanged,
  ) {
    return CheckboxListTile(
      title: Text(label),
      value: value,
      dense: true,
      activeColor: color,
      onChanged: (val) => onChanged(val ?? false),
      contentPadding: EdgeInsets.zero,
      controlAffinity: ListTileControlAffinity.leading,
    );
  }
}

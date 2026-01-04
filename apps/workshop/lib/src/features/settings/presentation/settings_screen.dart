import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:go_router/go_router.dart';
import 'package:workshop/src/core/theme/theme_controller.dart';
import 'package:workshop/src/features/settings/presentation/inventory_settings_screen.dart';
import 'package:workshop/src/features/settings/presentation/inspection_settings_screen.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeControllerProvider);
    final isDark = themeMode == ThemeMode.dark;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          const _SectionHeader(title: 'General'),
          ListTile(
            leading: const Icon(Icons.person_outline),
            title: const Text('Profile'),
            subtitle: const Text('Manage your account'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => const AlertDialog(
                  title: Text('Profile'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ListTile(
                        title: Text('Name'),
                        subtitle: Text('Workshop Admin'),
                      ),
                      ListTile(title: Text('Role'), subtitle: Text('Manager')),
                      ListTile(
                        title: Text('Email'),
                        subtitle: Text('admin@motract.com'),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          ListTile(
            title: const Text('Dark Mode'),
            subtitle: Text(isDark ? 'On' : 'Off'),
            trailing: Switch(
              value: isDark,
              onChanged: (v) {
                ref.read(themeControllerProvider.notifier).toggleTheme();
              },
            ),
          ),
          const Divider(),
          const _SectionHeader(title: 'Master Data'),
          ListTile(
            leading: const Icon(Icons.inventory),
            title: const Text('Inventory Settings'),
            subtitle: const Text('Manage brands, categories, vehicle data'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const InventorySettingsScreen(),
                ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.checklist),
            title: const Text('Inspection Settings'),
            subtitle: const Text('Manage inspection checklist items'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const InspectionSettingsScreen(),
                ),
              );
            },
          ),
          const Divider(),
          const _SectionHeader(title: 'About'),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('Version'),
            subtitle: const Text('1.0.0 (Build 101)'),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Logout', style: TextStyle(color: Colors.red)),
            onTap: () {
              // TODO: Clear auth state
              context.go('/login');
            },
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          color: Theme.of(context).primaryColor,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

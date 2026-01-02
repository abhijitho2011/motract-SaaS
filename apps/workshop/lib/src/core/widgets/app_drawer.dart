import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class AppDrawer extends ConsumerWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                const Icon(Icons.build_circle, size: 48, color: Colors.white),
                const SizedBox(height: 8),
                Text(
                  'Motract Workshop',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          _DrawerItem(
            icon: Icons.dashboard,
            title: 'Dashboard',
            route: '/dashboard',
          ),
          _DrawerItem(
            icon: Icons.assignment,
            title: 'Job Cards',
            route: '/job-cards',
          ),
          _DrawerItem(
            icon: Icons.receipt_long,
            title: 'Billing',
            route: '/billing',
          ),
          _DrawerItem(
            icon: Icons.garage,
            title: 'Bay Management',
            route: '/bays',
          ),
          _DrawerItem(
            icon: Icons.inventory_2,
            title: 'Inventory',
            route: '/inventory',
          ),
          _DrawerItem(
            icon: Icons.shopping_cart,
            title: 'Purchase',
            route: '/purchase/orders',
          ),
          _DrawerItem(
            icon: Icons.people,
            title: 'Suppliers',
            route: '/purchase/suppliers',
          ),
          _DrawerItem(
            icon: Icons.attach_money,
            title: 'Expenses',
            route: '/expenses',
          ),
          _DrawerItem(
            icon: Icons.bar_chart,
            title: 'Reports',
            route: '/reports',
          ),
          const Divider(),
          _DrawerItem(
            icon: Icons.settings,
            title: 'Settings',
            route: '/settings',
          ),
        ],
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String route;

  const _DrawerItem({
    required this.icon,
    required this.title,
    required this.route,
  });

  @override
  Widget build(BuildContext context) {
    final currentRoute = GoRouterState.of(context).uri.path;
    final isSelected = currentRoute == route;

    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? Theme.of(context).colorScheme.primary : null,
      ),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected ? Theme.of(context).colorScheme.primary : null,
        ),
      ),
      selected: isSelected,
      onTap: () {
        Navigator.pop(context); // Close drawer
        context.go(route);
      },
    );
  }
}

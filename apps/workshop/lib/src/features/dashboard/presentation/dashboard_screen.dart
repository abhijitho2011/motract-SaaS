import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:workshop/src/features/dashboard/presentation/dashboard_controller.dart';
import 'package:workshop/src/core/widgets/app_drawer.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final kpiState = ref.watch(dashboardControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Workshop Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                ref.read(dashboardControllerProvider.notifier).refresh(),
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () {
              // TODO: Profile/Logout
            },
          ),
        ],
      ),
      drawer: const AppDrawer(),
      body: kpiState.when(
        data: (data) => _DashboardContent(data: data),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const Gap(16),
              Text(
                'Error loading dashboard: $err',
                textAlign: TextAlign.center,
              ),
              const Gap(16),
              FilledButton(
                onPressed: () =>
                    ref.read(dashboardControllerProvider.notifier).refresh(),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/vehicle/lookup'),
        icon: const Icon(Icons.add),
        label: const Text('New Job Card'),
      ),
    );
  }
}

class _DashboardContent extends StatelessWidget {
  final Map<String, dynamic> data;

  const _DashboardContent({required this.data});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        // Handled by the fab/icon button for now, but good to have
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildKpiGrid(context),
          const Gap(24),
          Text('Quick Actions', style: Theme.of(context).textTheme.titleLarge),
          const Gap(16),
          _buildQuickActions(context),
        ],
      ),
    );
  }

  Widget _buildKpiGrid(BuildContext context) {
    final vehiclesIn = data['vehiclesIn'] ?? 0;
    final jobsInProgress = data['jobsInProgress'] ?? 0;
    final revenue = data['revenue'] ?? 0;
    final pendingDeliveries = data['pendingDeliveries'] ?? 0;

    return Column(
      children: [
        GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            _KpiCard(
              title: 'Vehicles In',
              value: '$vehiclesIn',
              icon: Icons.directions_car,
              color: Colors.blue,
            ),
            _KpiCard(
              title: 'In Progress',
              value: '$jobsInProgress',
              icon: Icons.build,
              color: Colors.orange,
            ),
            _KpiCard(
              title: 'Revenue (Today)',
              value: '₹$revenue',
              icon: Icons.currency_rupee,
              color: Colors.green,
            ),
            _KpiCard(
              title: 'Pending Delivery',
              value: '$pendingDeliveries',
              icon: Icons.schedule,
              color: Colors.purple,
            ),
          ],
        ),
        const Gap(24),
        _SectionHeader(title: 'Job Funnel'),
        _buildFunnel(context),
        const Gap(24),
        if (data['recentJobs'] != null &&
            (data['recentJobs'] as List).isNotEmpty) ...[
          _SectionHeader(title: 'Recent Activity'),
          _buildRecentActivity(context, data['recentJobs']),
          const Gap(24),
        ],
      ],
    );
  }

  Widget _buildFunnel(BuildContext context) {
    // Ideally fetch from separate endpoint, but simple list is fine for MVP
    // We can infer some from KPI or just show static for now if data missing
    // or better, use the KPI counts we have:
    // Vehicles In -> WIP -> Pending Delivery -> Completed
    final vIn = data['vehiclesIn'] ?? 0;
    final wip = data['jobsInProgress'] ?? 0; // WIP
    final del = data['pendingDeliveries'] ?? 0; // Billing/Delivery
    final done = data['jobsCompleted'] ?? 0;

    // Simple bar visual
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _FunnelRow(label: 'Vehicles In', count: vIn, color: Colors.blue),
            const Gap(8),
            _FunnelRow(label: 'In Progress', count: wip, color: Colors.orange),
            const Gap(8),
            _FunnelRow(
              label: 'Quality Check / Bill',
              count: del,
              color: Colors.purple,
            ),
            const Gap(8),
            _FunnelRow(label: 'Completed', count: done, color: Colors.green),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivity(BuildContext context, List recent) {
    return Card(
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: recent.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final job = recent[index];
          final vehicle = job['vehicle'] ?? {};
          final customer = job['customer'] ?? {};
          return ListTile(
            dense: true,
            leading: const Icon(Icons.history, size: 18),
            title: Text('${vehicle['regNumber']} (${vehicle['model']})'),
            subtitle: Text(customer['name'] ?? 'Unknown'),
            trailing: Text(job['stage'], style: const TextStyle(fontSize: 10)),
            onTap: () => context.push('/job-card/inspection?id=${job['id']}'),
          );
        },
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Registry
        Row(
          children: [
            Expanded(
              child: _ActionCard(
                icon: Icons.search,
                title: 'Lookup',
                onTap: () => context.push('/vehicle/lookup'),
              ),
            ),
            const Gap(8),
            Expanded(
              child: _ActionCard(
                icon: Icons.add,
                title: 'New Job',
                onTap: () => context.push('/vehicle/lookup'),
              ),
            ),
          ],
        ),
        const Gap(16),
        const Text('Manage'),
        const Gap(8),
        _ActionTile(
          icon: Icons.assignment,
          title: 'Job Cards',
          subtitle: 'Manage active jobs',
          onTap: () => context.push('/job-cards'),
        ),

        _ActionTile(
          icon: Icons.inventory_2,
          title: 'Inventory',
          subtitle: 'Manage stock and items',
          onTap: () => context.push('/inventory'),
        ),
        _ActionTile(
          icon: Icons.receipt_long,
          title: 'Billing',
          subtitle: 'Generate invoices',
          onTap: () => context.push('/billing'),
        ),
        _ActionTile(
          icon: Icons.settings,
          title: 'Settings',
          subtitle: 'App configuration',
          onTap: () => context.push('/settings'),
        ),
      ],
    );
  }
}

class _FunnelRow extends StatelessWidget {
  final String label;
  final int count;
  final Color color;

  const _FunnelRow({
    required this.label,
    required this.count,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
        ),
        Expanded(
          child: LinearProgressIndicator(
            value: count > 0
                ? 1.0
                : 0.0, // Just full bar for existence? Or relative?
            // Relative is hard without total. Let's make it always look "active" if > 0
            // Actually, let's just use it as a colored bar indicator
            valueColor: AlwaysStoppedAnimation(color),
            backgroundColor: color.withOpacity(0.1),
            minHeight: 8,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const Gap(12),
        Text('$count', style: const TextStyle(fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  const _ActionCard({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.grey.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 24, color: Theme.of(context).primaryColor),
            const Gap(8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
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
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
          color: Colors.grey[600],
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _KpiCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: color),
            const Gap(8),
            Text(
              value,
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const Gap(4),
            Text(
              title,
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: Colors.grey),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).colorScheme.primaryContainer,
          child: Icon(icon, color: Theme.of(context).colorScheme.primary),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}

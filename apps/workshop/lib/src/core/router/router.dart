import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:workshop/src/features/auth/presentation/login_screen.dart';
import 'package:workshop/src/features/dashboard/presentation/dashboard_screen.dart';
import 'package:workshop/src/features/vehicle/presentation/vehicle_lookup_screen.dart';
import 'package:workshop/src/features/vehicle/presentation/vehicle_register_screen.dart';
import 'package:workshop/src/features/job_card/presentation/create_job_card_screen.dart';
import 'package:workshop/src/features/job_card/presentation/job_card_list_screen.dart';
import 'package:workshop/src/features/inventory/presentation/inventory_screen.dart';
import 'package:workshop/src/features/billing/presentation/billing_screen.dart';
import 'package:workshop/src/features/slot/presentation/enhanced_slot_screen.dart';
import 'package:workshop/src/features/settings/presentation/settings_screen.dart';
import 'package:workshop/src/features/job_card/presentation/inspection_screen.dart';
import 'package:workshop/src/features/job_card/presentation/estimate_screen.dart';
import 'package:workshop/src/features/job_card/presentation/execution_screen.dart';
import 'package:workshop/src/features/billing/presentation/invoice_screen.dart';
import 'package:workshop/src/features/purchase/presentation/supplier_list_screen.dart';
import 'package:workshop/src/features/purchase/presentation/purchase_order_list_screen.dart';
import 'package:workshop/src/features/purchase/presentation/purchase_order_create_screen.dart';
import 'package:workshop/src/features/purchase/presentation/purchase_order_details_screen.dart';
import 'package:workshop/src/features/expense/presentation/expense_list_screen.dart';
import 'package:workshop/src/features/reports/presentation/reports_screen.dart';
import 'package:workshop/src/features/vehicle/presentation/vehicle_database_screen.dart';

part 'router.g.dart';

@riverpod
GoRouter router(Ref ref) {
  return GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: '/vehicle/lookup',
        builder: (context, state) => const VehicleLookupScreen(),
      ),
      GoRoute(
        path: '/vehicle/register',
        builder: (context, state) {
          final reg = state.uri.queryParameters['reg'];
          return VehicleRegisterScreen(initialRegNumber: reg);
        },
      ),
      GoRoute(
        path: '/job-card/create',
        builder: (context, state) {
          final vehicleId = state.uri.queryParameters['vehicleId']!;
          return CreateJobCardScreen(vehicleId: vehicleId);
        },
      ),
      GoRoute(
        path: '/inventory',
        builder: (context, state) => const InventoryScreen(),
      ),
      GoRoute(
        path: '/vehicles',
        builder: (context, state) => const VehicleDatabaseScreen(),
      ),
      GoRoute(
        path: '/billing',
        builder: (context, state) => const BillingScreen(),
      ),
      GoRoute(
        path: '/slots',
        builder: (context, state) => const EnhancedSlotScreen(),
      ),
      GoRoute(
        path: '/job-cards',
        builder: (context, state) => const JobCardListScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/job-card/inspection',
        builder: (context, state) {
          final id = state.uri.queryParameters['id']!;
          return InspectionScreen(jobCardId: id);
        },
      ),
      GoRoute(
        path: '/job-card/estimate',
        builder: (context, state) {
          final id = state.uri.queryParameters['id']!;
          return EstimateScreen(jobCardId: id);
        },
      ),
      GoRoute(
        path: '/job-card/execution',
        builder: (context, state) {
          final id = state.uri.queryParameters['id']!;
          return ExecutionScreen(jobCardId: id);
        },
      ),
      GoRoute(
        path: '/billing/invoice',
        builder: (context, state) {
          final id = state.uri.queryParameters['id']!;
          return InvoiceScreen(jobCardId: id);
        },
      ),
      // Purchase & Supply Chain
      GoRoute(
        path: '/purchase/suppliers',
        builder: (context, state) => const SupplierListScreen(),
      ),
      GoRoute(
        path: '/purchase/orders',
        builder: (context, state) => const PurchaseOrderListScreen(),
      ),
      GoRoute(
        path: '/purchase/orders/create',
        builder: (context, state) => const PurchaseOrderCreateScreen(),
      ),
      GoRoute(
        path: '/purchase/orders/details',
        builder: (context, state) {
          final id = state.uri.queryParameters['id']!;
          return PurchaseOrderDetailsScreen(orderId: id);
        },
      ),
      GoRoute(
        path: '/expenses',
        builder: (context, state) => const ExpenseListScreen(),
      ),
      GoRoute(
        path: '/reports',
        builder: (context, state) => const ReportsScreen(),
      ),
    ],
  );
}

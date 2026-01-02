import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workshop/src/core/router/router.dart';
import 'package:workshop/src/core/theme/app_theme.dart';
import 'package:workshop/src/core/theme/theme_controller.dart';

void main() {
  runApp(const ProviderScope(child: WorkshopApp()));
}

class WorkshopApp extends ConsumerWidget {
  const WorkshopApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeControllerProvider);

    return MaterialApp.router(
      title: 'Motract Workshop',
      theme: AppTheme
          .darkTheme, // We should probably have light theme too, but user asked for "Theme config"
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}

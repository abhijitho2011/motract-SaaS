import 'package:flutter/material.dart';
import 'src/core/theme/tablet_theme.dart';
import 'src/features/dashboard/dashboard_screen.dart';
import 'src/core/theme/theme_controller.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: ThemeController.instance,
      builder: (context, themeMode, _) {
        return MaterialApp(
          title: 'Motract Super Admin',
          theme: TabletTheme.lightTheme,
          darkTheme: TabletTheme.darkTheme,
          themeMode: themeMode,
          home: const DashboardScreen(),
          debugShowCheckedModeBanner: false,
        );
      },
    );
  }
}

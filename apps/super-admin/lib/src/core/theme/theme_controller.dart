import 'package:flutter/material.dart';

class ThemeController extends ValueNotifier<ThemeMode> {
  static final ThemeController instance = ThemeController._();

  ThemeController._() : super(ThemeMode.light);

  void toggle() {
    value = value == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
  }

  void setMode(ThemeMode mode) {
    value = mode;
  }
}

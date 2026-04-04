import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:freshmart/app.dart';

void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const FreshMartApp());
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
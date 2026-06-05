import 'package:flutter/material.dart';

import '../../core/theme/app_radius.dart';

class AppCard extends StatelessWidget {
  final Widget child;

  const AppCard({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadius.largeBorder,
        boxShadow: const [
          BoxShadow(
            blurRadius: 12,
            color: Color(0x11000000),
            offset: Offset(0, 4),
          )
        ],
      ),
      child: child,
    );
  }
}
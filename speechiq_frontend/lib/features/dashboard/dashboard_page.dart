import 'package:flutter/material.dart';

import '../../shared/cards/stat_card.dart';
import '../../shared/cards/xp_progress_card.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      appBar: AppBar(
        title: const Text("SpeechIQ"),
      ),

      body: Padding(
        padding: const EdgeInsets.all(16),

        child: Column(
          children: [

            const XPProgressCard(
              level: 12,
              progress: 0.72,
            ),

            const SizedBox(height: 16),

            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                children: const [

                  StatCard(
                    label: "XP",
                    value: "4,520",
                    icon: Icons.bolt,
                  ),

                  StatCard(
                    label: "Streak",
                    value: "15 Days",
                    icon: Icons.local_fire_department,
                  ),

                  StatCard(
                    label: "Fluency",
                    value: "87",
                    icon: Icons.record_voice_over,
                  ),

                  StatCard(
                    label: "Clarity",
                    value: "91",
                    icon: Icons.mic,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
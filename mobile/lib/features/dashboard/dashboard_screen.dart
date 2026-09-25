import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      _MenuItem('Notes', Icons.grade, AppColors.blue),
      _MenuItem('Absences', Icons.event_busy, AppColors.orange),
      _MenuItem('Emploi du temps', Icons.calendar_month, AppColors.green),
      _MenuItem('Devoirs', Icons.assignment, AppColors.lightBlue),
      _MenuItem('Paiements', Icons.payments, AppColors.orange),
      _MenuItem('Messagerie', Icons.chat_bubble, AppColors.blue),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('SmartSchool')),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.1,
        ),
        itemCount: items.length,
        itemBuilder: (context, i) {
          final item = items[i];
          return Card(
            elevation: 1,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () {},
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(item.icon, size: 36, color: item.color),
                  const SizedBox(height: 10),
                  Text(item.label, style: const TextStyle(fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _MenuItem {
  final String label;
  final IconData icon;
  final Color color;
  _MenuItem(this.label, this.icon, this.color);
}

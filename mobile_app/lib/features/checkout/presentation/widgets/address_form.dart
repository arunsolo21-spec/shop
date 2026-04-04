import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class AddressForm extends StatefulWidget {
  final Function(Map<String, String>) onAddressChanged;

  const AddressForm({super.key, required this.onAddressChanged});

  @override
  State<AddressForm> createState() => _AddressFormState();
}

class _AddressFormState extends State<AddressForm> {
  final _nameController = TextEditingController();
  final _streetController = TextEditingController();
  final _cityController = TextEditingController();
  final _zipController = TextEditingController();

  void _notifyChange() {
    widget.onAddressChanged({
      'name': _nameController.text,
      'street': _streetController.text,
      'city': _cityController.text,
      'zip': _zipController.text,
    });
  }

  @override
  void initState() {
    super.initState();
    _nameController.addListener(_notifyChange);
    _streetController.addListener(_notifyChange);
    _cityController.addListener(_notifyChange);
    _zipController.addListener(_notifyChange);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _streetController.dispose();
    _cityController.dispose();
    _zipController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.location_on_outlined, color: AppTheme.primaryGreen),
              SizedBox(width: 8),
              Text(
                "Delivery Address",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _nameController,
            decoration: const InputDecoration(labelText: "Full Name"),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _streetController,
            decoration: const InputDecoration(labelText: "Street Address"),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _cityController,
                  decoration: const InputDecoration(labelText: "City"),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _zipController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: "Zip Code"),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

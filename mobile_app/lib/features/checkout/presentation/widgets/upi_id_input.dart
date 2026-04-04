import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../../core/theme/app_theme.dart';

class UPIIDInput extends StatefulWidget {
  final String? initialValue;
  final Function(String) onVPAChanged;
  final bool isEnabled;

  const UPIIDInput({
    super.key,
    this.initialValue,
    required this.onVPAChanged,
    this.isEnabled = true,
  });

  @override
  State<UPIIDInput> createState() => _UPIIDInputState();
}

class _UPIIDInputState extends State<UPIIDInput> {
  late TextEditingController _controller;
  String? _errorText;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialValue ?? '');
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _validateVPA(String vpa) {
    if (vpa.isEmpty) {
      setState(() => _errorText = null);
      return;
    }

    final regex = RegExp(r'^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$');

    if (!regex.hasMatch(vpa)) {
      setState(() => _errorText = 'Invalid UPI ID format');
    } else {
      setState(() => _errorText = null);
    }

    widget.onVPAChanged(vpa);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Or Enter UPI ID',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppTheme.textDark,
          ),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: _controller,
          enabled: widget.isEnabled,
          onChanged: _validateVPA,
          keyboardType: TextInputType.text,
          inputFormatters: [
            LengthLimitingTextInputFormatter(256),
          ],
          style: const TextStyle(
            fontSize: 14,
            color: AppTheme.textDark,
          ),
          decoration: InputDecoration(
            hintText: 'example@upi',
            hintStyle: TextStyle(
              color: Colors.grey.shade400,
              fontSize: 14,
            ),
            prefixIcon: Icon(
              Icons.qr_code,
              color: Colors.grey.shade600,
            ),
            suffixIcon: _controller.text.isNotEmpty
                ? IconButton(
                    icon: Icon(
                      Icons.clear,
                      color: Colors.grey.shade400,
                    ),
                    onPressed: () {
                      _controller.clear();
                      widget.onVPAChanged('');
                    },
                  )
                : null,
            filled: true,
            fillColor: Colors.grey.shade50,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade200),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade200),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: AppTheme.primaryGreen,
                width: 2,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.red),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Colors.red,
                width: 2,
              ),
            ),
            errorText: _errorText,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Example: mobile@paytm, name@oksbi',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade500,
          ),
        ),
      ],
    );
  }
}
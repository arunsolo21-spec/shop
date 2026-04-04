import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  // Controllers
  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPassController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  // State: 0 = Enter Email, 1 = Enter OTP
  int _currentStep = 0;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    _newPassController.dispose();
    super.dispose();
  }

  // STEP 1: Request OTP
  Future<void> _sendCode() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    try {
      // Call Backend to generate OTP
      await ref
          .read(authRemoteSourceProvider)
          .forgotPassword(_emailController.text.trim());

      setState(() {
        _isLoading = false;
        _currentStep = 1; // Move to Next Step
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text("Code sent! Check your backend terminal."),
            backgroundColor: Colors.green),
      );
    } catch (e) {
      setState(() => _isLoading = false);
      _showError("User not found or connection error");
    }
  }

  // STEP 2: Verify & Reset
  Future<void> _resetPassword() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    try {
      // Call Backend to verify OTP and update password
      await ref.read(authRemoteSourceProvider).resetPassword(
            _emailController.text.trim(),
            _otpController.text.trim(),
            _newPassController.text,
          );

      setState(() => _isLoading = false);

      // Success! Go back to Login
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text("Password Reset Successful! Login now."),
            backgroundColor: Colors.green),
      );
      context.pop();
    } catch (e) {
      setState(() => _isLoading = false);
      if (e is DioException) {
        _showError(e.response?.data['message'] ?? "Invalid Code");
      } else {
        _showError("Failed to reset password");
      }
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.redAccent),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(_currentStep == 0 ? "Forgot Password" : "Reset Password"),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new,
              size: 20, color: Colors.black),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),

                // Dynamic Header Text
                Text(
                  _currentStep == 0 ? "Enter Email" : "Verify Code",
                  style: const TextStyle(
                      fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  _currentStep == 0
                      ? "We will send a 6-digit code to your email."
                      : "Enter the code sent to ${_emailController.text} and your new password.",
                  style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                ),
                const SizedBox(height: 30),

                // --- STEP 0: EMAIL INPUT ---
                if (_currentStep == 0) ...[
                  _buildTextField(
                    label: "Email",
                    controller: _emailController,
                    hint: "example@gmail.com",
                  ),
                  const SizedBox(height: 30),
                  _buildButton(text: "Send Code", onTap: _sendCode),
                ],

                // --- STEP 1: OTP & NEW PASSWORD ---
                if (_currentStep == 1) ...[
                  _buildTextField(
                      label: "OTP Code",
                      controller: _otpController,
                      hint: "123456",
                      isNumber: true),
                  const SizedBox(height: 20),
                  _buildTextField(
                      label: "New Password",
                      controller: _newPassController,
                      hint: "********",
                      isPassword: true),
                  const SizedBox(height: 30),
                  _buildButton(text: "Reset Password", onTap: _resetPassword),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  // --- Helper Widgets ---
  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required String hint,
    bool isPassword = false,
    bool isNumber = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: TextStyle(
                fontWeight: FontWeight.w600, color: Colors.grey.shade700)),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: isPassword,
          keyboardType: isNumber ? TextInputType.number : TextInputType.text,
          validator: (val) => val!.isEmpty ? 'Required' : null,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: Colors.grey.shade50,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.grey.shade200),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide:
                  const BorderSide(color: Color(0xFF1B5E20), width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildButton({required String text, required VoidCallback onTap}) {
    return SizedBox(
      height: 56,
      child: ElevatedButton(
        onPressed: _isLoading ? null : onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF1B5E20),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        ),
        child: _isLoading
            ? const CircularProgressIndicator(color: Colors.white)
            : Text(text,
                style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white)),
      ),
    );
  }
}

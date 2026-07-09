import 'dart:convert';
import 'package:http/http.dart' as http;

/// Handles all raw HTTP requests to the SpeechIQ backend.
class ApiService {
  static const String baseUrl = 'http://localhost:8000';

  Future<Map<String, dynamic>> get(String endpoint) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
    );

    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> post(
      String endpoint, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    return jsonDecode(response.body);
  }
}

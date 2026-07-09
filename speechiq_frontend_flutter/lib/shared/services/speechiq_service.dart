import 'dart:typed_data';

import 'package:http/http.dart' as http;
import 'dart:convert';

import 'api_service.dart';

/// Communicates with the SpeechIQ backend for speech analysis and synthesis.

class SpeechIQService {
  final ApiService _apiService = ApiService();

  Future<Map<String, dynamic>> analyzeAudio(String filePath) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse(
        '${ApiService.baseUrl}/analyze',
      ),
    );

    request.files.add(
      await http.MultipartFile.fromPath(
        'file',
        filePath,
      ),
    );

    final response = await request.send();

    final body = await response.stream.bytesToString();

    return jsonDecode(body);
  }

  Future<Map<String, dynamic>> analyzeAudioBytes(
    Uint8List bytes,
    String filename,
  ) async {
    final request = http.MultipartRequest(
      "POST",
      Uri.parse(
        "${ApiService.baseUrl}/analyze",
      ),
    );

    request.files.add(
      http.MultipartFile.fromBytes(
        "file",
        bytes,
        filename: filename,
      ),
    );

    final response = await request.send();

    final body = await response.stream.bytesToString();

    return jsonDecode(body);
  }

  Future<String> synthesizeVoice(String text,
      {double speed = 1.0, double pitch = 1.0}) async {
    throw UnimplementedError('TTS backend not implemented yet');
  }
}

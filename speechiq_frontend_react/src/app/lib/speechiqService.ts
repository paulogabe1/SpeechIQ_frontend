import { apiPostMultipart } from "./apiClient";
import { parseAnalysisResult, type AnalysisResult } from "./analysisResult";

/** Sends recorded/uploaded audio to the FastAPI /analyze endpoint and parses the response. */
export async function analyzeAudio(fileOrBlob: File | Blob, filename: string): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", fileOrBlob, filename);

  const json = await apiPostMultipart("/analyze", formData);
  return parseAnalysisResult(json);
}

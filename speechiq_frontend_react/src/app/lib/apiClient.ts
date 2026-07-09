import { API_BASE_URL } from "./config";

/**
 * POSTs a FormData payload (multipart/form-data). Do not set Content-Type manually —
 * the browser needs to set the multipart boundary itself.
 */
export async function apiPostMultipart(path: string, formData: FormData): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

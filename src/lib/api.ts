import { Detection } from "@/types/analysis";

const API_URL = "/api";

export interface LocalAnalysisResponse {
  detections: Detection[];
  image_url?: string; // The API might return a URL or base64
}

export async function uploadImage(file: File): Promise<LocalAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: {
      Accept: "application/json", // Keep this, though API might ignore it
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  // Check if response is JSON or Blob
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    // Assume it's an image blob
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    return {
      detections: [], // Local API didn't return detections, just image
      image_url: imageUrl,
    };
  }
}

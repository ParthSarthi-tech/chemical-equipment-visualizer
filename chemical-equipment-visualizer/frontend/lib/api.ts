"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const DEMO_CREDENTIALS = { username: "admin", password: "admin123" };

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("chemviz_demo_mode") === "true";
}

export function setDemoMode(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem("chemviz_demo_mode", "true");
  } else {
    localStorage.removeItem("chemviz_demo_mode");
  }
}

function getAuthHeader(): string | null {
  if (typeof window === "undefined") return null;
  const credentials = localStorage.getItem("chemviz_auth");
  if (!credentials) return null;
  return `Basic ${credentials}`;
}

export function setAuthCredentials(username: string, password: string): void {
  const credentials = btoa(`${username}:${password}`);
  localStorage.setItem("chemviz_auth", credentials);
  localStorage.setItem("chemviz_username", username);
}

export function clearAuthCredentials(): void {
  localStorage.removeItem("chemviz_auth");
  localStorage.removeItem("chemviz_username");
  localStorage.removeItem("chemviz_demo_mode");
}

export function getStoredUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("chemviz_username");
}

export interface ApiSummary {
  total_equipment: number;
  avg_flowrate: number;
  avg_pressure: number;
  avg_temperature: number;
  type_distribution: Record<string, number>;
}

export interface ApiDataset {
  id: number;
  filename: string;
  uploaded_at: string;
  summary: ApiSummary;
}

export interface UploadResponse {
  message: string;
  summary: ApiSummary;
}
export async function verifyCredentials(
  username: string,
  password: string
): Promise<{ success: boolean; demoMode: boolean }> {
  const credentials = btoa(`${username}:${password}`);

  try {
    const response = await fetch(`${API_BASE_URL}/history/`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      setDemoMode(false);
      return { success: true, demoMode: false };
    }
    return { success: false, demoMode: false };
  } catch {
    if (
      username === DEMO_CREDENTIALS.username &&
      password === DEMO_CREDENTIALS.password
    ) {
      setDemoMode(true);
      return { success: true, demoMode: true };
    }
    return { success: false, demoMode: false };
  }
}

export async function uploadCSV(file: File): Promise<UploadResponse> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    throw new Error("Not authenticated");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload/`, {
    method: "POST",
    headers: {
      "Authorization": authHeader,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getHistory(): Promise<ApiDataset[]> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/history/`, {
    method: "GET",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.statusText}`);
  }

  return response.json();
}

export async function downloadPDFReport(datasetId: number, filename: string): Promise<void> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/report/${datasetId}/`, {
    method: "GET",
    headers: {
      "Authorization": authHeader,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download report: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_report.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

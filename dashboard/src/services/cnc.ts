import type { MachineSnapshot } from "../types/cnc";

const API_BASE_URL = "http://localhost:5005/api/cnc";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function getSnapshot(): Promise<MachineSnapshot> {
  const response = await fetch(
    `${API_BASE_URL}/snapshot`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch CNC snapshot: ${response.status}`
    );
  }

  const result =
    (await response.json()) as ApiResponse<MachineSnapshot>;

  if (!result.success) {
    throw new Error(
      result.message ?? "Failed to fetch CNC snapshot."
    );
  }

  return result.data;
}
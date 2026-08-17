import type {
  HistoryResponse,
  SpindleHistoryPoint,
  TemperatureHistoryPoint,
} from "../types/history";

const API_BASE_URL = "http://localhost:5005";

async function fetchHistory<T>(
  endpoint: string,
  count = 300
): Promise<T[]> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}?count=${count}`
  );

  if (!response.ok) {
    throw new Error(
      `History API request failed: ${response.status}`
    );
  }

  const result: HistoryResponse<T> = await response.json();

  if (!result.success) {
    throw new Error("History API returned an unsuccessful response.");
  }

  return result.data;
}

export function getSpindleHistory(
  count = 300
): Promise<SpindleHistoryPoint[]> {
  return fetchHistory<SpindleHistoryPoint>(
    "/api/cnc/history/spindle",
    count
  );
}

export function getTemperatureHistory(
  count = 300
): Promise<TemperatureHistoryPoint[]> {
  return fetchHistory<TemperatureHistoryPoint>(
    "/api/cnc/history/temperature",
    count
  );
}
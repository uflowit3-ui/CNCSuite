export interface SpindleHistoryPoint {
  timestamp: string;
  rpm: number;
  targetRpm: number;
  load: number;
  power: number;
  temperature: number;
  isRunning: boolean;
}

export interface TemperatureHistoryPoint {
  timestamp: string;
  spindleTemperature: number;
}

export interface HistoryResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}
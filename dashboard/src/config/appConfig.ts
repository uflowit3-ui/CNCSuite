// ============================================================
// export function getCncHubUrl(): string {
// Central application configuration
// ============================================================

export interface AppSettings {
  // ----------------------------------------------------------
  // CNC MACHINE
  // ----------------------------------------------------------

  machineName: string;

  // ----------------------------------------------------------
  // BACKEND
  // ----------------------------------------------------------

  apiBaseUrl: string;

  // ----------------------------------------------------------
  // DASHBOARD
  // ----------------------------------------------------------

  refreshInterval: number;

  historyCount: number;

  // ----------------------------------------------------------
  // OEE
  // ----------------------------------------------------------

  idealCycleTime: number;
}

// ============================================================
// DEFAULT SETTINGS
// ============================================================

export const DEFAULT_SETTINGS: AppSettings = {
  machineName: "CNC-01",

  apiBaseUrl:
    "http://localhost:5005",

  refreshInterval: 5,

  historyCount: 300,

  idealCycleTime: 12.5,
};

// ============================================================
// STORAGE KEY
// ============================================================

const STORAGE_KEY =
  "cnc-dashboard-settings";

// ============================================================
// NORMALIZE API URL
// ============================================================

function normalizeApiBaseUrl(
  url: string
): string {
  return url
    .trim()
    .replace(/\/+$/, "");
}

// ============================================================
// VALIDATE SETTINGS
// ============================================================

function normalizeSettings(
  settings: Partial<AppSettings>
): AppSettings {
  return {
    machineName:
      typeof settings.machineName === "string" &&
      settings.machineName.trim().length > 0
        ? settings.machineName.trim()
        : DEFAULT_SETTINGS.machineName,

    apiBaseUrl:
      typeof settings.apiBaseUrl === "string" &&
      settings.apiBaseUrl.trim().length > 0
        ? normalizeApiBaseUrl(
            settings.apiBaseUrl
          )
        : DEFAULT_SETTINGS.apiBaseUrl,

    refreshInterval:
      typeof settings.refreshInterval ===
        "number" &&
      Number.isFinite(
        settings.refreshInterval
      ) &&
      settings.refreshInterval >= 1
        ? settings.refreshInterval
        : DEFAULT_SETTINGS.refreshInterval,

    historyCount:
      typeof settings.historyCount ===
        "number" &&
      Number.isFinite(
        settings.historyCount
      ) &&
      settings.historyCount >= 1
        ? Math.floor(
            settings.historyCount
          )
        : DEFAULT_SETTINGS.historyCount,

    idealCycleTime:
      typeof settings.idealCycleTime ===
        "number" &&
      Number.isFinite(
        settings.idealCycleTime
      ) &&
      settings.idealCycleTime > 0
        ? settings.idealCycleTime
        : DEFAULT_SETTINGS.idealCycleTime,
  };
}

// ============================================================
// GET ALL SETTINGS
// ============================================================

export function getAppSettings(): AppSettings {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return {
        ...DEFAULT_SETTINGS,
      };
    }

    const parsed =
      JSON.parse(
        stored
      ) as Partial<AppSettings>;

    return normalizeSettings(
      parsed
    );

  } catch (error) {
    console.error(
      "Failed to load application settings:",
      error
    );

    return {
      ...DEFAULT_SETTINGS,
    };
  }
}

// ============================================================
// SAVE ALL SETTINGS
// ============================================================

export function saveAppSettings(
  settings: AppSettings
): void {
  const normalized =
    normalizeSettings(
      settings
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      normalized
    )
  );
}

// ============================================================
// RESET SETTINGS
// ============================================================

export function resetAppSettings(): AppSettings {
  const defaults = {
    ...DEFAULT_SETTINGS,
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      defaults
    )
  );

  return defaults;
}

// ============================================================
// INDIVIDUAL GETTERS
// ============================================================

export function getApiBaseUrl(): string {
  return getAppSettings()
    .apiBaseUrl;
}

export function getMachineName(): string {
  return getAppSettings()
    .machineName;
}

export function getRefreshInterval(): number {
  return getAppSettings()
    .refreshInterval;
}

export function getHistoryCount(): number {
  return getAppSettings()
    .historyCount;
}

export function getIdealCycleTime(): number {
  return getAppSettings()
    .idealCycleTime;
}

// ============================================================
// SIGNALR HUB URL
// ============================================================

export function getCncHubUrl(): string {
  return `${getApiBaseUrl()}/hubs/cnc`;
  //return `${getApiBaseUrl()}/hubs/cnc-dashboard`;
}

// ============================================================
// API URL BUILDER
// ============================================================

export function buildApiUrl(
  path: string
): string {
  const baseUrl =
    getApiBaseUrl();

  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

// ============================================================
// COMMON API ENDPOINTS
// ============================================================

export const API_ENDPOINTS = {
  status:
    "/api/cnc/status",

  production:
    "/api/cnc/production",

  history:
    "/api/cnc/history",

  productionHistory:
    "/api/cnc/history/production",

  axisHistory:
    "/api/cnc/history/axis",

  alarmHistory:
    "/api/cnc/history/alarms",

  currentAlarm:
    "/api/cnc/alarm",

  reports:
    "/api/cnc/reports",

  oee:
    "/api/cnc/oee",
} as const;

// ============================================================
// ENDPOINT BUILDERS
// ============================================================

export function getStatusUrl(): string {
  return buildApiUrl(
    API_ENDPOINTS.status
  );
}

export function getProductionUrl(): string {
  return buildApiUrl(
    API_ENDPOINTS.production
  );
}

export function getHistoryUrl(): string {
  return buildApiUrl(
    API_ENDPOINTS.history
  );
}

export function getProductionHistoryUrl(
  count?: number
): string {
  const historyCount =
    count ?? getHistoryCount();

  return `${buildApiUrl(
    API_ENDPOINTS.productionHistory
  )}?count=${historyCount}`;
}

export function getAxisHistoryUrl(
  count?: number
): string {
  const historyCount =
    count ?? getHistoryCount();

  return `${buildApiUrl(
    API_ENDPOINTS.axisHistory
  )}?count=${historyCount}`;
}

export function getAlarmHistoryUrl(
  count?: number
): string {
  const historyCount =
    count ?? getHistoryCount();

  return `${buildApiUrl(
    API_ENDPOINTS.alarmHistory
  )}?count=${historyCount}`;
}

export function getCurrentAlarmUrl(): string {
  return buildApiUrl(
    API_ENDPOINTS.currentAlarm
  );
}

export function getReportsUrl(
  hours: number
): string {
  return `${buildApiUrl(
    API_ENDPOINTS.reports
  )}?hours=${hours}`;
}

export function getOeeUrl(
  count?: number
): string {
  const historyCount =
    count ?? getHistoryCount();

  const idealCycleTime =
    getIdealCycleTime();

  return `${buildApiUrl(
    API_ENDPOINTS.oee
  )}?count=${historyCount}&idealCycleTimeSeconds=${idealCycleTime}`;
}

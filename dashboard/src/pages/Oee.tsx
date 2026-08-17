import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAppSettings,
} from "../config/appConfig";

// ============================================================
// TYPES
// ============================================================

interface OeeData {
  available: boolean;

  message?: string;

  snapshotCount: number;

  period?: {
    start: string;
    end: string;
    durationSeconds: number;
  };

  availability: number;
  performance: number;
  quality: number;
  oee: number;

  totalParts: number;
  goodParts: number;
  rejectParts: number;

  targetQuantity: number;
  actualQuantity: number;
  targetCompletion: number;

  powerOnSeconds: number;
  runningSeconds: number;
  idleSeconds: number;
  alarmSeconds: number;
  stoppedSeconds: number;

  idealCycleTimeSeconds: number;
  averageCycleTimeSeconds: number;
  cycleTimeSampleCount: number;
}

interface OeeResponse {
  success: boolean;
  data: OeeData;
}

// ============================================================
// HELPERS
// ============================================================

function formatSeconds(
  seconds: number | undefined
): string {
  if (
    seconds === undefined ||
    !Number.isFinite(seconds)
  ) {
    return "00:00:00";
  }

  const total =
    Math.max(
      0,
      Math.floor(seconds)
    );

  const hours =
    Math.floor(
      total / 3600
    );

  const minutes =
    Math.floor(
      (total % 3600) / 60
    );

  const secs =
    total % 60;

  return [
    hours
      .toString()
      .padStart(2, "0"),

    minutes
      .toString()
      .padStart(2, "0"),

    secs
      .toString()
      .padStart(2, "0"),
  ].join(":");
}

function formatPercent(
  value: number | undefined
): string {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "0.0%";
  }

  return `${value.toFixed(1)}%`;
}

function formatNumber(
  value: number | undefined
): string {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "0";
  }

  return value.toLocaleString();
}

function formatSecondsDecimal(
  value: number | undefined
): string {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "0.0 s";
  }

  return `${value.toFixed(1)} s`;
}

function getOeeClass(
  value: number
): string {
  if (value >= 85) {
    return "oee-good";
  }

  if (value >= 60) {
    return "oee-warning";
  }

  return "oee-danger";
}

// ============================================================
// COMPONENT
// ============================================================

export default function Oee() {
  const [
    data,
    setData,
  ] = useState<OeeData | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState<Date | null>(
    null
  );

  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  // ==========================================================
  // LOAD OEE
  // ==========================================================

  const loadOee =
    useCallback(
      async () => {
        try {
          setError(null);

          const settings =
            getAppSettings();

          const baseUrl =
            settings.apiBaseUrl
              .replace(/\/+$/, "");

          const count =
            settings.historyCount;

          const idealCycleTime =
            settings.idealCycleTime;

          const url =
            `${baseUrl}/api/cnc/oee` +
            `?count=${encodeURIComponent(
              count
            )}` +
            `&idealCycleTimeSeconds=${encodeURIComponent(
              idealCycleTime
            )}`;

          const response =
            await fetch(url, {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
              },
              cache: "no-store",
            });

          if (!response.ok) {
            throw new Error(
              `OEE API error: ${response.status}`
            );
          }

          const result =
            (await response.json()) as OeeResponse;

          if (
            !result.success ||
            !result.data
          ) {
            throw new Error(
              result.data?.message ??
                "Unable to load OEE data."
            );
          }

          setData(
            result.data
          );

          setLastUpdated(
            new Date()
          );

        } catch (err) {
          console.error(
            "Failed to load OEE:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load OEE data."
          );

        } finally {
          setLoading(false);
        }
      },
      []
    );

  // ==========================================================
  // INITIAL LOAD + AUTO REFRESH
  // ==========================================================

  useEffect(() => {
    void loadOee();

    const settings =
      getAppSettings();

    const intervalMs =
      Math.max(
        1,
        settings.refreshInterval
      ) * 1000;

    const timer =
      window.setInterval(
        () => {
          void loadOee();
        },
        intervalMs
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    loadOee,
    refreshKey,
  ]);

  // ==========================================================
  // CALCULATED VALUES
  // ==========================================================

  const calculated =
    useMemo(() => {
      if (!data) {
        return {
          totalRuntime: 0,
          productionEfficiency: 0,
          rejectRate: 0,
        };
      }

      const totalRuntime =
        data.runningSeconds +
        data.idleSeconds +
        data.alarmSeconds +
        data.stoppedSeconds;

      const productionEfficiency =
        data.targetQuantity > 0
          ? (
              data.totalParts /
              data.targetQuantity
            ) * 100
          : 0;

      const rejectRate =
        data.totalParts > 0
          ? (
              data.rejectParts /
              data.totalParts
            ) * 100
          : 0;

      return {
        totalRuntime,
        productionEfficiency,
        rejectRate,
      };
    }, [
      data,
    ]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading &&
    !data
  ) {
    return (
      <div className="page-container oee-page">
        <div className="page-header">
          <div>
            <h1>OEE</h1>
            <p>
              Overall Equipment Effectiveness
            </p>
          </div>
        </div>

        <div className="oee-loading">
          Loading OEE data...
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    !data
  ) {
    return (
      <div className="page-container oee-page">
        <div className="page-header">
          <div>
            <h1>OEE</h1>
            <p>
              Overall Equipment Effectiveness
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setLoading(true);
              setRefreshKey(
                (value) =>
                  value + 1
              );
            }}
          >
            Retry
          </button>
        </div>

        <div className="oee-error">
          <strong>
            Unable to load OEE
          </strong>

          <span>
            {error}
          </span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="page-container oee-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="page-header">

        <div>
          <h1>OEE</h1>

          <p>
            Overall Equipment Effectiveness
          </p>
        </div>

        <div className="page-header-actions">

          <div className="oee-status">

            <span
              className={
                data?.available
                  ? "status-dot online"
                  : "status-dot offline"
              }
            />

            <span>
              {data?.available
                ? "Data Available"
                : "No Data"}
            </span>

          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setLoading(true);

              setRefreshKey(
                (value) =>
                  value + 1
              );
            }}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

      </div>

      {/* =====================================================
          ERROR BANNER
          ===================================================== */}

      {error && (
        <div className="oee-warning-banner">
          {error}
        </div>
      )}

      {/* =====================================================
          PERIOD
          ===================================================== */}

      {data?.period && (
        <div className="oee-period-card">

          <div>
            <span>
              PERIOD START
            </span>

            <strong>
              {new Date(
                data.period.start
              ).toLocaleString()}
            </strong>
          </div>

          <div>
            <span>
              PERIOD END
            </span>

            <strong>
              {new Date(
                data.period.end
              ).toLocaleString()}
            </strong>
          </div>

          <div>
            <span>
              DURATION
            </span>

            <strong>
              {formatSeconds(
                data.period
                  .durationSeconds
              )}
            </strong>
          </div>

          <div>
            <span>
              SNAPSHOTS
            </span>

            <strong>
              {formatNumber(
                data.snapshotCount
              )}
            </strong>
          </div>

        </div>
      )}

      {/* =====================================================
          OEE MAIN CARD
          ===================================================== */}

      <div className="oee-main-card">

        <div className="oee-score">

          <span className="oee-score-label">
            OEE
          </span>

          <strong
            className={getOeeClass(
              data?.oee ?? 0
            )}
          >
            {formatPercent(
              data?.oee
            )}
          </strong>

          <small>
            Availability × Performance × Quality
          </small>

        </div>

        <div className="oee-factors">

          <div className="oee-factor">

            <span>
              AVAILABILITY
            </span>

            <strong>
              {formatPercent(
                data?.availability
              )}
            </strong>

            <div className="oee-progress">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      data?.availability ?? 0
                    )
                  )}%`,
                }}
              />
            </div>

          </div>

          <div className="oee-factor">

            <span>
              PERFORMANCE
            </span>

            <strong>
              {formatPercent(
                data?.performance
              )}
            </strong>

            <div className="oee-progress">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      data?.performance ?? 0
                    )
                  )}%`,
                }}
              />
            </div>

          </div>

          <div className="oee-factor">

            <span>
              QUALITY
            </span>

            <strong>
              {formatPercent(
                data?.quality
              )}
            </strong>

            <div className="oee-progress">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      data?.quality ?? 0
                    )
                  )}%`,
                }}
              />
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          PRODUCTION
          ===================================================== */}

      <section className="dashboard-section">

        <div className="section-header">
          <div>
            <h2>
              Production
            </h2>

            <p>
              Production performance during the selected period.
            </p>
          </div>
        </div>

        <div className="stats-grid">

          <div className="stat-card">

            <span>
              TOTAL PARTS
            </span>

            <strong>
              {formatNumber(
                data?.totalParts
              )}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              GOOD PARTS
            </span>

            <strong>
              {formatNumber(
                data?.goodParts
              )}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              REJECT PARTS
            </span>

            <strong>
              {formatNumber(
                data?.rejectParts
              )}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              TARGET
            </span>

            <strong>
              {formatNumber(
                data?.targetQuantity
              )}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              TARGET COMPLETION
            </span>

            <strong>
              {formatPercent(
                data?.targetCompletion
              )}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              REJECT RATE
            </span>

            <strong>
              {formatPercent(
                calculated.rejectRate
              )}
            </strong>

          </div>

        </div>

      </section>

      {/* =====================================================
          RUNTIME
          ===================================================== */}

      <section className="dashboard-section">

        <div className="section-header">

          <div>
            <h2>
              Runtime
            </h2>

            <p>
              Runtime calculated for the selected history window.
            </p>
          </div>

        </div>

        <div className="machine-runtime-grid">

          <div>
            <span>
              POWER ON
            </span>

            <strong>
              {formatSeconds(
                data?.powerOnSeconds
              )}
            </strong>
          </div>

          <div>
            <span>
              RUNNING
            </span>

            <strong>
              {formatSeconds(
                data?.runningSeconds
              )}
            </strong>
          </div>

          <div>
            <span>
              IDLE
            </span>

            <strong>
              {formatSeconds(
                data?.idleSeconds
              )}
            </strong>
          </div>

          <div>
            <span>
              ALARM
            </span>

            <strong>
              {formatSeconds(
                data?.alarmSeconds
              )}
            </strong>
          </div>

          <div>
            <span>
              STOPPED
            </span>

            <strong>
              {formatSeconds(
                data?.stoppedSeconds
              )}
            </strong>
          </div>

        </div>

      </section>

      {/* =====================================================
          CYCLE TIME
          ===================================================== */}

      <section className="dashboard-section">

        <div className="section-header">

          <div>
            <h2>
              Cycle Time
            </h2>

            <p>
              Cycle-time performance for the selected period.
            </p>
          </div>

        </div>

        <div className="stats-grid">

          <div className="stat-card">

            <span>
              IDEAL CYCLE TIME
            </span>

            <strong>
              {formatSecondsDecimal(
                data?.idealCycleTimeSeconds
              )}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              AVERAGE CYCLE TIME
            </span>

            <strong>
              {formatSecondsDecimal(
                data?.averageCycleTimeSeconds
              )}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              SAMPLES
            </span>

            <strong>
              {formatNumber(
                data?.cycleTimeSampleCount
              )}
            </strong>

          </div>

        </div>

      </section>

      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <section className="dashboard-section">

        <div className="section-header">

          <div>
            <h2>
              Summary
            </h2>

            <p>
              Overall machine efficiency for the selected period.
            </p>
          </div>

        </div>

        <div className="oee-summary-grid">

          <div className="summary-card">

            <span>
              PRODUCTION EFFICIENCY
            </span>

            <strong>
              {formatPercent(
                calculated.productionEfficiency
              )}
            </strong>

          </div>

          <div className="summary-card">

            <span>
              GOOD PARTS
            </span>

            <strong>
              {formatNumber(
                data?.goodParts
              )}
            </strong>

          </div>

          <div className="summary-card">

            <span>
              REJECT RATE
            </span>

            <strong>
              {formatPercent(
                calculated.rejectRate
              )}
            </strong>

          </div>

          <div className="summary-card">

            <span>
              TOTAL RUNTIME
            </span>

            <strong>
              {formatSeconds(
                calculated.totalRuntime
              )}
            </strong>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <div className="page-footer">

        <span>
          CNC OEE
        </span>

        <span>
          {lastUpdated
            ? `Last updated ${lastUpdated.toLocaleTimeString()}`
            : "Waiting for data"}
        </span>

      </div>

    </div>
  );
}

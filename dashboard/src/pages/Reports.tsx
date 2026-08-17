import { useEffect, useState } from "react";

import "./Reports.css";


// ============================================================
// TYPES
// ============================================================

interface ReportData {
  available: boolean;

  message?: string;

  snapshotCount: number;

  period: {
    start: string;
    end: string;
    durationSeconds: number;
  };

  production: {
    totalParts: number;
    goodParts: number;
    rejectParts: number;
    targetQuantity: number;
    actualQuantity: number;
    targetCompletion: number;
  };

  cycleTime: {
    averageSeconds: number;
    minimumSeconds: number;
    maximumSeconds: number;
    sampleCount: number;
  };

  runtime: {
    powerOnSeconds: number;
    runningSeconds: number;
    idleSeconds: number;
    alarmSeconds: number;
    stoppedSeconds: number;
  };

  performance: {
    quality: number;
    rejectRate: number;
    utilization: number;
  };
}

interface ReportResponse {
  success: boolean;
  data: ReportData;
}


// ============================================================
// CONFIG
// ============================================================

const API_BASE =
  "http://localhost:5005";

const DEFAULT_COUNT = 300;


// ============================================================
// HELPERS
// ============================================================

function formatDuration(
  seconds: number
): string {

  if (!Number.isFinite(seconds)) {
    return "00:00:00";
  }

  const total =
    Math.max(
      0,
      Math.floor(seconds)
    );

  const hours =
    Math.floor(total / 3600);

  const minutes =
    Math.floor(
      (total % 3600) / 60
    );

  const secs =
    total % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(secs).padStart(2, "0"),
  ].join(":");
}


function formatDateTime(
  value: string
): string {

  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleString();
}


function formatNumber(
  value: number,
  digits = 2
): string {

  if (!Number.isFinite(value)) {
    return "0";
  }

  return value.toFixed(digits);
}


// ============================================================
// COMPONENT
// ============================================================

function Reports() {

  const [report, setReport] =
    useState<ReportData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [count, setCount] =
    useState(DEFAULT_COUNT);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);


  // ==========================================================
  // LOAD REPORT
  // ==========================================================

  const loadReport = async () => {

    try {

      setError(null);

      const response =
        await fetch(
          `${API_BASE}/api/cnc/reports` +
          `?count=${count}`
        );

      if (!response.ok) {

        throw new Error(
          `Reports API returned ${response.status}`
        );

      }

      const json =
        await response.json() as ReportResponse;

      if (!json.success) {

        throw new Error(
          "Reports API returned an unsuccessful response."
        );

      }

      if (!json.data?.available) {

        setReport(null);

        throw new Error(
          json.data?.message ??
          "Not enough history data."
        );

      }

      setReport(
        json.data
      );

      setLastUpdated(
        new Date()
      );

    } catch (err) {

      console.error(
        "Failed to load production report:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load production report."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // INITIAL LOAD + AUTO REFRESH
  // ==========================================================

  useEffect(() => {

    setLoading(true);

    loadReport();

    const timer =
      window.setInterval(
        loadReport,
        5000
      );

    return () => {

      window.clearInterval(
        timer
      );

    };

  }, [count]);


  // ==========================================================
  // CSV EXPORT
  // ==========================================================

  const exportCsv = () => {

    if (!report) {
      return;
    }

    const rows = [

      [
        "Production Report",
        "",
      ],

      [
        "Report Start",
        report.period.start,
      ],

      [
        "Report End",
        report.period.end,
      ],

      [
        "Report Duration Seconds",
        report.period.durationSeconds,
      ],

      [],

      [
        "Production",
        "",
      ],

      [
        "Total Parts",
        report.production.totalParts,
      ],

      [
        "Good Parts",
        report.production.goodParts,
      ],

      [
        "Reject Parts",
        report.production.rejectParts,
      ],

      [
        "Target Quantity",
        report.production.targetQuantity,
      ],

      [
        "Actual Quantity",
        report.production.actualQuantity,
      ],

      [
        "Target Completion %",
        report.production.targetCompletion,
      ],

      [],

      [
        "Cycle Time",
        "",
      ],

      [
        "Average Cycle Time Seconds",
        report.cycleTime.averageSeconds,
      ],

      [
        "Minimum Cycle Time Seconds",
        report.cycleTime.minimumSeconds,
      ],

      [
        "Maximum Cycle Time Seconds",
        report.cycleTime.maximumSeconds,
      ],

      [
        "Cycle Time Samples",
        report.cycleTime.sampleCount,
      ],

      [],

      [
        "Runtime",
        "",
      ],

      [
        "Power ON Seconds",
        report.runtime.powerOnSeconds,
      ],

      [
        "Running Seconds",
        report.runtime.runningSeconds,
      ],

      [
        "Idle Seconds",
        report.runtime.idleSeconds,
      ],

      [
        "Alarm Seconds",
        report.runtime.alarmSeconds,
      ],

      [
        "Stopped Seconds",
        report.runtime.stoppedSeconds,
      ],

      [],

      [
        "Performance",
        "",
      ],

      [
        "Quality %",
        report.performance.quality,
      ],

      [
        "Reject Rate %",
        report.performance.rejectRate,
      ],

      [
        "Utilization %",
        report.performance.utilization,
      ],
    ];


    const csv =
      rows
        .map(
          (row) =>
            row
              .map(
                (value) =>
                  `"${String(value ?? "")
                    .replaceAll(
                      '"',
                      '""'
                    )}"`
              )
              .join(",")
        )
        .join("\r\n");


    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `cnc-production-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="reports-page">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="reports-header">

        <div>

          <h1>
            Production Reports
          </h1>

          <p>
            CNC production and machine runtime analysis
          </p>

        </div>


        <div className="reports-actions">

          <label>
            History
          </label>

          <select
            value={count}
            onChange={(event) =>
              setCount(
                Number(
                  event.target.value
                )
              )
            }
          >

            <option value={100}>
              Last 100
            </option>

            <option value={300}>
              Last 300
            </option>

            <option value={600}>
              Last 600
            </option>

            <option value={1000}>
              Last 1000
            </option>

            <option value={2000}>
              Last 2000
            </option>

            <option value={3600}>
              Last 3600
            </option>

          </select>


          <button
            type="button"
            onClick={loadReport}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>


          <button
            type="button"
            className="export-button"
            onClick={exportCsv}
            disabled={!report}
          >
            Export CSV
          </button>

        </div>

      </header>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (

        <div className="reports-error">

          <strong>
            Report Error
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading && !report && (

        <div className="reports-loading">
          Loading production report...
        </div>

      )}


      {report && (

        <>

          {/* =================================================
              REPORT PERIOD
              ================================================= */}

          <section className="report-period-card">

            <div>

              <span>
                REPORT PERIOD
              </span>

              <strong>
                {formatDateTime(
                  report.period.start
                )}
              </strong>

            </div>


            <div className="period-arrow">
              →
            </div>


            <div>

              <span>
                END
              </span>

              <strong>
                {formatDateTime(
                  report.period.end
                )}
              </strong>

            </div>


            <div className="period-duration">

              <span>
                DURATION
              </span>

              <strong>
                {formatDuration(
                  report.period.durationSeconds
                )}
              </strong>

            </div>

          </section>


          {/* =================================================
              PRODUCTION SUMMARY
              ================================================= */}

          <section className="report-section">

            <div className="report-section-header">

              <div>

                <h2>
                  Production
                </h2>

                <p>
                  Production counters for the selected history window
                </p>

              </div>

            </div>


            <div className="report-card-grid">


              <div className="report-card">

                <span>
                  TOTAL PARTS
                </span>

                <strong>
                  {report.production.totalParts}
                </strong>

              </div>


              <div className="report-card">

                <span>
                  GOOD PARTS
                </span>

                <strong className="positive">
                  {report.production.goodParts}
                </strong>

              </div>


              <div className="report-card">

                <span>
                  REJECT PARTS
                </span>

                <strong className="negative">
                  {report.production.rejectParts}
                </strong>

              </div>


              <div className="report-card">

                <span>
                  TARGET
                </span>

                <strong>
                  {report.production.targetQuantity}
                </strong>

              </div>


              <div className="report-card">

                <span>
                  ACTUAL QUANTITY
                </span>

                <strong>
                  {report.production.actualQuantity}
                </strong>

              </div>


              <div className="report-card">

                <span>
                  TARGET COMPLETION
                </span>

                <strong>
                  {formatNumber(
                    report.production.targetCompletion,
                    2
                  )}%
                </strong>

              </div>

            </div>


            <div className="completion-block">

              <div className="completion-header">

                <span>
                  TARGET COMPLETION
                </span>

                <strong>
                  {formatNumber(
                    report.production.targetCompletion,
                    2
                  )}%
                </strong>

              </div>

              <div className="completion-bar">

                <div
                  style={{
                    width:
                      `${Math.min(
                        100,
                        Math.max(
                          0,
                          report.production.targetCompletion
                        )
                      )}%`,
                  }}
                />

              </div>

            </div>

          </section>


          {/* =================================================
              CYCLE TIME
              ================================================= */}

          <section className="report-section">

            <div className="report-section-header">

              <div>

                <h2>
                  Cycle Time
                </h2>

                <p>
                  Cycle time statistics from collected samples
                </p>

              </div>

            </div>


            <div className="report-card-grid">


              <div className="report-card">

                <span>
                  AVERAGE
                </span>

                <strong>
                  {formatNumber(
                    report.cycleTime.averageSeconds,
                    3
                  )} sec
                </strong>

              </div>


              <div className="report-card">

                <span>
                  MINIMUM
                </span>

                <strong>
                  {formatNumber(
                    report.cycleTime.minimumSeconds,
                    3
                  )} sec
                </strong>

              </div>


              <div className="report-card">

                <span>
                  MAXIMUM
                </span>

                <strong>
                  {formatNumber(
                    report.cycleTime.maximumSeconds,
                    3
                  )} sec
                </strong>

              </div>


              <div className="report-card">

                <span>
                  SAMPLES
                </span>

                <strong>
                  {report.cycleTime.sampleCount}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              MACHINE RUNTIME
              ================================================= */}

          <section className="report-section">

            <div className="report-section-header">

              <div>

                <h2>
                  Machine Runtime
                </h2>

                <p>
                  Current cumulative machine runtime counters
                </p>

              </div>

            </div>


            <div className="runtime-report-grid">


              <div className="runtime-report-card">

                <span>
                  POWER ON
                </span>

                <strong>
                  {formatDuration(
                    report.runtime.powerOnSeconds
                  )}
                </strong>

              </div>


              <div className="runtime-report-card">

                <span>
                  RUNNING
                </span>

                <strong>
                  {formatDuration(
                    report.runtime.runningSeconds
                  )}
                </strong>

              </div>


              <div className="runtime-report-card">

                <span>
                  IDLE
                </span>

                <strong>
                  {formatDuration(
                    report.runtime.idleSeconds
                  )}
                </strong>

              </div>


              <div className="runtime-report-card">

                <span>
                  ALARM
                </span>

                <strong>
                  {formatDuration(
                    report.runtime.alarmSeconds
                  )}
                </strong>

              </div>


              <div className="runtime-report-card">

                <span>
                  STOPPED
                </span>

                <strong>
                  {formatDuration(
                    report.runtime.stoppedSeconds
                  )}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              QUALITY / UTILIZATION
              ================================================= */}

          <section className="report-section">

            <div className="report-section-header">

              <div>

                <h2>
                  Performance
                </h2>

                <p>
                  Quality and machine utilization indicators
                </p>

              </div>

            </div>


            <div className="performance-grid">


              <div className="performance-card">

                <span>
                  QUALITY
                </span>

                <strong className="positive">
                  {formatNumber(
                    report.performance.quality,
                    2
                  )}%
                </strong>

                <div className="performance-bar">

                  <div
                    className="quality-bar"
                    style={{
                      width:
                        `${Math.min(
                          100,
                          Math.max(
                            0,
                            report.performance.quality
                          )
                        )}%`,
                    }}
                  />

                </div>

              </div>


              <div className="performance-card">

                <span>
                  REJECT RATE
                </span>

                <strong
                  className={
                    report.performance.rejectRate > 0
                      ? "negative"
                      : "positive"
                  }
                >
                  {formatNumber(
                    report.performance.rejectRate,
                    2
                  )}%
                </strong>

                <div className="performance-bar">

                  <div
                    className="reject-bar"
                    style={{
                      width:
                        `${Math.min(
                          100,
                          Math.max(
                            0,
                            report.performance.rejectRate
                          )
                        )}%`,
                    }}
                  />

                </div>

              </div>


              <div className="performance-card">

                <span>
                  UTILIZATION
                </span>

                <strong>
                  {formatNumber(
                    report.performance.utilization,
                    2
                  )}%
                </strong>

                <div className="performance-bar">

                  <div
                    className="utilization-bar"
                    style={{
                      width:
                        `${Math.min(
                          100,
                          Math.max(
                            0,
                            report.performance.utilization
                          )
                        )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              FOOTER
              ================================================= */}

          <footer className="reports-footer">

            <span>
              Snapshots: {report.snapshotCount}
            </span>

            <span>
              Auto refresh: 5 seconds
            </span>

            {lastUpdated && (

              <span>
                Last update:{" "}
                {lastUpdated.toLocaleTimeString()}
              </span>

            )}

          </footer>

        </>

      )}

    </div>
  );
}


export default Reports;
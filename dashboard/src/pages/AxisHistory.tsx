import { useEffect, useState } from "react";

import "./AlarmHistory.css";

import {
  getApiBaseUrl,
  getRefreshInterval,
} from "../config/appConfig";

// ============================================================
// TYPES
// ============================================================

interface AlarmHistoryItem {
  timestamp?: string;

  alarmNumber?: number;

  controllerAlarmCode?: string;

  message?: string;

  description?: string;

  isActive?: boolean;
}

interface AlarmHistoryResponse {
  success?: boolean;

  count?: number;

  data?: AlarmHistoryItem[];

  message?: string;
}

// ============================================================
// RANGE OPTIONS
// ============================================================

const RANGE_OPTIONS = [
  {
    label: "Last 5 Minutes",
    count: 300,
  },
  {
    label: "Last 15 Minutes",
    count: 900,
  },
  {
    label: "Last 30 Minutes",
    count: 1800,
  },
  {
    label: "Last 60 Minutes",
    count: 3600,
  },
];

// ============================================================
// HELPERS
// ============================================================

function formatDateTime(
  timestamp?: string
): string {
  if (!timestamp) {
    return "-";
  }

  const date =
    new Date(timestamp);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleString();
}

function escapeCsvValue(
  value: unknown
): string {
  return `"${String(
    value ?? ""
  ).replaceAll('"', '""')}"`;
}

// ============================================================
// COMPONENT
// ============================================================

function AlarmHistory() {
  // ==========================================================
  // STATE
  // ==========================================================

  const [range, setRange] =
    useState(300);

  const [alarms, setAlarms] =
    useState<AlarmHistoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  // ==========================================================
  // LOAD HISTORY
  // ==========================================================

  const loadHistory =
    async () => {
      try {
        setError(null);

        const apiBaseUrl =
          getApiBaseUrl();

        const url =
          `${apiBaseUrl}/api/cnc/history/alarms?count=${range}`;

        console.log(
          "Loading alarm history:",
          url
        );

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Alarm history API returned ${response.status}`
          );
        }

        const json =
          (await response.json()) as AlarmHistoryResponse;

        console.log(
          "Alarm history response:",
          json
        );

        if (
          json.success === false
        ) {
          throw new Error(
            json.message ??
              "Unable to load alarm history."
          );
        }

        const data =
          Array.isArray(json.data)
            ? json.data
            : [];

        setAlarms(data);

        setLastUpdated(
          new Date()
        );

      } catch (err) {
        console.error(
          "Failed to load alarm history:",
          err
        );

        setAlarms([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load alarm history."
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

    loadHistory();

    const refreshSeconds =
      getRefreshInterval();

    const timer =
      window.setInterval(
        loadHistory,
        refreshSeconds * 1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };

    // Range intentionally controls
    // the API request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  // ==========================================================
  // CSV EXPORT
  // ==========================================================

  const exportCsv =
    () => {
      if (
        alarms.length === 0
      ) {
        return;
      }

      const rows =
        [
          [
            "Time",
            "Alarm Number",
            "Controller Code",
            "Message",
            "Description",
            "Status",
          ],
        ];

      alarms.forEach(
        (alarm) => {
          rows.push([
            formatDateTime(
              alarm.timestamp
            ),

            String(
              alarm.alarmNumber ??
                ""
            ),

            String(
              alarm.controllerAlarmCode ??
                ""
            ),

            String(
              alarm.message ??
                ""
            ),

            String(
              alarm.description ??
                ""
            ),

            alarm.isActive
              ? "ACTIVE"
              : "CLEARED",
          ]);
        }
      );

      const csv =
        rows
          .map(
            (row) =>
              row
                .map(
                  escapeCsvValue
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
        `cnc-alarm-history-${new Date()
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
  // SUMMARY
  // ==========================================================

  const activeCount =
    alarms.filter(
      (alarm) =>
        alarm.isActive === true
    ).length;

  const clearedCount =
    alarms.filter(
      (alarm) =>
        alarm.isActive !== true
    ).length;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="alarm-history-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="alarm-history-header">

        <div>

          <h1>
            Alarm History
          </h1>

          <p>
            Historical CNC controller alarms
          </p>

        </div>


        <div className="alarm-history-controls">

          <label>
            Time Range
          </label>


          <select
            value={range}
            onChange={(event) => {
              setRange(
                Number(
                  event.target.value
                )
              );
            }}
          >

            {RANGE_OPTIONS.map(
              (option) => (

                <option
                  key={
                    option.count
                  }
                  value={
                    option.count
                  }
                >
                  {option.label}
                </option>

              )
            )}

          </select>


          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadHistory();
            }}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>


          <button
            type="button"
            onClick={
              exportCsv
            }
            disabled={
              alarms.length === 0
            }
          >
            Export CSV
          </button>

        </div>

      </header>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="alarm-history-error">

          <strong>
            Alarm History Error
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="alarm-history-loading">
          Loading alarm history...
        </div>
      )}


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      {!loading &&
        !error && (

          <section className="alarm-history-summary">

            <div>

              <span>
                TOTAL ALARMS
              </span>

              <strong>
                {alarms.length}
              </strong>

            </div>


            <div>

              <span>
                ACTIVE
              </span>

              <strong className="alarm-summary-active">
                {activeCount}
              </strong>

            </div>


            <div>

              <span>
                CLEARED
              </span>

              <strong>
                {clearedCount}
              </strong>

            </div>


            <div>

              <span>
                RANGE
              </span>

              <strong>
                {RANGE_OPTIONS.find(
                  (option) =>
                    option.count ===
                    range
                )?.label ??
                  `${range} seconds`}
              </strong>

            </div>

          </section>

        )}


      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        !error &&
        alarms.length === 0 && (

          <div className="alarm-history-empty">

            <div className="alarm-empty-icon">
              ✓
            </div>

            <strong>
              No Alarm History
            </strong>

            <span>
              No alarms were recorded
              for the selected time range.
            </span>

          </div>

        )}


      {/* =====================================================
          TABLE
      ===================================================== */}

      {!loading &&
        !error &&
        alarms.length > 0 && (

          <section className="alarm-history-card">

            <div className="alarm-table-wrapper">

              <table className="alarm-table">

                <thead>

                  <tr>

                    <th>
                      TIME
                    </th>

                    <th>
                      ALARM
                    </th>

                    <th>
                      CONTROLLER CODE
                    </th>

                    <th>
                      MESSAGE
                    </th>

                    <th>
                      DESCRIPTION
                    </th>

                    <th>
                      STATUS
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {alarms.map(
                    (
                      alarm,
                      index
                    ) => (

                      <tr
                        key={
                          `${alarm.timestamp ?? "alarm"}-${index}`
                        }
                      >

                        <td>
                          {formatDateTime(
                            alarm.timestamp
                          )}
                        </td>


                        <td>

                          <strong>
                            #
                            {alarm.alarmNumber ??
                              "-"}
                          </strong>

                        </td>


                        <td>

                          <span className="alarm-code">

                            {alarm.controllerAlarmCode ??
                              "-"}

                          </span>

                        </td>


                        <td>

                          <strong>
                            {alarm.message ??
                              "-"}

                          </strong>

                        </td>


                        <td>

                          <span className="alarm-description">

                            {alarm.description ??
                              "-"}

                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              alarm.isActive
                                ? "alarm-status active"
                                : "alarm-status cleared"
                            }
                          >

                            {alarm.isActive
                              ? "ACTIVE"
                              : "CLEARED"}

                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>

        )}


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="alarm-history-footer">

        <span>
          API: /api/cnc/history/alarms
        </span>

        <span>
          Auto refresh:{" "}
          {getRefreshInterval()} seconds
        </span>

        {lastUpdated && (

          <span>
            Last update:{" "}
            {lastUpdated.toLocaleTimeString()}
          </span>

        )}

      </footer>

    </div>
  );
}

export default AlarmHistory;

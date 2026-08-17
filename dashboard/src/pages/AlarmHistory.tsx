import { useEffect, useState } from "react";

import "./AlarmHistory.css";


// ============================================================
// TYPES
// ============================================================

interface AlarmHistoryItem {
  timestamp: string;

  alarmNumber: number;

  controllerAlarmCode: string;

  message: string;

  description: string;

  isActive?: boolean;
}


// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE = "http://localhost:5005";

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
  timestamp: string
) {
  return new Date(
    timestamp
  ).toLocaleString();
}


// ============================================================
// COMPONENT
// ============================================================

function AlarmHistory() {

  const [range, setRange] =
    useState(300);

  const [alarms, setAlarms] =
    useState<AlarmHistoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  // ==========================================================
  // LOAD ALARM HISTORY
  // ==========================================================

  const loadHistory = async () => {

    try {

      setError(null);

      const response =
        await fetch(
          `${API_BASE}/api/cnc/history/alarms?count=${range}`
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load alarm history."
        );
      }

      const json =
        await response.json();

      setAlarms(
        json.data ?? []
      );

    } catch (err) {

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

    const timer =
      window.setInterval(
        loadHistory,
        5000
      );

    return () => {
      window.clearInterval(timer);
    };

  }, [range]);


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
            onChange={(event) =>
              setRange(
                Number(
                  event.target.value
                )
              )
            }
          >

            {RANGE_OPTIONS.map(
              (option) => (

                <option
                  key={option.count}
                  value={option.count}
                >
                  {option.label}
                </option>

              )
            )}

          </select>

        </div>

      </header>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="alarm-history-error">
          {error}
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
              No alarms were recorded for
              the selected time range.
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

            <div className="alarm-history-summary">

              <div>

                <span className="summary-label">
                  TOTAL ALARMS
                </span>

                <strong>
                  {alarms.length}
                </strong>

              </div>

            </div>


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
                    (alarm, index) => (

                      <tr
                        key={`${alarm.timestamp}-${index}`}
                      >

                        <td>
                          {formatDateTime(
                            alarm.timestamp
                          )}
                        </td>

                        <td>
                          <strong>
                            #{alarm.alarmNumber}
                          </strong>
                        </td>

                        <td>
                          <span className="alarm-code">
                            {alarm.controllerAlarmCode}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {alarm.message}
                          </strong>
                        </td>

                        <td>
                          <span className="alarm-description">
                            {alarm.description}
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

    </div>
  );
}


export default AlarmHistory;
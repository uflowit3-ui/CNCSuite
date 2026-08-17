import { useEffect, useState } from "react";

import "./ProductionHistory.css";

import {
  getApiBaseUrl,
  getHistoryCount,
  getRefreshInterval,
} from "../config/appConfig";

// ============================================================
// TYPES
// ============================================================

interface ProductionHistoryItem {
  timestamp?: string;

  partCount?: number;
  goodParts?: number;
  rejectParts?: number;

  targetQuantity?: number;
  actualQuantity?: number;

  cycleTime?: number;
}

interface ProductionHistoryResponse {
  success: boolean;
  count?: number;
  data?: ProductionHistoryItem[];
  message?: string;
}

// ============================================================
// HELPERS
// ============================================================

function formatDateTime(
  value?: string
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

function formatCycleTime(
  value?: number
): string {
  if (
    value === undefined ||
    value === null ||
    !Number.isFinite(value)
  ) {
    return "-";
  }

  return `${value.toFixed(2)} s`;
}

function escapeCsvValue(
  value: unknown
): string {
  return `"${String(value ?? "")
    .replaceAll('"', '""')}"`;
}

// ============================================================
// COMPONENT
// ============================================================

function ProductionHistory() {
  // ==========================================================
  // SETTINGS
  // ==========================================================

  const configuredHistoryCount =
    getHistoryCount();

  const [history, setHistory] =
    useState<ProductionHistoryItem[]>([]);

  const [count, setCount] =
    useState(configuredHistoryCount);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  // ==========================================================
  // LOAD PRODUCTION HISTORY
  // ==========================================================

  const loadHistory = async () => {
    try {
      setError(null);

      const apiBaseUrl =
        getApiBaseUrl();

      /*
       * IMPORTANT:
       *
       * Use the production-specific endpoint.
       *
       * Backend:
       * GET /api/cnc/history/production?count=300
       *
       * Response:
       * {
       *   success: true,
       *   count: 24,
       *   data: [
       *     {
       *       timestamp,
       *       partCount,
       *       goodParts,
       *       rejectParts,
       *       targetQuantity,
       *       actualQuantity,
       *       cycleTime
       *     }
       *   ]
       * }
       */

      const url =
        `${apiBaseUrl}/api/cnc/history/production?count=${count}`;

      const response =
        await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Production history API returned ${response.status}`
        );
      }

      const json =
        (await response.json()) as ProductionHistoryResponse;

      if (!json.success) {
        throw new Error(
          json.message ??
          "Unable to load production history."
        );
      }

      const data =
        Array.isArray(json.data)
          ? json.data
          : [];

      setHistory(data);

      setLastUpdated(
        new Date()
      );

    } catch (err) {
      console.error(
        "Failed to load production history:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load production history."
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

    /*
     * Refresh interval comes from Settings.
     *
     * Example:
     * Settings = 5 seconds
     * → refresh every 5 seconds
     */

    const refreshInterval =
      getRefreshInterval();

    const timer =
      window.setInterval(
        loadHistory,
        refreshInterval * 1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };

    // count is intentionally the dependency.
    // Changing record count reloads the API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // ==========================================================
  // SUMMARY DATA
  // ==========================================================

  const latest =
    history.length > 0
      ? history[
          history.length - 1
        ]
      : undefined;

  const totalGoodParts =
    history.reduce(
      (total, item) =>
        total +
        (item.goodParts ?? 0),
      0
    );

  const totalRejectParts =
    history.reduce(
      (total, item) =>
        total +
        (item.rejectParts ?? 0),
      0
    );

  const totalParts =
    history.reduce(
      (total, item) =>
        total +
        (item.partCount ?? 0),
      0
    );

  const averageCycleTime =
    history.length > 0
      ? history.reduce(
          (total, item) =>
            total +
            (item.cycleTime ?? 0),
          0
        ) / history.length
      : 0;

  // ==========================================================
  // CSV EXPORT
  // ==========================================================

  const exportCsv = () => {
    if (history.length === 0) {
      return;
    }

    const rows: string[][] = [
      [
        "Date / Time",
        "Part Count",
        "Good Parts",
        "Reject Parts",
        "Target Quantity",
        "Actual Quantity",
        "Cycle Time (Seconds)",
      ],
    ];

    history.forEach(
      (item) => {
        rows.push([
          formatDateTime(
            item.timestamp
          ),

          String(
            item.partCount ?? 0
          ),

          String(
            item.goodParts ?? 0
          ),

          String(
            item.rejectParts ?? 0
          ),

          String(
            item.targetQuantity ?? 0
          ),

          String(
            item.actualQuantity ?? 0
          ),

          item.cycleTime !== undefined
            ? item.cycleTime.toFixed(2)
            : "",
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
      `cnc-production-history-${new Date()
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
    <div className="production-history-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="production-history-header">

        <div>

          <h1>
            Production History
          </h1>

          <p>
            Historical CNC production records
          </p>

        </div>


        <div className="production-history-actions">

          <label>
            Records
          </label>


          <select
            value={count}
            onChange={(event) => {
              setCount(
                Number(
                  event.target.value
                )
              );
            }}
          >

            <option value={50}>
              Last 50
            </option>

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

          </select>


          <button
            type="button"
            onClick={loadHistory}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>


          <button
            type="button"
            className="history-export-button"
            onClick={exportCsv}
            disabled={
              history.length === 0
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

        <div className="history-error">

          <strong>
            History Error
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <section className="history-summary">

        <div>

          <span>
            SNAPSHOTS
          </span>

          <strong>
            {history.length}
          </strong>

        </div>


        <div>

          <span>
            TOTAL PARTS
          </span>

          <strong>
            {totalParts}
          </strong>

        </div>


        <div>

          <span>
            GOOD PARTS
          </span>

          <strong className="history-positive">
            {totalGoodParts}
          </strong>

        </div>


        <div>

          <span>
            REJECT PARTS
          </span>

          <strong className="history-negative">
            {totalRejectParts}
          </strong>

        </div>


        <div>

          <span>
            AVG CYCLE
          </span>

          <strong>
            {averageCycleTime > 0
              ? `${averageCycleTime.toFixed(2)} s`
              : "-"}
          </strong>

        </div>

      </section>


      {/* =====================================================
          LATEST PRODUCTION
          ===================================================== */}

      {latest && (

        <section className="history-latest-card">

          <div>

            <span>
              LATEST PART COUNT
            </span>

            <strong>
              {latest.partCount ?? 0}
            </strong>

          </div>


          <div>

            <span>
              GOOD
            </span>

            <strong>
              {latest.goodParts ?? 0}
            </strong>

          </div>


          <div>

            <span>
              REJECT
            </span>

            <strong>
              {latest.rejectParts ?? 0}
            </strong>

          </div>


          <div>

            <span>
              TARGET
            </span>

            <strong>
              {latest.targetQuantity ?? 0}
            </strong>

          </div>


          <div>

            <span>
              ACTUAL
            </span>

            <strong>
              {latest.actualQuantity ?? 0}
            </strong>

          </div>


          <div>

            <span>
              CYCLE TIME
            </span>

            <strong>
              {formatCycleTime(
                latest.cycleTime
              )}
            </strong>

          </div>

        </section>

      )}


      {/* =====================================================
          TABLE
          ===================================================== */}

      <section className="history-table-card">

        <div className="history-table-header">

          <div>

            <h2>
              Production Records
            </h2>

            <p>
              CNC production history from the machine controller
            </p>

          </div>

        </div>


        {loading &&
        history.length === 0 ? (

          <div className="history-loading">
            Loading production history...
          </div>

        ) : history.length === 0 ? (

          <div className="history-empty">

            <strong>
              No production history available.
            </strong>

            <span>
              Make sure the CNC controller is running
              and history snapshots are being collected.
            </span>

          </div>

        ) : (

          <div className="history-table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    DATE / TIME
                  </th>

                  <th>
                    PART COUNT
                  </th>

                  <th>
                    GOOD
                  </th>

                  <th>
                    REJECT
                  </th>

                  <th>
                    TARGET
                  </th>

                  <th>
                    ACTUAL
                  </th>

                  <th>
                    CYCLE TIME
                  </th>

                </tr>

              </thead>


              <tbody>

                {history
                  .slice()
                  .reverse()
                  .map(
                    (
                      item,
                      index
                    ) => (

                      <tr
                        key={
                          `${item.timestamp ?? "row"}-${index}`
                        }
                      >

                        <td>
                          {formatDateTime(
                            item.timestamp
                          )}
                        </td>


                        <td className="number-cell">

                          {item.partCount ?? 0}

                        </td>


                        <td className="number-cell good-cell">

                          {item.goodParts ?? 0}

                        </td>


                        <td className="number-cell reject-cell">

                          {item.rejectParts ?? 0}

                        </td>


                        <td className="number-cell">

                          {item.targetQuantity ?? 0}

                        </td>


                        <td className="number-cell">

                          {item.actualQuantity ?? 0}

                        </td>


                        <td>

                          {formatCycleTime(
                            item.cycleTime
                          )}

                        </td>

                      </tr>

                    )
                  )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="production-history-footer">

        <span>
          API: Production History
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

export default ProductionHistory;
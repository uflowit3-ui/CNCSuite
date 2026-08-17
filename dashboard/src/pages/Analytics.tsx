import { useEffect, useMemo, useState } from "react";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

import "./Analytics.css";


// ============================================================
// TYPES
// ============================================================

interface ProductionHistoryItem {
  timestamp: string;

  partCount: number;
  goodPartCount: number;
  rejectPartCount: number;

  targetQuantity: number;

  cycleTime?: string | number;
}

interface ProductionSummary {
  partCount: number;
  goodParts: number;
  rejectParts: number;
  target: number;
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

function formatTime(timestamp: string) {
  return new Date(
    timestamp
  ).toLocaleTimeString();
}


function parseCycleTime(
  value?: string | number
) {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  const match =
    value.match(
      /(\d+):(\d+):(\d+(?:\.\d+)?)/ 
    );

  if (!match) {
    return 0;
  }

  const hours =
    Number(match[1]);

  const minutes =
    Number(match[2]);

  const seconds =
    Number(match[3]);

  return (
    hours * 3600 +
    minutes * 60 +
    seconds
  );
}


// ============================================================
// ANALYTICS
// ============================================================

function Analytics() {

  const [range, setRange] =
    useState(300);

  const [history, setHistory] =
    useState<ProductionHistoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadProductionHistory =
    async () => {

      try {

        setError(null);

        const response =
          await fetch(
            `${API_BASE}/api/cnc/history/production?count=${range}`
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load production history."
          );
        }

        const json =
          await response.json();

        setHistory(
          json.data ?? []
        );

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load analytics data."
        );

      } finally {

        setLoading(false);

      }
    };


  // ==========================================================
  // REFRESH
  // ==========================================================

  useEffect(() => {

    setLoading(true);

    loadProductionHistory();

    const timer =
      window.setInterval(
        loadProductionHistory,
        5000
      );

    return () => {
      window.clearInterval(timer);
    };

  }, [range]);


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary: ProductionSummary =
    useMemo(() => {

      if (history.length === 0) {

        return {
          partCount: 0,
          goodParts: 0,
          rejectParts: 0,
          target: 0,
        };

      }

      const latest =
        history[
          history.length - 1
        ];

      return {
        partCount:
          latest.partCount ?? 0,

        goodParts:
          latest.goodPartCount ?? 0,

        rejectParts:
          latest.rejectPartCount ?? 0,

        target:
          latest.targetQuantity ?? 0,
      };

    }, [history]);


  // ==========================================================
  // CALCULATIONS
  // ==========================================================

  const completionRate =
    summary.target > 0
      ? (
          summary.partCount /
          summary.target
        ) * 100
      : 0;


  const rejectRate =
    summary.partCount > 0
      ? (
          summary.rejectParts /
          summary.partCount
        ) * 100
      : 0;


  const qualityRate =
    summary.partCount > 0
      ? (
          summary.goodParts /
          summary.partCount
        ) * 100
      : 0;


  const chartData =
    history.map((item) => ({
      time: formatTime(
        item.timestamp
      ),

      parts:
        item.partCount ?? 0,

      good:
        item.goodPartCount ?? 0,

      reject:
        item.rejectPartCount ?? 0,

      target:
        item.targetQuantity ?? 0,

      cycleTime:
        parseCycleTime(
          item.cycleTime
        ),
    }));


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="analytics-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="analytics-header">

        <div>

          <h1>
            Production Analytics
          </h1>

          <p>
            CNC production performance and
            manufacturing statistics
          </p>

        </div>


        <div className="analytics-controls">

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

        <div className="analytics-error">
          {error}
        </div>

      )}


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (

        <div className="analytics-loading">
          Loading analytics...
        </div>

      )}


      {!loading && !error && (

        <>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <section className="analytics-kpi-grid">


            <div className="analytics-kpi-card">

              <span>
                TOTAL PARTS
              </span>

              <strong>
                {summary.partCount}
              </strong>

              <small>
                Target: {summary.target}
              </small>

            </div>


            <div className="analytics-kpi-card">

              <span>
                GOOD PARTS
              </span>

              <strong>
                {summary.goodParts}
              </strong>

              <small>
                Quality: {qualityRate.toFixed(1)}%
              </small>

            </div>


            <div className="analytics-kpi-card">

              <span>
                REJECT PARTS
              </span>

              <strong>
                {summary.rejectParts}
              </strong>

              <small>
                Reject Rate: {rejectRate.toFixed(1)}%
              </small>

            </div>


            <div className="analytics-kpi-card">

              <span>
                TARGET COMPLETION
              </span>

              <strong>
                {completionRate.toFixed(1)}%
              </strong>

              <small>
                Production progress
              </small>

            </div>

          </section>


          {/* =================================================
              PRODUCTION TREND
          ================================================= */}

          <section className="analytics-card">

            <div className="analytics-card-header">

              <div>

                <h2>
                  Production Trend
                </h2>

                <span>
                  Total, good and rejected parts
                </span>

              </div>

            </div>


            <div className="analytics-chart">

              <ResponsiveContainer
                width="100%"
                height={400}
              >

                <LineChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                    minTickGap={40}
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />


                  <Line
                    type="monotone"
                    dataKey="parts"
                    name="Total Parts"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                  />


                  <Line
                    type="monotone"
                    dataKey="good"
                    name="Good Parts"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />


                  <Line
                    type="monotone"
                    dataKey="reject"
                    name="Reject Parts"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </section>


          {/* =================================================
              TARGET VS ACTUAL
          ================================================= */}

          <section className="analytics-card">

            <div className="analytics-card-header">

              <div>

                <h2>
                  Target vs Actual
                </h2>

                <span>
                  Production target comparison
                </span>

              </div>

            </div>


            <div className="analytics-chart">

              <ResponsiveContainer
                width="100%"
                height={380}
              >

                <BarChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                    minTickGap={40}
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />


                  <Bar
                    dataKey="target"
                    name="Target"
                    fill="#475569"
                  />


                  <Bar
                    dataKey="parts"
                    name="Actual"
                    fill="#2563eb"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </section>


          {/* =================================================
              CYCLE TIME
          ================================================= */}

          <section className="analytics-card">

            <div className="analytics-card-header">

              <div>

                <h2>
                  Cycle Time
                </h2>

                <span>
                  Cycle time trend in seconds
                </span>

              </div>

            </div>


            <div className="analytics-chart">

              <ResponsiveContainer
                width="100%"
                height={360}
              >

                <LineChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                    minTickGap={40}
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />


                  <Line
                    type="monotone"
                    dataKey="cycleTime"
                    name="Cycle Time (sec)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </section>


          {/* =================================================
              QUALITY
          ================================================= */}

          <section className="analytics-quality">

            <div>

              <span>
                QUALITY RATE
              </span>

              <strong>
                {qualityRate.toFixed(2)}%
              </strong>

            </div>


            <div>

              <span>
                REJECT RATE
              </span>

              <strong>
                {rejectRate.toFixed(2)}%
              </strong>

            </div>


            <div>

              <span>
                TARGET COMPLETION
              </span>

              <strong>
                {completionRate.toFixed(2)}%
              </strong>

            </div>

          </section>

        </>

      )}

    </div>
  );
}


export default Analytics;
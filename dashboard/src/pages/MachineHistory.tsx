import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./MachineHistory.css";

interface SpindleHistoryPoint {
  timestamp: string;
  rpm: number;
  targetRpm: number;
  load: number;
  power: number;
  temperature: number;
  isRunning: boolean;
}

interface ProductionHistoryPoint {
  timestamp: string;
  partCount: number;
  goodParts: number;
  rejectParts: number;
  targetQuantity: number;
  actualQuantity: number;
  cycleTime: number;
}

type RangeOption = {
  label: string;
  count: number;
};

const API_BASE = "http://localhost:5005";

const RANGE_OPTIONS: RangeOption[] = [
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

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString();
}

function MachineHistory() {
  const [range, setRange] = useState(300);

  const [spindleHistory, setSpindleHistory] =
    useState<SpindleHistoryPoint[]>([]);

  const [productionHistory, setProductionHistory] =
    useState<ProductionHistoryPoint[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadHistory = async () => {
    try {
      setError(null);

      const [
        spindleResponse,
        productionResponse,
      ] = await Promise.all([
        fetch(
          `${API_BASE}/api/cnc/history/spindle?count=${range}`
        ),
        fetch(
          `${API_BASE}/api/cnc/history/production?count=${range}`
        ),
      ]);

      if (
        !spindleResponse.ok ||
        !productionResponse.ok
      ) {
        throw new Error(
          "Failed to load CNC history."
        );
      }

      const spindleJson =
        await spindleResponse.json();

      const productionJson =
        await productionResponse.json();

      setSpindleHistory(
        spindleJson.data ?? []
      );

      setProductionHistory(
        productionJson.data ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load CNC history."
      );
    } finally {
      setLoading(false);
    }
  };

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

  const spindleChartData =
    spindleHistory.map((item) => ({
      time: formatTime(item.timestamp),
      rpm: item.rpm,
      targetRpm: item.targetRpm,
      load: item.load,
      power: item.power,
      temperature: item.temperature,
    }));

  const productionChartData =
    productionHistory.map((item) => ({
      time: formatTime(item.timestamp),
      partCount: item.partCount,
      goodParts: item.goodParts,
      rejectParts: item.rejectParts,
      targetQuantity:
        item.targetQuantity,
    }));

  return (
    <div className="history-page">

      {/* Header */}

      <header className="history-header">

        <div>
          <h1>
            CNC Machine History
          </h1>

          <p>
            Historical machine,
            spindle and production data
          </p>
        </div>

        <div className="history-controls">

          <label>
            Time Range
          </label>

          <select
            value={range}
            onChange={(event) =>
              setRange(
                Number(event.target.value)
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

      {/* Error */}

      {error && (
        <div className="history-error">
          {error}
        </div>
      )}

      {/* Loading */}

      {loading && (
        <div className="history-loading">
          Loading CNC history...
        </div>
      )}

      {/* Data */}

      {!loading && !error && (
        <>

          {/* Spindle RPM */}

          <section className="history-card">

            <div className="history-card-header">

              <div>
                <h2>
                  Spindle RPM
                </h2>

                <span>
                  Current RPM vs target RPM
                </span>
              </div>

            </div>

            <div className="history-chart">

              <ResponsiveContainer
                width="100%"
                height={360}
              >
                <LineChart
                  data={spindleChartData}
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
                    dataKey="rpm"
                    name="Current RPM"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="targetRpm"
                    name="Target RPM"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>

          </section>

          {/* Load / Power */}

          <section className="history-card">

            <div className="history-card-header">

              <div>
                <h2>
                  Spindle Load & Power
                </h2>

                <span>
                  Spindle load percentage
                  and power
                </span>
              </div>

            </div>

            <div className="history-chart">

              <ResponsiveContainer
                width="100%"
                height={360}
              >
                <LineChart
                  data={spindleChartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                    minTickGap={40}
                  />

                  <YAxis
                    yAxisId="load"
                    orientation="left"
                  />

                  <YAxis
                    yAxisId="power"
                    orientation="right"
                  />

                  <Tooltip />

                  <Legend />

                  <Line
                    yAxisId="load"
                    type="monotone"
                    dataKey="load"
                    name="Load %"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    yAxisId="power"
                    type="monotone"
                    dataKey="power"
                    name="Power"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>

          </section>

          {/* Temperature */}

          <section className="history-card">

            <div className="history-card-header">

              <div>
                <h2>
                  Spindle Temperature
                </h2>

                <span>
                  Historical spindle
                  temperature
                </span>
              </div>

            </div>

            <div className="history-chart">

              <ResponsiveContainer
                width="100%"
                height={360}
              >
                <LineChart
                  data={spindleChartData}
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
                    dataKey="temperature"
                    name="Temperature °C"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>

          </section>

          {/* Production */}

          <section className="history-card">

            <div className="history-card-header">

              <div>
                <h2>
                  Production History
                </h2>

                <span>
                  Part production trend
                </span>
              </div>

            </div>

            <div className="history-chart">

              <ResponsiveContainer
                width="100%"
                height={360}
              >
                <LineChart
                  data={productionChartData}
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
                    dataKey="partCount"
                    name="Part Count"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="goodParts"
                    name="Good Parts"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="rejectParts"
                    name="Reject Parts"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>

          </section>

        </>
      )}

    </div>
  );
}

export default MachineHistory;
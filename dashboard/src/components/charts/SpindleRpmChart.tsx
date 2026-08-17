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

import { getSpindleHistory } from "../../services/historyApi";
import type { SpindleHistoryPoint } from "../../types/history";

interface ChartPoint {
  time: string;
  rpm: number;
  targetRpm: number;
}

export default function SpindleRpmChart() {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        const history: SpindleHistoryPoint[] =
          await getSpindleHistory(300);

        if (!mounted) return;

        const chartData = history.map((item) => ({
          time: new Date(item.timestamp).toLocaleTimeString(),
          rpm: item.rpm,
          targetRpm: item.targetRpm,
        }));

        setData(chartData);
        setError(null);
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load spindle history."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    const interval = window.setInterval(
      loadHistory,
      5000
    );

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>Spindle RPM</h3>
          <span>Current vs Target RPM</span>
        </div>
      </div>

      {loading && (
        <div className="chart-state">
          Loading spindle history...
        </div>
      )}

      {!loading && error && (
        <div className="chart-state chart-error">
          {error}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="chart-state">
          No spindle history available.
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="chart-container">
          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="time"
                minTickGap={30}
              />

              <YAxis
                allowDecimals={false}
                domain={[0, "auto"]}
              />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="rpm"
                name="Current RPM"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="targetRpm"
                name="Target RPM"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
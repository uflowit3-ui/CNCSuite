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
  load: number;
  power: number;
}

export default function SpindleLoadChart() {
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
          load: item.load,
          power: item.power,
        }));

        setData(chartData);
        setError(null);
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load spindle load history."
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
          <h3>Spindle Load & Power</h3>
          <span>Historical spindle load and power</span>
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
                yAxisId="left"
                domain={[0, "auto"]}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, "auto"]}
              />

              <Tooltip />

              <Legend />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="load"
                name="Load %"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="power"
                name="Power"
                stroke="#7c3aed"
                strokeWidth={2}
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
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

import { getTemperatureHistory } from "../../services/historyApi";
import type { TemperatureHistoryPoint } from "../../types/history";

interface ChartPoint {
  time: string;
  temperature: number;
}

export default function TemperatureChart() {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        const history: TemperatureHistoryPoint[] =
          await getTemperatureHistory(300);

        if (!mounted) return;

        const chartData = history.map((item) => ({
          time: new Date(item.timestamp).toLocaleTimeString(),
          temperature: item.spindleTemperature,
        }));

        setData(chartData);
        setError(null);
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load temperature history."
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
          <h3>Spindle Temperature</h3>
          <span>Historical spindle temperature</span>
        </div>
      </div>

      {loading && (
        <div className="chart-state">
          Loading temperature history...
        </div>
      )}

      {!loading && error && (
        <div className="chart-state chart-error">
          {error}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="chart-state">
          No temperature history available.
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
                domain={["auto", "auto"]}
              />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="temperature"
                name="Temperature °C"
                stroke="#ea580c"
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
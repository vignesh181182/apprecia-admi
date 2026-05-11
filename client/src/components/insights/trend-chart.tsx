import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { TrendPoint } from "@/lib/insights-data";

export function TrendChart({ data, height = 260 }: { data: TrendPoint[]; height?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
      <header className="mb-3">
        <h3 className="text-sm font-semibold text-stone-900">Recognitions over time</h3>
        <p className="text-xs text-stone-500 mt-0.5">Daily count</p>
      </header>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a87a3a" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#a87a3a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(d) => {
                const dt = new Date(d);
                return `${dt.getMonth() + 1}/${dt.getDate()}`;
              }}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4", fontSize: 12 }}
              labelFormatter={(d) =>
                new Date(d as string).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              }
            />
            <Area
              type="monotone"
              dataKey="recognitions"
              stroke="#a87a3a"
              strokeWidth={2}
              fill="url(#trend-fill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

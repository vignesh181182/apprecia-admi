import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import type { DepartmentStat } from "@/lib/insights-data";

export function DepartmentBars({ stats }: { stats: DepartmentStat[] }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
      <header className="mb-3">
        <h3 className="text-sm font-semibold text-stone-900">By department</h3>
        <p className="text-xs text-stone-500 mt-0.5">Given vs received</p>
      </header>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <BarChart data={stats} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickLine={false}
              axisLine={false}
              interval={0}
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} iconType="circle" />
            <Bar dataKey="given" fill="#a87a3a" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="received" fill="#fbbf24" radius={[6, 6, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

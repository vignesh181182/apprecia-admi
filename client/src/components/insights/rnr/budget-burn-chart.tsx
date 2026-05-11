import { ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { getAccount } from "@/lib/account";
import type { BudgetBurnPoint } from "@/lib/rnr-insights-data";

export function BudgetBurnChart({ data, height = 280 }: { data: BudgetBurnPoint[]; height?: number }) {
  const currency = getAccount()?.currency || "₹";

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
      <header className="mb-3">
        <h3 className="text-sm font-semibold text-stone-900">Budget burn</h3>
        <p className="text-xs text-stone-500 mt-0.5">Cumulative spend vs straight-line pace</p>
      </header>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="budget-fill" x1="0" y1="0" x2="0" y2="1">
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
              minTickGap={32}
              tickFormatter={(d) => {
                const dt = new Date(d);
                return `${dt.getMonth() + 1}/${dt.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4", fontSize: 12 }}
              formatter={(v: number) => [`${currency}${v.toLocaleString()}`, undefined]}
              labelFormatter={(d) =>
                new Date(d as string).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              }
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} iconType="circle" />
            <Area
              type="monotone"
              dataKey="spent"
              name="Spent"
              stroke="#a87a3a"
              strokeWidth={2}
              fill="url(#budget-fill)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="pace"
              name="Pace target"
              stroke="#78716c"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

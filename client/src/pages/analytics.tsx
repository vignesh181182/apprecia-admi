import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  monthlyTrendData,
  departmentStatsData,
  categoryBreakdownData,
  budgetBurnData,
} from "@/lib/hr-data";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Users, Star, DollarSign } from "lucide-react";

const summaryCards = [
  { label: "Total Recognitions YTD", value: "663", trend: "+8% vs last year", icon: Star, positive: true },
  { label: "Avg Participation Rate", value: "78%", trend: "All-time high", icon: Users, positive: true },
  { label: "Total Points Issued", value: "97.1k", trend: "+14% vs last year", icon: TrendingUp, positive: true },
  { label: "Budget Utilized", value: "84%", trend: "$8k remaining", icon: DollarSign, positive: false },
];

export default function Analytics() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full custom-scrollbar">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, trend, icon: Icon, positive }) => (
          <Card key={label} className="border border-stone-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">{label}</p>
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-stone-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-stone-900">{value}</p>
              <p className={`text-xs mt-1 ${positive ? "text-green-600" : "text-amber-600"}`}>{trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Participation + Points Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-stone-900">Recognition Volume</CardTitle>
            <p className="text-xs text-stone-500">Monthly recognitions issued, Jan–Dec</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrendData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: "1px solid #e7e5e4", borderRadius: 8 }}
                  formatter={(v: number) => [v, "Recognitions"]}
                />
                <Line
                  type="monotone"
                  dataKey="recognitions"
                  stroke="#1c1917"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-stone-900">Participation Rate</CardTitle>
            <p className="text-xs text-stone-500">Unique participants per month</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTrendData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="participantGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c1917" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1c1917" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: "1px solid #e7e5e4", borderRadius: 8 }}
                  formatter={(v: number) => [v, "Participants"]}
                />
                <Area
                  type="monotone"
                  dataKey="participants"
                  stroke="#1c1917"
                  strokeWidth={2}
                  fill="url(#participantGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-stone-900">Points by Department</CardTitle>
            <p className="text-xs text-stone-500">Total recognition points earned</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={departmentStatsData}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="department" type="category" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: "1px solid #e7e5e4", borderRadius: 8 }}
                  formatter={(v: number) => [`${v.toLocaleString()} pts`, "Points"]}
                />
                <Bar dataKey="points" fill="#1c1917" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-stone-900">Recognition by Category</CardTitle>
            <p className="text-xs text-stone-500">Distribution of recognition types</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {categoryBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 12, border: "1px solid #e7e5e4", borderRadius: 8 }}
                    formatter={(v: number) => [`${v}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryBreakdownData.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.fill }} />
                      <span className="text-stone-700">{cat.category}</span>
                    </div>
                    <span className="font-semibold text-stone-900">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Burn Rate */}
      <Card className="border border-stone-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-stone-900">Budget Burn Rate</CardTitle>
              <p className="text-xs text-stone-500">Cumulative spending vs. total budget ($50,000)</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-500">Current spend</p>
              <p className="text-lg font-bold text-stone-900">$42,000</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={budgetBurnData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1c1917" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1c1917" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: "#78716c" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, border: "1px solid #e7e5e4", borderRadius: 8 }}
                formatter={(v: number, name) => [`$${v.toLocaleString()}`, name === "spent" ? "Spent" : "Budget"]}
              />
              <Legend formatter={(v) => <span className="text-xs text-stone-600">{v === "spent" ? "Spent" : "Total Budget"}</span>} />
              <Area
                type="monotone"
                dataKey="budget"
                stroke="#d6d3d1"
                strokeWidth={1}
                strokeDasharray="4 4"
                fill="none"
                name="budget"
              />
              <Area
                type="monotone"
                dataKey="spent"
                stroke="#1c1917"
                strokeWidth={2}
                fill="url(#budgetGrad)"
                name="spent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Participation Table */}
      <Card className="border border-stone-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-stone-900">Department Participation Rates</CardTitle>
          <p className="text-xs text-stone-500">% of employees who gave or received a recognition this quarter</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...departmentStatsData]
              .sort((a, b) => b.participationRate - a.participationRate)
              .map((dept) => (
                <div key={dept.department} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-stone-700 w-28 shrink-0">{dept.department}</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dept.participationRate >= 85 ? "bg-green-500" :
                        dept.participationRate >= 70 ? "bg-stone-700" :
                        "bg-amber-500"
                      }`}
                      style={{ width: `${dept.participationRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-stone-900 w-10 text-right">{dept.participationRate}%</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

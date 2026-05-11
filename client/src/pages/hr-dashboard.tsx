import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { employeesData, recognitionsData, programsData } from "@/lib/hr-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Star, Users, Gift, TrendingUp, CheckCircle, Clock, Trophy } from "lucide-react";

const totalPointsIssued = recognitionsData
  .filter((r) => r.status === "Approved")
  .reduce((sum, r) => sum + r.points, 0);

const activeRecognitions = recognitionsData.filter((r) => r.status === "Approved").length;
const pendingCount = recognitionsData.filter((r) => r.status === "Pending").length;
const participationRate = 78;
const budgetUsed = 27600;
const budgetTotal = 50000;

const topPerformers = [...employeesData]
  .sort((a, b) => b.points - a.points)
  .slice(0, 8)
  .map((e) => ({ name: e.name.split(" ")[0], points: e.points, department: e.department }));

const recentFeed = [...recognitionsData]
  .filter((r) => r.status === "Approved")
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 5);

const badgeColors: Record<string, string> = {
  Bronze: "bg-amber-100 text-amber-800",
  Silver: "bg-slate-100 text-slate-700",
  Gold: "bg-yellow-100 text-yellow-800",
  Platinum: "bg-purple-100 text-purple-800",
};

const categoryColors: Record<string, string> = {
  Innovation: "bg-blue-100 text-blue-700",
  Leadership: "bg-purple-100 text-purple-700",
  Teamwork: "bg-green-100 text-green-700",
  Creativity: "bg-pink-100 text-pink-700",
  Culture: "bg-orange-100 text-orange-700",
  Collaboration: "bg-teal-100 text-teal-700",
  "Customer Focus": "bg-cyan-100 text-cyan-700",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function HRDashboard() {
  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar space-y-6">
      {/* Hero */}
      <Card className="relative border border-stone-200 overflow-hidden">
        <div className="relative h-52 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }}
          />
          <div className="relative z-10 p-8 flex items-center h-full justify-between">
            <div className="max-w-lg">
              <p className="text-stone-400 text-sm font-medium mb-1 uppercase tracking-wide">May 2025</p>
              <h2 className="text-3xl font-bold text-white mb-3">Recognition Dashboard</h2>
              <p className="text-stone-300 text-base leading-relaxed">
                {pendingCount} recognition{pendingCount !== 1 ? "s" : ""} awaiting approval · Participation at{" "}
                <span className="text-white font-semibold">{participationRate}%</span> this month
              </p>
            </div>
            <div className="hidden lg:flex flex-col items-center justify-center bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <Trophy className="w-10 h-10 text-yellow-400 mb-2" />
              <p className="text-white font-semibold text-lg">Employee of Month</p>
              <p className="text-stone-300 text-sm">Marcus Johnson</p>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-stone-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-1">Points Issued</p>
                <p className="text-2xl font-bold text-stone-900">{totalPointsIssued.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% vs last month</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-1">Recognitions</p>
                <p className="text-2xl font-bold text-stone-900">{activeRecognitions}</p>
                <p className="text-xs text-stone-500 mt-1">{pendingCount} pending approval</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-1">Participation</p>
                <p className="text-2xl font-bold text-stone-900">{participationRate}%</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> All-time high</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-1">Budget Remaining</p>
                <p className="text-2xl font-bold text-stone-900">${(budgetTotal - budgetUsed).toLocaleString()}</p>
                <p className="text-xs text-stone-500 mt-1">of ${budgetTotal.toLocaleString()} total</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
            </div>
            <Progress value={(budgetUsed / budgetTotal) * 100} className="mt-3 h-1.5" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers Chart */}
        <Card className="border border-stone-200 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-stone-900">Top Performers by Points</CardTitle>
            <p className="text-xs text-stone-500">All-time point totals</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topPerformers} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: "1px solid #e7e5e4", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                  formatter={(value: number) => [`${value.toLocaleString()} pts`, "Points"]}
                />
                <Bar dataKey="points" fill="#1c1917" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="border border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-stone-900">Leaderboard</CardTitle>
            <p className="text-xs text-stone-500">Top 5 this month</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {employeesData
              .sort((a, b) => b.points - a.points)
              .slice(0, 5)
              .map((emp, i) => (
                <div key={emp.id} className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-4 text-right ${i === 0 ? "text-yellow-600" : i === 1 ? "text-slate-500" : i === 2 ? "text-amber-700" : "text-stone-400"}`}>
                    {i + 1}
                  </span>
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={emp.avatar} alt={emp.name} />
                    <AvatarFallback className="text-xs">{emp.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-900 truncate">{emp.name}</p>
                    <p className="text-xs text-stone-500">{emp.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-stone-900">{emp.points.toLocaleString()}</p>
                    <Badge className={`text-xs px-1.5 py-0 h-4 ${badgeColors[emp.badgeLevel]}`} variant="secondary">
                      {emp.badgeLevel}
                    </Badge>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recognition Feed */}
        <Card className="border border-stone-200 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-stone-900">Recent Recognitions</CardTitle>
                <p className="text-xs text-stone-500">Latest approved shout-outs</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-stone-500">View all</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentFeed.map((rec) => (
              <div key={rec.id} className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={rec.senderAvatar} alt={rec.senderName} />
                  <AvatarFallback className="text-xs">{rec.senderName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1 mb-0.5">
                    <span className="text-xs font-semibold text-stone-900">{rec.senderName}</span>
                    <span className="text-xs text-stone-500">recognized</span>
                    <span className="text-xs font-semibold text-stone-900">{rec.recipientName}</span>
                    <Badge className={`text-xs px-1.5 py-0 h-4 ${categoryColors[rec.category] ?? "bg-stone-100 text-stone-700"}`} variant="secondary">
                      {rec.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2">{rec.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-stone-400">{timeAgo(rec.createdAt)}</span>
                    <span className="text-xs font-medium text-stone-700">+{rec.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Programs */}
        <Card className="border border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-stone-900">Active Programs</CardTitle>
            <p className="text-xs text-stone-500">Budget utilization</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {programsData
              .filter((p) => p.status === "Active")
              .map((prog) => {
                const pct = Math.round((prog.spentPoints / prog.pointBudget) * 100);
                return (
                  <div key={prog.id}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-stone-900 truncate flex-1">{prog.name}</p>
                      <span className="text-xs text-stone-500 ml-2">{pct}%</span>
                    </div>
                    <Progress value={pct} className={`h-1.5 ${pct >= 80 ? "[&>div]:bg-red-500" : pct >= 60 ? "[&>div]:bg-yellow-500" : ""}`} />
                    <p className="text-xs text-stone-400 mt-0.5">
                      {prog.spentPoints.toLocaleString()} / {prog.pointBudget.toLocaleString()} pts
                    </p>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      {pendingCount > 0 && (
        <Card className="border border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                {pendingCount} recognition{pendingCount !== 1 ? "s" : ""} pending your approval
              </p>
              <p className="text-xs text-amber-700">Review and approve to issue points to recipients.</p>
            </div>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
              Review Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Crown } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { scoreDistribution, type ShortlistEntry } from "@/lib/ai-shortlister";

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

export function ScoreDistributionCard({ shortlist }: { shortlist: ShortlistEntry[] }) {
  const distribution = scoreDistribution(shortlist);
  return (
    <Card className="border border-stone-200">
      <CardContent className="p-5">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">Score distribution</h2>
            <p className="text-xs text-stone-500 mt-0.5">Where the natural cutoff lives</p>
          </div>
          <span className="text-xs text-stone-400">
            Median {median(shortlist.map((s) => s.score))}/100
          </span>
        </div>
        {shortlist.length === 0 ? (
          <EmptyChart label="No approved nominations to score" />
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={distribution}
              margin={{ top: 5, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 11, fill: "#78716c" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#78716c" }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e7e5e4",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="count"
                fill="#a87a3a"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-stone-400">
      <Crown className="w-5 h-5 mb-1.5" />
      <p className="text-xs">{label}</p>
    </div>
  );
}

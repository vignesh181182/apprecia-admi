import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getStoredPrograms,
  type ProgramCategory,
  type ProgramStatus,
  type StoredProgram,
} from "@/lib/programs-data";
import { getAccount } from "@/lib/account";

type Row = {
  category: ProgramCategory;
  program: StoredProgram;
  points: number;
  money: number;
};

const STATUS_FILTERS: { id: "all" | ProgramStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "scheduled", label: "Scheduled" },
  { id: "active", label: "Active" },
  { id: "ended", label: "Ended" },
];

const statusBadgeClass: Record<ProgramStatus, string> = {
  draft: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  scheduled: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  active: "bg-green-100 text-green-800 hover:bg-green-100",
  "ending-soon": "bg-orange-100 text-orange-800 hover:bg-orange-100",
  ended: "bg-stone-100 text-stone-700 hover:bg-stone-100",
};

export default function Categories() {
  const account = getAccount();
  const currency = account?.currency ?? "₹";
  const pv = account?.appreciationPolicy?.pointValue;
  const pointRate = pv && pv.points > 0 ? pv.amount / pv.points : 1;

  const [statusFilter, setStatusFilter] = useState<"all" | ProgramStatus>("all");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "engagex_programs") setVersion((v) => v + 1);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const rows = useMemo<Row[]>(() => {
    const programs = getStoredPrograms();
    const out: Row[] = [];
    for (const p of programs) {
      for (const c of p.categories ?? []) {
        const points = c.winnersCount * c.prizePoints;
        const money = Math.round(points * pointRate);
        out.push({ category: c, program: p, points, money });
      }
    }
    return out;
  }, [pointRate, version]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return rows;
    if (statusFilter === "active") {
      return rows.filter(
        (r) => r.program.status === "active" || r.program.status === "ending-soon",
      );
    }
    return rows.filter((r) => r.program.status === statusFilter);
  }, [rows, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const f of STATUS_FILTERS) {
      if (f.id === "all") continue;
      if (f.id === "active") {
        c[f.id] = rows.filter(
          (r) => r.program.status === "active" || r.program.status === "ending-soon",
        ).length;
      } else {
        c[f.id] = rows.filter((r) => r.program.status === f.id).length;
      }
    }
    return c;
  }, [rows]);

  const totalWinners = filtered.reduce((s, r) => s + r.category.winnersCount, 0);
  const totalPoints = filtered.reduce((s, r) => s + r.points, 0);
  const totalMoney = filtered.reduce((s, r) => s + r.money, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              statusFilter === f.id
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            {f.label} ({counts[f.id] ?? 0})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryStat label="Categories" value={filtered.length} />
        <SummaryStat label="Total winners" value={totalWinners} />
        <SummaryStat
          label="Total spend"
          value={`${totalPoints.toLocaleString()} pts · ${currency}${totalMoney.toLocaleString()}`}
        />
      </div>

      <Card className="border border-stone-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[36%]">Category</TableHead>
                <TableHead>Program</TableHead>
                <TableHead className="text-right">Winners</TableHead>
                <TableHead className="text-right">Prize / winner</TableHead>
                <TableHead className="text-right">Category budget</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-stone-500 py-10">
                    No categories yet. Create a program and add award categories to see them here.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => {
                  const perWinnerMoney = Math.round(r.category.prizePoints * pointRate);
                  return (
                    <TableRow key={`${r.program.id}-${r.category.id}`}>
                      <TableCell>
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="text-xl leading-none mt-0.5">
                            {r.category.emoji || "🏆"}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-900 truncate">
                              {r.category.name || "(unnamed)"}
                            </p>
                            {r.category.description && (
                              <p className="text-xs text-stone-500 truncate">
                                {r.category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-0">
                          <Link
                            to={`/programs/${r.program.id}`}
                            className="text-sm text-stone-700 hover:text-stone-900 hover:underline truncate"
                          >
                            {r.program.name}
                          </Link>
                          <Badge
                            variant="secondary"
                            className={`${statusBadgeClass[r.program.status]} text-[10px] capitalize`}
                          >
                            {r.program.status.replace("-", " ")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm text-stone-700">
                        {r.category.winnersCount}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        <span className="text-stone-900">
                          {currency}
                          {perWinnerMoney.toLocaleString()}
                        </span>
                        <span className="text-stone-500">
                          {" · "}
                          {r.category.prizePoints.toLocaleString()} pts
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        <span className="text-stone-900 font-medium">
                          {currency}
                          {r.money.toLocaleString()}
                        </span>
                        <span className="text-stone-500">
                          {" · "}
                          {r.points.toLocaleString()} pts
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border border-stone-200">
      <CardContent className="p-4">
        <p className="text-[11px] uppercase tracking-wide text-stone-500">{label}</p>
        <p className="text-xl font-semibold text-stone-900 tabular-nums mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

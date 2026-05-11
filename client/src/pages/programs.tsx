import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { programsData, type Program, type ProgramStatus } from "@/lib/hr-data";
import { Plus, Users, Calendar, Trophy, Pencil, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<ProgramStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Draft: "bg-yellow-100 text-yellow-700",
  Ended: "bg-stone-100 text-stone-500",
};

const typeColors: Record<string, string> = {
  "Monthly Award": "bg-purple-100 text-purple-700",
  Ongoing: "bg-blue-100 text-blue-700",
  Milestone: "bg-cyan-100 text-cyan-700",
  "Quarterly Award": "bg-orange-100 text-orange-700",
  "One-time": "bg-pink-100 text-pink-700",
};

export default function Programs() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editProgram, setEditProgram] = useState<Program | null>(null);

  const filtered = programsData.filter((p) =>
    statusFilter === "all" || p.status === statusFilter
  );

  const counts = {
    Active: programsData.filter((p) => p.status === "Active").length,
    Draft: programsData.filter((p) => p.status === "Draft").length,
    Ended: programsData.filter((p) => p.status === "Ended").length,
  };

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "Active", "Draft", "Ended"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${statusFilter === s ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"}`}
            >
              {s === "all" ? "All" : `${s} (${counts[s as ProgramStatus]})`}
            </button>
          ))}
        </div>

        <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) setEditProgram(null); }}>
          <SheetTrigger asChild>
            <Button size="sm" className="bg-stone-900 hover:bg-stone-700 text-white gap-2 h-9">
              <Plus className="w-4 h-4" /> New Program
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editProgram ? "Edit Program" : "Create Program"}</SheetTitle>
              <SheetDescription>
                {editProgram ? "Update program details and settings." : "Set up a new recognition program for your team."}
              </SheetDescription>
            </SheetHeader>
            <ProgramForm
              program={editProgram}
              onSubmit={() => {
                setSheetOpen(false);
                setEditProgram(null);
                toast({ title: editProgram ? "Program updated" : "Program created", description: "Changes saved successfully." });
              }}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Active Programs", value: counts.Active, color: "text-green-600" },
          { label: "Total Budget", value: `$${(programsData.reduce((s, p) => s + p.pointBudget, 0) / 100).toLocaleString()}k`, color: "text-stone-900" },
          { label: "Total Enrolled", value: programsData.reduce((s, p) => s + p.enrollmentCount, 0).toLocaleString(), color: "text-stone-900" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border border-stone-200">
            <CardContent className="p-4">
              <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Program Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((prog) => {
          const pct = Math.round((prog.spentPoints / prog.pointBudget) * 100);
          const isOverBudget = pct >= 80;

          return (
            <Card key={prog.id} className={`border border-stone-200 hover:shadow-sm transition-all ${prog.status === "Ended" ? "opacity-70" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-stone-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{prog.name}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{prog.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge className={`text-xs ${statusColors[prog.status]}`} variant="secondary">
                      {prog.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-stone-400 hover:text-stone-700"
                      onClick={() => { setEditProgram(prog); setSheetOpen(true); }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {/* Type */}
                <Badge className={`text-xs ${typeColors[prog.type] ?? "bg-stone-100 text-stone-600"}`} variant="secondary">
                  {prog.type}
                </Badge>

                {/* Budget */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-stone-600 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" /> Budget
                    </span>
                    <span className={`text-xs font-medium ${isOverBudget ? "text-red-600" : "text-stone-700"}`}>
                      {prog.spentPoints.toLocaleString()} / {prog.pointBudget.toLocaleString()} pts ({pct}%)
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-1.5 ${isOverBudget ? "[&>div]:bg-red-500" : pct >= 60 ? "[&>div]:bg-yellow-500" : ""}`}
                  />
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-600">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    {prog.enrollmentCount} enrolled
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-600">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {new Date(prog.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-stone-500 text-sm">
            No programs found.
          </div>
        )}
      </div>
    </div>
  );
}

function ProgramForm({ program, onSubmit }: { program: Program | null; onSubmit: () => void }) {
  return (
    <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Program Name</Label>
        <Input defaultValue={program?.name} placeholder="e.g. Employee of the Month" className="h-9 text-sm border-stone-200" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Description</Label>
        <Textarea defaultValue={program?.description} placeholder="Describe the program…" className="text-sm border-stone-200 resize-none" rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-stone-700">Type</Label>
          <Select defaultValue={program?.type}>
            <SelectTrigger className="h-9 text-sm border-stone-200">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {["Monthly Award", "Quarterly Award", "Ongoing", "Milestone", "One-time"].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-stone-700">Status</Label>
          <Select defaultValue={program?.status ?? "Draft"}>
            <SelectTrigger className="h-9 text-sm border-stone-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Ended">Ended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Point Budget</Label>
        <Input type="number" defaultValue={program?.pointBudget} placeholder="e.g. 10000" min={100} className="h-9 text-sm border-stone-200" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-stone-700">Start Date</Label>
          <Input type="date" defaultValue={program?.startDate} className="h-9 text-sm border-stone-200" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-stone-700">End Date</Label>
          <Input type="date" defaultValue={program?.endDate} className="h-9 text-sm border-stone-200" />
        </div>
      </div>
      <Button type="submit" className="w-full bg-stone-900 hover:bg-stone-700 text-white">
        {program ? "Save Changes" : "Create Program"}
      </Button>
    </form>
  );
}

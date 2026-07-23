import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employeesData, recognitionsData, type Employee, type BadgeLevel } from "@/lib/hr-data";
import { Search, LayoutGrid, List, Star, ArrowUpDown } from "lucide-react";

const badgeColors: Record<BadgeLevel, string> = {
  Bronze: "bg-amber-100 text-amber-800",
  Silver: "bg-muted text-muted-foreground",
  Gold: "bg-yellow-100 text-yellow-800",
  Platinum: "bg-purple-100 text-purple-800",
};

const departments = ["All", ...Array.from(new Set(employeesData.map((e) => e.department)))].sort();

export default function Employees() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [sortField, setSortField] = useState<"points" | "name">("points");

  const filtered = employeesData
    .filter((e) => {
      const matchSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase());
      const matchDept = dept === "All" || e.department === dept;
      return matchSearch && matchDept;
    })
    .sort((a, b) => sortField === "points" ? b.points - a.points : a.name.localeCompare(b.name));

  const employeeRecognitions = selected
    ? recognitionsData.filter((r) => r.recipientId === selected.id || r.senderId === selected.id)
    : [];

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search employees…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm border-border"
            />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="h-9 w-44 text-sm border-border">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 text-xs border-border text-muted-foreground"
            onClick={() => setSortField((f) => f === "points" ? "name" : "points")}
          >
            <ArrowUpDown className="w-3 h-3" />
            Sort: {sortField === "points" ? "Points" : "Name"}
          </Button>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "table")}>
          <TabsList className="h-9 bg-muted">
            <TabsTrigger value="grid" className="h-7 px-2.5"><LayoutGrid className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="table" className="h-7 px-2.5"><List className="w-4 h-4" /></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} employees</p>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((emp) => (
            <Card
              key={emp.id}
              className="border border-border hover:border-border cursor-pointer transition-all hover:shadow-sm"
              onClick={() => setSelected(emp)}
            >
              <CardContent className="p-5 text-center">
                <Avatar className="h-14 w-14 mx-auto mb-3">
                  <AvatarImage src={emp.avatar} alt={emp.name} />
                  <AvatarFallback>{emp.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{emp.role}</p>
                <p className="text-xs text-muted-foreground">{emp.department}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge className={`text-xs ${badgeColors[emp.badgeLevel]}`} variant="secondary">
                    {emp.badgeLevel}
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-primary" />
                    {emp.points.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{emp.recognitionsReceived}</p>
                    <p className="text-xs text-muted-foreground">Received</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{emp.recognitionsGiven}</p>
                    <p className="text-xs text-muted-foreground">Given</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="text-xs font-semibold text-muted-foreground">Employee</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Department</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Role</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Points</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Badge</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Received</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Given</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => (
                <TableRow
                  key={emp.id}
                  className="hover:bg-muted cursor-pointer"
                  onClick={() => setSelected(emp)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={emp.avatar} />
                        <AvatarFallback className="text-xs">{emp.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium text-foreground">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{emp.department}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{emp.role}</TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">{emp.points.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${badgeColors[emp.badgeLevel]}`} variant="secondary">{emp.badgeLevel}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{emp.recognitionsReceived}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{emp.recognitionsGiven}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Employee Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-4 mt-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selected.avatar} alt={selected.name} />
                    <AvatarFallback className="text-lg">{selected.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-lg">{selected.name}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{selected.role} · {selected.department}</p>
                    <p className="text-xs text-muted-foreground">{selected.email}</p>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "Total Points", value: selected.points.toLocaleString() },
                  { label: "Received", value: selected.recognitionsReceived },
                  { label: "Given", value: selected.recognitionsGiven },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-muted border border-border p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Badge className={`${badgeColors[selected.badgeLevel]}`} variant="secondary">
                  {selected.badgeLevel} Level
                </Badge>
                <span className="text-xs text-muted-foreground">Joined {new Date(selected.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-foreground mb-3">Recognition History</p>
                {employeeRecognitions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No recognitions found.</p>
                ) : (
                  <div className="space-y-3">
                    {employeeRecognitions.map((rec) => {
                      const isRecipient = rec.recipientId === selected.id;
                      return (
                        <div key={rec.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-center justify-between mb-1">
                            <Badge className="text-xs bg-muted text-muted-foreground" variant="secondary">
                              {isRecipient ? "Received" : "Sent"}
                            </Badge>
                            <span className="text-xs font-semibold text-muted-foreground">
                              {isRecipient ? `+${rec.points}` : `-${rec.points}`} pts
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{rec.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isRecipient ? `From ${rec.senderName}` : `To ${rec.recipientName}`} · {rec.category}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

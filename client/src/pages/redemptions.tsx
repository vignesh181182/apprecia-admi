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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redemptionsData, type Redemption, type RedemptionStatus } from "@/lib/hr-data";
import { Search, Check, X, Package, Star, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { getAccount } from "@/lib/account";
import { isMonetaryActive } from "@/lib/appreciation-policy";

// TODO: Connects to wallet redemptions in Phase 4.1. Until then the table
// is backed by the mocked redemptionsData from hr-data.

const statusColors: Record<RedemptionStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Fulfilled: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Redemptions() {
  const { toast } = useToast();
  const [items, setItems] = useState<Redemption[]>(redemptionsData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const account = getAccount();
  if (!isMonetaryActive(account)) {
    return (
      <div className="p-6">
        <Card className="border border-stone-200">
          <CardContent className="flex flex-col items-center text-center gap-3 py-14 px-6">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
              <Ban className="w-5 h-5 text-stone-500" />
            </div>
            <p className="text-base font-semibold text-stone-900">Redemptions are disabled</p>
            <p className="text-sm text-stone-600 max-w-md">
              Monetary recognition is currently off at the org level. Re-enable it in{" "}
              <Link to="/settings" className="text-stone-900 underline underline-offset-2 font-medium">
                Settings → Appreciation Policy
              </Link>{" "}
              to start accepting employee redemptions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filtered = items.filter((r) => {
    const matchSearch =
      r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      r.rewardName.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function fulfill(id: string) {
    setItems((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Fulfilled" as RedemptionStatus, fulfilledAt: new Date().toISOString() } : r
      )
    );
    toast({ title: "Redemption fulfilled", description: "The employee has been notified." });
  }

  function reject(id: string) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected" as RedemptionStatus } : r)));
    toast({ title: "Redemption rejected", description: "Points have been refunded to the employee." });
  }

  const pendingCount = items.filter((r) => r.status === "Pending").length;
  const totalPtsRedeemed = items.filter((r) => r.status === "Fulfilled").reduce((s, r) => s + r.points, 0);

  return (
    <div className="p-6 space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending", value: pendingCount, icon: Package, accent: pendingCount > 0 ? "text-yellow-600" : "text-stone-900" },
          { label: "Fulfilled", value: items.filter((r) => r.status === "Fulfilled").length, icon: Check, accent: "text-green-600" },
          { label: "Pts Redeemed", value: totalPtsRedeemed.toLocaleString(), icon: Star, accent: "text-stone-900" },
        ].map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className="border border-stone-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-stone-600" />
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">{label}</p>
                <p className={`text-2xl font-bold ${accent}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Search by employee or reward…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm border-stone-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-40 text-sm border-stone-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Fulfilled">Fulfilled</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-stone-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50">
              <TableHead className="text-xs font-semibold text-stone-600">Employee</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Reward</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Category</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Points</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Requested</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Fulfilled</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Status</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((red) => (
              <TableRow key={red.id} className="hover:bg-stone-50">
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={red.employeeAvatar} />
                      <AvatarFallback className="text-xs">{red.employeeName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium text-stone-900">{red.employeeName}</p>
                      <p className="text-xs text-stone-500">{red.department}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-stone-900 font-medium max-w-32 truncate">{red.rewardName}</TableCell>
                <TableCell className="text-xs text-stone-600">{red.rewardCategory}</TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-stone-900 flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {red.points.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-stone-600">{formatDate(red.requestedAt)}</TableCell>
                <TableCell className="text-xs text-stone-600">
                  {red.fulfilledAt ? formatDate(red.fulfilledAt) : "—"}
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs ${statusColors[red.status]}`} variant="secondary">
                    {red.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {red.status === "Pending" && (
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 gap-1"
                        onClick={() => fulfill(red.id)}
                      >
                        <Check className="w-3.5 h-3.5" /> Fulfill
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <X className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reject this redemption?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {red.employeeName}'s request for "{red.rewardName}" will be declined and {red.points} points will be refunded.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => reject(red.id)} className="bg-red-600 hover:bg-red-700">
                              Reject & Refund
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-stone-500 py-10">
                  No redemptions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

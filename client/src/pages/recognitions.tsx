import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { recognitionsData, type Recognition, type RecognitionStatus } from "@/lib/hr-data";
import { Search, Plus, Check, X, Filter, Star, Info, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AUTO_APPROVE_THRESHOLD = 100;

const statusColors: Record<RecognitionStatus, string> = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function Recognitions() {
  const { toast } = useToast();
  const [items, setItems] = useState<Recognition[]>(recognitionsData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Recognition | null>(null);

  const filtered = items.filter((r) => {
    const matchSearch =
      r.senderName.toLowerCase().includes(search.toLowerCase()) ||
      r.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.message.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function approve(id: string) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" as RecognitionStatus } : r)));
    setSelected((s) => (s && s.id === id ? { ...s, status: "Approved" } : s));
    toast({ title: "Recognition approved", description: "Points have been issued to the recipient." });
  }

  function reject(id: string) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected" as RecognitionStatus } : r)));
    setSelected((s) => (s && s.id === id ? { ...s, status: "Rejected" } : s));
    toast({ title: "Recognition rejected", description: "The recognition has been declined." });
  }

  return (
    <div className="p-6 space-y-4">
      {/* Auto-approval banner */}
      <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border border-blue-100 bg-blue-50">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-900">
          <span className="font-semibold">Auto-approval rule:</span> Recognitions under{" "}
          <span className="font-semibold">{AUTO_APPROVE_THRESHOLD} pts</span> go live instantly. Recognitions of{" "}
          {AUTO_APPROVE_THRESHOLD} pts or more require admin approval.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search by name, category, or message…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm border-stone-200"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-40 text-sm border-stone-200">
              <Filter className="w-4 h-4 mr-2 text-stone-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending Approval</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="bg-stone-900 hover:bg-stone-700 text-white gap-2 h-9">
              <Plus className="w-4 h-4" /> New Recognition
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Create Recognition</SheetTitle>
              <SheetDescription>Send a recognition to celebrate a colleague's contribution.</SheetDescription>
            </SheetHeader>
            <NewRecognitionForm onSubmit={(autoApproved) => {
              setSheetOpen(false);
              toast({
                title: autoApproved ? "Recognition live" : "Recognition submitted",
                description: autoApproved
                  ? `Under ${AUTO_APPROVE_THRESHOLD} pts — went live automatically.`
                  : "It will appear after admin approval.",
              });
            }} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats row — clickable to filter */}
      <div className="grid grid-cols-3 gap-3">
        {(["Pending", "Approved", "Rejected"] as RecognitionStatus[]).map((s) => {
          const count = items.filter((r) => r.status === s).length;
          const isActive = statusFilter === s;
          return (
            <Card
              key={s}
              className={`border cursor-pointer transition-all ${isActive ? "border-stone-800 shadow-sm" : "border-stone-200 hover:border-stone-300"}`}
              onClick={() => setStatusFilter(isActive ? "all" : s)}
            >
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-stone-900">{count}</p>
                <Badge className={`mt-1 ${statusColors[s]}`} variant="secondary">{s === "Pending" ? "Pending Approval" : s}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-stone-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50">
              <TableHead className="text-xs font-semibold text-stone-600">From → To</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Program</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Category</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Points</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Date</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Status</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((rec) => (
              <TableRow
                key={rec.id}
                className="hover:bg-stone-50 cursor-pointer"
                onClick={() => setSelected(rec)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      <Avatar className="h-6 w-6 border-2 border-white">
                        <AvatarImage src={rec.senderAvatar} />
                        <AvatarFallback className="text-xs">{rec.senderName[0]}</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-6 w-6 border-2 border-white">
                        <AvatarImage src={rec.recipientAvatar} />
                        <AvatarFallback className="text-xs">{rec.recipientName[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-stone-900">{rec.senderName}</p>
                      <p className="text-xs text-stone-500">→ {rec.recipientName}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-stone-700">{rec.programName}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${categoryColors[rec.category] ?? "bg-stone-100 text-stone-700"}`} variant="secondary">
                    {rec.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-semibold text-stone-900">+{rec.points}</TableCell>
                <TableCell className="text-xs text-stone-600">{formatDate(rec.createdAt)}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${statusColors[rec.status]}`} variant="secondary">
                    {rec.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  {rec.status === "Pending" ? (
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => approve(rec.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <X className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reject this recognition?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will decline the recognition from {rec.senderName} to {rec.recipientName}. No points will be issued.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => reject(rec.id)} className="bg-red-600 hover:bg-red-700">
                              Reject
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-stone-500 hover:text-stone-900"
                      onClick={() => setSelected(rec)}
                    >
                      View
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-stone-500 py-10">
                  No recognitions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-base">Recognition Details</SheetTitle>
                <SheetDescription className="text-xs">
                  {formatDateTime(selected.createdAt)}
                </SheetDescription>
              </SheetHeader>

              {/* Status pill */}
              <div className="mt-5 flex items-center justify-between">
                <Badge className={`${statusColors[selected.status]}`} variant="secondary">
                  {selected.status === "Pending" ? "Pending Approval" : selected.status}
                </Badge>
                <div className="flex items-center gap-1 text-sm font-bold text-stone-900">
                  <Star className="w-3.5 h-3.5 text-yellow-500" />
                  +{selected.points} pts
                </div>
              </div>

              {/* From → To card */}
              <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={selected.senderAvatar} />
                      <AvatarFallback className="text-xs">{selected.senderName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs text-stone-500">From</p>
                      <p className="text-sm font-semibold text-stone-900 truncate">{selected.senderName}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={selected.recipientAvatar} />
                      <AvatarFallback className="text-xs">{selected.recipientName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs text-stone-500">To</p>
                      <p className="text-sm font-semibold text-stone-900 truncate">{selected.recipientName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-stone-500 mb-1">Program</p>
                  <p className="text-sm font-medium text-stone-900">{selected.programName}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-1">Category</p>
                  <Badge className={`text-xs ${categoryColors[selected.category] ?? "bg-stone-100 text-stone-700"}`} variant="secondary">
                    {selected.category}
                  </Badge>
                </div>
              </div>

              {/* Reason */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Reason</p>
                <div className="rounded-lg border border-stone-200 bg-white p-3.5">
                  <p className="text-sm text-stone-700 leading-relaxed">{selected.message}</p>
                </div>
              </div>

              {/* Actions */}
              {selected.status === "Pending" && (
                <div className="mt-6 flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2">
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject this recognition?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will decline {selected.senderName}'s recognition for {selected.recipientName}. No points will be issued.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => reject(selected.id)} className="bg-red-600 hover:bg-red-700">
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    className="flex-1 bg-stone-900 hover:bg-stone-700 text-white gap-2"
                    onClick={() => approve(selected.id)}
                  >
                    <Check className="w-4 h-4" /> Approve
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NewRecognitionForm({ onSubmit }: { onSubmit: (autoApproved: boolean) => void }) {
  const [points, setPoints] = useState<number>(100);
  const willAutoApprove = points < AUTO_APPROVE_THRESHOLD;

  return (
    <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(willAutoApprove); }}>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Recipient</Label>
        <Select>
          <SelectTrigger className="h-9 text-sm border-stone-200">
            <SelectValue placeholder="Select employee…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Sarah Chen</SelectItem>
            <SelectItem value="2">Marcus Johnson</SelectItem>
            <SelectItem value="3">Priya Sharma</SelectItem>
            <SelectItem value="4">David Kim</SelectItem>
            <SelectItem value="5">Aisha Okafor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Program</Label>
        <Select>
          <SelectTrigger className="h-9 text-sm border-stone-200">
            <SelectValue placeholder="Select program…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="peer">Peer-to-Peer Recognition</SelectItem>
            <SelectItem value="eotm">Employee of the Month</SelectItem>
            <SelectItem value="values">Values Champion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Category</Label>
        <Select>
          <SelectTrigger className="h-9 text-sm border-stone-200">
            <SelectValue placeholder="Select category…" />
          </SelectTrigger>
          <SelectContent>
            {["Innovation", "Teamwork", "Leadership", "Creativity", "Culture", "Collaboration", "Customer Focus"].map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Points</Label>
        <Input
          type="number"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          min={25}
          max={500}
          className="h-9 text-sm border-stone-200"
        />
        <p className={`text-xs ${willAutoApprove ? "text-green-600" : "text-amber-600"}`}>
          {willAutoApprove
            ? `Will go live instantly (under ${AUTO_APPROVE_THRESHOLD} pts).`
            : `Requires admin approval (${AUTO_APPROVE_THRESHOLD}+ pts).`}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Reason</Label>
        <Textarea
          placeholder="Describe what this person did and why it matters…"
          className="text-sm border-stone-200 resize-none"
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full bg-stone-900 hover:bg-stone-700 text-white">
        Submit Recognition
      </Button>
    </form>
  );
}

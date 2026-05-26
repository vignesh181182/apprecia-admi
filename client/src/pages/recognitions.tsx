import { useEffect, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { employeesData, recognitionsData, type Recognition, type RecognitionStatus } from "@/lib/hr-data";
import { getAccount } from "@/lib/account";
import {
  BADGE_CATEGORIES,
  INITIAL_BADGES,
  findBadgeByName,
  getCategoryStyle,
} from "@/lib/badges-catalog";
import { Search, Plus, Check, X, Filter, Star, Info, ArrowRight, MoreHorizontal, Pencil, Trash2, Eye, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AUTO_APPROVE_KEY = "engagex_auto_approve_threshold";
const DEFAULT_AUTO_APPROVE_THRESHOLD = 100;

function readAutoApproveThreshold(): number {
  if (typeof window === "undefined") return DEFAULT_AUTO_APPROVE_THRESHOLD;
  const raw = window.localStorage.getItem(AUTO_APPROVE_KEY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_AUTO_APPROVE_THRESHOLD;
}

const statusColors: Record<RecognitionStatus, string> = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
};


function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export type RecognitionDraft = {
  recipientId: string;
  programName: string;
  category: string;
  points: number;
  message: string;
};

export default function Recognitions({
  showCreate = true,
  defaultStatusFilter = "all",
  approvalMode = false,
}: { showCreate?: boolean; defaultStatusFilter?: string; approvalMode?: boolean } = {}) {
  const { toast } = useToast();
  const [items, setItems] = useState<Recognition[]>(recognitionsData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(defaultStatusFilter);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Recognition | null>(null);
  const [selected, setSelected] = useState<Recognition | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Recognition | null>(null);
  const [autoApproveThreshold, setAutoApproveThreshold] = useState<number>(readAutoApproveThreshold);

  useEffect(() => {
    window.localStorage.setItem(AUTO_APPROVE_KEY, String(autoApproveThreshold));
  }, [autoApproveThreshold]);

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

  function createRecognition(draft: RecognitionDraft): boolean {
    const recipient = employeesData.find((e) => e.id === draft.recipientId);
    if (!recipient) return false;
    const account = getAccount();
    const senderName = account?.adminName ?? "You";
    const autoApprove = draft.points < autoApproveThreshold;
    const newItem: Recognition = {
      id: `rec-${Date.now()}`,
      senderId: "current-user",
      senderName,
      senderAvatar: "",
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientAvatar: recipient.avatar,
      programName: draft.programName,
      category: draft.category,
      points: draft.points,
      message: draft.message,
      status: autoApprove ? "Approved" : "Pending",
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
    toast({
      title: autoApprove ? "Recognition live" : "Recognition submitted",
      description: autoApprove
        ? `Under ${autoApproveThreshold} pts — went live automatically.`
        : "It will appear after admin approval.",
    });
    return true;
  }

  function updateRecognition(id: string, draft: RecognitionDraft): boolean {
    const recipient = employeesData.find((e) => e.id === draft.recipientId);
    if (!recipient) return false;
    setItems((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              recipientId: recipient.id,
              recipientName: recipient.name,
              recipientAvatar: recipient.avatar,
              programName: draft.programName,
              category: draft.category,
              points: draft.points,
              message: draft.message,
            }
          : r,
      ),
    );
    setSelected((s) =>
      s && s.id === id
        ? {
            ...s,
            recipientId: recipient.id,
            recipientName: recipient.name,
            recipientAvatar: recipient.avatar,
            programName: draft.programName,
            category: draft.category,
            points: draft.points,
            message: draft.message,
          }
        : s,
    );
    toast({ title: "Recognition updated" });
    return true;
  }

  function deleteRecognition(id: string) {
    setItems((prev) => prev.filter((r) => r.id !== id));
    setSelected((s) => (s && s.id === id ? null : s));
    toast({ title: "Recognition deleted" });
  }

  return (
    <div className="p-6 space-y-4">
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

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <AutoApprovalPill
            threshold={autoApproveThreshold}
            onChange={setAutoApproveThreshold}
          />
          {showCreate && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="bg-stone-900 hover:bg-stone-700 text-white gap-2 h-9">
                  <Plus className="w-4 h-4" /> Add Recognition
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Create Recognition</SheetTitle>
                  <SheetDescription>Send a recognition to celebrate a colleague's contribution.</SheetDescription>
                </SheetHeader>
                <RecognitionForm
                  submitLabel="Submit Recognition"
                  threshold={autoApproveThreshold}
                  onSubmit={(draft) => {
                    if (createRecognition(draft)) setSheetOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Edit Sheet */}
      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {editing && (
            <>
              <SheetHeader>
                <SheetTitle>Edit Recognition</SheetTitle>
                <SheetDescription>Update the details of this recognition.</SheetDescription>
              </SheetHeader>
              <RecognitionForm
                submitLabel="Save Changes"
                threshold={autoApproveThreshold}
                initial={{
                  recipientId: editing.recipientId,
                  programName: editing.programName,
                  category: editing.category,
                  points: editing.points,
                  message: editing.message,
                }}
                onSubmit={(draft) => {
                  if (updateRecognition(editing.id, draft)) setEditing(null);
                }}
              />
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this recognition?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCandidate && (
                <>This will permanently remove the recognition from {deleteCandidate.senderName} to {deleteCandidate.recipientName}. This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteCandidate) deleteRecognition(deleteCandidate.id);
                setDeleteCandidate(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              <TableHead className="text-xs font-semibold text-stone-600">Badge</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Category</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Points</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Note</TableHead>
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
                <TableCell className="text-xs text-stone-700">
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden>{getCategoryStyle(rec.category).emoji}</span>
                    <span className="font-medium">{rec.programName}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs ${getCategoryStyle(rec.category).chip}`} variant="secondary">
                    {rec.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-semibold text-stone-900">+{rec.points}</TableCell>
                <TableCell className="max-w-[260px]">
                  <p
                    className="text-xs text-stone-600 truncate"
                    title={rec.message}
                  >
                    {rec.message}
                  </p>
                </TableCell>
                <TableCell className="text-xs text-stone-600 whitespace-nowrap">{formatDate(rec.createdAt)}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${statusColors[rec.status]}`} variant="secondary">
                    {rec.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  {approvalMode && rec.status === "Pending" ? (
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
                  ) : approvalMode ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-stone-500 hover:text-stone-900"
                      onClick={() => setSelected(rec)}
                    >
                      View
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-stone-500 hover:text-stone-900">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => setSelected(rec)}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditing(rec)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteCandidate(rec)}
                          className="text-red-600 focus:text-red-700 focus:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-stone-500 py-10">
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
                  <Badge className={`text-xs ${getCategoryStyle(selected.category).chip}`} variant="secondary">
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
              {approvalMode && selected.status === "Pending" && (
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

              {!approvalMode && (
                <div className="mt-6 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2"
                    onClick={() => setDeleteCandidate(selected)}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                  <Button
                    className="flex-1 bg-stone-900 hover:bg-stone-700 text-white gap-2"
                    onClick={() => {
                      setEditing(selected);
                      setSelected(null);
                    }}
                  >
                    <Pencil className="w-4 h-4" /> Edit
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

function AutoApprovalPill({
  threshold,
  onChange,
}: {
  threshold: number;
  onChange: (next: number) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string>(String(threshold));

  useEffect(() => {
    if (open) setDraft(String(threshold));
  }, [open, threshold]);

  function save() {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast({
        title: "Invalid threshold",
        description: "Enter a number greater than or equal to 0.",
        variant: "destructive",
      });
      return;
    }
    onChange(parsed);
    setOpen(false);
    toast({ title: "Auto-approval rule updated" });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-blue-100 bg-blue-50 text-xs text-blue-900 hover:bg-blue-100 transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>
            Auto-approve under <span className="font-semibold">{threshold} pts</span>
          </span>
          <Settings className="w-3.5 h-3.5 text-blue-600 ml-1" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-stone-900">Auto-approval rule</p>
            <p className="text-xs text-stone-500 mt-0.5">
              Recognitions under this point value go live instantly; anything at or above requires admin approval.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-stone-700">Threshold (points)</Label>
            <Input
              type="number"
              min={0}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="h-9 text-sm border-stone-200"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" className="bg-stone-900 hover:bg-stone-700 text-white" onClick={save}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RecognitionForm({
  onSubmit,
  submitLabel,
  initial,
  threshold,
}: {
  onSubmit: (draft: RecognitionDraft) => void;
  submitLabel: string;
  initial?: RecognitionDraft;
  threshold: number;
}) {
  const { toast } = useToast();
  const [recipientId, setRecipientId] = useState<string>(initial?.recipientId ?? "");
  const [badgeName, setBadgeName] = useState<string>(initial?.programName ?? "");
  const [category, setCategory] = useState<string>(initial?.category ?? "");
  const [points, setPoints] = useState<number>(initial?.points ?? 100);
  const [message, setMessage] = useState<string>(initial?.message ?? "");
  const willAutoApprove = points < threshold;

  function handleBadgeChange(name: string) {
    setBadgeName(name);
    const badge = findBadgeByName(name);
    if (badge) setCategory(badge.category);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientId || !badgeName || !category || !message.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill out recipient, badge, and note.",
        variant: "destructive",
      });
      return;
    }
    onSubmit({
      recipientId,
      programName: badgeName,
      category,
      points,
      message: message.trim(),
    });
  }

  const activeBadgesByCategory = BADGE_CATEGORIES.map((cat) => ({
    category: cat,
    badges: INITIAL_BADGES.filter((b) => b.isActive && b.category === cat),
  })).filter((g) => g.badges.length > 0);

  const selectedBadge = findBadgeByName(badgeName);
  const categoryStyle = category ? getCategoryStyle(category) : null;

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Recipient</Label>
        <Select value={recipientId} onValueChange={setRecipientId}>
          <SelectTrigger className="h-9 text-sm border-stone-200">
            <SelectValue placeholder="Select employee…" />
          </SelectTrigger>
          <SelectContent>
            {employeesData.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Badge</Label>
        <Select value={badgeName} onValueChange={handleBadgeChange}>
          <SelectTrigger className="h-9 text-sm border-stone-200">
            <SelectValue placeholder="Select a badge…" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {activeBadgesByCategory.map((group) => (
              <div key={group.category}>
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                  {getCategoryStyle(group.category).emoji} {group.category}
                </div>
                {group.badges.map((b) => (
                  <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
        {selectedBadge && (
          <p className="text-xs text-stone-500">{selectedBadge.description}</p>
        )}
      </div>

      {category && categoryStyle && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-stone-700">Category</Label>
          <div>
            <Badge className={`text-xs ${categoryStyle.chip}`} variant="secondary">
              {categoryStyle.emoji} {category}
            </Badge>
          </div>
        </div>
      )}

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
            ? `Will go live instantly (under ${threshold} pts).`
            : `Requires admin approval (${threshold}+ pts).`}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Note</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe what this person did and why it matters…"
          className="text-sm border-stone-200 resize-none"
          rows={4}
        />
      </div>

      <div className="sticky bottom-0 -mx-6 px-6 pt-3 pb-1 bg-white/95 backdrop-blur border-t border-stone-200 shadow-[0_-4px_12px_-8px_rgba(0,0,0,0.12)]">
        <Button type="submit" className="w-full bg-stone-900 hover:bg-stone-700 text-white">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

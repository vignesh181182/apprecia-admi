import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, ShieldCheck, Search, Plus, Trash2, UserPlus } from "lucide-react";
import { employeesData, type Employee } from "@/lib/hr-data";
import { addApprover, getApproverIds, removeApprover } from "@/lib/approvers";
import { useToast } from "@/hooks/use-toast";
import Recognitions from "@/pages/recognitions";

export default function Approvals() {
  return (
    <div className="px-6 pt-3 pb-6">
      <Tabs defaultValue="pending">
        <div className="mb-4">
          <TabsList className="bg-muted h-9">
            <TabsTrigger value="pending" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
              Pending Approvals
            </TabsTrigger>
            <TabsTrigger value="panel" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              Approval Panel
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending" className="mt-0 -mx-6">
          <Recognitions showCreate={false} defaultStatusFilter="Pending" approvalMode={true} />
        </TabsContent>

        <TabsContent value="panel" className="mt-0">
          <ApprovalPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ApprovalPanel() {
  const { toast } = useToast();
  const [approverIds, setApproverIds] = useState<string[]>(getApproverIds);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [removeCandidate, setRemoveCandidate] = useState<Employee | null>(null);

  const approvers = useMemo(
    () =>
      approverIds
        .map((id) => employeesData.find((e) => e.id === id))
        .filter((e): e is Employee => !!e),
    [approverIds],
  );

  const filteredApprovers = approvers.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q)
    );
  });

  function handleAdd(id: string) {
    const next = addApprover(id);
    setApproverIds(next);
    const emp = employeesData.find((e) => e.id === id);
    toast({
      title: "Approver added",
      description: emp ? `${emp.name} can now approve appreciations.` : "Person added to approval panel.",
    });
    setSheetOpen(false);
  }

  function handleRemove(emp: Employee) {
    const next = removeApprover(emp.id);
    setApproverIds(next);
    toast({ title: "Approver removed", description: `${emp.name} can no longer approve appreciations.` });
    setRemoveCandidate(null);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="border border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Total Approvers</p>
            <p className="text-2xl font-bold text-foreground">{approvers.length}</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Departments Covered</p>
            <p className="text-2xl font-bold text-foreground">
              {new Set(approvers.map((e) => e.department)).size}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Eligible Employees</p>
            <p className="text-2xl font-bold text-foreground">{employeesData.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search approvers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm border-border"
          />
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-9">
              <Plus className="w-4 h-4" /> Add Approver
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add Approver</SheetTitle>
              <SheetDescription>
                Pick an employee to grant approval rights for appreciations.
              </SheetDescription>
            </SheetHeader>
            <AddApproverList existingIds={approverIds} onAdd={handleAdd} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead className="text-xs font-semibold text-muted-foreground">Approver</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Role</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Department</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Email</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApprovers.map((emp) => (
              <TableRow key={emp.id} className="hover:bg-muted">
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={emp.avatar} />
                      <AvatarFallback className="text-xs">{emp.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium text-foreground">{emp.name}</p>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{emp.role}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{emp.department}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{emp.email}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                    onClick={() => setRemoveCandidate(emp)}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredApprovers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                  {approvers.length === 0
                    ? "No approvers yet. Add someone to manage appreciation approvals."
                    : "No approvers match your search."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!removeCandidate} onOpenChange={(open) => !open && setRemoveCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this approver?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeCandidate && (
                <>
                  {removeCandidate.name} will no longer be able to approve appreciation submissions.
                  You can add them back at any time.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeCandidate && handleRemove(removeCandidate)}
              className="bg-destructive hover:bg-destructive"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AddApproverList({
  existingIds,
  onAdd,
}: {
  existingIds: string[];
  onAdd: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const candidates = employeesData.filter((e) => !existingIds.includes(e.id));
  const filtered = candidates.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mt-6 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search employees…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm border-border"
        />
      </div>

      <div className="rounded-lg border border-border divide-y divide-border max-h-[60vh] overflow-y-auto">
        {filtered.map((emp) => (
          <div key={emp.id} className="flex items-center justify-between gap-3 p-3 hover:bg-muted">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={emp.avatar} />
                <AvatarFallback className="text-xs">{emp.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{emp.name}</p>
                <p className="text-xs text-muted-foreground truncate">{emp.role} · {emp.department}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs gap-1 border-border"
              onClick={() => onAdd(emp.id)}
            >
              <UserPlus className="w-3.5 h-3.5" /> Add
            </Button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {candidates.length === 0
              ? "All employees are already approvers."
              : "No employees match your search."}
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Award,
  FileText,
  FileCode2,
  Send,
  Mail,
  MonitorPlay,
  Linkedin,
  Twitter,
  MessageSquare,
  Slack,
} from "lucide-react";
import { getAccount, isAdmin } from "@/lib/account";
import {
  getNominationsForProgram,
  type Nomination,
  type StoredProgram,
} from "@/lib/programs-data";

const PHASE3_TIP = "Phase 3 feature — Phase 2 ships the foundation.";

export function WinnerActionStubs({
  program,
  showAdminPanel,
}: {
  program: StoredProgram;
  /** Defaults to current account's admin flag. Pass `false` to force-hide. */
  showAdminPanel?: boolean;
}) {
  const account = getAccount();
  const currency = account?.currency ?? "₹";
  const adminView = showAdminPanel ?? isAdmin(account);

  const winners = useMemo<Nomination[]>(() => {
    return getNominationsForProgram(program.id)
      .filter((n) => n.status === "winner")
      .sort((a, b) => (a.finalRank ?? 99) - (b.finalRank ?? 99));
  }, [program.id]);

  if (winners.length === 0) return null;

  return (
    <div className="space-y-4">
      {winners.map((w) => (
        <WinnerCard key={w.id} winner={w} currency={currency} />
      ))}
      {adminView && <AdminPublishingPanel program={program} />}
    </div>
  );
}

function WinnerCard({ winner, currency }: { winner: Nomination; currency: string }) {
  const { toast } = useToast();
  function stub(label: string) {
    toast({
      title: `${label} coming in Phase 3`,
      description: "This action is wired to a stub for the demo.",
    });
  }

  return (
    <Card className="border border-stone-200">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 shrink-0 w-14">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <Badge className="bg-stone-900 text-white hover:bg-stone-900 text-[10px]">
              #{winner.finalRank}
            </Badge>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={winner.nomineeAvatar} alt={winner.nomineeName} />
                <AvatarFallback>
                  {winner.nomineeName.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-base font-semibold text-stone-900 truncate">
                  {winner.nomineeName}
                </p>
                <p className="text-xs text-stone-500 truncate">
                  {winner.nomineeRole}
                  {winner.nomineeDepartment && ` · ${winner.nomineeDepartment}`}
                </p>
              </div>
              {winner.prizeAmount && (
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-800 ml-auto hidden sm:inline-flex"
                >
                  {currency}
                  {winner.prizeAmount.toLocaleString()}
                </Badge>
              )}
            </div>
            <p className="text-sm text-stone-700 mt-3 leading-relaxed">{winner.reason}</p>
            <p className="text-xs text-stone-500 mt-2">
              Nominated by{" "}
              <span className="font-medium text-stone-700">{winner.nominatorName}</span>
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <StubButton
                label="Create citation"
                icon={<FileText className="w-3.5 h-3.5" />}
                onAction={() => stub("Citation editor")}
              />
              <StubButton
                label="Generate PDF"
                icon={<FileText className="w-3.5 h-3.5" />}
                onAction={() => stub("PDF generation")}
              />
              <StubButton
                label="Generate PowerPoint"
                icon={<FileCode2 className="w-3.5 h-3.5" />}
                onAction={() => stub("PPT generation")}
              />
              <StubButton
                label="Send to HR for publishing"
                icon={<Send className="w-3.5 h-3.5" />}
                onAction={() => stub("HR publishing workflow")}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminPublishingPanel({ program }: { program: StoredProgram }) {
  const { toast } = useToast();
  function stub(label: string) {
    toast({
      title: `${label} coming in Phase 3`,
      description: "This action is wired to a stub for the demo.",
    });
  }

  return (
    <Card className="border border-stone-200">
      <CardContent className="p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-stone-900">HR publishing</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Push winners out to the rest of the organization.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StubButton
            label="Publish to award night display"
            icon={<MonitorPlay className="w-3.5 h-3.5" />}
            onAction={() => stub("Award-night display")}
          />
          <StubButton
            label="Email announcement"
            icon={<Mail className="w-3.5 h-3.5" />}
            onAction={() => stub("Email blast (uses SendGrid)")}
          />
        </div>

        <div>
          <p className="text-xs font-medium text-stone-700 mb-2">
            Post to social channels
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SocialStub
              label="LinkedIn"
              icon={<Linkedin className="w-3.5 h-3.5" />}
              onAction={() => stub("LinkedIn composer")}
            />
            <SocialStub
              label="Twitter / X"
              icon={<Twitter className="w-3.5 h-3.5" />}
              onAction={() => stub("Twitter composer")}
            />
            <SocialStub
              label="Slack"
              icon={<Slack className="w-3.5 h-3.5" />}
              onAction={() => stub("Slack composer")}
            />
            <SocialStub
              label="MS Teams"
              icon={<MessageSquare className="w-3.5 h-3.5" />}
              onAction={() => stub("MS Teams composer")}
            />
          </div>
        </div>

        <p className="text-xs text-stone-400 italic pt-2 border-t border-stone-100">
          {program.notifications?.announceWinnersToSlack
            ? "Slack winners auto-announce is enabled — Phase 3 will fire it on confirm."
            : "Hint: enable Slack winner announcements in the program settings."}
        </p>
      </CardContent>
    </Card>
  );
}

function StubButton({
  label,
  icon,
  onAction,
}: {
  label: string;
  icon: React.ReactNode;
  onAction: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onAction}>
          {icon}
          <span className="ml-1.5">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{PHASE3_TIP}</TooltipContent>
    </Tooltip>
  );
}

function SocialStub({
  label,
  icon,
  onAction,
}: {
  label: string;
  icon: React.ReactNode;
  onAction: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onAction}
          className="flex items-center gap-2 p-2.5 border border-stone-200 rounded-md text-xs text-stone-700 hover:bg-stone-50 transition"
        >
          {icon}
          <span>{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{PHASE3_TIP}</TooltipContent>
    </Tooltip>
  );
}

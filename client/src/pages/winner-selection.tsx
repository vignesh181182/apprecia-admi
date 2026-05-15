import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import {
  getNominationsForProgram,
  getProgramById,
  type StoredProgram,
} from "@/lib/programs-data";
import {
  shortlistNominations,
  type ShortlistEntry,
} from "@/lib/ai-shortlister";
import { getAccount } from "@/lib/account";
import { ScoreDistributionCard } from "@/components/programs/score-distribution-card";
import { AiShortlistPanel } from "@/components/programs/ai-shortlist-panel";

export default function WinnerSelection() {
  const { programId } = useParams<{ programId: string }>();
  const account = getAccount();
  const program = useMemo<StoredProgram | undefined>(
    () => (programId ? getProgramById(programId) : undefined),
    [programId],
  );
  const eligibleCount = useMemo(() => {
    if (!programId) return 0;
    return getNominationsForProgram(programId).filter(
      (n) => n.status === "approved" || n.status === "pending-panel",
    ).length;
  }, [programId]);
  const shortlist = useMemo<ShortlistEntry[]>(() => {
    if (!program || !programId) return [];
    const eligible = getNominationsForProgram(programId).filter(
      (n) => n.status === "approved" || n.status === "pending-panel",
    );
    return shortlistNominations(eligible, account, program.panel ?? []);
  }, [program, programId, account]);

  if (!programId || !program) {
    return (
      <div className="p-6">
        <p className="text-sm text-stone-500">Program not found.</p>
        <Button asChild variant="ghost" size="sm" className="mt-3">
          <Link to="/programs">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to programs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="px-4 lg:px-6 pb-32">
        <div className="max-w-5xl mx-auto pt-4 lg:pt-6 space-y-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Link to={`/programs/${programId}`} data-testid="winner-back">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-stone-900">Winner selection</h1>
              <p className="text-sm text-stone-500 mt-0.5">
                {program.name} · {eligibleCount} eligible
              </p>
            </div>
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 capitalize">
              {program.status}
            </Badge>
          </div>

          <ScoreDistributionCard shortlist={shortlist} />
          <AiShortlistPanel program={program} mode="page" />
        </div>
      </div>
    </div>
  );
}

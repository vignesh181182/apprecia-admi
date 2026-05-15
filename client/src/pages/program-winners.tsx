import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Trophy } from "lucide-react";
import {
  getNominationsForProgram,
  getProgramById,
  type Nomination,
  type StoredProgram,
} from "@/lib/programs-data";
import { BannerArt } from "@/components/programs/banner-art";
import { WinnerActionStubs } from "@/components/programs/winner-action-stubs";

export default function ProgramWinners() {
  const { programId } = useParams<{ programId: string }>();

  const program = useMemo<StoredProgram | undefined>(
    () => (programId ? getProgramById(programId) : undefined),
    [programId],
  );
  const winners = useMemo<Nomination[]>(() => {
    if (!programId) return [];
    return getNominationsForProgram(programId)
      .filter((n) => n.status === "winner")
      .sort((a, b) => (a.finalRank ?? 99) - (b.finalRank ?? 99));
  }, [programId]);

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
    <div className="px-4 lg:px-6 pb-12">
      <div className="max-w-5xl mx-auto pt-4 lg:pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Link to={`/programs/${programId}`} data-testid="winners-back">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-stone-900">Winners declared</h1>
            <p className="text-sm text-stone-500 mt-0.5">
              {program.name} · {winners.length} winner{winners.length === 1 ? "" : "s"}{" "}
              this cycle
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            data-testid="winners-reselect"
          >
            <Link to={`/programs/${programId}/winner-selection`}>Re-run shortlist</Link>
          </Button>
        </div>

        <Card className="border border-stone-200 overflow-hidden">
          <div className="relative h-32 flex items-end p-4">
            <BannerArt
              bannerId={program.bannerId}
              customDataUrl={program.customBannerDataUrl}
              className="absolute inset-0"
            />
            <div className="relative z-10 flex items-center gap-3">
              <span className="text-3xl drop-shadow">
                {program.iconEmoji ?? program.emoji ?? "🏆"}
              </span>
              <div className="text-white drop-shadow">
                <p className="text-base font-semibold">{program.name}</p>
                <p className="text-xs opacity-90">
                  Cycle ended{" "}
                  {program.endDate
                    ? new Date(program.endDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {winners.length === 0 ? (
          <Card className="border border-dashed border-stone-300 bg-stone-50">
            <CardContent className="p-10 text-center">
              <Trophy className="w-9 h-9 text-stone-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-stone-900 mb-1">
                No winners declared yet
              </p>
              <p className="text-xs text-stone-500 mb-4">
                Run the AI shortlister to pick winners for this cycle.
              </p>
              <Button asChild>
                <Link to={`/programs/${programId}/winner-selection`}>
                  <Sparkles className="w-4 h-4 mr-1.5" /> Open winner selection
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <WinnerActionStubs program={program} />
        )}
      </div>
    </div>
  );
}

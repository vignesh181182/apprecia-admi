import {
  Award,
  Edit3,
  FileText,
  Quote,
} from "lucide-react";
import { RecognizeDialog } from "@/components/recognize/recognize-dialog";
import { cn } from "@/lib/utils";
import type { Program, ProgramDocument, ProgramHighlight } from "@/lib/programs-data";
import { Target, Trophy, Gift, Users, Rocket } from "lucide-react";

const ICON_MAP: Record<ProgramHighlight["iconKey"], React.FC<{ className?: string }>> = {
  target: Target,
  trophy: Trophy,
  gift: Gift,
  users: Users,
  award: Award,
  rocket: Rocket,
};

export function DetailsTab({
  program,
  variant = "mobile",
}: {
  program: Program;
  variant?: "mobile" | "web";
}) {
  return (
    <div className={cn("space-y-4", variant === "web" && "pt-3")}>
      <AboutCard program={program} />
      <RewardTeammateCard program={program} />
      <NominateButton />
      {program.lastWinner && <LastWinnerCard winner={program.lastWinner} />}
    </div>
  );
}

function RewardTeammateCard({ program }: { program: Program }) {
  const featured = (program.programLeaderboard ?? []).slice(0, 3);

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-white">
      <div
        className="px-5 pt-5 pb-4 flex items-start gap-3"
        style={{ background: program.themeBg }}
      >
        <span className="w-11 h-11 rounded-xl bg-white/60 flex items-center justify-center text-xl shrink-0 shadow-sm">
          🎁
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-mobile text-base font-semibold text-foreground leading-tight">
            Nominate a teammate
          </h3>
          <p className="text-sm text-muted-foreground mt-1 leading-snug">
            Recognize a peer who's earned it for this program. They'll be added to the
            leaderboard.
          </p>
        </div>
      </div>

      {featured.length > 0 && (
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-mobile font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Top nominees this cycle
          </p>
          <ul className="space-y-1">
            {featured.map((person) => (
              <li
                key={person.rank}
                className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="relative shrink-0">
                  <img
                    src={person.avatar}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-border"
                  />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-border flex items-center justify-center text-[10px] font-mobile font-semibold text-muted-foreground tabular-nums">
                    {person.rank}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mobile font-semibold text-foreground truncate">
                    {person.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{person.role}</p>
                </div>
                <RecognizeDialog
                  kind="rnr"
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-primary/20 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-mobile font-semibold transition-colors shrink-0"
                    >
                      <Edit3 className="w-3 h-3" />
                      Nominate
                    </button>
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

function NominateButton() {
  return (
    <RecognizeDialog
      kind="rnr"
      trigger={
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-mobile font-semibold transition-colors shadow-sm"
        >
          <Edit3 className="w-4 h-4" />
          Nominate
        </button>
      }
    />
  );
}

/**
 * Open an attached document in a new tab. Uploaded files are stored as `data:`
 * URLs (no backend), and Chrome blocks top-level navigation to those — so route
 * them through a Blob URL instead. External links open directly.
 */
function openProgramDocument(doc: ProgramDocument) {
  if (!doc.url.startsWith("data:")) {
    window.open(doc.url, "_blank", "noopener,noreferrer");
    return;
  }
  const [meta, base64] = doc.url.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] ?? doc.type ?? "application/octet-stream";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  // Give the new tab time to load before releasing the object URL.
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

export function AboutCard({ program }: { program: Program }) {
  const doc = program.guidelinesDoc;
  return (
    <div className="bg-white rounded-2xl border border-border/70 p-5">
      <h2 className="font-mobile font-semibold text-foreground mb-3">About this program</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">{program.description}</p>
      {doc && (
        <button
          type="button"
          onClick={() => openProgramDocument(doc)}
          title={doc.name}
          className="mt-3 inline-flex items-center gap-2 text-sm font-mobile font-semibold text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
        >
          <FileText className="w-4 h-4 shrink-0" />
          View guidelines
        </button>
      )}
      <div className="mt-5 space-y-4">
        {program.highlights.map((h, i) => {
          const Icon = ICON_MAP[h.iconKey];
          return (
            <div
              key={i}
              className="flex items-start gap-3 pb-4 last:pb-0 border-b border-border last:border-b-0"
            >
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/15">
                <Icon className="w-5 h-5 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mobile font-semibold text-foreground text-sm">
                  {h.title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{h.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LastWinnerCard({ winner }: { winner: NonNullable<Program["lastWinner"]> }) {
  return (
    <div
      className="rounded-2xl border border-primary/15 p-5 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #fdf6e8 0%, #fbecc8 100%)" }}
    >
      <p className="text-xs uppercase tracking-wide font-mobile font-semibold text-primary">
        Last month's winner
      </p>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-mobile text-xl font-semibold text-foreground leading-tight">
            {winner.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">{winner.team}</p>
          <div className="mt-3 inline-flex items-start gap-2 bg-white/70 rounded-xl px-3 py-2 max-w-md">
            <Quote className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground italic leading-snug">{winner.quote}</p>
          </div>
        </div>
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-white shadow-sm overflow-hidden">
            <img
              src={winner.avatar}
              alt={winner.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</span>
        </div>
      </div>
    </div>
  );
}

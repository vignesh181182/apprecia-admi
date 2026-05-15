/**
 * Vector banner illustrations for the program create/edit wizard. Each pattern
 * renders inline SVG against the preset's gradient so the banner reads as an
 * actual illustration rather than a flat color swatch.
 */

import { bannerById } from "@/lib/program-presets";

type ArtProps = {
  bannerId?: string;
  customDataUrl?: string;
  className?: string;
};

export function BannerArt({ bannerId, customDataUrl, className }: ArtProps) {
  if (customDataUrl) {
    return (
      <div
        className={`overflow-hidden ${className ?? ""}`}
        style={{
          backgroundImage: `url(${customDataUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }
  const preset = bannerById(bannerId);
  return (
    <div
      className={`overflow-hidden ${className ?? ""}`}
      style={{ background: preset?.background ?? "#fafaf9" }}
    >
      <PatternSvg patternId={preset?.patternId} accent={preset?.accent ?? "#ffffff"} />
    </div>
  );
}

function PatternSvg({ patternId, accent }: { patternId?: string; accent: string }) {
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      {patternId === "confetti" && <Confetti />}
      {patternId === "trophy" && <Trophy accent={accent} />}
      {patternId === "stars" && <Stars accent={accent} />}
      {patternId === "waves" && <Waves accent={accent} />}
      {patternId === "dots" && <Dots accent={accent} />}
      {patternId === "spotlight" && <Spotlight accent={accent} />}
      {patternId === "mountains" && <Mountains accent={accent} />}
      {patternId === "bubbles" && <Bubbles accent={accent} />}
      {patternId === "ribbons" && <Ribbons accent={accent} />}
      {patternId === "crown" && <Crown accent={accent} />}
      {patternId === "medal" && <Medal accent={accent} />}
      {patternId === "streamers" && <Streamers accent={accent} />}
    </svg>
  );
}

// ─── Patterns ─────────────────────────────────────────────────────────

function Confetti() {
  const pieces: { x: number; y: number; r: number; c: string; w?: number; h?: number; shape: "rect" | "circle" }[] = [
    { x: 30,  y: 30,  r: 18, c: "#ef4444", shape: "rect", w: 10, h: 4 },
    { x: 80,  y: 20,  r: -25, c: "#3b82f6", shape: "rect", w: 12, h: 5 },
    { x: 140, y: 50,  r: 0, c: "#fbbf24", shape: "circle" },
    { x: 200, y: 28,  r: 35, c: "#22c55e", shape: "rect", w: 12, h: 4 },
    { x: 260, y: 60,  r: -10, c: "#a855f7", shape: "rect", w: 10, h: 4 },
    { x: 60,  y: 110, r: 0, c: "#f97316", shape: "circle" },
    { x: 110, y: 140, r: 15, c: "#06b6d4", shape: "rect", w: 12, h: 5 },
    { x: 180, y: 120, r: -20, c: "#ec4899", shape: "rect", w: 10, h: 4 },
    { x: 240, y: 130, r: 0, c: "#84cc16", shape: "circle" },
    { x: 290, y: 100, r: 50, c: "#fbbf24", shape: "rect", w: 10, h: 4 },
  ];
  return (
    <g opacity="0.9">
      {pieces.map((p, i) =>
        p.shape === "circle" ? (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={p.c} />
        ) : (
          <rect
            key={i}
            x={p.x}
            y={p.y}
            width={p.w}
            height={p.h}
            rx="1"
            fill={p.c}
            transform={`rotate(${p.r} ${p.x + (p.w ?? 0) / 2} ${p.y + (p.h ?? 0) / 2})`}
          />
        ),
      )}
    </g>
  );
}

function Trophy({ accent }: { accent: string }) {
  return (
    <g>
      <g opacity="0.18" fill={accent}>
        <circle cx="40"  cy="40"  r="3" />
        <circle cx="280" cy="50"  r="2.5" />
        <circle cx="60"  cy="140" r="2" />
        <circle cx="270" cy="150" r="3" />
        <path d="M30 100 l4 -4 l4 4 l-4 4 z" />
        <path d="M285 110 l4 -4 l4 4 l-4 4 z" />
      </g>
      <g transform="translate(160 90)" opacity="0.95">
        <path
          d="M-22 -38 h44 v8 a22 22 0 0 1 -22 22 a22 22 0 0 1 -22 -22 z"
          fill={accent}
        />
        <rect x="-6" y="-8" width="12" height="14" fill={accent} />
        <rect x="-18" y="6" width="36" height="6" rx="1" fill={accent} />
        <path d="M-22 -34 q-12 0 -12 12 q0 10 12 14" stroke={accent} strokeWidth="3" fill="none" />
        <path d="M22 -34 q12 0 12 12 q0 10 -12 14" stroke={accent} strokeWidth="3" fill="none" />
      </g>
    </g>
  );
}

function Stars({ accent }: { accent: string }) {
  const stars = [
    { x: 30, y: 30, r: 5 }, { x: 80, y: 60, r: 3 }, { x: 140, y: 25, r: 4 },
    { x: 200, y: 40, r: 6 }, { x: 260, y: 70, r: 4 }, { x: 50, y: 110, r: 4 },
    { x: 120, y: 130, r: 5 }, { x: 180, y: 105, r: 3 }, { x: 240, y: 140, r: 5 },
    { x: 290, y: 110, r: 4 },
  ];
  return (
    <g fill={accent} opacity="0.85">
      {stars.map((s, i) => (
        <path
          key={i}
          d={starPath(s.x, s.y, s.r, s.r * 0.4, 5)}
        />
      ))}
    </g>
  );
}

function starPath(cx: number, cy: number, outer: number, inner: number, points: number): string {
  const step = Math.PI / points;
  let d = "";
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    d += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d + " Z";
}

function Waves({ accent }: { accent: string }) {
  return (
    <g fill={accent}>
      <path d="M0 130 Q40 110 80 130 T160 130 T240 130 T320 130 V180 H0 Z" opacity="0.35" />
      <path d="M0 145 Q40 125 80 145 T160 145 T240 145 T320 145 V180 H0 Z" opacity="0.55" />
      <path d="M0 160 Q40 145 80 160 T160 160 T240 160 T320 160 V180 H0 Z" opacity="0.85" />
    </g>
  );
}

function Dots({ accent }: { accent: string }) {
  const dots: { x: number; y: number }[] = [];
  for (let y = 15; y < 180; y += 22) {
    for (let x = (y / 22) % 2 === 0 ? 15 : 26; x < 320; x += 22) {
      dots.push({ x, y });
    }
  }
  return (
    <g fill={accent} opacity="0.35">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="2" />
      ))}
    </g>
  );
}

function Spotlight({ accent }: { accent: string }) {
  return (
    <g>
      <defs>
        <radialGradient id="sl-grad" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="url(#sl-grad)" />
      <g opacity="0.7">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={i}
            x1="160"
            y1="90"
            x2={160 + Math.cos((i * Math.PI) / 3) * 200}
            y2={90 + Math.sin((i * Math.PI) / 3) * 200}
            stroke={accent}
            strokeOpacity="0.18"
            strokeWidth="2"
          />
        ))}
      </g>
    </g>
  );
}

function Mountains({ accent }: { accent: string }) {
  return (
    <g>
      <path d="M0 180 L50 110 L90 140 L150 80 L200 130 L260 90 L320 140 L320 180 Z" fill={accent} opacity="0.45" />
      <path d="M0 180 L40 145 L100 170 L160 130 L220 165 L280 140 L320 175 L320 180 Z" fill={accent} opacity="0.85" />
    </g>
  );
}

function Bubbles({ accent }: { accent: string }) {
  const bubbles = [
    { x: 30,  y: 40,  r: 18 }, { x: 90,  y: 120, r: 24 }, { x: 160, y: 50,  r: 14 },
    { x: 220, y: 110, r: 28 }, { x: 280, y: 40,  r: 16 }, { x: 60,  y: 150, r: 12 },
    { x: 250, y: 160, r: 18 }, { x: 130, y: 150, r: 10 }, { x: 200, y: 30,  r: 8 },
  ];
  return (
    <g fill={accent}>
      {bubbles.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} opacity={0.18 + (i % 3) * 0.08} />
      ))}
    </g>
  );
}

function Ribbons({ accent }: { accent: string }) {
  return (
    <g stroke={accent} strokeWidth="14" fill="none" strokeLinecap="round">
      <path d="M-20 30 Q120 -10 340 70" opacity="0.35" />
      <path d="M-20 90 Q120 50 340 130" opacity="0.5" />
      <path d="M-20 150 Q120 110 340 190" opacity="0.7" />
    </g>
  );
}

function Crown({ accent }: { accent: string }) {
  return (
    <g>
      <g opacity="0.18" fill={accent}>
        {[40, 80, 240, 280].map((x) => (
          <circle key={x} cx={x} cy={Math.sin(x) * 30 + 60} r="2.5" />
        ))}
      </g>
      <g transform="translate(160 95)" fill={accent}>
        <path d="M-40 10 L-30 -20 L-15 5 L0 -28 L15 5 L30 -20 L40 10 Z" />
        <rect x="-42" y="10" width="84" height="10" rx="2" />
        <circle cx="-30" cy="-22" r="3" />
        <circle cx="0" cy="-30" r="3.5" />
        <circle cx="30" cy="-22" r="3" />
      </g>
    </g>
  );
}

function Medal({ accent }: { accent: string }) {
  return (
    <g>
      <g opacity="0.18" fill={accent}>
        <circle cx="40" cy="40" r="2.5" />
        <circle cx="280" cy="50" r="3" />
        <circle cx="60" cy="150" r="2" />
        <circle cx="270" cy="140" r="2.5" />
      </g>
      <g transform="translate(160 100)">
        <path
          d="M-18 -50 L-10 -30 L0 -50 L10 -30 L18 -50 L18 -22 L-18 -22 Z"
          fill={accent}
          opacity="0.85"
        />
        <circle cx="0" cy="10" r="32" fill={accent} opacity="0.95" />
        <circle cx="0" cy="10" r="22" fill="none" stroke={accent} strokeOpacity="0.4" strokeWidth="2" />
        <text
          x="0"
          y="16"
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill={accent === "#ffffff" ? "rgba(0,0,0,0.55)" : "#ffffff"}
          opacity="0.9"
        >
          ★
        </text>
      </g>
    </g>
  );
}

function Streamers({ accent }: { accent: string }) {
  return (
    <g fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round">
      <path d="M-10 -10 Q60 30 30 90 T80 180" opacity="0.55" />
      <path d="M30 -10 Q90 40 60 100 T110 180" opacity="0.4" />
      <path d="M330 -10 Q260 30 290 90 T240 180" opacity="0.55" />
      <path d="M290 -10 Q230 40 260 100 T210 180" opacity="0.4" />
      <g fill={accent}>
        <circle cx="80" cy="180" r="3" />
        <circle cx="110" cy="180" r="3" />
        <circle cx="240" cy="180" r="3" />
        <circle cx="210" cy="180" r="3" />
      </g>
    </g>
  );
}

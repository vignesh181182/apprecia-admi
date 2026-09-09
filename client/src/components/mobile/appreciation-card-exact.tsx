// Appreciation card — pixel-faithful reproduction of the Figma design
// (node 183:651), rendered from live feed data. Sized to Instagram portrait
// (468×585) by scaling the pixel-tuned 361px design uniformly.
//
// This showcase card intentionally uses the exact design values — hex colours,
// SF Pro / Inter type, and the provided assets — so theming is deliberately
// bypassed here (hence the `// theme-allow` markers).

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { BADGE_IMAGE, isMe, type RecognitionFeedItem } from "@/lib/mobile-data";
import { getAccount } from "@/lib/account";
import {
  GENZ_REACTIONS,
  getReactions,
  toggleReaction,
  type GenzReaction,
} from "@/lib/reactions";

const CARD = "/images/appriciation-card";

// Exact Figma palette.
const FX = {
  grey: "#7c7c7c", // theme-allow
  black: "#000000", // theme-allow
  cat: "#0c0506", // theme-allow
  quoteText: "#10121a", // theme-allow
  ribbonGold: "#ce920a", // theme-allow
  ribbonGrey: "#736969", // theme-allow
  divider: "#b2b2b2", // theme-allow
};
const CARD_BG =
  "linear-gradient(180deg, #fdfcfd 25.995%, #fdefe1 90.576%, #fae4ce 100%)"; // theme-allow
const NAME_BG = "linear-gradient(86.92deg, #442304 12.072%, #d37a23 98.288%)"; // theme-allow
const QUOTE_BG = "linear-gradient(180deg, #fdfbfa 0%, #fbe4d0 160.56%)"; // theme-allow

const SF = '-apple-system, "SF Pro Text", "SF Pro Display", system-ui, sans-serif';
const INTER = "Inter, system-ui, sans-serif";

/** "Game Changer" → "#gameChanger" — a playful hashtag for the ribbon. */
function hashtagFrom(label: string): string {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "#recognized";
  return (
    "#" +
    words
      .map((w, i) =>
        i === 0
          ? w.toLowerCase()
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
      )
      .join("")
  );
}

export function AppreciationCardExact({ item }: { item: RecognitionFeedItem }) {
  const account = getAccount();
  const recipientIsYou = isMe(item.recipientEmail, account);
  const senderIsYou = isMe(item.senderEmail, account);
  const genzEnabled = account?.appreciationPolicy?.allowGenzLingo ?? false;
  const [reactions, setReactions] = useState(() => getReactions(item.id));

  const senderName = senderIsYou ? "You" : item.senderName;
  const recipientName = recipientIsYou ? "You" : item.recipientName;

  return (
    <div className="mx-auto w-[468px]">
      {/* Fixed 468×585 frame; the pixel-tuned 361px design scales up to fill it
          (468 / 361 = 1.2964 → 361×451.3 → 468×585). */}
      <div className="w-[468px] h-[585px]">
        <div className="origin-top-left" style={{ transform: "scale(1.29640)" }}>
          <article
            className="relative flex flex-col w-[361px] min-h-[451.3px] overflow-hidden rounded-[12px]"
            style={{
              backgroundImage: CARD_BG,
              boxShadow: "0px 4px 19px 0px rgba(0,0,0,0.07)",
            }}
          >
            {/* Header — who appreciated whom */}
            <header className="flex items-start gap-2 pl-5 pr-2.5 pt-3">
              <img
                src={item.senderAvatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-end">
                <p
                  className="text-[12px] leading-none tracking-[0.1px]"
                  style={{ fontFamily: SF, color: FX.grey }}
                >
                  Appreciated by
                </p>
                <p
                  className="text-[14px] font-semibold leading-tight mt-0.5 truncate"
                  style={{ fontFamily: SF, color: FX.black }}
                >
                  {senderName}
                </p>
              </div>
              <div className="flex items-center gap-2 px-2 shrink-0">
                <span
                  className="text-[11px] tracking-[0.1px]"
                  style={{ fontFamily: SF, color: FX.grey }}
                >
                  {item.timeAgo}
                </span>
                <MoreHorizontal
                  className="w-[18px] h-[18px]"
                  style={{ color: FX.black }}
                />
              </div>
            </header>

            {/* Hero — laurel-framed recipient photo beside the earned badge */}
            <div className="mt-[28px] flex items-start justify-center">
              <div className="relative w-[194px] h-[169px] shrink-0">
                <img
                  src={`${CARD}/user_bg.png`}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <img
                  src={item.recipientAvatar}
                  alt={recipientName}
                  className="absolute left-[28px] top-[10px] w-[127px] h-[127px] rounded-full object-cover"
                />
              </div>
              <img
                src={BADGE_IMAGE[item.badge]}
                alt={item.badgeLabel}
                className="relative z-10 w-[144px] h-[140px] object-contain shrink-0 -ml-[67px] mt-[10px]"
              />
            </div>

            {/* Recipient name + award category */}
            <div className="mt-[6px] flex flex-col items-center gap-[5px] px-6">
              <h3
                className="text-[28px] font-bold text-center leading-none tracking-[0.1px] bg-clip-text text-transparent max-w-full truncate"
                style={{ fontFamily: SF, backgroundImage: NAME_BG }}
              >
                {recipientName}
              </h3>
              <div className="flex items-center">
                <img src={`${CARD}/oa-left.png`} alt="" className="w-[22px] h-[22px]" />
                <p
                  className="text-[10px] text-center uppercase tracking-[2.7px] whitespace-nowrap"
                  style={{ fontFamily: SF, color: FX.cat }}
                >
                  {item.badgeLabel}
                </p>
                <img src={`${CARD}/oa-right.png`} alt="" className="w-[22px] h-[22px]" />
              </div>
            </div>

            {/* Quote — the appreciation message */}
            <div
              className="mx-auto mt-[20px] flex w-[298px] items-start gap-[13px] rounded-[16px] pt-[14px] pr-[14px] pb-[12px] pl-[17px]"
              style={{
                backgroundImage: QUOTE_BG,
                filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.08))",
              }}
            >
              <img
                src={`${CARD}/quote.png`}
                alt=""
                className="w-[19px] h-[16px] shrink-0"
              />
              <p
                className="flex-1 text-[12px] leading-normal tracking-[0.199px]"
                style={{ fontFamily: INTER, color: FX.quoteText }}
              >
                {item.message}
              </p>
            </div>

            {/* Ribbon (pinned to the bottom edge) — shaped SVG banner */}
            <div className="relative mt-auto h-[28px]">
              {/* The export's 346×36 canvas is the 28px band plus 8px of drop
                  shadow below it, so the image is pinned 36px tall from the top
                  of the 28px slot — the shadow overflow is clipped by the card. */}
              <img
                src={`${CARD}/card-footer.svg`}
                alt=""
                className="absolute left-0 top-0 h-[36px] w-full"
              />
              <div className="relative z-10 flex h-full items-center justify-center gap-[9px]">
                <span
                  className="text-[10px] font-medium"
                  style={{ fontFamily: INTER, color: FX.ribbonGold }}
                >
                  Keep raising the bar!
                </span>
                <span
                  className="h-[15px] w-px"
                  style={{ backgroundColor: FX.divider }}
                />
                <span
                  className="text-[10px]"
                  style={{ fontFamily: INTER, color: FX.ribbonGrey }}
                >
                  {hashtagFrom(item.badgeLabel)}
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Gen-Z emoji reactions (admin-gated) — attached below the certificate */}
      {genzEnabled && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {GENZ_REACTIONS.map((emoji: GenzReaction) => {
            const count = reactions.counts[emoji] ?? 0;
            const picked = reactions.mine === emoji;
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => setReactions(toggleReaction(item.id, emoji))}
                aria-pressed={picked}
                aria-label={`React ${emoji}`}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm leading-none transition-colors ${
                  picked
                    ? "border-primary/40 bg-primary/15"
                    : "border-border bg-card hover:bg-primary/5"
                }`}
              >
                <span>{emoji}</span>
                {count > 0 && (
                  <span
                    className={`text-xs font-semibold ${
                      picked ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Gen-Z emoji reactions on appreciation cards. Gated by
// `account.appreciationPolicy.allowGenzLingo`. No backend — reactions live in
// localStorage keyed by feed-item id.
// ──────────────────────────────────────────────────────────────────────

/** The reaction palette employees pick from when Gen-Z lingo is enabled. */
export const GENZ_REACTIONS = ["🔥", "💯", "🐐", "🫶", "😭", "💅"] as const;

export type GenzReaction = (typeof GENZ_REACTIONS)[number];

const KEY = "engagex_reactions_v1";

/** Per-item state: tallies for every emoji + the current user's own pick. */
export type ItemReactions = {
  counts: Partial<Record<GenzReaction, number>>;
  /** The emoji the signed-in user has selected on this card, if any. */
  mine?: GenzReaction;
};

type Store = Record<string, ItemReactions>;

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    return {};
  }
}

function write(store: Store): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function getReactions(itemId: string): ItemReactions {
  return read()[itemId] ?? { counts: {} };
}

/**
 * Toggle the user's reaction on an item. Picking a new emoji moves the user's
 * vote (their previous pick is decremented); picking the same emoji removes it.
 * Returns the item's updated reactions.
 */
export function toggleReaction(itemId: string, emoji: GenzReaction): ItemReactions {
  const store = read();
  const current: ItemReactions = store[itemId] ?? { counts: {} };
  const counts = { ...current.counts };

  const dec = (e: GenzReaction) => {
    counts[e] = Math.max(0, (counts[e] ?? 0) - 1);
    if (counts[e] === 0) delete counts[e];
  };

  let mine: GenzReaction | undefined;
  if (current.mine === emoji) {
    // Same emoji → un-react.
    dec(emoji);
    mine = undefined;
  } else {
    if (current.mine) dec(current.mine); // switching votes
    counts[emoji] = (counts[emoji] ?? 0) + 1;
    mine = emoji;
  }

  const next: ItemReactions = { counts, mine };
  store[itemId] = next;
  write(store);
  return next;
}

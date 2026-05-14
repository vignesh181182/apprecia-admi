import type { Account, WalletRole } from "./account";
import { getAccount } from "./account";
import { isMonetaryActive } from "./appreciation-policy";

export type Wallet = {
  userId: string;
  /** Current period in "YYYY-MM" form. Rolls over on first read of a new month. */
  period: string;
  /** Points the user can still give away this period. */
  giveBalance: number;
  /** Total points they're allowed to give per period (a snapshot of the
   *  org-wide allowance the last time the wallet rolled over). */
  giveAllowance: number;
  /** Redeemable balance the user has received from others. */
  receiveBalance: number;
  /** Total points received across all time (never decremented on redeem). */
  lifetimeReceived: number;
};

const KEY_PREFIX = "engagex_wallet_";
const INDEX_KEY = "engagex_wallet_index";

function key(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

function currentPeriod(now: Date = new Date()): string {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function readWallet(userId: string): Wallet | null {
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return null;
    return JSON.parse(raw) as Wallet;
  } catch {
    return null;
  }
}

function writeWallet(wallet: Wallet): void {
  localStorage.setItem(key(wallet.userId), JSON.stringify(wallet));
  addToIndex(wallet.userId);
}

function getIndex(): string[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function addToIndex(userId: string): void {
  const all = new Set(getIndex());
  all.add(userId);
  localStorage.setItem(INDEX_KEY, JSON.stringify(Array.from(all)));
}

function allowanceFor(role: WalletRole, account: Account | null): number {
  const allowances = account?.pointsPolicy?.monthlyAllowance;
  if (!allowances) {
    // Sensible defaults that mirror DEFAULT_POINTS_POLICY so a wallet created
    // before the account loads still rolls over with a reasonable number.
    return role === "admin" ? 300 : role === "manager" ? 200 : 100;
  }
  return allowances[role];
}

/**
 * Returns the user's wallet, auto-rolling over to the current month if the
 * stored period is stale. When `expireUnused` is true the unused give-balance
 * is reset to the role's allowance; otherwise the prior balance is preserved
 * but the allowance is refreshed for the new period.
 *
 * Creates an empty wallet on first read.
 */
export function getWallet(userId: string, role: WalletRole, account: Account | null = getAccount()): Wallet {
  const now = new Date();
  const period = currentPeriod(now);
  const allowance = allowanceFor(role, account);
  const existing = readWallet(userId);

  if (!existing) {
    const wallet: Wallet = {
      userId,
      period,
      giveBalance: allowance,
      giveAllowance: allowance,
      receiveBalance: 0,
      lifetimeReceived: 0,
    };
    writeWallet(wallet);
    return wallet;
  }

  if (existing.period === period) {
    // Same period — sync the allowance in case the policy changed mid-month,
    // but don't touch the user's current giveBalance.
    if (existing.giveAllowance !== allowance) {
      const synced = { ...existing, giveAllowance: allowance };
      writeWallet(synced);
      return synced;
    }
    return existing;
  }

  // Rollover.
  const expireUnused = account?.pointsPolicy?.expireUnused ?? true;
  const rolled: Wallet = {
    ...existing,
    period,
    giveAllowance: allowance,
    giveBalance: expireUnused ? allowance : existing.giveBalance + allowance,
  };
  writeWallet(rolled);
  return rolled;
}

/**
 * Spends from the user's give-balance. Returns false when there's not enough
 * left to cover the amount. No-op (returns true) when monetary is disabled.
 */
export function deductGive(
  userId: string,
  role: WalletRole,
  amount: number,
  account: Account | null = getAccount(),
): boolean {
  if (!isMonetaryActive(account)) return true;
  if (amount <= 0) return true;
  const wallet = getWallet(userId, role, account);
  if (wallet.giveBalance < amount) return false;
  writeWallet({ ...wallet, giveBalance: wallet.giveBalance - amount });
  return true;
}

/**
 * Credits the receiver's redeemable balance and lifetime total. No-op when
 * monetary is disabled.
 *
 * Receivers don't have a role on file from the caller's perspective, so this
 * defaults to "employee" for the auto-create case. The role only matters for
 * the give-balance allowance and is corrected the next time the receiver
 * signs in (or sends an appreciation themselves).
 */
export function creditReceive(
  userId: string,
  amount: number,
  account: Account | null = getAccount(),
): void {
  if (!isMonetaryActive(account)) return;
  if (amount <= 0) return;
  const wallet = getWallet(userId, "employee", account);
  writeWallet({
    ...wallet,
    receiveBalance: wallet.receiveBalance + amount,
    lifetimeReceived: wallet.lifetimeReceived + amount,
  });
}

/**
 * Deducts from the receiver's redeemable balance. Returns false when there's
 * not enough to cover the redemption. No-op (returns true) when monetary is
 * disabled — although in practice the rewards catalog should be hidden in
 * that state, so this branch is mostly defensive.
 */
export function redeem(
  userId: string,
  amount: number,
  account: Account | null = getAccount(),
): boolean {
  if (!isMonetaryActive(account)) return true;
  if (amount <= 0) return true;
  const wallet = getWallet(userId, "employee", account);
  if (wallet.receiveBalance < amount) return false;
  writeWallet({ ...wallet, receiveBalance: wallet.receiveBalance - amount });
  return true;
}

/** Returns every wallet currently in storage. Used by the HR insights pages. */
export function getAllWallets(): Wallet[] {
  const ids = getIndex();
  const out: Wallet[] = [];
  for (const id of ids) {
    const w = readWallet(id);
    if (w) out.push(w);
  }
  return out;
}

/** Test/dev helper — wipes every wallet and the index. */
export function clearAllWallets(): void {
  for (const id of getIndex()) localStorage.removeItem(key(id));
  localStorage.removeItem(INDEX_KEY);
}

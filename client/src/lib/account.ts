export type ProductFlags = {
  appreciation: boolean;
  rnr: boolean;
};

export type HRAdmin = {
  id: string;
  name: string;
  email: string;
  invitedAt: string;
};

export type IntegrationStatus = "connected" | "disconnected";

export type Integrations = {
  activeDirectory: IntegrationStatus;
  azureAd: IntegrationStatus;
  okta: IntegrationStatus;
  googleWorkspace: IntegrationStatus;
  workday: IntegrationStatus;
  bambooHr: IntegrationStatus;
  adp: IntegrationStatus;
  slack: IntegrationStatus;
  msTeams: IntegrationStatus;
  ssoProvider: "none" | "saml" | "oidc";
};

export type Role = "admin" | "employee";

export type Account = {
  accountId: string;
  companyName: string;
  companyLogo: string | null;
  address: string;
  phone: string;
  adminEmail: string;
  adminName: string;
  adminDesignation: string;
  adminDepartment: string;
  adminPhotoUrl: string | null;
  role: Role;
  currency: string;
  products: ProductFlags;
  brandColor: string;
  timezone: string;
  fiscalYearStart: string;
  hrAdmins: HRAdmin[];
  integrations: Integrations;
  recognitionCategories: string[];
  pointsPolicy: {
    startingBudget: number;
    expiryMonths: number;
    maxPerRecognition: number;
    requireManagerApproval: boolean;
  };
  notifications: {
    weeklyDigest: boolean;
    budgetAlerts: boolean;
    recognitionEmails: boolean;
  };
  setupCompleted: boolean;
  createdAt: string;
};

const ACCOUNT_KEY = "engagex_account";
const AUTH_KEY = "engagex_authenticated";
const INVITES_KEY = "engagex_invites";
const SUPERADMIN_AUTH_KEY = "engagex_superadmin_authenticated";

/**
 * Demo super admin credentials. In production this would be replaced with a
 * real internal auth flow (SSO against the EngageX corporate IdP).
 */
export const SUPERADMIN_CREDENTIALS = {
  email: "superadmin@engagex.com",
  password: "engagex2026",
};

export const DEFAULT_INTEGRATIONS: Integrations = {
  activeDirectory: "disconnected",
  azureAd: "disconnected",
  okta: "disconnected",
  googleWorkspace: "disconnected",
  workday: "disconnected",
  bambooHr: "disconnected",
  adp: "disconnected",
  slack: "disconnected",
  msTeams: "disconnected",
  ssoProvider: "none",
};

export const DEFAULT_CATEGORIES = [
  "Innovation",
  "Leadership",
  "Teamwork",
  "Creativity",
  "Culture",
  "Customer Focus",
];

export function getAccount(): Account | null {
  const raw = localStorage.getItem(ACCOUNT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Account;
  } catch {
    return null;
  }
}

export function saveAccount(account: Account): void {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
}

export function updateAccount(patch: Partial<Account>): Account | null {
  const current = getAccount();
  if (!current) return null;
  const next = { ...current, ...patch };
  saveAccount(next);
  return next;
}

export function clearAccount(): void {
  localStorage.removeItem(ACCOUNT_KEY);
  localStorage.removeItem(AUTH_KEY);
}

export function isAdmin(account: Account | null = getAccount()): boolean {
  if (!account) return false;
  return (account.role ?? "admin") === "admin";
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function setAuthenticated(value: boolean): void {
  if (value) {
    localStorage.setItem(AUTH_KEY, "true");
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

// ──────────────────────────────────────────────────────────────────────
// Super Admin auth
// ──────────────────────────────────────────────────────────────────────

export function isSuperAdminAuthenticated(): boolean {
  return localStorage.getItem(SUPERADMIN_AUTH_KEY) === "true";
}

export function setSuperAdminAuthenticated(value: boolean): void {
  if (value) {
    localStorage.setItem(SUPERADMIN_AUTH_KEY, "true");
  } else {
    localStorage.removeItem(SUPERADMIN_AUTH_KEY);
  }
}

/**
 * Check super admin credentials. Returns true on match. In production this
 * would call the EngageX corporate IdP / SSO; here we ship demo credentials
 * so the page is testable without a backend.
 */
export function superAdminAuthenticate(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === SUPERADMIN_CREDENTIALS.email.toLowerCase() &&
    password === SUPERADMIN_CREDENTIALS.password
  );
}

export function generateAccountId(): string {
  return "ACC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function generateInviteToken(): string {
  return Math.random().toString(36).slice(2, 14);
}

export type InviteRecord = {
  token: string;
  accountId: string;
  adminEmail: string;
  adminName: string;
  adminDesignation: string;
  adminDepartment: string;
  companyName: string;
  phone: string;
  address: string;
  products: ProductFlags;
  createdAt: string;
  /** True once the admin has signed in with the invite link. */
  redeemed?: boolean;
  /** ISO timestamp of when the admin first signed in with the invite. */
  redeemedAt?: string;
  /** True once the redeemed admin finishes the onboarding wizard. */
  setupCompleted?: boolean;
  /** ISO timestamp of when onboarding was completed. */
  setupCompletedAt?: string;
};

export function getInvites(): InviteRecord[] {
  const raw = localStorage.getItem(INVITES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as InviteRecord[];
  } catch {
    return [];
  }
}

export function saveInvite(invite: InviteRecord): void {
  const all = getInvites();
  all.push(invite);
  localStorage.setItem(INVITES_KEY, JSON.stringify(all));
}

export function findInvite(token: string): InviteRecord | undefined {
  return getInvites().find((i) => i.token === token);
}

/**
 * Patch an existing invite record by token. Returns the updated record, or
 * null if no invite with that token exists.
 */
export function updateInvite(
  token: string,
  patch: Partial<InviteRecord>,
): InviteRecord | null {
  const all = getInvites();
  const idx = all.findIndex((i) => i.token === token);
  if (idx === -1) return null;
  const next = { ...all[idx], ...patch };
  all[idx] = next;
  localStorage.setItem(INVITES_KEY, JSON.stringify(all));
  return next;
}

/** Look up the invite associated with a given accountId (if any). */
export function findInviteByAccountId(accountId: string): InviteRecord | undefined {
  return getInvites().find((i) => i.accountId === accountId);
}

export function createAccountFromInvite(invite: InviteRecord): Account {
  const account: Account = {
    accountId: invite.accountId,
    companyName: invite.companyName,
    companyLogo: null,
    address: invite.address,
    phone: invite.phone,
    adminEmail: invite.adminEmail,
    adminName: invite.adminName,
    adminDesignation: invite.adminDesignation || "Member",
    adminDepartment: invite.adminDepartment || "",
    adminPhotoUrl: null,
    role: "admin",
    currency: "₹",
    products: invite.products,
    brandColor: "#1c1917",
    timezone: "pt",
    fiscalYearStart: "jan",
    hrAdmins: [],
    integrations: DEFAULT_INTEGRATIONS,
    recognitionCategories: DEFAULT_CATEGORIES,
    pointsPolicy: {
      startingBudget: 50000,
      expiryMonths: 12,
      maxPerRecognition: 500,
      requireManagerApproval: true,
    },
    notifications: {
      weeklyDigest: true,
      budgetAlerts: true,
      recognitionEmails: true,
    },
    setupCompleted: false,
    createdAt: new Date().toISOString(),
  };
  saveAccount(account);
  // Mark this invite as redeemed so the super admin sees it as Active.
  updateInvite(invite.token, {
    redeemed: true,
    redeemedAt: account.createdAt,
  });
  return account;
}

// ──────────────────────────────────────────────────────────────────────
// Dummy seed data — populated on first Super Admin page load
// ──────────────────────────────────────────────────────────────────────

const SEED_FLAG_KEY = "engagex_seeded_v1";

type SeedSpec = {
  companyName: string;
  adminName: string;
  adminEmail: string;
  adminDesignation: string;
  adminDepartment: string;
  phone: string;
  address: string;
  products: ProductFlags;
  /** "active" → setup completed, "in-setup" → admin signed in only, "pending" → invite not yet redeemed. */
  state: "active" | "in-setup" | "pending";
  /** How many days ago the invite was created (for spread-out timestamps). */
  daysAgo: number;
};

/**
 * Five dummy companies covering the full status spectrum:
 *  • 2 Active (setup complete) — Acme Corp, Northwind Logistics
 *  • 2 In setup (admin redeemed but didn't finish onboarding) — Globex, Soylent Corp
 *  • 1 Pending invite (just provisioned) — Initech
 */
const SEED_COMPANIES: SeedSpec[] = [
  {
    companyName: "Acme Corp",
    adminName: "Jane Doe",
    adminEmail: "jane@acmecorp.com",
    adminDesignation: "VP People Operations",
    adminDepartment: "People Ops",
    phone: "+1 (415) 555-0101",
    address: "1 Market St, San Francisco, CA 94105",
    products: { appreciation: true, rnr: true },
    state: "active",
    daysAgo: 21,
  },
  {
    companyName: "Northwind Logistics",
    adminName: "Marcus Johnson",
    adminEmail: "marcus@northwind.io",
    adminDesignation: "CHRO",
    adminDepartment: "Executive",
    phone: "+1 (212) 555-0144",
    address: "350 5th Ave, New York, NY 10118",
    products: { appreciation: true, rnr: false },
    state: "active",
    daysAgo: 14,
  },
  {
    companyName: "Globex Industries",
    adminName: "Priya Sharma",
    adminEmail: "priya@globex.com",
    adminDesignation: "Head of People",
    adminDepartment: "People Ops",
    phone: "+91 80 4567 1234",
    address: "Brigade Road, Bengaluru, KA 560001",
    products: { appreciation: true, rnr: true },
    state: "in-setup",
    daysAgo: 5,
  },
  {
    companyName: "Soylent Corp",
    adminName: "David Kim",
    adminEmail: "david@soylentcorp.com",
    adminDesignation: "People Partner",
    adminDepartment: "People Ops",
    phone: "+1 (310) 555-0182",
    address: "10250 Constellation Blvd, Los Angeles, CA 90067",
    products: { appreciation: true, rnr: false },
    state: "in-setup",
    daysAgo: 3,
  },
  {
    companyName: "Initech Software",
    adminName: "Sarah Chen",
    adminEmail: "sarah@initech.co",
    adminDesignation: "Director of People",
    adminDepartment: "People Ops",
    phone: "+1 (512) 555-0167",
    address: "200 Congress Ave, Austin, TX 78701",
    products: { appreciation: true, rnr: true },
    state: "pending",
    daysAgo: 1,
  },
];

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/**
 * Seed dummy companies the first time the Super Admin page loads.
 * Idempotent — runs only once per browser unless the seed flag is cleared.
 * Existing invites and accounts are NEVER overwritten; if the user has
 * already created their own companies, seeding is skipped.
 */
export function seedDummyCompanies(): void {
  if (localStorage.getItem(SEED_FLAG_KEY) === "true") return;
  if (getInvites().length > 0) {
    // User already has companies — don't pollute their list.
    localStorage.setItem(SEED_FLAG_KEY, "true");
    return;
  }

  const invites: InviteRecord[] = SEED_COMPANIES.map((spec) => {
    const createdAt = daysAgoIso(spec.daysAgo);
    const redeemedAt =
      spec.state !== "pending" ? daysAgoIso(Math.max(spec.daysAgo - 1, 0)) : undefined;
    const setupCompletedAt =
      spec.state === "active" ? daysAgoIso(Math.max(spec.daysAgo - 2, 0)) : undefined;

    return {
      token: generateInviteToken(),
      accountId: generateAccountId(),
      adminEmail: spec.adminEmail,
      adminName: spec.adminName,
      adminDesignation: spec.adminDesignation,
      adminDepartment: spec.adminDepartment,
      companyName: spec.companyName,
      phone: spec.phone,
      address: spec.address,
      products: spec.products,
      createdAt,
      redeemed: spec.state !== "pending",
      redeemedAt,
      setupCompleted: spec.state === "active",
      setupCompletedAt,
    };
  });

  localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
  localStorage.setItem(SEED_FLAG_KEY, "true");
}

/**
 * Reset everything — clears active account, all invites, AND the seed flag
 * so dummy data is re-populated next time the Super Admin page loads.
 */
export function resetAndReseed(): void {
  clearAccount();
  localStorage.removeItem(INVITES_KEY);
  localStorage.removeItem(SEED_FLAG_KEY);
  seedDummyCompanies();
}


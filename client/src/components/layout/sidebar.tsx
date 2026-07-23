import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  CheckSquare,
  Star,
  Users,
  Gift,
  Trophy,
  ShoppingCart,
  Tag,
  Bell,
  Settings,
  X,
  LogOut,
  Wallet,
  Building2,
  Sparkles,
  Award,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAccount } from "@/lib/account";
import { BRAND } from "@/lib/brand";

type NavItem = { title: string; href: string; icon: React.ElementType; badge?: number };
type NavGroup = { label: string; items: NavItem[]; rnrOnly?: boolean };

const navGroups: NavGroup[] = [
  {
    label: "Appreciation",
    items: [
      { title: "Analytics",              href: "/",                       icon: BarChart2          },
      // { title: "Recognitions",           href: "/recognitions",           icon: Star               },
      { title: "Approval",               href: "/approvals",              icon: CheckSquare        },
      { title: "Appreciation Badges",    href: "/appreciation-settings",  icon: Award              },
      { title: "Appreciation Policy",    href: "/appreciation-policy",    icon: Sparkles           },
    ],
  },
  {
    label: "Rewards & Recognition",
    rnrOnly: true,
    items: [
      { title: "Analytics",         href: "/?tab=rnr",         icon: BarChart2    },
      { title: "Programs",          href: "/programs",         icon: Trophy      },
      { title: "Redemptions",       href: "/redemptions",      icon: ShoppingCart },
      { title: "Categories",        href: "/categories",       icon: Tag          },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Employees",       href: "/employees",     icon: Users               },
      { title: "Rewards Catalog", href: "/rewards",       icon: Gift                },
      // { title: "Points & Budget", href: "/budget",        icon: Wallet              },
      { title: "Notifications",   href: "/notifications", icon: Bell,     badge: 3  },
      { title: "Settings",        href: "/settings",      icon: Settings            },
    ],
  },
];

function matchesActive(href: string, pathname: string, search: string): boolean {
  const [hrefPath, hrefQuery = ""] = href.split("?");
  if (hrefPath !== pathname) return false;
  const curParams = new URLSearchParams(search);
  if (!hrefQuery) {
    // Bare path: only active if no rnr tab is set.
    return curParams.get("tab") !== "rnr";
  }
  const hrefParams = new URLSearchParams(hrefQuery);
  for (const [k, v] of hrefParams.entries()) {
    if (curParams.get(k) !== v) return false;
  }
  return true;
}

const activeClass =
  "px-3 py-2 shadow-sm bg-gradient-to-r from-[#fbe4d0] via-[#f8e1e2] to-[#efe2f2] border border-[#f2ddd0] text-[#c2610c] font-medium transition-colors duration-200";
const inactiveClass =
  "px-3 py-2 text-muted-foreground hover:bg-white/60 transition-colors duration-200 border border-transparent";

export function Sidebar({
  onClose,
  onSignOut,
  collapsed = false,
  onToggleCollapse,
}: {
  onClose?: () => void;
  onSignOut?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const location = useLocation();
  const account = getAccount();
  const rnrEnabled = account?.products.rnr ?? false;
  const visibleGroups = navGroups.filter((g) => !g.rnrOnly || rnrEnabled);

  const companyName = account?.companyName || BRAND.name;
  const companyLogo = account?.companyLogo;

  const adminName = account?.adminName || "Admin";
  const adminDesignation = account?.adminDesignation || "";
  const adminPhotoUrl = account?.adminPhotoUrl;
  const initials =
    adminName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  return (
    <aside
      className={cn(
        "flex flex-col relative z-10 h-full bg-gradient-to-b from-[#fdf6ee] via-[#faf1e7] to-[#f6ecef] transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[76px]" : "w-60",
      )}
    >
      <div
        className={cn(
          "relative z-10 flex gap-2.5",
          collapsed ? "flex-col items-center p-3" : "items-center p-6 pb-4",
        )}
      >
        {companyLogo ? (
          <img
            src={companyLogo}
            alt={companyName}
            className="w-9 h-9 rounded-lg object-contain border border-border bg-white shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-[#f1e2d0] flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
        )}
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-foreground truncate">{companyName}</h1>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{BRAND.name} · {BRAND.tagline}</p>
          </div>
        )}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand menu" : "Collapse menu"}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-white/60 hover:text-foreground transition-colors shrink-0"
            data-testid="sidebar-toggle"
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}
      </div>

      <nav
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden relative z-10",
          collapsed ? "px-2 pb-4" : "p-4 pt-0",
        )}
      >
        {visibleGroups.map((group, gi) => (
          <div key={group.label} className={cn("space-y-1", gi > 0 && "pt-4 mt-4 border-t border-[#efe3d6]")}>
            {!collapsed && (
              <p className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = matchesActive(item.href, location.pathname, location.search);
              return (
                <NavLink key={item.href} to={item.href} title={collapsed ? item.title : undefined}>
                  <div
                    className={cn(
                      "flex items-center text-sm font-normal rounded-lg cursor-pointer",
                      isActive ? activeClass : inactiveClass,
                      collapsed && "justify-center",
                    )}
                  >
                    <span className="relative flex items-center shrink-0">
                      <Icon className={cn("w-4 h-4 shrink-0", !collapsed && "mr-3")} />
                      {collapsed && item.badge ? (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
                      ) : null}
                    </span>
                    {!collapsed && <span className="flex-1">{item.title}</span>}
                    {!collapsed && item.badge ? (
                      <Badge className="ml-auto h-5 min-w-5 px-1.5 text-xs bg-primary text-primary-foreground">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </div>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={cn("border-t border-[#efe3d6]", collapsed ? "p-2" : "p-3")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center w-full rounded-lg hover:bg-white/60 transition-colors",
                collapsed ? "justify-center p-1.5" : "gap-2.5 px-2 py-1.5 text-left",
              )}
              data-testid="sidebar-profile"
              title={collapsed ? adminName : undefined}
            >
              <Avatar className="h-9 w-9 rounded-lg shrink-0">
                <AvatarImage src={adminPhotoUrl ?? undefined} alt={adminName} />
                <AvatarFallback className="rounded-lg bg-muted text-muted-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{adminName}</p>
                    {adminDesignation && (
                      <p className="text-xs text-muted-foreground truncate">{adminDesignation}</p>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={collapsed ? "start" : "end"} side="top" className="w-52">
            <DropdownMenuItem onClick={onSignOut} className="text-muted-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

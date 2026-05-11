import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Star,
  Users,
  Gift,
  Trophy,
  ShoppingCart,
  BarChart2,
  Bell,
  Settings,
  X,
  LogOut,
  Award,
  Wallet,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Target,
  ScrollText,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAccount } from "@/lib/account";
import { BRAND } from "@/lib/brand";

type NavItem = { title: string; href: string; icon: React.ElementType; badge?: number };
type NavGroup = { label: string; items: NavItem[]; rnrOnly?: boolean };

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard",     href: "/",             icon: LayoutDashboard },
      { title: "Recognitions",  href: "/recognitions", icon: Star            },
      { title: "Employees",     href: "/employees",    icon: Users           },
      { title: "Programs",      href: "/programs",     icon: Trophy          },
      { title: "Badges & Tags", href: "/badges",       icon: Award           },
    ],
  },
  // {
  //   label: "People Ops",
  //   items: [
  //     { title: "Check-ins",           href: "/check-ins",    icon: ClipboardList },
  //     { title: "1-on-1s",             href: "/one-on-ones",  icon: MessageSquare },
  //     { title: "Engagement Surveys", href: "/surveys",      icon: BarChart3     },
  //     { title: "OKRs & Goals",        href: "/okrs",         icon: Target        },
  //     { title: "Performance Reviews", href: "/reviews",      icon: ScrollText    },
  //   ],
  // },
  {
    label: "Rewards",
    rnrOnly: true,
    items: [
      { title: "Rewards Catalog", href: "/rewards",     icon: Gift         },
      { title: "Redemptions",     href: "/redemptions", icon: ShoppingCart },
      { title: "Points & Budget", href: "/budget",      icon: Wallet       },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Analytics", href: "/analytics", icon: BarChart2 },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Notifications", href: "/notifications", icon: Bell,     badge: 3 },
      { title: "Settings",      href: "/settings",      icon: Settings           },
    ],
  },
];

const activeClass =
  "px-3 py-2 shadow-sm bg-stone-800 relative bg-gradient-to-b from-stone-700 to-stone-800 border border-stone-900 text-stone-50 after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)] after:pointer-events-none duration-300";
const inactiveClass =
  "px-3 py-2 text-stone-700 hover:bg-stone-100 transition-colors duration-200 border border-transparent";

export function Sidebar({ onClose, onSignOut }: { onClose?: () => void; onSignOut?: () => void }) {
  const location = useLocation();
  const account = getAccount();
  const rnrEnabled = account?.products.rnr ?? false;
  const visibleGroups = navGroups.filter((g) => !g.rnrOnly || rnrEnabled);

  const companyName = account?.companyName || BRAND.name;
  const companyLogo = account?.companyLogo;

  return (
    <aside className="w-60 bg-white lg:bg-transparent flex flex-col relative z-10 h-full border-r border-stone-200 lg:border-0">
      <div className="p-6 pb-4 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={companyName}
              className="w-9 h-9 rounded-lg object-contain border border-stone-200 bg-white shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-stone-500" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-stone-900 truncate">{companyName}</h1>
            <p className="text-xs text-stone-500 mt-0.5 truncate">{BRAND.name} · {BRAND.tagline}</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 p-4 pt-0 overflow-y-auto relative z-10">
        {visibleGroups.map((group, gi) => (
          <div key={group.label} className={cn("space-y-1", gi > 0 && "pt-4 mt-4 border-t border-stone-200")}>
            <p className="px-3 pb-2 text-xs font-semibold text-stone-400 uppercase tracking-wide">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <NavLink key={item.href} to={item.href}>
                  <div className={cn("flex items-center text-sm font-normal rounded-lg cursor-pointer", isActive ? activeClass : inactiveClass)}>
                    <Icon className="mr-3 w-4 h-4 shrink-0" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge ? (
                      <Badge className="ml-auto h-5 min-w-5 px-1.5 text-xs bg-stone-800 text-white">
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

      <div className="p-4 border-t border-stone-200">
        <button
          onClick={onSignOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Settings,
  LogOut,
  HelpCircle,
  Layers,
  ShieldCheck,
  User,
  ChevronRight,
  Menu,
} from "lucide-react";
import { getAccount, setAuthenticated } from "@/lib/account";

export function UserMenuSheet() {
  const navigate = useNavigate();
  const account = getAccount();

  if (!account) return null;

  const initial = (account.adminName?.[0] || "?").toUpperCase();

  function signOut() {
    setAuthenticated(false);
    navigate("/auth/sign-in");
  }

  return (
    <Sheet>
      <SheetTrigger
        className="p-2 rounded-full hover:bg-stone-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-stone-700" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[360px] sm:w-[400px] bg-stone-50 p-5 border-l border-stone-200">
        <SheetTitle className="sr-only">Account menu</SheetTitle>
        <div className="flex flex-col gap-3">
          <ProfileBlock
            name={account.adminName}
            designation={account.adminDesignation || "Member"}
            photoUrl={account.adminPhotoUrl}
            initial={initial}
          />

          <MenuRow
            icon={Settings}
            label="Admin access"
            onClick={() => navigate("/")}
          />

          <MenuGroup
            items={[
              { icon: Settings, label: "Account settings", onClick: () => {} },
              { icon: Layers, label: "Integration", onClick: () => {} },
              { icon: HelpCircle, label: "Get Help", onClick: () => {} },
              { icon: User, label: "View Profile", onClick: () => navigate("/m/profile") },
              { icon: ShieldCheck, label: "Privacy", onClick: () => {} },
            ]}
          />

          <button
            onClick={signOut}
            className="flex items-center gap-3 px-2 py-3 text-sm text-stone-800 hover:text-red-600 transition-colors mt-1"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ProfileBlock({
  name,
  designation,
  photoUrl,
  initial,
}: {
  name: string;
  designation: string;
  photoUrl: string | null;
  initial: string;
}) {
  return (
    <div className="bg-stone-200/60 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-mobile font-semibold text-amber-900">{initial}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-mobile font-semibold text-stone-900 text-base truncate">
            {name}
          </p>
          <p className="text-xs text-stone-600 truncate">{designation}</p>
        </div>
      </div>
      <Link
        to="/m/profile"
        className="block w-full text-center h-10 leading-10 rounded-full border border-[#a87a3a] text-[#a87a3a] text-sm font-mobile font-semibold hover:bg-[#a87a3a] hover:text-white transition-colors"
      >
        View profile
      </Link>
    </div>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-stone-200/60 rounded-2xl px-4 py-3.5 text-sm font-medium text-stone-900 hover:bg-stone-200 transition-colors"
    >
      <Icon className="w-5 h-5 text-stone-700 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight className="w-4 h-4 text-stone-500" />
    </button>
  );
}

function MenuGroup({
  items,
}: {
  items: { icon: React.ElementType; label: string; onClick?: () => void }[];
}) {
  return (
    <div className="bg-stone-200/60 rounded-2xl divide-y divide-stone-300/50 overflow-hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={item.onClick}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-stone-900 hover:bg-stone-200/70 transition-colors text-left"
          >
            <Icon className="w-5 h-5 text-stone-700 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

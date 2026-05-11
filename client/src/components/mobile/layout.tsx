import { MobileTopBar } from "./top-bar";
import { MobileBottomNav } from "./bottom-nav";

type Props = {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  hideTopBar?: boolean;
  hideBottomNav?: boolean;
};

export function MobileLayout({
  children,
  title,
  showBack,
  onBack,
  hideTopBar,
  hideBottomNav,
}: Props) {
  return (
    <div className="min-h-screen bg-stone-50 font-mobile flex flex-col">
      {!hideTopBar && <MobileTopBar title={title} showBack={showBack} onBack={onBack} />}
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: hideBottomNav ? undefined : "calc(72px + 16px + max(16px, env(safe-area-inset-bottom)))" }}
      >
        {children}
      </main>
      {!hideBottomNav && <MobileBottomNav />}
    </div>
  );
}

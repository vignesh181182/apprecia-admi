import { useIsMobile } from "@/hooks/use-viewport";
import { MobileLayout } from "@/components/mobile/layout";
import { WebEmployeeLayout } from "@/components/web/employee-layout";

type Props = {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  hideTopBar?: boolean;
  hideBottomNav?: boolean;
  showRightRail?: boolean;
  rightRail?: React.ReactNode;
};

export function EmployeeLayout({
  children,
  title,
  showBack,
  onBack,
  hideTopBar,
  hideBottomNav,
  showRightRail,
  rightRail,
}: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout
        title={title}
        showBack={showBack}
        onBack={onBack}
        hideTopBar={hideTopBar}
        hideBottomNav={hideBottomNav}
      >
        {children}
      </MobileLayout>
    );
  }

  return (
    <WebEmployeeLayout showRightRail={showRightRail} contentTitle={title} rightRail={rightRail}>
      {children}
    </WebEmployeeLayout>
  );
}

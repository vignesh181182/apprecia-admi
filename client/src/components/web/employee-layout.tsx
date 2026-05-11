import { WebTopBar } from "./top-bar";
import { WebEmployeeNav } from "./employee-nav";
import { WebRightRail } from "./right-rail";

type Props = {
  children: React.ReactNode;
  showRightRail?: boolean;
  contentTitle?: string;
  rightRail?: React.ReactNode;
};

export function WebEmployeeLayout({ children, showRightRail = true, contentTitle, rightRail }: Props) {
  return (
    <div className="min-h-screen bg-stone-50 font-mobile">
      <WebTopBar />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-12 gap-6 pt-4">
          <div className="col-span-3">
            <WebEmployeeNav />
          </div>

          <div className={showRightRail ? "col-span-6" : "col-span-9"}>
            {contentTitle && (
              <h1 className="text-xl font-semibold text-stone-900 mb-3 px-1">{contentTitle}</h1>
            )}
            <div className="space-y-4 pb-12">{children}</div>
          </div>

          {showRightRail && (
            <div className="col-span-3">
              {rightRail ?? <WebRightRail />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

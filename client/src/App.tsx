import { HashRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { Menu, LogOut } from "lucide-react";
import { useState } from "react";
import HRDashboard from "@/pages/hr-dashboard";
import Recognitions from "@/pages/recognitions";
import Employees from "@/pages/employees";
import Rewards from "@/pages/rewards";
import Programs from "@/pages/programs";
import ProgramEdit from "@/pages/program-edit";
import ProgramDetailAdmin from "@/pages/program-detail";
import WinnerSelection from "@/pages/winner-selection";
import ProgramWinners from "@/pages/program-winners";
import Redemptions from "@/pages/redemptions";
import Analytics from "@/pages/analytics";
import HRSettings from "@/pages/hr-settings";
import HRNotifications from "@/pages/hr-notifications";
import BadgesAndTags from "@/pages/badges";
import Budget from "@/pages/budget";
import CheckIns from "@/pages/check-ins";
import OneOnOnes from "@/pages/one-on-ones";
import Surveys from "@/pages/surveys";
import OKRs from "@/pages/okrs";
import Reviews from "@/pages/reviews";
import SignIn from "@/pages/auth/sign-in";
import NotFound from "@/pages/not-found";
import SuperAdmin from "@/pages/superadmin";
import SuperAdminSignIn from "@/pages/superadmin/sign-in";
import MobileHome from "@/pages/mobile/home";
import MobileRewards from "@/pages/mobile/rewards";
import ProductDetail from "@/pages/mobile/product-detail";
import MobileRecognize from "@/pages/mobile/recognize";
import MobileRanks from "@/pages/mobile/ranks";
import MobileInsights from "@/pages/mobile/insights";
import ProgramDetail from "@/pages/mobile/program-detail";
import MobilePrograms from "@/pages/mobile/programs";
import MobileSettings from "@/pages/mobile/settings";
import { ComingSoon } from "@/components/coming-soon";
import MobileProfile from "@/pages/mobile/profile";
import MobileNotifications from "@/pages/mobile/notifications";
import ApprovalsAppreciations from "@/pages/mobile/approvals-appreciations";
import { useIsMobile } from "@/hooks/use-viewport";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import OnboardingWelcome from "@/pages/onboarding/welcome";
import OnboardingCompany from "@/pages/onboarding/company";
import OnboardingAdmins from "@/pages/onboarding/admins";
import OnboardingIntegrations from "@/pages/onboarding/integrations";
import OnboardingRecognition from "@/pages/onboarding/recognition";
import OnboardingReview from "@/pages/onboarding/review";
import { isAuthenticated, getAccount, setAuthenticated, isAdmin, isSuperAdminAuthenticated } from "@/lib/account";
import { processAppreciationAutoApprovals } from "@/lib/badges";
import { transitionScheduledPrograms } from "@/lib/programs-data";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/auth/sign-in" replace />;
  return <>{children}</>;
}

function RequireSetupComplete({ children }: { children: React.ReactNode }) {
  const account = getAccount();
  if (!account) return <Navigate to="/auth/sign-in" replace />;
  if (!account.setupCompleted) return <Navigate to="/onboarding/welcome" replace />;
  return <>{children}</>;
}

function RequireSetupInProgress({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/auth/sign-in" replace />;
  const account = getAccount();
  if (!account) return <Navigate to="/auth/sign-in" replace />;
  if (account.setupCompleted) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireRnR({ children }: { children: React.ReactNode }) {
  const account = getAccount();
  if (!account?.products.rnr) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function MobileGuard({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireSetupComplete>{children}</RequireSetupComplete>
    </RequireAuth>
  );
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  if (!isAdmin()) return <Navigate to="/m" replace />;
  return <>{children}</>;
}

function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  if (!isSuperAdminAuthenticated()) return <Navigate to="/superadmin/sign-in" replace />;
  return <>{children}</>;
}

function MobileRedirect() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isMobile) return;
    if (location.pathname.startsWith("/m") || location.pathname.startsWith("/auth") || location.pathname.startsWith("/onboarding") || location.pathname.startsWith("/superadmin")) return;
    if (!isAuthenticated()) return;
    const account = getAccount();
    if (!account?.setupCompleted) return;
    navigate("/m", { replace: true });
  }, [isMobile, location.pathname, navigate]);

  return null;
}

function Layout({ children, title, description }: { children: React.ReactNode; title?: string; description?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  function signOut() {
    setAuthenticated(false);
    navigate("/auth/sign-in");
  }

  return (
    <div className="flex h-screen bg-stone-50 grain-texture">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-10
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} onSignOut={signOut} />
      </div>

      <main className="flex-1 overflow-y-auto p-3 lg:p-6 relative z-10 flex flex-col">
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <Card className="flex-1 border border-stone-200 bg-white relative z-20">
          {title && (
            <div className="pt-6 px-3 lg:px-6 pb-4">
              <h1 className="text-xl font-semibold text-stone-900 mb-1">{title}</h1>
              {description && <p className="text-sm text-stone-600">{description}</p>}
              <div className="border-b border-stone-200 mt-4"></div>
            </div>
          )}
          {children}
        </Card>
        <Footer />
      </main>
    </div>
  );
}

function Protected({ children, title, description }: { children: React.ReactNode; title?: string; description?: string }) {
  return (
    <RequireAuth>
      <RequireSetupComplete>
        <Layout title={title} description={description}>{children}</Layout>
      </RequireSetupComplete>
    </RequireAuth>
  );
}

function ProtectedRnR({ children, title, description }: { children: React.ReactNode; title?: string; description?: string }) {
  return (
    <RequireAuth>
      <RequireSetupComplete>
        <RequireRnR>
          <Layout title={title} description={description}>{children}</Layout>
        </RequireRnR>
      </RequireSetupComplete>
    </RequireAuth>
  );
}

function Router() {
  return (
    <Routes>
      <Route path="/auth/sign-in" element={<SignIn />} />
      <Route path="/superadmin/sign-in" element={<SuperAdminSignIn />} />
      <Route path="/superadmin" element={<RequireSuperAdmin><SuperAdmin /></RequireSuperAdmin>} />

      <Route path="/onboarding" element={<Navigate to="/onboarding/welcome" replace />} />
      <Route path="/onboarding/welcome" element={<RequireSetupInProgress><OnboardingWelcome /></RequireSetupInProgress>} />
      <Route path="/onboarding/company" element={<RequireSetupInProgress><OnboardingCompany /></RequireSetupInProgress>} />
      <Route path="/onboarding/admins" element={<RequireSetupInProgress><OnboardingAdmins /></RequireSetupInProgress>} />
      <Route path="/onboarding/integrations" element={<RequireSetupInProgress><OnboardingIntegrations /></RequireSetupInProgress>} />
      <Route path="/onboarding/recognition" element={<RequireSetupInProgress><OnboardingRecognition /></RequireSetupInProgress>} />
      <Route path="/onboarding/review" element={<RequireSetupInProgress><OnboardingReview /></RequireSetupInProgress>} />

      <Route path="/" element={<Protected><HRDashboard /></Protected>} />
      <Route path="/recognitions" element={<Protected title="Recognitions" description="Manage and approve employee recognition submissions"><Recognitions /></Protected>} />
      <Route path="/employees" element={<Protected title="Employees" description="Browse your workforce and track recognition activity"><Employees /></Protected>} />
      <Route path="/programs" element={<Protected title="Programs" description="Create and manage recognition programs and campaigns"><Programs /></Protected>} />
      <Route path="/programs/new" element={<Protected><ProgramEdit /></Protected>} />
      <Route path="/programs/:programId/edit" element={<Protected><ProgramEdit /></Protected>} />
      <Route path="/programs/:programId/winner-selection" element={<ProtectedRnR><WinnerSelection /></ProtectedRnR>} />
      <Route path="/programs/:programId/winners" element={<ProtectedRnR><ProgramWinners /></ProtectedRnR>} />
      <Route path="/programs/:programId" element={<ProtectedRnR><ProgramDetailAdmin /></ProtectedRnR>} />
      <Route path="/badges" element={<Protected title="Badges & Tags" description="Manage recognition tags and achievement badge taxonomy"><BadgesAndTags /></Protected>} />
      <Route path="/check-ins" element={<Protected title="Weekly Check-ins" description="Track employee weekly updates and manager responses"><CheckIns /></Protected>} />
      <Route path="/one-on-ones" element={<Protected title="1-on-1s" description="Structured manager-employee meeting agendas and notes"><OneOnOnes /></Protected>} />
      <Route path="/surveys" element={<Protected title="Engagement Surveys" description="Pulse, lifecycle, and custom employee surveys"><Surveys /></Protected>} />
      <Route path="/okrs" element={<Protected title="OKRs & Goals" description="Aligned goal-setting across company, teams, and individuals"><OKRs /></Protected>} />
      <Route path="/reviews" element={<Protected title="Performance Reviews" description="Configure and manage review cycles and submissions"><Reviews /></Protected>} />
      <Route path="/analytics" element={<Protected title="Analytics" description="Insights into recognition trends, participation, and budget"><Analytics /></Protected>} />
      <Route path="/settings" element={<Protected title="Settings" description="Configure recognition policies, integrations, and admin preferences"><HRSettings /></Protected>} />
      <Route path="/notifications" element={<Protected title="Notifications" description="System alerts, budget warnings, and pending action items"><HRNotifications /></Protected>} />

      <Route path="/rewards" element={<ProtectedRnR title="Rewards Catalog" description="Manage redeemable rewards available to employees"><Rewards /></ProtectedRnR>} />
      <Route path="/redemptions" element={<ProtectedRnR title="Redemptions" description="Review and fulfill employee reward redemption requests"><Redemptions /></ProtectedRnR>} />
      <Route path="/budget" element={<ProtectedRnR title="Points & Budget" description="Org-wide point budget, allocations, allowances, and ledger"><Budget /></ProtectedRnR>} />

      <Route path="/m" element={<MobileGuard><MobileHome /></MobileGuard>} />
      <Route path="/m/rewards" element={<MobileGuard><MobileRewards /></MobileGuard>} />
      <Route path="/m/rewards/:id" element={<MobileGuard><ProductDetail /></MobileGuard>} />
      <Route path="/m/recognize" element={<MobileGuard><MobileRecognize /></MobileGuard>} />
      <Route path="/m/ranks" element={<MobileGuard><MobileRanks /></MobileGuard>} />
      <Route path="/m/insights" element={<MobileGuard><RequireAdmin><MobileInsights /></RequireAdmin></MobileGuard>} />
      <Route path="/m/programs" element={<MobileGuard><MobilePrograms /></MobileGuard>} />
      <Route path="/m/programs/:id" element={<MobileGuard><ProgramDetail /></MobileGuard>} />
      <Route path="/m/profile" element={<MobileGuard><MobileProfile /></MobileGuard>} />
      <Route path="/m/notifications" element={<MobileGuard><MobileNotifications /></MobileGuard>} />
      <Route path="/m/approvals/appreciations" element={<MobileGuard><ApprovalsAppreciations /></MobileGuard>} />
      <Route path="/m/settings" element={<MobileGuard><MobileSettings /></MobileGuard>} />
      <Route path="/m/*" element={<MobileGuard><ComingSoon title="Page" description="This page isn't ready yet." withBack /></MobileGuard>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AutoApprovalRunner() {
  useEffect(() => {
    processAppreciationAutoApprovals();
    transitionScheduledPrograms();
  }, []);
  return null;
}

function App() {
  return (
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AutoApprovalRunner />
          <MobileRedirect />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HashRouter>
  );
}

export default App;

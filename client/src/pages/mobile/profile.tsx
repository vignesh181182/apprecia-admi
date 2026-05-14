import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Monitor } from "lucide-react";
import { EmployeeLayout } from "@/components/employee-layout";
import { ProfileHeader } from "@/components/profile/profile-header";
import { StatsGrid, ICONS } from "@/components/profile/stats-grid";
import { ProfileTabs, type ProfileTab } from "@/components/profile/profile-tabs";
import { BadgesGrid } from "@/components/profile/badges-grid";
import { RecognitionCard } from "@/components/mobile/recognition-card";
import { ProfileRightRail } from "@/components/profile/profile-right-rail";
import { WalletCard } from "@/components/profile/wallet-card";
import { getAccount, setAuthenticated } from "@/lib/account";
import { FEED, MY_BADGES, MY_RANK, ME, isMe, type RecognitionFeedItem } from "@/lib/mobile-data";
import { loadMyRecognitions } from "@/lib/recognize-data";

export default function MobileProfile() {
  const navigate = useNavigate();
  const account = getAccount();
  const [tab, setTab] = useState<ProfileTab>("received");

  const myRecognitions = useMemo(() => {
    return loadMyRecognitions().map<RecognitionFeedItem>((r) => ({
      id: r.id,
      kind: r.kind,
      senderName: "You",
      senderAvatar: account?.adminPhotoUrl || "/m/images/user06.png",
      senderEmail: ME,
      recipientName: r.recipientName,
      recipientAvatar: r.recipientAvatar,
      recipientEmail: `${r.recipientId}@local`,
      timeAgo: "Just now",
      badge: r.badgeKind,
      badgeLabel: r.badgeLabel,
      message: r.reason || "—",
      points: r.points,
    }));
  }, [account]);

  const received = useMemo(() => FEED.filter((f) => isMe(f.recipientEmail, account)), [account]);
  const given = useMemo(
    () => [...myRecognitions, ...FEED.filter((f) => isMe(f.senderEmail, account))],
    [account, myRecognitions],
  );

  if (!account) return null;

  function signOut() {
    setAuthenticated(false);
    navigate("/auth/sign-in");
  }

  const stats = [
    { label: "Received", value: received.length, Icon: ICONS.Received, tone: "rose" as const },
    { label: "Given", value: given.length, Icon: ICONS.Given, tone: "amber" as const },
    { label: "Rank", value: `#${MY_RANK.rank}`, Icon: ICONS.Rank, tone: "emerald" as const, hint: "this month" },
    { label: "Points", value: MY_RANK.points.toLocaleString(), Icon: ICONS.Points, tone: "amber" as const },
  ];

  return (
    <EmployeeLayout rightRail={<ProfileRightRail />}>
      <div className="px-5 md:px-0 pt-3 md:pt-0 pb-6 space-y-4">
        <ProfileHeader account={account} />

        <WalletCard />

        <StatsGrid stats={stats} />

        <div>
          <ProfileTabs
            value={tab}
            onChange={setTab}
            counts={{ received: received.length, given: given.length, badges: MY_BADGES.length }}
          />
          <div className="mt-4 space-y-4">
            {tab === "received" && (
              received.length === 0 ? (
                <EmptyState message="You haven't received any recognitions yet." />
              ) : (
                received.map((f) => <RecognitionCard key={f.id} item={f} />)
              )
            )}
            {tab === "given" && (
              given.length === 0 ? (
                <EmptyState message="You haven't sent any recognitions yet." />
              ) : (
                given.map((f) => <RecognitionCard key={f.id} item={f} />)
              )
            )}
            {tab === "badges" && <BadgesGrid badges={MY_BADGES} />}
          </div>
        </div>

        <div className="md:hidden rounded-2xl border border-stone-200 bg-white divide-y divide-stone-100">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50"
          >
            <Monitor className="w-4 h-4 text-stone-500" />
            Switch to admin web
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </EmployeeLayout>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
      <p className="text-sm text-stone-600">{message}</p>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { EmployeeLayout } from "@/components/employee-layout";

export default function MobileNotifications() {
  const navigate = useNavigate();
  return (
    <EmployeeLayout title="Notifications" showBack onBack={() => navigate(-1)} showRightRail={false}>
      <div className="px-5 md:px-0 pt-4 md:pt-0 pb-6">
        <p className="text-sm text-stone-600">No new notifications.</p>
      </div>
    </EmployeeLayout>
  );
}

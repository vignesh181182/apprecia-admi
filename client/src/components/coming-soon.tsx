import { Construction } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmployeeLayout } from "@/components/employee-layout";

export function ComingSoon({
  title,
  description,
  withBack = false,
}: {
  title: string;
  description?: string;
  withBack?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <EmployeeLayout
      title={title}
      showBack={withBack}
      onBack={() => navigate(-1)}
      showRightRail={false}
    >
      <div className="px-5 md:px-0 pt-4 md:pt-0 pb-12">
        <div className="bg-white rounded-2xl border border-border p-10 md:p-12 text-center max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center mx-auto mb-4">
            <Construction className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-mobile text-xl font-semibold text-foreground mb-2">
            {title} is coming soon
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {description ??
              "This page hasn't been built yet. We're cooking — check back soon."}
          </p>
        </div>
      </div>
    </EmployeeLayout>
  );
}

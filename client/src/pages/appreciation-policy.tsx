import { useState } from "react";
import { getAccount, updateAccount, DEFAULT_APPRECIATION_POLICY } from "@/lib/account";
import type { AppreciationPolicy } from "@/lib/account";
import { AppreciationPolicyEditor } from "@/components/recognition/appreciation-policy-editor";

export default function AppreciationPolicyPage() {
  const account = getAccount();
  const [policy, setPolicy] = useState<AppreciationPolicy>(
    account?.appreciationPolicy ?? DEFAULT_APPRECIATION_POLICY,
  );

  function handleChange(next: AppreciationPolicy) {
    setPolicy(next);
    // Auto-save on every edit. If monetary is on but the point-value pair
    // is incomplete (mid-typing) we still persist; the editor surfaces the
    // validation hint inline, and the partial state is harmless until the
    // user finishes typing.
    updateAccount({ appreciationPolicy: next });
  }

  return (
    <div className="p-6 overflow-y-auto h-full custom-scrollbar">
      <AppreciationPolicyEditor
        policy={policy}
        onChange={handleChange}
        accountTimezone={account?.timezone}
        accountCurrency={account?.currency}
      />
    </div>
  );
}

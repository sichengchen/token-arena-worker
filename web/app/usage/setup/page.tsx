import { UsagePageShell } from "@/components/usage/page-shell";
import { SetupCard } from "@/components/usage/setup-card";
import { getSessionOrRedirect } from "@/lib/session";
import { listUsageApiKeys } from "@/lib/usage/api-keys";
import { getUsagePreference } from "@/lib/usage/preferences";

export default async function UsageSetupPage() {
  const session = await getSessionOrRedirect();
  const [preference, keys] = await Promise.all([
    getUsagePreference(session.user.id),
    listUsageApiKeys(session.user.id),
  ]);

  const keysSummary = {
    total: keys.length,
    active: keys.filter((key) => key.status === "active").length,
    disabled: keys.filter((key) => key.status === "disabled").length,
  };

  return (
    <UsagePageShell
      activePath="/usage/setup"
      title="Setup"
      description="Configure your account timezone, project privacy mode, and the first-time CLI workflow."
      email={session.user.email}
      timezone={preference.timezone}
    >
      <SetupCard
        initialTimezone={preference.timezone}
        initialProjectMode={preference.projectMode}
        keysSummary={keysSummary}
      />
    </UsagePageShell>
  );
}

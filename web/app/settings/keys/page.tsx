import { KeyManager } from "@/components/usage/key-manager";
import { UsagePageShell } from "@/components/usage/page-shell";
import { getSessionOrRedirect } from "@/lib/session";
import { listUsageApiKeys } from "@/lib/usage/api-keys";
import { getUsagePreference } from "@/lib/usage/preferences";

export default async function UsageKeysPage() {
  const session = await getSessionOrRedirect();
  const [preference, keys] = await Promise.all([
    getUsagePreference(session.user.id),
    listUsageApiKeys(session.user.id),
  ]);

  return (
    <UsagePageShell
      activePath="/settings/keys"
      title="API Keys"
      description="Create one CLI key per device or workflow, then rotate, disable, or delete them safely."
      email={session.user.email}
      timezone={preference.timezone}
    >
      <KeyManager
        initialKeys={keys.map((key) => ({
          id: key.id,
          name: key.name,
          prefix: key.prefix,
          status: key.status,
          lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
          createdAt: key.createdAt.toISOString(),
        }))}
      />
    </UsagePageShell>
  );
}

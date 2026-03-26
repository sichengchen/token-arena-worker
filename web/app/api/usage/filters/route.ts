import { NextResponse } from "next/server";

import { getOptionalSession } from "@/lib/session";
import { getFilterOptions, getLastSyncedAt } from "@/lib/usage/queries";

export async function GET() {
  const session = await getOptionalSession();

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const [filters, lastSyncedAt] = await Promise.all([
    getFilterOptions(session.user.id),
    getLastSyncedAt(session.user.id),
  ]);

  return NextResponse.json({
    ...filters,
    lastSyncedAt: lastSyncedAt?.toISOString() ?? null,
  });
}

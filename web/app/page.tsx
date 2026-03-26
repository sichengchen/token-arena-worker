import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPreferredLocale, localeCookieName } from "@/lib/i18n";
import { getOptionalSession } from "@/lib/session";
import { getUsagePreference } from "@/lib/usage/preferences";

export default async function HomePage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const fallbackLocale = getPreferredLocale({
    cookieLocale: cookieStore.get(localeCookieName)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
  const session = await getOptionalSession();

  if (session) {
    const preference = await getUsagePreference(session.user.id);
    redirect(`/${preference.locale ?? fallbackLocale}/usage`);
  }

  redirect(`/${fallbackLocale}/login`);
}

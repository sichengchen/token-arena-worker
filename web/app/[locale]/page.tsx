import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/session";
import { getUsagePreference } from "@/lib/usage/preferences";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getOptionalSession();

  if (session) {
    const preference = await getUsagePreference(session.user.id);
    redirect(`/${preference.locale}/usage`);
  }

  redirect(`/${locale}/login`);
}

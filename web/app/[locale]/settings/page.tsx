import { redirect } from "@/i18n/navigation";

type SettingsIndexPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SettingsIndexPage({
  params,
}: SettingsIndexPageProps) {
  const { locale } = await params;
  redirect({ href: "/settings/account", locale });
}

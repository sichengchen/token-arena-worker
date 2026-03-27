-- CreateEnum
CREATE TYPE "AppLocale" AS ENUM ('en', 'zh');

-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('light', 'dark', 'system');

-- AlterTable
ALTER TABLE "UsagePreference" ADD COLUMN     "locale" "AppLocale" NOT NULL DEFAULT 'en',
ADD COLUMN     "theme" "ThemeMode" NOT NULL DEFAULT 'system';

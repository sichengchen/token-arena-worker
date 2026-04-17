import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Circular icon triggers in the footer (transparent bar — works on light and dark pages). */
export const FOOTER_ICON_BUTTON_CLASS =
  "size-9 rounded-full border-0 bg-muted/70 text-foreground shadow-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0 dark:bg-muted/50";

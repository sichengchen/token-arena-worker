import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function App() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <ThemeProvider defaultTheme="system" storageKey="tb-theme">
      <div className="min-h-screen bg-background text-foreground">
        {/* Root content — routes render via RouterProvider */}
      </div>
    </ThemeProvider>
  );
}

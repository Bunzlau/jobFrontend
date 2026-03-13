/**
 * DashboardHeader — nowoczesny nagłówek z gradientem i przełącznikiem dark mode.
 */

import { Moon, Sun, BarChart3, Database } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function DashboardHeader() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Rynek Pracy PL
              </h1>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono uppercase tracking-wider border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400">
                live
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Monitoring zatrudnienia i bezrobocia — dane GUS &amp; Eurostat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden md:inline-flex gap-1 text-xs">
            <Database className="h-3 w-3" />
            PostgreSQL
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDark((d) => !d)}
            className="rounded-lg"
            aria-label="Przełącz motyw"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <Separator className="mt-4" />
    </header>
  );
}

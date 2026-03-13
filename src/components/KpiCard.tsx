/**
 * KpiCard — nowoczesna karta KPI z wartością, trendem i sparkline.
 */

import { ArrowDownRight, ArrowUpRight, Info, Minus, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KpiCardProps {
  tytul: string;
  wartosc: number | null;
  jednostka: string;
  zmiana: number | null;
  okres: string;
  loading?: boolean;
  error?: string | null;
  wyzejLepiej?: boolean;
  icon?: LucideIcon;
  accent?: "blue" | "emerald" | "amber" | "rose";
  /** Tekst wyjaśniający wyświetlany po najechaniu na tytuł karty */
  tooltipText?: string;
}

function formatNumber(val: number): string {
  return val.toLocaleString("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function KpiCard({
  tytul,
  wartosc,
  jednostka,
  zmiana,
  okres,
  loading = false,
  error = null,
  wyzejLepiej = true,
  icon: Icon,
  accent = "blue",
  tooltipText,
}: KpiCardProps) {
  const accentColors = {
    blue: "from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/5",
    emerald: "from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/5",
    amber: "from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/5",
    rose: "from-rose-500/10 to-rose-500/5 dark:from-rose-500/20 dark:to-rose-500/5",
  };

  const iconColors = {
    blue: "text-blue-600 dark:text-blue-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
  };

  const getTrendInfo = (change: number | null) => {
    if (change === null || change === 0)
      return { color: "text-muted-foreground", bg: "bg-muted", icon: Minus, label: "bez zmian" };
    const isPositive = change > 0;
    const isGood = wyzejLepiej ? isPositive : !isPositive;
    if (isGood)
      return { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/20", icon: ArrowUpRight, label: "wzrost" };
    return { color: "text-red-700 dark:text-red-400", bg: "bg-red-100 dark:bg-red-500/20", icon: ArrowDownRight, label: "spadek" };
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-2/3 mb-2" />
          <Skeleton className="h-5 w-1/3" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden border-red-200 dark:border-red-900">
        <CardContent className="p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">{tytul}</p>
          <p className="text-sm text-red-500">Brak połączenia z API</p>
        </CardContent>
      </Card>
    );
  }

  const trend = getTrendInfo(zmiana);
  const TrendIcon = trend.icon;

  return (
    <Card className="overflow-hidden group shadow-sm hover:shadow-md transition-shadow duration-200 border-zinc-200/60 dark:border-zinc-800">
      <CardContent className={`p-5 bg-gradient-to-br ${accentColors[accent]}`}>
        {/* Nagłówek z ikoną */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-1 pr-2">
            <p className="text-sm font-medium text-muted-foreground leading-tight">
              {tytul}
            </p>
            {tooltipText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help inline-flex items-center">
                    <Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                    {tooltipText}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {Icon && (
            <div className={`p-2 rounded-lg bg-background/80 backdrop-blur-sm ${iconColors[accent]}`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Wartość główna */}
        <div className="mb-2">
          <span className="text-3xl font-bold tracking-tight">
            {wartosc !== null ? formatNumber(wartosc) : "—"}
          </span>
          <span className="text-sm font-medium text-muted-foreground ml-1.5">
            {jednostka}
          </span>
        </div>

        {/* Trend i okres */}
        <div className="flex items-center gap-2">
          {zmiana !== null ? (
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${trend.bg} ${trend.color}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              {zmiana > 0 ? "+" : ""}{zmiana.toFixed(1)}%
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
              —
            </span>
          )}
          <span className="text-xs text-muted-foreground">{okres}</span>
        </div>
      </CardContent>
    </Card>
  );
}


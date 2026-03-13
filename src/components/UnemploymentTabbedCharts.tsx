/**
 * UnemploymentTabbedCharts — bezrobocie GUS i Eurostat na osobnych zakładkach.
 * Zakładki pionowe po lewej stronie. Kompaktowy tooltip.
 */

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowDown, ArrowUp, Info, TrendingDown } from "lucide-react";
import type { UnemploymentCompareResponse, UnemploymentDataPoint } from "@/types";

interface Props {
  data: UnemploymentCompareResponse | null;
  loading: boolean;
  error: string | null;
}

type TabKey = "eurostat" | "gus";

/** Konfiguracja każdej zakładki */
const tabConfig: Record<
  TabKey,
  {
    label: string;
    shortLabel: string;
    color: string;
    gradientId: string;
    description: string;
    tooltip: string;
    sourceLabel: string;
  }
> = {
  eurostat: {
    label: "Eurostat (ILO)",
    shortLabel: "ILO",
    color: "hsl(217, 91%, 60%)",
    gradientId: "euroGrad",
    description: "Stopa bezrobocia ILO/BAEL, sezonowo skorygowana",
    sourceLabel: "Eurostat · une_rt_m · BAEL/ILO",
    tooltip:
      "Stopa bezrobocia wg Badania Aktywności Ekonomicznej Ludności (BAEL), zharmonizowana przez Eurostat wg standardów ILO. Obejmuje osoby 15–74 lat aktywnie poszukujące pracy, niezależnie od rejestracji w urzędzie. Dane miesięczne, sezonowo skorygowane.",
  },
  gus: {
    label: "GUS (rejestrowane)",
    shortLabel: "GUS",
    color: "hsl(30, 90%, 50%)",
    gradientId: "gusGrad",
    description: "Stopa bezrobocia rejestrowanego",
    sourceLabel: "GUS BDL · bezrobocie rejestrowane (XII)",
    tooltip:
      "Stopa bezrobocia rejestrowanego w Polsce — odsetek osób zarejestrowanych jako bezrobotne w urzędach pracy w stosunku do ludności aktywnej zawodowo. Dane roczne z GUS, Bank Danych Lokalnych (stan na grudzień każdego roku).",
  },
};

function periodLabel(dp: UnemploymentDataPoint): string {
  if (dp.miesiac) return `${dp.miesiac.toString().padStart(2, "0")}/${dp.rok}`;
  return dp.rok.toString();
}

function computeStats(points: UnemploymentDataPoint[]) {
  if (!points.length) return null;

  const current = points[points.length - 1];
  let peak = points[0];
  let low = points[0];

  for (const p of points) {
    if (p.wartosc > peak.wartosc) peak = p;
    if (p.wartosc < low.wartosc) low = p;
  }

  return {
    current: { value: current.wartosc, label: periodLabel(current) },
    peak: { value: peak.wartosc, label: periodLabel(peak) },
    low: { value: low.wartosc, label: periodLabel(low) },
  };
}

/** Kompaktowy tooltip — mały, nie zasłania wykresu */
function ChartTooltip({
  active,
  payload,
  tab,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { label: string } }>;
  tab: TabKey;
}) {
  if (!active || !payload?.length) return null;
  const cfg = tabConfig[tab];
  return (
    <div className="rounded-md bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm px-2.5 py-1.5 text-xs shadow-md border border-zinc-200/80 dark:border-zinc-600/50">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {payload[0].value.toFixed(1)}%
        </span>
        <span className="text-zinc-400 text-[10px]">{payload[0].payload.label}</span>
      </div>
    </div>
  );
}

export function UnemploymentTabbedCharts({ data, loading, error }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("eurostat");

  const tabs: TabKey[] = ["eurostat", "gus"];

  const points = activeTab === "eurostat" ? data?.eurostat : data?.gus;
  const chartData =
    points?.map((dp) => ({
      label: periodLabel(dp),
      wartosc: dp.wartosc,
    })) ?? [];

  const stats = points ? computeStats(points) : null;
  const cfg = tabConfig[activeTab];

  if (loading) {
    return (
      <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800">
        <CardContent className="p-4">
          <Skeleton className="h-[380px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center h-[380px] text-muted-foreground">
            <TrendingDown className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">Nie udało się załadować danych</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800 overflow-hidden">
      <div className="flex">
        {/* ── Zakładki pionowe po lewej ── */}
        <div className="flex flex-col border-r border-zinc-200/60 dark:border-zinc-700/50 bg-zinc-50/50 dark:bg-zinc-900/50">
          {tabs.map((tab) => {
            const tcfg = tabConfig[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  relative flex flex-col items-center gap-1 px-3 py-4 text-[10px] font-medium transition-all duration-200 min-w-[56px]
                  ${isActive
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100/50 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/50"
                  }
                `}
              >
                {/* Aktywny wskaźnik po lewej */}
                {isActive && (
                  <div
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                    style={{ backgroundColor: tcfg.color }}
                  />
                )}
                <div
                  className={`w-3 h-3 rounded-full transition-opacity ${isActive ? "opacity-100" : "opacity-40"}`}
                  style={{ backgroundColor: tcfg.color }}
                />
                <span className="uppercase tracking-wider leading-none">{tcfg.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* ── Treść: nagłówek + wykres ── */}
        <div className="flex-1 min-w-0">
          {/* Nagłówek — źródło + statystyki */}
          <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-1">
            {/* Źródło z info tooltip */}
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                  Bezrobocie — {cfg.label}
                </p>
                <TooltipProvider>
                  <UiTooltip>
                    <TooltipTrigger className="cursor-help">
                      <Info className="h-3 w-3 text-zinc-400/60 hover:text-zinc-500 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs text-xs leading-relaxed">
                      {cfg.tooltip}
                    </TooltipContent>
                  </UiTooltip>
                </TooltipProvider>
              </div>
              <p className="text-[10px] text-zinc-400">{cfg.sourceLabel}</p>
            </div>

            {/* Statystyki — aktualna / peak / low */}
            {stats && (
              <div className="flex items-start gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider">Aktualna</p>
                  <p className="text-xl font-bold tracking-tight leading-tight" style={{ color: cfg.color }}>
                    {stats.current.value.toFixed(1)}%
                  </p>
                  <p className="text-[9px] text-zinc-400">{stats.current.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-end gap-0.5">
                    <ArrowUp className="h-2.5 w-2.5 text-red-400" />Peak
                  </p>
                  <p className="text-sm font-semibold tracking-tight leading-tight text-red-600 dark:text-red-400">
                    {stats.peak.value.toFixed(1)}%
                  </p>
                  <p className="text-[9px] text-zinc-400">{stats.peak.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-end gap-0.5">
                    <ArrowDown className="h-2.5 w-2.5 text-emerald-400" />Low
                  </p>
                  <p className="text-sm font-semibold tracking-tight leading-tight text-emerald-600 dark:text-emerald-400">
                    {stats.low.value.toFixed(1)}%
                  </p>
                  <p className="text-[9px] text-zinc-400">{stats.low.label}</p>
                </div>
              </div>
            )}
          </div>

          {/* Wykres */}
          <div className="px-2 pb-3">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[310px] text-muted-foreground text-sm">
                Brak danych do wyświetlenia
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={310}>
                <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -15 }}>
                  <defs>
                    <linearGradient id={cfg.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={cfg.color} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={cfg.color} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="none"
                    stroke="hsl(0, 0%, 90%)"
                    strokeOpacity={0.5}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "hsl(0,0%,60%)" }}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(0,0%,60%)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                    domain={["auto", "auto"]}
                    dx={-5}
                  />
                  <Tooltip
                    content={<ChartTooltip tab={activeTab} />}
                    cursor={{ stroke: "hsl(0,0%,80%)", strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="wartosc"
                    stroke={cfg.color}
                    strokeWidth={2}
                    fill={`url(#${cfg.gradientId})`}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: cfg.color,
                      strokeWidth: 2,
                      stroke: "white",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

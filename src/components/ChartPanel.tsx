/**
 * ChartPanel — pełnoekranowy layout: sidebar po lewej na całą wysokość,
 * wykres na środku. Bez kart KPI — tylko wykres.
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowDown, ArrowUp, BarChart3, Briefcase, Info, TrendingDown, Users } from "lucide-react";
import type {
  EmploymentHistoryResponse,
  TimeFilter,
  UnemploymentCompareResponse,
} from "@/types";
import { TimeFilter as TimeFilterControl } from "@/components/TimeFilter";
import { StatusFooter } from "@/components/StatusFooter";

// ─── Typy ───

type TabKey = "employment" | "eurostat" | "gus";

interface ChartPanelProps {
  employmentData: EmploymentHistoryResponse | null;
  employmentLoading: boolean;
  employmentError: string | null;
  unemploymentData: UnemploymentCompareResponse | null;
  unemploymentLoading: boolean;
  unemploymentError: string | null;
  timeFilter: TimeFilter;
  onTimeFilterChange: (f: TimeFilter) => void;
}

interface TabDef {
  key: TabKey;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  gradientId: string;
  unit: string;
  sourceLabel: string;
  tooltip: string;
}

// ─── Konfiguracja zakładek ───

const tabs: TabDef[] = [
  {
    key: "employment",
    label: "Zatrudnienie",
    subtitle: "Sektor przedsiębiorstw",
    icon: Users,
    color: "hsl(217, 91%, 60%)",
    gradientId: "grad_emp",
    unit: "tys. osób",
    sourceLabel: "GUS BDL · sektor przedsiębiorstw (>9 osób)",
    tooltip:
      "Przeciętne zatrudnienie w sektorze przedsiębiorstw zatrudniających powyżej 9 osób. Dane roczne z GUS (Bank Danych Lokalnych).",
  },
  {
    key: "eurostat",
    label: "Bezrobocie ILO",
    subtitle: "Eurostat · BAEL",
    icon: TrendingDown,
    color: "hsl(262, 80%, 60%)",
    gradientId: "grad_euro",
    unit: "%",
    sourceLabel: "Eurostat · une_rt_m · BAEL/ILO · miesięczne",
    tooltip:
      "Zharmonizowana stopa bezrobocia wg metodologii ILO (Badanie Aktywności Ekonomicznej Ludności). Dane miesięczne, sezonowo skorygowane. Obejmuje osoby 15–74 lat aktywnie poszukujące pracy.",
  },
  {
    key: "gus",
    label: "Bezrobocie GUS",
    subtitle: "Rejestrowane · roczne",
    icon: Briefcase,
    color: "hsl(30, 90%, 50%)",
    gradientId: "grad_gus",
    unit: "%",
    sourceLabel: "GUS BDL · bezrobocie rejestrowane (grudzień) · roczne",
    tooltip:
      "Stopa bezrobocia rejestrowanego w Polsce — odsetek osób zarejestrowanych jako bezrobotne w urzędach pracy. Dane roczne z GUS, Bank Danych Lokalnych (stan na grudzień).",
  },
];

// ─── Helpers ───

interface ChartPoint {
  label: string;
  value: number;
}

function buildChartData(
  tab: TabKey,
  empData: EmploymentHistoryResponse | null,
  unempData: UnemploymentCompareResponse | null
): ChartPoint[] {
  if (tab === "employment") {
    return (
      empData?.dane.map((d) => ({
        label: d.miesiac
          ? `${d.miesiac.toString().padStart(2, "0")}/${d.rok}`
          : d.rok.toString(),
        value: d.wartosc,
      })) ?? []
    );
  }
  const points = tab === "eurostat" ? unempData?.eurostat : unempData?.gus;
  return (
    points?.map((dp) => ({
      label: dp.miesiac
        ? `${dp.miesiac.toString().padStart(2, "0")}/${dp.rok}`
        : dp.rok.toString(),
      value: dp.wartosc,
    })) ?? []
  );
}

function computeStats(points: ChartPoint[]) {
  if (!points.length) return null;
  const current = points[points.length - 1];
  let peak = points[0];
  let low = points[0];
  for (const p of points) {
    if (p.value > peak.value) peak = p;
    if (p.value < low.value) low = p;
  }
  return { current, peak, low };
}

function formatVal(v: number, unit: string): string {
  if (unit === "%") return `${v.toFixed(1)}%`;
  return v.toLocaleString("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

// ─── Kompaktowy tooltip wykresu ───

function ChartTooltip({
  active,
  payload,
  tabDef,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { label: string } }>;
  tabDef: TabDef;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm px-2.5 py-1.5 text-xs shadow-md border border-zinc-200/80 dark:border-zinc-600/50">
      <div className="flex items-center gap-1.5">
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: tabDef.color }}
        />
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {formatVal(payload[0].value, tabDef.unit)}
        </span>
        <span className="text-zinc-400 text-[10px]">
          {tabDef.unit !== "%" && "tys. · "}
          {payload[0].payload.label}
        </span>
      </div>
    </div>
  );
}

// ─── Komponent główny ───

export function ChartPanel({
  employmentData,
  employmentLoading,
  employmentError,
  unemploymentData,
  unemploymentLoading,
  unemploymentError,
  timeFilter,
  onTimeFilterChange,
}: ChartPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("employment");

  const currentTabDef = tabs.find((t) => t.key === activeTab)!;

  const isLoading =
    activeTab === "employment" ? employmentLoading : unemploymentLoading;
  const error =
    activeTab === "employment" ? employmentError : unemploymentError;
  const chartData = buildChartData(activeTab, employmentData, unemploymentData);
  const stats = computeStats(chartData);
  const isHigherBetter = activeTab === "employment";

  return (
    <div className="flex w-full min-h-screen">
      {/* ══════ Sidebar ══════ */}
      <aside className="w-[220px] flex-shrink-0 bg-zinc-900 text-white flex flex-col">
        {/* Logo / tytuł */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5 mb-1">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <span className="text-[15px] font-bold tracking-tight">Rynek Pracy PL</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-tight">
            Monitoring zatrudnienia i bezrobocia
          </p>
        </div>

        {/* Nawigacja */}
        <nav className="flex-1 flex flex-col px-2">
          <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest px-3 mb-2">
            Wskaźniki
          </p>

          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;
            const tabData = buildChartData(tab.key, employmentData, unemploymentData);
            const latest = tabData.length ? tabData[tabData.length - 1] : null;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  relative flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg mb-0.5 transition-all duration-150
                  ${isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  }
                `}
              >
                {/* Pasek aktywny */}
                {isActive && (
                  <div
                    className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full"
                    style={{ backgroundColor: tab.color }}
                  />
                )}

                <TabIcon
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: isActive ? tab.color : undefined }}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium leading-tight truncate">
                    {tab.label}
                  </p>
                  <p className="text-[10px] text-zinc-500 leading-tight truncate">
                    {tab.subtitle}
                  </p>
                </div>

                {/* Aktualna wartość */}
                {latest && (
                  <span
                    className="text-[11px] font-semibold flex-shrink-0"
                    style={{ color: isActive ? tab.color : "inherit" }}
                  >
                    {formatVal(latest.value, tab.unit)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dół sidebara */}
        <div className="px-5 py-4 border-t border-zinc-800">
          <p className="text-[9px] text-zinc-600 leading-tight">
            Dane: GUS BDL · Eurostat
          </p>
          <p className="text-[9px] text-zinc-600 leading-tight">
            Auto-sync co 6h
          </p>
        </div>
      </aside>

      {/* ══════ Główna treść — wykres ══════ */}
      <main className="flex-1 min-w-0 flex flex-col bg-background">
        {/* Top bar — tytuł + filtr czasu */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-200/60 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              {currentTabDef.label}
            </h1>
            <TooltipProvider>
              <UiTooltip>
                <TooltipTrigger className="cursor-help">
                  <Info className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
                  {currentTabDef.tooltip}
                </TooltipContent>
              </UiTooltip>
            </TooltipProvider>
            <span className="text-[11px] text-zinc-400 ml-2">
              {currentTabDef.sourceLabel}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Statystyki inline — kompaktowe */}
            {!isLoading && !error && stats && (
              <div className="flex items-center gap-4 mr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-400 uppercase">Aktualna</span>
                  <span className="text-sm font-bold" style={{ color: currentTabDef.color }}>
                    {formatVal(stats.current.value, currentTabDef.unit)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowUp className={`h-3 w-3 ${isHigherBetter ? "text-emerald-500" : "text-red-500"}`} />
                  <span className={`text-xs font-semibold ${isHigherBetter ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {formatVal(stats.peak.value, currentTabDef.unit)}
                  </span>
                  <span className="text-[9px] text-zinc-400">{stats.peak.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowDown className={`h-3 w-3 ${isHigherBetter ? "text-red-500" : "text-emerald-500"}`} />
                  <span className={`text-xs font-semibold ${isHigherBetter ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {formatVal(stats.low.value, currentTabDef.unit)}
                  </span>
                  <span className="text-[9px] text-zinc-400">{stats.low.label}</span>
                </div>
              </div>
            )}
            <TimeFilterControl value={timeFilter} onChange={onTimeFilterChange} />
          </div>
        </header>

        {/* Wykres — cała pozostała przestrzeń */}
        <div className="flex-1 flex items-center justify-center p-6">
          {isLoading ? (
            <Skeleton className="w-full h-full rounded-lg max-h-[500px]" />
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <TrendingDown className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">Nie udało się załadować danych</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              Brak danych do wyświetlenia
            </div>
          ) : (
            <div className="w-full h-full max-h-[600px] min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id={currentTabDef.gradientId}
                      x1="0" y1="0" x2="0" y2="1"
                    >
                      <stop offset="0%" stopColor={currentTabDef.color} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={currentTabDef.color} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="none"
                    stroke="hsl(0,0%,90%)"
                    strokeOpacity={0.5}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "hsl(0,0%,55%)" }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(0,0%,55%)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) =>
                      currentTabDef.unit === "%"
                        ? `${v}%`
                        : `${(v / 1000).toFixed(1)}k`
                    }
                    domain={["auto", "auto"]}
                    dx={-5}
                  />
                  <Tooltip
                    content={<ChartTooltip tabDef={currentTabDef} />}
                    cursor={{ stroke: "hsl(0,0%,80%)", strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={currentTabDef.color}
                    strokeWidth={2.5}
                    fill={`url(#${currentTabDef.gradientId})`}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: currentTabDef.color,
                      strokeWidth: 2,
                      stroke: "white",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-4">
          <StatusFooter />
        </div>
      </main>
    </div>
  );
}


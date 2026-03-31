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
import { BarChart3, Briefcase, Info, TrendingDown, Users } from "lucide-react";
import type {
  EmploymentHistoryResponse,
  UnemploymentCompareResponse,
} from "@/types";
import { StatusFooter } from "@/components/StatusFooter";
import { VoivodeshipMap } from "@/components/VoivodeshipMap";
import { useVoivodeships } from "@/hooks/useApi";

// ─── Typy ───

type TabKey = "employment" | "eurostat" | "gus";

interface ChartPanelProps {
  employmentData: EmploymentHistoryResponse | null;
  employmentLoading: boolean;
  employmentError: string | null;
  unemploymentData: UnemploymentCompareResponse | null;
  unemploymentLoading: boolean;
  unemploymentError: string | null;
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
    sourceLabel: "Przeciętne zatrudnienie w sektorze przedsiębiorstw (≥10 pracujących) · dane miesięczne · GUS",
    tooltip:
      "Wykres przedstawia przeciętne zatrudnienie w sektorze przedsiębiorstw o liczbie pracujących 10 i więcej osób w Polsce. Obejmuje osoby zatrudnione na podstawie stosunku pracy, w przeliczeniu na pełne etaty. Wartości w tysiącach etatów. Dane miesięczne od 2010 roku. Źródło: Główny Urząd Statystyczny, Bank Danych Lokalnych.",
  },
  {
    key: "eurostat",
    label: "Bezrobocie ILO",
    subtitle: "Eurostat · BAEL",
    icon: TrendingDown,
    color: "hsl(262, 80%, 60%)",
    gradientId: "grad_euro",
    unit: "%",
    sourceLabel: "Stopa bezrobocia wg BAEL · sezonowo skorygowana · dane miesięczne · Eurostat",
    tooltip:
      "Wykres przedstawia zharmonizowaną stopę bezrobocia wg metodologii Międzynarodowej Organizacji Pracy (ILO), obliczaną na podstawie Badania Aktywności Ekonomicznej Ludności (BAEL). Obejmuje osoby w wieku 15–74 lat aktywnie poszukujące pracy, niezależnie od rejestracji w urzędzie. Dane miesięczne, sezonowo skorygowane. Źródło: Eurostat.",
  },
  {
    key: "gus",
    label: "Bezrobocie GUS",
    subtitle: "Rejestrowane · BDL",
    icon: Briefcase,
    color: "hsl(30, 90%, 50%)",
    gradientId: "grad_gus",
    unit: "%",
    sourceLabel: "Stopa bezrobocia rejestrowanego · dane miesięczne od 2015 · GUS BDL",
    tooltip:
      "Wykres przedstawia stopę bezrobocia rejestrowanego w Polsce — odsetek osób zarejestrowanych jako bezrobotne w powiatowych urzędach pracy w stosunku do ludności aktywnej zawodowo. Dane miesięczne od 2015 roku z GUS BDL. Źródło: Główny Urząd Statystyczny, Bank Danych Lokalnych.",
  },
];

// ─── Helpers ───

interface ChartPoint {
  label: string;
  value: number;
  liczba_bezrobotnych?: number;
}

function buildChartData(
  tab: TabKey,
  empData: EmploymentHistoryResponse | null,
  unempData: UnemploymentCompareResponse | null,
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
      ...(dp.liczba_bezrobotnych != null ? { liczba_bezrobotnych: dp.liczba_bezrobotnych } : {}),
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
  payload?: Array<{ value: number; payload: ChartPoint }>;
  tabDef: TabDef;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
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
          {point.label}
        </span>
      </div>
      {point.liczba_bezrobotnych != null && (
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-amber-400" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {point.liczba_bezrobotnych.toLocaleString("pl-PL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} tys.
          </span>
          <span className="text-zinc-400 text-[10px]">bezrobotnych</span>
        </div>
      )}
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
}: ChartPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("employment");
  const voivodeships = useVoivodeships();

  const currentTabDef = tabs.find((t) => t.key === activeTab)!;

  const isLoading =
    activeTab === "employment" ? employmentLoading : unemploymentLoading;
  const error =
    activeTab === "employment" ? employmentError : unemploymentError;
  const chartData = buildChartData(activeTab, employmentData, unemploymentData);
  const stats = computeStats(chartData);

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

      {/* ══════ Główna treść ══════ */}
      <main className="flex-1 min-w-0 flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
        {/* ── Top bar ── */}
        <header className="px-7 py-5">
          <div className="flex items-center justify-between gap-6">
            {/* Lewa: tytuł + źródło */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                style={{ backgroundColor: `${currentTabDef.color}12` }}
              >
                <currentTabDef.icon className="h-[18px] w-[18px]" style={{ color: currentTabDef.color }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                    {currentTabDef.label}
                  </h1>
                  <TooltipProvider>
                    <UiTooltip>
                      <TooltipTrigger className="cursor-help">
                        <Info className="h-3.5 w-3.5 text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
                        {currentTabDef.tooltip}
                      </TooltipContent>
                    </UiTooltip>
                  </TooltipProvider>
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-tight mt-0.5 truncate">
                  {currentTabDef.sourceLabel}
                </p>
              </div>
            </div>

            {/* Prawa: Live badge + metryki */}
            {!isLoading && !error && stats && (
              <div className="flex items-center gap-4 flex-shrink-0">
                {/* LIVE badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>

                {/* Separator */}
                <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />

                {/* Wartość główna */}
                <div className="text-right">
                  <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider leading-none mb-1">
                    Aktualna
                  </p>
                  <p
                    className="text-lg font-bold tracking-tight leading-none"
                    style={{ color: currentTabDef.color }}
                  >
                    {formatVal(stats.current.value, currentTabDef.unit)}
                  </p>
                </div>

                {/* Liczba bezrobotnych (jeśli dostępna) */}
                {stats.current.liczba_bezrobotnych != null && (
                  <>
                    <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
                    <div className="text-right">
                      <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider leading-none mb-1">
                        Bezrobotni
                      </p>
                      <p className="text-lg font-bold tracking-tight leading-none text-amber-500 dark:text-amber-400">
                        {stats.current.liczba_bezrobotnych.toLocaleString("pl-PL", { maximumFractionDigits: 0 })} tys.
                      </p>
                    </div>
                  </>
                )}

                {/* Separator + data */}
                <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
                <div className="text-right">
                  <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider leading-none mb-1">
                    Okres
                  </p>
                  <p className="text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 tracking-tight leading-none">
                    {stats.current.label}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Karta wykresu ── */}
        <div className={`flex flex-col mx-5 ${activeTab === "gus" ? "mb-4" : "mb-5"} rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-sm overflow-hidden`}>
          <div className={`${activeTab === "gus" ? "h-[400px]" : "h-[calc(100vh-180px)] min-h-[400px]"} px-4 pt-5 pb-5`}>
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-lg" />
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <TrendingDown className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">Nie udało się załadować danych</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Brak danych do wyświetlenia
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 16, bottom: 4, left: -4 }}
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
                    stroke="hsl(0,0%,92%)"
                    strokeOpacity={0.6}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "hsl(0,0%,58%)" }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    tickFormatter={(label: string) => {
                      // Show only the year part when it's January (01/) or a plain year
                      if (/^01\/\d{4}$/.test(label)) return label.slice(3);
                      if (/^\d{4}$/.test(label)) return label;
                      return "";
                    }}
                    interval={0}
                    ticks={
                      chartData
                        .map((d) => d.label)
                        .filter((l) => /^01\/\d{4}$/.test(l) || /^\d{4}$/.test(l))
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(0,0%,58%)" }}
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
                    cursor={{ stroke: "hsl(0,0%,82%)", strokeDasharray: "4 4" }}
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
            )}
          </div>
        </div>

        {/* ── Mapa województw — widoczna tylko w zakładce GUS ── */}
        {activeTab === "gus" && (
          <div className="mx-5 mb-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-sm p-5">
            <VoivodeshipMap
              data={voivodeships.data}
              loading={voivodeships.loading}
              error={voivodeships.error}
            />
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-4">
          <StatusFooter />
        </div>
      </main>
    </div>
  );
}


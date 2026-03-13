/**
 * UnemploymentCompareChart — porównanie bezrobocia GUS vs Eurostat
 * w stylu trueup.io: czyste linie, area fill, tooltipy z wyjaśnieniami.
 */

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, TrendingDown } from "lucide-react";
import type { UnemploymentCompareResponse, UnemploymentDataPoint } from "@/types";

interface Props {
  data: UnemploymentCompareResponse | null;
  loading: boolean;
  error: string | null;
}

function periodLabel(dp: UnemploymentDataPoint): string {
  if (dp.miesiac) return `${dp.miesiac.toString().padStart(2, "0")}/${dp.rok}`;
  return dp.rok.toString();
}

function mergeData(gus: UnemploymentDataPoint[], eurostat: UnemploymentDataPoint[]) {
  const map = new Map<string, { label: string; gus?: number; eurostat?: number }>();
  for (const dp of gus) {
    const key = `${dp.rok}-${String(dp.miesiac ?? 0).padStart(2, "0")}`;
    map.set(key, { ...map.get(key), label: periodLabel(dp), gus: dp.wartosc });
  }
  for (const dp of eurostat) {
    const key = `${dp.rok}-${String(dp.miesiac ?? 0).padStart(2, "0")}`;
    map.set(key, { ...map.get(key), label: periodLabel(dp), eurostat: dp.wartosc });
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}

/** Tooltip wykresu z opisem obu serii */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; color: string; name: string; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const descriptions: Record<string, string> = {
    eurostat: "Zharmonizowana stopa bezrobocia (ILO/BAEL), sezonowo skorygowana",
    gus: "Stopa bezrobocia rejestrowanego — osoby w urzędach pracy",
  };

  return (
    <div className="rounded-lg bg-white dark:bg-zinc-900 px-4 py-3 text-sm shadow-lg border border-zinc-200 dark:border-zinc-700 min-w-[220px]">
      <p className="text-[11px] font-medium text-zinc-500 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="mb-1.5 last:mb-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-zinc-600 dark:text-zinc-400 text-[12px]">{p.name}</span>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{p.value?.toFixed(1) ?? "—"}%</span>
          </div>
          <p className="text-[10px] text-zinc-400 ml-[18px] leading-tight">{descriptions[p.dataKey]}</p>
        </div>
      ))}
    </div>
  );
}

/** Opisy źródeł danych — wyświetlane po najechaniu na legendę */
const legendTooltips: Record<string, string> = {
  "Eurostat (ILO/BAEL)":
    "Zharmonizowana stopa bezrobocia wg metodologii Międzynarodowej Organizacji Pracy (ILO). Badanie Aktywności Ekonomicznej Ludności (BAEL) — dane miesięczne, sezonowo skorygowane. Obejmuje osoby aktywnie poszukujące pracy, niezależnie od rejestracji w urzędzie.",
  "GUS (rejestrowane)":
    "Stopa bezrobocia rejestrowanego w Polsce — odsetek osób zarejestrowanych jako bezrobotne w stosunku do ludności aktywnej zawodowo. Dane roczne z GUS, Bank Danych Lokalnych (grudzień).",
};

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null;
  return (
    <div className="flex items-center justify-center gap-6 mt-3">
      {payload.map((entry) => {
        const tip = legendTooltips[entry.value];
        return (
          <div key={entry.value} className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <div className="w-3 h-[3px] rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.value}</span>
            {tip && (
              <TooltipProvider>
                <UiTooltip>
                  <TooltipTrigger className="cursor-help inline-flex items-center">
                    <Info className="h-3 w-3 text-zinc-400/60 hover:text-zinc-500 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                    {tip}
                  </TooltipContent>
                </UiTooltip>
              </TooltipProvider>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function UnemploymentCompareChart({ data, loading, error }: Props) {
  const title = "Bezrobocie — GUS vs Eurostat";

  if (loading) {
    return (
      <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-[15px] font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-[15px] font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[320px] text-muted-foreground">
            <TrendingDown className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">Nie udało się załadować danych</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data ? mergeData(data.gus, data.eurostat) : [];

  return (
    <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
            {title}
            <TooltipProvider>
              <UiTooltip>
                <TooltipTrigger className="cursor-help">
                  <Info className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm text-xs leading-relaxed">
                  <strong>Dlaczego dwie serie?</strong> GUS mierzy bezrobocie rejestrowane (osoby zarejestrowane w urzędach pracy),
                  a Eurostat — bezrobocie wg badania BAEL/ILO (osoby aktywnie szukające pracy, niezależnie od rejestracji).
                  Różnice wynikają z odmiennej metodologii.
                </TooltipContent>
              </UiTooltip>
            </TooltipProvider>
          </CardTitle>
          {/* Aktualne wartości obu serii */}
          {data && (
            <div className="flex items-center gap-3">
              {data.eurostat_aktualna != null && (
                <span className="text-lg font-bold tracking-tight text-blue-600 dark:text-blue-400">
                  {data.eurostat_aktualna.toFixed(1)}%
                  <span className="text-[10px] font-normal text-zinc-400 ml-1">ILO</span>
                </span>
              )}
              {data.gus_aktualna != null && (
                <span className="text-lg font-bold tracking-tight text-amber-600 dark:text-amber-400">
                  {data.gus_aktualna.toFixed(1)}%
                  <span className="text-[10px] font-normal text-zinc-400 ml-1">GUS</span>
                </span>
              )}
            </div>
          )}
        </div>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          Stopa bezrobocia rejestrowanego vs stopa ILO · Źródła: GUS BDL, Eurostat
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[320px] text-muted-foreground text-sm">
            Brak danych do wyświetlenia
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
              <defs>
                <linearGradient id="euroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.01} />
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
                tick={{ fontSize: 11, fill: "hsl(0,0%,60%)" }}
                tickLine={false}
                axisLine={false}
                dy={10}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(0,0%,60%)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}%`}
                domain={["auto", "auto"]}
                dx={-5}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(0,0%,80%)", strokeDasharray: "4 4" }} />
              <Legend content={<CustomLegend />} />
              {/* Eurostat — area fill + linia (jak trueup.io) */}
              <Area
                type="monotone"
                dataKey="eurostat"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                fill="url(#euroGradient)"
                dot={false}
                activeDot={{ r: 5, fill: "hsl(217, 91%, 60%)", strokeWidth: 2, stroke: "white" }}
                name="Eurostat (ILO/BAEL)"
                connectNulls
              />
              {/* GUS — linia przerywana z kropkami */}
              <Line
                type="monotone"
                dataKey="gus"
                stroke="hsl(30, 90%, 50%)"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ r: 3, fill: "hsl(30, 90%, 50%)", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "hsl(30, 90%, 50%)", strokeWidth: 2, stroke: "white" }}
                name="GUS (rejestrowane)"
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

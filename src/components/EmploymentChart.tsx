/**
 * EmploymentChart — wykres zatrudnienia w stylu trueup.io:
 * czysta area z gładkim gradientem, minimalistyczna siatka, czytelne tooltipy.
 * Nagłówek: aktualna wartość + peak + low.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowDown, ArrowUp, Info, Users } from "lucide-react";
import type { EmploymentHistoryResponse } from "@/types";

interface EmploymentChartProps {
  data: EmploymentHistoryResponse | null;
  loading: boolean;
  error: string | null;
}

function formatLabel(rok: number, miesiac: number | null): string {
  if (miesiac) return `${miesiac.toString().padStart(2, "0")}/${rok}`;
  return rok.toString();
}

function formatValue(v: number): string {
  return v.toLocaleString("pl-PL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Kompaktowy tooltip — mały, nie zasłania wykresu */
function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { label: string } }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm px-2.5 py-1.5 text-xs shadow-md border border-zinc-200/80 dark:border-zinc-600/50">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-blue-500" />
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {formatValue(payload[0].value)}
        </span>
        <span className="text-zinc-400 text-[10px]">tys. · {payload[0].payload.label}</span>
      </div>
    </div>
  );
}

export function EmploymentChart({ data, loading, error }: EmploymentChartProps) {
  const title = "Zatrudnienie w przedsiębiorstwach";

  if (loading) {
    return (
      <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800">
        <CardHeader className="pb-2">
          <p className="text-[15px] font-semibold">{title}</p>
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
          <p className="text-[15px] font-semibold">{title}</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[320px] text-muted-foreground">
            <Users className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">Nie udało się załadować danych</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData =
    data?.dane.map((d) => ({
      label: formatLabel(d.rok, d.miesiac),
      wartosc: d.wartosc,
    })) ?? [];

  // Oblicz statystyki
  let current: { value: number; label: string } | null = null;
  let peak: { value: number; label: string } | null = null;
  let low: { value: number; label: string } | null = null;

  if (chartData.length > 0) {
    current = { value: chartData[chartData.length - 1].wartosc, label: chartData[chartData.length - 1].label };
    peak = { ...current };
    low = { ...current };
    for (const d of chartData) {
      if (d.wartosc > peak.value) peak = { value: d.wartosc, label: d.label };
      if (d.wartosc < low.value) low = { value: d.wartosc, label: d.label };
    }
  }

  return (
    <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800">
      <CardHeader className="pb-1">
        <div className="flex items-start justify-between gap-4">
          {/* Tytuł + opis */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-[15px] font-semibold">{title}</p>
              <TooltipProvider>
                <UiTooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                    Przeciętne zatrudnienie w sektorze przedsiębiorstw zatrudniających powyżej 9 osób.
                    Dane roczne z GUS (Bank Danych Lokalnych).
                  </TooltipContent>
                </UiTooltip>
              </TooltipProvider>
            </div>
            <p className="text-[11px] text-zinc-400">
              Sektor przedsiębiorstw (&gt;9 osób) · Źródło: GUS BDL
            </p>
          </div>

          {/* Statystyki — Aktualna / Peak / Low */}
          {current && peak && low && (
            <div className="flex items-start gap-5 flex-shrink-0">
              <div className="text-right">
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-0.5">Aktualna</p>
                <p className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                  {formatValue(current.value)}
                </p>
                <p className="text-[10px] text-zinc-400">{current.label}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-0.5 flex items-center justify-end gap-0.5">
                  <ArrowUp className="h-3 w-3 text-emerald-400" />
                  Peak
                </p>
                <p className="text-lg font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {formatValue(peak.value)}
                </p>
                <p className="text-[10px] text-zinc-400">{peak.label}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-0.5 flex items-center justify-end gap-0.5">
                  <ArrowDown className="h-3 w-3 text-red-400" />
                  Low
                </p>
                <p className="text-lg font-semibold tracking-tight text-red-600 dark:text-red-400">
                  {formatValue(low.value)}
                </p>
                <p className="text-[10px] text-zinc-400">{low.label}</p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[320px] text-muted-foreground text-sm">
            Brak danych do wyświetlenia
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
              <defs>
                <linearGradient id="empGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.20} />
                  <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.02} />
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
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(0,0%,60%)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
                domain={["dataMin - 200", "dataMax + 200"]}
                dx={-5}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(0,0%,80%)", strokeDasharray: "4 4" }} />
              <Area
                type="monotone"
                dataKey="wartosc"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                fill="url(#empGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "hsl(217, 91%, 60%)",
                  strokeWidth: 2,
                  stroke: "white",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

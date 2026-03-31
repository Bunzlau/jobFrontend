/**
 * StatusFooter — nowoczesna stopka z info o synchronizacji i źródłach danych.
 */

import { CheckCircle2, Clock, Database, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStatus } from "@/hooks/useApi";

function formatDate(iso: string | null): string {
  if (!iso) return "nigdy";
  try {
    return new Date(iso).toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function StatusFooter() {
  const { data, loading } = useStatus();

  return (
    <footer className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {/* Status sync */}
        <div className="flex items-center gap-1.5">
          {loading ? (
            <RefreshCw className="h-3.5 w-3.5" style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          )}
          <span>
            Sync: {loading ? "trwa…" : formatDate(data?.ostatnia_synchronizacja ?? null)}
          </span>
        </div>

        {/* Ilość rekordów */}
        {data && (
          <>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />
              <span>
                {data.liczba_rekordow_zatrudnienie + data.liczba_rekordow_bezrobocie + data.liczba_rekordow_wakaty} rekordów
              </span>
            </div>

            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" />

            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Auto-sync co 6h</span>
            </div>
          </>
        )}

        {/* Źródła */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span>Źródła:</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">GUS BDL</Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">Eurostat</Badge>
        </div>
      </div>
    </footer>
  );
}

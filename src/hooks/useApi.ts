/**
 * Hooki do pobierania danych z API.
 * Prosty mechanizm z useState + useEffect (bez React Query dla MVP).
 */

import { useCallback, useEffect, useState } from "react";
import {
  fetchEmploymentCurrent,
  fetchEmploymentHistory,
  fetchGusHistorical,
  fetchStatus,
  fetchUnemploymentCompare,
  fetchVacanciesCurrent,
} from "@/api/client";
import type {
  EmploymentCurrentResponse,
  EmploymentHistoryResponse,
  GusHistoricalResponse,
  StatusResponse,
  TimeFilter,
  UnemploymentCompareResponse,
  VacancyCurrentResponse,
} from "@/types";

// ──────────────────────────────────────────────
// Generyczny hook do fetcha
// ──────────────────────────────────────────────

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Nieznany błąd połączenia";
      setError(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}

// ──────────────────────────────────────────────
// Hooki dla poszczególnych endpointów
// ──────────────────────────────────────────────

export function useEmploymentCurrent(): UseApiResult<EmploymentCurrentResponse> {
  return useApi(() => fetchEmploymentCurrent());
}

export function useEmploymentHistory(
  filter: TimeFilter
): UseApiResult<EmploymentHistoryResponse> {
  return useApi(() => fetchEmploymentHistory(filter), [filter]);
}

export function useUnemploymentCompare(
  filter: TimeFilter
): UseApiResult<UnemploymentCompareResponse> {
  return useApi(() => fetchUnemploymentCompare(filter), [filter]);
}

export function useVacanciesCurrent(): UseApiResult<VacancyCurrentResponse> {
  return useApi(() => fetchVacanciesCurrent());
}

export function useStatus(): UseApiResult<StatusResponse> {
  return useApi(() => fetchStatus());
}

export function useGusHistorical(): UseApiResult<GusHistoricalResponse> {
  return useApi(() => fetchGusHistorical());
}


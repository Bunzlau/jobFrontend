/**
 * Klient API — komunikacja z backendem FastAPI.
 */

import axios from "axios";
import type {
  EmploymentCurrentResponse,
  EmploymentHistoryResponse,
  GusHistoricalResponse,
  StatusResponse,
  TimeFilter,
  UnemploymentCompareResponse,
  VacancyCurrentResponse,
} from "@/types";

// Bazowy URL backendu
const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 15000,
});

/**
 * Konwertuje filtr czasu na parametry zapytania.
 */
function timeFilterToParams(filter: TimeFilter): Record<string, number> {
  switch (filter) {
    case "12m":
      return { years: 1 };
    case "3y":
      return { years: 3 };
    case "all":
      return { years: 20 };
  }
}

function timeFilterToMonths(filter: TimeFilter): number {
  switch (filter) {
    case "12m":
      return 12;
    case "3y":
      return 36;
    case "all":
      return 240;
  }
}

// ──────────────────────────────────────────────
// Zatrudnienie
// ──────────────────────────────────────────────

export async function fetchEmploymentCurrent(): Promise<EmploymentCurrentResponse> {
  const { data } = await api.get<EmploymentCurrentResponse>(
    "/api/employment/enterprises/current"
  );
  return data;
}

export async function fetchEmploymentHistory(
  filter: TimeFilter = "3y"
): Promise<EmploymentHistoryResponse> {
  const params = timeFilterToParams(filter);
  const { data } = await api.get<EmploymentHistoryResponse>(
    "/api/employment/enterprises/history",
    { params }
  );
  return data;
}

// ──────────────────────────────────────────────
// Bezrobocie
// ──────────────────────────────────────────────

export async function fetchUnemploymentCompare(
  filter: TimeFilter = "3y"
): Promise<UnemploymentCompareResponse> {
  const months = timeFilterToMonths(filter);
  const { data } = await api.get<UnemploymentCompareResponse>(
    "/api/unemployment/compare",
    { params: { months } }
  );
  return data;
}

// ──────────────────────────────────────────────
// Wakaty
// ──────────────────────────────────────────────

export async function fetchVacanciesCurrent(): Promise<VacancyCurrentResponse> {
  const { data } = await api.get<VacancyCurrentResponse>(
    "/api/vacancies/current"
  );
  return data;
}

// ──────────────────────────────────────────────
// Status
// ──────────────────────────────────────────────

export async function fetchStatus(): Promise<StatusResponse> {
  const { data } = await api.get<StatusResponse>("/api/status");
  return data;
}

// ──────────────────────────────────────────────
// Dane historyczne GUS (od 1995)
// ──────────────────────────────────────────────

export async function fetchGusHistorical(
  fromYear = 1995,
  toYear?: number
): Promise<GusHistoricalResponse> {
  const params: Record<string, number> = { from_year: fromYear };
  if (toYear) params.to_year = toYear;
  const { data } = await api.get<GusHistoricalResponse>(
    "/api/gus/historical",
    { params }
  );
  return data;
}


/**
 * Klient API — komunikacja z backendem FastAPI.
 */

import axios from "axios";
import type {
  ConstructionHistoryResponse,
  DemographicsVoivResponse,
  EmploymentCurrentResponse,
  EmploymentHistoryResponse,
  GusHistoricalResponse,
  GusMonthlyResponse,
  GusVoivodeshipResponse,
  InflationHistoryResponse,
  ProfitabilityHistoryResponse,
  RealWagesResponse,
  StatusResponse,
  TimeFilter,
  UnemploymentCompareResponse,
  VacancyCurrentResponse,
  WageHistoryResponse,
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

// ──────────────────────────────────────────────
// Dane miesięczne GUS (z XLSX)
// ──────────────────────────────────────────────

export async function fetchGusMonthly(): Promise<GusMonthlyResponse> {
  const { data } = await api.get<GusMonthlyResponse>("/api/gus/monthly");
  return data;
}

export async function fetchVoivodeships(): Promise<GusVoivodeshipResponse> {
  const { data } = await api.get<GusVoivodeshipResponse>("/api/gus/monthly/voivodeships");
  return data;
}

// ──────────────────────────────────────────────
// Wynagrodzenia
// ──────────────────────────────────────────────

export async function fetchWagesHistory(
  filter: TimeFilter = "3y"
): Promise<WageHistoryResponse> {
  const params = timeFilterToParams(filter);
  const { data } = await api.get<WageHistoryResponse>(
    "/api/wages/history",
    { params }
  );
  return data;
}

export async function fetchRealWages(
  filter: TimeFilter = "3y"
): Promise<RealWagesResponse> {
  const params = timeFilterToParams(filter);
  const { data } = await api.get<RealWagesResponse>(
    "/api/wages/real-wages",
    { params }
  );
  return data;
}

// ──────────────────────────────────────────────
// Inflacja
// ──────────────────────────────────────────────

export async function fetchInflationHistory(
  filter: TimeFilter = "3y"
): Promise<InflationHistoryResponse> {
  const params = timeFilterToParams(filter);
  const { data } = await api.get<InflationHistoryResponse>(
    "/api/inflation/history",
    { params }
  );
  return data;
}

// ──────────────────────────────────────────────
// Budownictwo
// ──────────────────────────────────────────────

export async function fetchConstructionHistory(
  filter: TimeFilter = "3y"
): Promise<ConstructionHistoryResponse> {
  const params = timeFilterToParams(filter);
  const { data } = await api.get<ConstructionHistoryResponse>(
    "/api/construction/history",
    { params }
  );
  return data;
}

// ──────────────────────────────────────────────
// Rentowność
// ──────────────────────────────────────────────

export async function fetchProfitabilityHistory(
  filter: TimeFilter = "3y"
): Promise<ProfitabilityHistoryResponse> {
  const params = timeFilterToParams(filter);
  const { data } = await api.get<ProfitabilityHistoryResponse>(
    "/api/profitability/history",
    { params }
  );
  return data;
}

// ──────────────────────────────────────────────
// Demografia
// ──────────────────────────────────────────────

export async function fetchDemographicsVoivodeships(
  year?: number
): Promise<DemographicsVoivResponse> {
  const params: Record<string, number> = {};
  if (year) params.year = year;
  const { data } = await api.get<DemographicsVoivResponse>(
    "/api/demographics/voivodeships",
    { params }
  );
  return data;
}


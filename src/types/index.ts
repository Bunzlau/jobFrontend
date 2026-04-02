/**
 * Typy TypeScript — odpowiadające schematom backendu.
 */

// ──────────────────────────────────────────────
// Zatrudnienie w sektorze przedsiębiorstw
// ──────────────────────────────────────────────

export interface EmploymentDataPoint {
  rok: number;
  miesiac: number | null;
  wartosc: number;
  jednostka: string;
}

export interface EmploymentCurrentResponse {
  aktualna_wartosc: number;
  jednostka: string;
  okres: string;
  zmiana_mm: number | null;
  zmiana_rr: number | null;
  ostatnia_aktualizacja: string | null;
}

export interface EmploymentHistoryResponse {
  dane: EmploymentDataPoint[];
  liczba_rekordow: number;
}

// ──────────────────────────────────────────────
// Bezrobocie — porównanie GUS vs Eurostat
// ──────────────────────────────────────────────

export interface UnemploymentDataPoint {
  rok: number;
  miesiac: number | null;
  wartosc: number;
  jednostka: string;
  liczba_bezrobotnych: number | null;
}

export interface UnemploymentCompareResponse {
  gus: UnemploymentDataPoint[];
  eurostat: UnemploymentDataPoint[];
  gus_aktualna: number | null;
  eurostat_aktualna: number | null;
}

// ──────────────────────────────────────────────
// Wakaty
// ──────────────────────────────────────────────

export interface VacancyCurrentResponse {
  aktualna_wartosc: number;
  jednostka: string;
  okres: string;
  zmiana_mm: number | null;
  ostatnia_aktualizacja: string | null;
}

// ──────────────────────────────────────────────
// Status systemu
// ──────────────────────────────────────────────

export interface FetchLogEntry {
  zrodlo: string;
  status: string;
  liczba_rekordow: number;
  blad: string | null;
  czas: string | null;
}

export interface StatusResponse {
  status: string;
  ostatnia_synchronizacja: string | null;
  liczba_rekordow_zatrudnienie: number;
  liczba_rekordow_bezrobocie: number;
  liczba_rekordow_wakaty: number;
  ostatnie_logi: FetchLogEntry[];
}

// ──────────────────────────────────────────────
// Filtr czasu
// ──────────────────────────────────────────────

export type TimeFilter = "12m" | "3y" | "all";

// ──────────────────────────────────────────────
// Dane historyczne GUS (od 1995)
// ──────────────────────────────────────────────

export interface GusHistoricalDataPoint {
  year: number;
  unemployment_rate_registered: number | null;
  unemployed_persons: number | null;
  employed_persons: number | null;
}

export interface GusHistoricalResponse {
  dane: GusHistoricalDataPoint[];
  liczba_rekordow: number;
  najstarszy_rok: number | null;
  najnowszy_rok: number | null;
  ostatnia_aktualizacja: string | null;
}

/** Wskaźnik wybrany przez użytkownika na wykresie GUS */
export type GusIndicator =
  | "unemployment_rate_registered"
  | "unemployed_persons"
  | "employed_persons";

// ──────────────────────────────────────────────
// Dane miesięczne GUS z XLSX
// ──────────────────────────────────────────────

export interface GusMonthlyDataPoint {
  rok: number;
  miesiac: number;
  stopa_bezrobocia: number;
  liczba_bezrobotnych: number;
}

export interface GusMonthlyResponse {
  dane: GusMonthlyDataPoint[];
  liczba_rekordow: number;
}

// ──────────────────────────────────────────────
// Dane wg województw (z XLSX)
// ──────────────────────────────────────────────

export interface GusVoivodeshipDataPoint {
  kod: string;
  nazwa: string;
  stopa_bezrobocia: number;
  liczba_bezrobotnych: number;
}

export interface GusVoivodeshipResponse {
  rok: number;
  miesiac: number;
  wojewodztwa: GusVoivodeshipDataPoint[];
}

// ──────────────────────────────────────────────
// Wynagrodzenia
// ──────────────────────────────────────────────

export interface WageDataPoint {
  rok: number;
  miesiac: number | null;
  wartosc: number;
  jednostka: string;
  is_estimate: boolean;
}

export interface WageHistoryResponse {
  dane: WageDataPoint[];
  liczba_rekordow: number;
}

// ──────────────────────────────────────────────
// Nożyce realnych płac
// ──────────────────────────────────────────────

export interface RealWagesDataPoint {
  rok: number;
  miesiac: number | null;
  wynagrodzenie: number | null;
  cpi: number | null;
  roznica_realna: number | null;
  is_estimate: boolean;
}

export interface RealWagesResponse {
  dane: RealWagesDataPoint[];
  liczba_rekordow: number;
}

// ──────────────────────────────────────────────
// Inflacja (CPI)
// ──────────────────────────────────────────────

export interface InflationDataPoint {
  rok: number;
  miesiac: number | null;
  cpi: number;
  is_estimate: boolean;
}

export interface InflationHistoryResponse {
  dane: InflationDataPoint[];
  liczba_rekordow: number;
}

// ──────────────────────────────────────────────
// Budownictwo
// ──────────────────────────────────────────────

export interface ConstructionDataPoint {
  rok: number;
  miesiac: number | null;
  pozwolenia: number | null;
  rozpoczete: number | null;
  is_estimate: boolean;
}

export interface ConstructionHistoryResponse {
  dane: ConstructionDataPoint[];
  liczba_rekordow: number;
}

// ──────────────────────────────────────────────
// Rentowność firm
// ──────────────────────────────────────────────

export interface ProfitabilityDataPoint {
  rok: number;
  kwartal: number | null;
  wartosc: number;
  jednostka: string;
  is_estimate: boolean;
}

export interface ProfitabilityHistoryResponse {
  dane: ProfitabilityDataPoint[];
  liczba_rekordow: number;
}

// ──────────────────────────────────────────────
// Demografia wg województw
// ──────────────────────────────────────────────

export interface DemographicsVoivDataPoint {
  kod: string;
  nazwa: string;
  wiek_produkcyjny: number | null;
  wiek_poprodukcyjny: number | null;
  indeks_starzenia: number | null;
}

export interface DemographicsVoivResponse {
  rok: number;
  wojewodztwa: DemographicsVoivDataPoint[];
}


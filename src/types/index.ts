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


// Core data model for the Uni Grade Tracker app.
// Everything here is persisted to localStorage (see src/lib/storage.ts).

export interface Course {
  id: string;
  name: string;
  /** Grade out of 30, or 31 to represent "30 e lode" (honors). `null` = not yet taken. */
  grade: number | null;
  /** Credits (CFU) this course is worth. */
  credits: number;
  /** ISO date string (YYYY-MM-DD) the exam was taken. `null` if not taken yet. */
  date: string | null;
  /** Optional grouping, e.g. "Year 2 - Fall" or "Summer session 2025". */
  semester?: string;
  /** Optional subject area, e.g. "Math", "Humanities" - used for best/worst stats. */
  category?: string;
  /** Optional free-form notes (a small safe subset of Markdown is supported). */
  notes?: string;
}

export interface UpcomingExam {
  id: string;
  name: string;
  /** ISO date string (YYYY-MM-DD) of the scheduled exam. */
  date: string;
  category?: string;
}

export interface Todo {
  id: string;
  courseId: string;
  text: string;
  done: boolean;
}

export interface StudySession {
  id: string;
  /** The course this study session was logged against, or null for general study. */
  courseId: string | null;
  /** ISO date string (YYYY-MM-DD) the session happened. */
  date: string;
  minutes: number;
}

export interface Settings {
  /** Total CFU required to graduate, e.g. 180. */
  totalCreditsTarget: number;
  /** Manual bonus points (e.g. from thesis discussion) added on top of the 110-scale projection. */
  thesisBonus: number;
}

export const DEFAULT_SETTINGS: Settings = {
  totalCreditsTarget: 180,
  thesisBonus: 0,
};

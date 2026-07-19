// ---------------------------------------------------------------------------
// gradeMath.ts
//
// All the grade/GPA/degree-score math lives in this one file, deliberately
// kept separate from UI components and well-commented so it's easy to tweak
// later (e.g. if your university uses a different degree-score formula).
// ---------------------------------------------------------------------------

import type { Course } from '../types';

/** Minimum grade needed to pass an Italian university exam. */
export const MIN_PASSING_GRADE = 18;
/** Normal maximum grade. */
export const MAX_GRADE = 30;
/** Special top grade, "30 e lode" (30 with honors) - treated as one point above 30. */
export const MAX_GRADE_WITH_HONORS = 31;
/** The Italian final degree score is out of 110 (110 e lode exists but is a jury-only bonus). */
export const DEGREE_SCALE_MAX = 110;

/** Anything with a grade and positive credits is usable for the math below. */
type GradedCourse = Pick<Course, 'grade' | 'credits'>;

export function isPassingGrade(grade: number): boolean {
  return grade >= MIN_PASSING_GRADE;
}

export type GradeColor = 'red' | 'yellow' | 'green';

/** Color coding used across the UI: red <24, yellow 24-27, green 28-31. */
export function colorForGrade(grade: number): GradeColor {
  if (grade < 24) return 'red';
  if (grade <= 27) return 'yellow';
  return 'green';
}

/**
 * Weighted average (GPA), weighted by credits, over every course that has
 * actually been taken (grade !== null). Formula: sum(grade * credits) / sum(credits).
 * Returns `null` if there is nothing to average yet.
 */
export function weightedAverage(courses: GradedCourse[]): number | null {
  const taken = courses.filter((c): c is GradedCourse & { grade: number } => c.grade !== null && c.credits > 0);
  const totalCredits = taken.reduce((sum, c) => sum + c.credits, 0);
  if (totalCredits === 0) return null;
  const weightedSum = taken.reduce((sum, c) => sum + c.grade * c.credits, 0);
  return weightedSum / totalCredits;
}

/** Total CFU earned so far (only courses that have a grade, i.e. have been taken). */
export function totalCreditsEarned(courses: GradedCourse[]): number {
  return courses.filter((c) => c.grade !== null).reduce((sum, c) => sum + c.credits, 0);
}

/**
 * Projects the Italian 110-point final degree score from a weighted average
 * out of 30, then adds any manual thesis bonus points on top.
 * Formula: (weightedAverage / 30) * 110 + thesisBonus
 */
export function projectDegreeScore(weightedAvg: number | null, thesisBonus = 0): number | null {
  if (weightedAvg === null) return null;
  return (weightedAvg / 30) * DEGREE_SCALE_MAX + thesisBonus;
}

export interface RequiredAverageResult {
  /** The average (0-31 scale) you'd need across your remaining CFU. `null` if there's nothing left to take. */
  requiredAverage: number | null;
  /** Remaining CFU between what's already earned and the total target. */
  remainingCredits: number;
  /** Whether the required average is realistically possible (<= 31). */
  achievable: boolean;
  /** Whether the target is already met even with a minimum-passing average in remaining exams. */
  alreadyMet: boolean;
  /** Human-readable explanation to show in the UI. */
  note: string;
}

/**
 * "What do I need" calculator: given a target final degree score (out of 110),
 * work out what average you need across your *remaining* CFU to hit it.
 *
 * This is credits-aware (not just a flat average), because your final weighted
 * average will blend your current grade*credits total with whatever you score
 * in the CFU you still have left before reaching `totalCreditsTarget`.
 */
export function requiredAverageForTargetScore(
  courses: GradedCourse[],
  targetDegreeScore: number,
  thesisBonus: number,
  totalCreditsTarget: number
): RequiredAverageResult {
  const taken = courses.filter((c): c is GradedCourse & { grade: number } => c.grade !== null && c.credits > 0);
  const currentCredits = taken.reduce((sum, c) => sum + c.credits, 0);
  const currentWeightedSum = taken.reduce((sum, c) => sum + c.grade * c.credits, 0);
  const remainingCredits = totalCreditsTarget - currentCredits;

  // Degree points we need to reach BEFORE the manual thesis bonus is added.
  const targetScoreBeforeBonus = targetDegreeScore - thesisBonus;
  // Convert that target back down to the equivalent weighted average out of 30.
  const targetAverage30 = (targetScoreBeforeBonus / DEGREE_SCALE_MAX) * 30;

  if (remainingCredits <= 0) {
    const finalAverage = currentCredits > 0 ? currentWeightedSum / currentCredits : 0;
    const alreadyMet = finalAverage >= targetAverage30;
    return {
      requiredAverage: null,
      remainingCredits: 0,
      achievable: alreadyMet,
      alreadyMet,
      note:
        remainingCredits < 0
          ? "You've already reached your target credits - there are no remaining exams left to average in."
          : 'You have no remaining CFU toward your target.',
    };
  }

  const requiredAverageRaw = (targetAverage30 * totalCreditsTarget - currentWeightedSum) / remainingCredits;
  const requiredAverage = Math.max(requiredAverageRaw, 0);
  const achievable = requiredAverageRaw <= MAX_GRADE_WITH_HONORS;
  const alreadyMet = requiredAverageRaw <= MIN_PASSING_GRADE;

  let note: string;
  if (!achievable) {
    note = `Not achievable: you'd need an average above ${MAX_GRADE_WITH_HONORS} across your remaining ${remainingCredits} CFU.`;
  } else if (alreadyMet) {
    note = `You're already on track - even the minimum passing grade (${MIN_PASSING_GRADE}) in your remaining ${remainingCredits} CFU keeps you at or above target.`;
  } else {
    note = `You need an average of about ${requiredAverage.toFixed(1)} across your remaining ${remainingCredits} CFU.`;
  }

  return { requiredAverage, remainingCredits, achievable, alreadyMet, note };
}

export interface RetakeComparison {
  currentAverage: number | null;
  currentProjectedScore: number | null;
  simulatedAverage: number | null;
  simulatedProjectedScore: number | null;
  /** simulatedAverage - currentAverage, or null if not computable. */
  delta: number | null;
}

/**
 * Retake simulator: recomputes the weighted average and projected degree score
 * as if `courseId`'s grade were replaced with `simulatedGrade`, and returns it
 * side-by-side with the current (real) numbers.
 */
export function simulateRetake(
  courses: Course[],
  courseId: string,
  simulatedGrade: number,
  thesisBonus: number
): RetakeComparison {
  const currentAverage = weightedAverage(courses);
  const currentProjectedScore = projectDegreeScore(currentAverage, thesisBonus);

  const updatedCourses = courses.map((c) => (c.id === courseId ? { ...c, grade: simulatedGrade } : c));
  const simulatedAverage = weightedAverage(updatedCourses);
  const simulatedProjectedScore = projectDegreeScore(simulatedAverage, thesisBonus);

  const delta =
    currentAverage !== null && simulatedAverage !== null ? simulatedAverage - currentAverage : null;

  return { currentAverage, currentProjectedScore, simulatedAverage, simulatedProjectedScore, delta };
}

export type RetakeVerdict = 'retake' | 'keep' | 'neutral' | 'no-data';

export interface RetakeRecommendation {
  /** The grade you'd need to beat to make retaking worthwhile - simply the existing grade. */
  breakevenGrade: number;
  verdict: RetakeVerdict;
  message: string;
}

/**
 * Accept-or-retake suggestion. Since a retake replaces the old grade in the
 * weighted-average formula, retaking only ever helps if the new grade beats
 * the old one - so the "breakeven" point is just the current grade itself.
 *
 * Note: some universities let you refuse ("rifiutare") a grade before it's
 * registered, keeping the old one - if yours doesn't, remember a retake can
 * also make things worse.
 */
export function getRetakeRecommendation(oldGrade: number, simulatedGrade?: number | null): RetakeRecommendation {
  const breakevenGrade = oldGrade;

  if (simulatedGrade === undefined || simulatedGrade === null || Number.isNaN(simulatedGrade)) {
    return {
      breakevenGrade,
      verdict: 'no-data',
      message: `Retaking only helps if you score above ${breakevenGrade}. Keeping this grade is safer if you're not confident of beating it.`,
    };
  }

  if (simulatedGrade > oldGrade) {
    return {
      breakevenGrade,
      verdict: 'retake',
      message: `Retaking looks worth it: ${simulatedGrade} beats your current ${oldGrade}.`,
    };
  }

  if (simulatedGrade === oldGrade) {
    return {
      breakevenGrade,
      verdict: 'neutral',
      message: `No change: scoring ${simulatedGrade} again would leave your weighted average exactly the same.`,
    };
  }

  return {
    breakevenGrade,
    verdict: 'keep',
    message: `Keep your current grade: ${simulatedGrade} is lower than your current ${oldGrade} and would hurt your average.`,
  };
}

/** Sorted (chronological) grade points for the trendline chart. */
export interface TrendPoint {
  date: string;
  grade: number;
  name: string;
}

export function getTrendPoints(courses: Course[]): TrendPoint[] {
  return courses
    .filter((c): c is Course & { grade: number; date: string } => c.grade !== null && !!c.date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((c) => ({ date: c.date, grade: c.grade, name: c.name }));
}

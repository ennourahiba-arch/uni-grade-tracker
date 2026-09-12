
import type { Course } from '../types';

export const MIN_PASSING_GRADE = 18;
export const MAX_GRADE = 30;
export const MAX_GRADE_WITH_HONORS = 31;
export const DEGREE_SCALE_MAX = 110;
type GradedCourse = Pick<Course, 'grade' | 'credits'>;

export function isPassingGrade(grade: number): boolean {
  return grade >= MIN_PASSING_GRADE;
}

export type GradeColor = 'red' | 'yellow' | 'green';

export function colorForGrade(grade: number): GradeColor {
  if (grade < 24) return 'red';
  if (grade <= 27) return 'yellow';
  return 'green';
}

export function weightedAverage(courses: GradedCourse[]): number | null {
  const taken = courses.filter((c): c is GradedCourse & { grade: number } => c.grade !== null && c.credits > 0);
  const totalCredits = taken.reduce((sum, c) => sum + c.credits, 0);
  if (totalCredits === 0) return null;
  const weightedSum = taken.reduce((sum, c) => sum + c.grade * c.credits, 0);
  return weightedSum / totalCredits;
}
export function totalCreditsEarned(courses: GradedCourse[]): number {
  return courses.filter((c) => c.grade !== null).reduce((sum, c) => sum + c.credits, 0);
}
export function projectDegreeScore(weightedAvg: number | null, thesisBonus = 0): number | null {
  if (weightedAvg === null) return null;
  return (weightedAvg / 30) * DEGREE_SCALE_MAX + thesisBonus;
}

export interface RequiredAverageResult {
  requiredAverage: number | null;
  remainingCredits: number;
  achievable: boolean;
  alreadyMet: boolean;
  note: string;
}

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

  const targetScoreBeforeBonus = targetDegreeScore - thesisBonus;
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

  delta: number | null;
}

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

  breakevenGrade: number;
  verdict: RetakeVerdict;
  message: string;
}

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

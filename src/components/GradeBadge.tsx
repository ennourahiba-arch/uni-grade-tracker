import { colorForGrade } from '../lib/gradeMath';

export function GradeBadge({ grade }: { grade: number | null }) {
  if (grade === null) {
    return <span className="grade-badge grade-badge--pending">Not taken</span>;
  }
  const color = colorForGrade(grade);
  const label = grade === 31 ? '30L' : String(grade);
  return <span className={`grade-badge grade-badge--${color}`}>{label}</span>;
}

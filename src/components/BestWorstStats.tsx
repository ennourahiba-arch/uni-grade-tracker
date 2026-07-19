import { useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { weightedAverage } from '../lib/gradeMath';

export function BestWorstStats() {
  const { courses } = useAppData();

  const byCategory = useMemo(() => {
    const taken = courses.filter((c) => c.grade !== null && c.category);
    const groups = new Map<string, typeof courses>();
    for (const c of taken) {
      const key = c.category!;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(c);
    }
    return Array.from(groups.entries())
      .map(([category, list]) => ({
        category,
        average: weightedAverage(list),
        count: list.length,
      }))
      .filter((g) => g.average !== null)
      .sort((a, b) => (b.average as number) - (a.average as number));
  }, [courses]);

  if (byCategory.length === 0) {
    return (
      <div className="card">
        <h3>Best / worst subject areas</h3>
        <p className="muted">Add a category to your courses (e.g. "Math", "Humanities") to see this breakdown.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Best / worst subject areas</h3>
      <ul className="ranking-list">
        {byCategory.map((g, idx) => (
          <li key={g.category} className="ranking-list__item">
            <span className="ranking-list__rank">
              {idx === 0 ? '🏆' : idx === byCategory.length - 1 && byCategory.length > 1 ? '📉' : `${idx + 1}.`}
            </span>
            <span className="ranking-list__name">{g.category}</span>
            <span className="ranking-list__value">{(g.average as number).toFixed(2)} avg</span>
            <span className="muted">({g.count} exams)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

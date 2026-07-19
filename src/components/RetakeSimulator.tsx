import { useMemo, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { getRetakeRecommendation, simulateRetake } from '../lib/gradeMath';
import { GradeBadge } from './GradeBadge';

export function RetakeSimulator() {
  const { courses, settings } = useAppData();
  const takenCourses = useMemo(() => courses.filter((c) => c.grade !== null), [courses]);

  const [selectedId, setSelectedId] = useState<string>(takenCourses[0]?.id ?? '');
  const [simulatedGrade, setSimulatedGrade] = useState('');

  const selectedCourse = takenCourses.find((c) => c.id === selectedId);
  const simulatedGradeNum = simulatedGrade ? Number(simulatedGrade) : null;

  const comparison =
    selectedCourse && simulatedGradeNum !== null && !Number.isNaN(simulatedGradeNum)
      ? simulateRetake(courses, selectedCourse.id, simulatedGradeNum, settings.thesisBonus)
      : null;

  const recommendation = selectedCourse
    ? getRetakeRecommendation(selectedCourse.grade as number, simulatedGradeNum ?? undefined)
    : null;

  if (takenCourses.length === 0) {
    return (
      <div className="card">
        <h3>Retake simulator</h3>
        <p className="muted">Add a course with a grade first to simulate a retake.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Retake simulator</h3>

      <label className="field">
        <span>Course to retake</span>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {takenCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (current: {c.grade === 31 ? '30L' : c.grade})
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Simulated new grade</span>
        <input
          type="number"
          min="18"
          max="31"
          value={simulatedGrade}
          onChange={(e) => setSimulatedGrade(e.target.value)}
          placeholder="e.g. 30"
        />
      </label>

      {selectedCourse && (
        <div className="retake-compare">
          <div className="retake-compare__col">
            <h4>Keep current grade</h4>
            <p>
              Grade: <GradeBadge grade={selectedCourse.grade} />
            </p>
            <p>Weighted average: {comparison ? comparison.currentAverage?.toFixed(2) : '—'}</p>
            <p>Projected score: {comparison ? comparison.currentProjectedScore?.toFixed(1) : '—'} / 110</p>
          </div>
          <div className="retake-compare__col">
            <h4>Simulated retake</h4>
            <p>
              Grade: <GradeBadge grade={simulatedGradeNum} />
            </p>
            <p>Weighted average: {comparison ? comparison.simulatedAverage?.toFixed(2) : '—'}</p>
            <p>Projected score: {comparison ? comparison.simulatedProjectedScore?.toFixed(1) : '—'} / 110</p>
          </div>
        </div>
      )}

      {recommendation && (
        <div
          className={`callout callout--${
            recommendation.verdict === 'retake'
              ? 'success'
              : recommendation.verdict === 'keep'
                ? 'warning'
                : 'info'
          }`}
        >
          {recommendation.message}
        </div>
      )}
    </div>
  );
}

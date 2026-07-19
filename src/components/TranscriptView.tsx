import { useAppData } from '../context/AppDataContext';
import { totalCreditsEarned, weightedAverage, projectDegreeScore } from '../lib/gradeMath';
import { coursesToCsv, downloadTextFile } from '../lib/csv';
import { formatDate } from '../lib/dateUtils';
import { GradeBadge } from './GradeBadge';

export function TranscriptView() {
  const { courses, settings } = useAppData();
  const avg = weightedAverage(courses);
  const credits = totalCreditsEarned(courses);
  const score = projectDegreeScore(avg, settings.thesisBonus);

  const sorted = [...courses].sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'));

  function handleExportCsv() {
    downloadTextFile('transcript.csv', coursesToCsv(courses), 'text/csv;charset=utf-8;');
  }

  return (
    <div className="page">
      <div className="page__header">
        <h2>Transcript</h2>
        <div className="form-actions">
          <button className="btn" onClick={handleExportCsv}>
            Export CSV
          </button>
          <button className="btn btn--primary" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>

      <div className="card transcript">
        <h3>Summary</h3>
        <p>
          Weighted average: <strong>{avg !== null ? avg.toFixed(2) : '—'}</strong> / 30 &nbsp;·&nbsp; Credits:{' '}
          <strong>{credits}</strong> / {settings.totalCreditsTarget} CFU &nbsp;·&nbsp; Projected score:{' '}
          <strong>{score !== null ? score.toFixed(1) : '—'}</strong> / 110
        </p>

        <table className="transcript-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Grade</th>
              <th>CFU</th>
              <th>Date</th>
              <th>Semester</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>
                  <GradeBadge grade={c.grade} />
                </td>
                <td>{c.credits}</td>
                <td>{formatDate(c.date)}</td>
                <td>{c.semester ?? '—'}</td>
                <td>{c.category ?? '—'}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  No courses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

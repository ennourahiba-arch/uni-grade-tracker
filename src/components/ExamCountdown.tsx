import { useState, type FormEvent } from 'react';
import { useAppData } from '../context/AppDataContext';
import { countdownLabel, daysUntil, formatDate, todayIso } from '../lib/dateUtils';

export function ExamCountdown() {
  const { upcomingExams, addExam, deleteExam } = useAppData();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sorted = [...upcomingExams].sort((a, b) => a.date.localeCompare(b.date));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Exam name is required.');
      return;
    }
    if (!date) {
      setError('Exam date is required.');
      return;
    }
    addExam({ name: name.trim(), date, category: category.trim() || undefined });
    setName('');
    setDate('');
    setCategory('');
  }

  return (
    <div className="card">
      <h3>Exam countdown</h3>
      <form className="course-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Exam name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Physics II" />
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" min={todayIso()} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span>Category (optional)</span>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Physics" />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn btn--primary">
            Add upcoming exam
          </button>
        </div>
      </form>

      <ul className="exam-list">
        {sorted.length === 0 && <p className="muted">No upcoming exams scheduled.</p>}
        {sorted.map((exam) => {
          const days = daysUntil(exam.date);
          return (
            <li key={exam.id} className="exam-list__item">
              <div>
                <strong>{exam.name}</strong>
                <div className="muted">
                  {formatDate(exam.date)} {exam.category && `· ${exam.category}`}
                </div>
              </div>
              <span className={`countdown-pill ${days <= 3 ? 'countdown-pill--urgent' : ''}`}>
                {countdownLabel(days)}
              </span>
              <button className="btn btn--icon" onClick={() => deleteExam(exam.id)} aria-label="Delete exam">
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

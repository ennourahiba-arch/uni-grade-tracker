import { useEffect, useState, type FormEvent } from 'react';
import type { Course } from '../types';
import { MAX_GRADE_WITH_HONORS, MIN_PASSING_GRADE } from '../lib/gradeMath';

interface CourseFormProps {
  initial?: Course | null;
  onSubmit: (data: Omit<Course, 'id'>) => void;
  onCancel?: () => void;
}

export function CourseForm({ initial, onSubmit, onCancel }: CourseFormProps) {
  const [name, setName] = useState('');
  const [taken, setTaken] = useState(false);
  const [grade, setGrade] = useState('');
  const [credits, setCredits] = useState('');
  const [date, setDate] = useState('');
  const [semester, setSemester] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initial?.name ?? '');
    setTaken(initial ? initial.grade !== null : false);
    setGrade(initial?.grade != null ? String(initial.grade) : '');
    setCredits(initial?.credits != null ? String(initial.credits) : '');
    setDate(initial?.date ?? '');
    setSemester(initial?.semester ?? '');
    setCategory(initial?.category ?? '');
    setNotes(initial?.notes ?? '');
    setError(null);
  }, [initial]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Course name is required.');
      return;
    }

    const creditsNum = Number(credits);
    if (!credits || Number.isNaN(creditsNum) || creditsNum <= 0) {
      setError('Credits (CFU) must be a positive number.');
      return;
    }

    let gradeNum: number | null = null;
    if (taken) {
      gradeNum = Number(grade);
      if (!grade || Number.isNaN(gradeNum) || gradeNum < MIN_PASSING_GRADE || gradeNum > MAX_GRADE_WITH_HONORS) {
        setError(`Grade must be between ${MIN_PASSING_GRADE} and ${MAX_GRADE_WITH_HONORS} (31 = 30 e lode).`);
        return;
      }
    }

    onSubmit({
      name: name.trim(),
      grade: gradeNum,
      credits: creditsNum,
      date: taken ? date || null : null,
      semester: semester.trim() || undefined,
      category: category.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (!initial) {
      setName('');
      setTaken(false);
      setGrade('');
      setCredits('');
      setDate('');
      setSemester('');
      setCategory('');
      setNotes('');
    }
  }

  return (
    <form className="course-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="field">
          <span>Course name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Linear Algebra" />
        </label>

        <label className="field">
          <span>Credits (CFU)</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            placeholder="e.g. 9"
          />
        </label>

        <label className="field field--checkbox">
          <input type="checkbox" checked={taken} onChange={(e) => setTaken(e.target.checked)} />
          <span>Already taken</span>
        </label>

        {taken && (
          <>
            <label className="field">
              <span>Grade (18-31, 31 = 30L)</span>
              <input
                type="number"
                min={MIN_PASSING_GRADE}
                max={MAX_GRADE_WITH_HONORS}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. 27"
              />
            </label>

            <label className="field">
              <span>Date taken</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
          </>
        )}

        <label className="field">
          <span>Semester / session (optional)</span>
          <input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g. Year 1 - Fall" />
        </label>

        <label className="field">
          <span>Category (optional)</span>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Math" />
        </label>
      </div>

      <label className="field">
        <span>Notes (optional, supports **bold**, *italic*, `code`, - lists)</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn--primary">
          {initial ? 'Save changes' : 'Add course'}
        </button>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

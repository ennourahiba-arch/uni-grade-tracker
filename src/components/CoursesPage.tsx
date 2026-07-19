import { useMemo, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import type { Course } from '../types';
import { CourseForm } from './CourseForm';
import { CourseCard } from './CourseCard';

export function CoursesPage() {
  const { courses, addCourse, updateCourse, deleteCourse } = useAppData();
  const [editing, setEditing] = useState<Course | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const semesters = useMemo(
    () => Array.from(new Set(courses.map((c) => c.semester).filter(Boolean))) as string[],
    [courses]
  );
  const categories = useMemo(
    () => Array.from(new Set(courses.map((c) => c.category).filter(Boolean))) as string[],
    [courses]
  );

  const filtered = courses.filter((c) => {
    if (semesterFilter !== 'all' && c.semester !== semesterFilter) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.name.localeCompare(b.name);
  });

  function handleAddOrEdit(data: Omit<Course, 'id'>) {
    if (editing) {
      updateCourse(editing.id, data);
      setEditing(null);
    } else {
      addCourse(data);
    }
    setShowForm(false);
  }

  function handleEdit(course: Course) {
    setEditing(course);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (window.confirm('Delete this course entry? This cannot be undone.')) {
      deleteCourse(id);
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <h2>Courses</h2>
        <button
          className="btn btn--primary"
          onClick={() => {
            setEditing(null);
            setShowForm((v) => !v);
          }}
        >
          {showForm ? 'Close form' : '+ Add course'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <CourseForm
            initial={editing}
            onSubmit={handleAddOrEdit}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      {courses.length > 0 && (
        <div className="filters">
          <label className="field field--inline">
            <span>Semester</span>
            <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
              <option value="all">All</option>
              {semesters.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="field field--inline">
            <span>Category</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="course-list">
        {sorted.length === 0 && <p className="muted">No courses yet. Add your first one above.</p>}
        {sorted.map((course) => (
          <CourseCard key={course.id} course={course} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

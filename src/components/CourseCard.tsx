import { useState } from 'react';
import type { Course } from '../types';
import { GradeBadge } from './GradeBadge';
import { CourseNotesAndTodos } from './CourseNotesAndTodos';
import { formatDate } from '../lib/dateUtils';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="course-card">
      <div className="course-card__main">
        <button
          className="course-card__toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <span className="course-card__chevron">{expanded ? '▾' : '▸'}</span>
          <span className="course-card__name">{course.name}</span>
        </button>

        <div className="course-card__meta">
          <GradeBadge grade={course.grade} />
          <span className="tag">{course.credits} CFU</span>
          {course.date && <span className="tag tag--muted">{formatDate(course.date)}</span>}
          {course.semester && <span className="tag tag--muted">{course.semester}</span>}
          {course.category && <span className="tag tag--category">{course.category}</span>}
        </div>

        <div className="course-card__actions">
          <button className="btn btn--small" onClick={() => onEdit(course)}>
            Edit
          </button>
          <button className="btn btn--small btn--danger" onClick={() => onDelete(course.id)}>
            Delete
          </button>
        </div>
      </div>

      {expanded && <CourseNotesAndTodos course={course} />}
    </div>
  );
}

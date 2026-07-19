import { useState } from 'react';
import type { Course } from '../types';
import { useAppData } from '../context/AppDataContext';
import { SimpleMarkdown } from '../lib/markdown';

export function CourseNotesAndTodos({ course }: { course: Course }) {
  const { updateCourse, todos, addTodo, toggleTodo, deleteTodo } = useAppData();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(course.notes ?? '');
  const [newTodo, setNewTodo] = useState('');

  const courseTodos = todos.filter((t) => t.courseId === course.id);

  function saveNotes() {
    updateCourse(course.id, { notes: notesDraft.trim() || undefined });
    setEditingNotes(false);
  }

  function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodo.trim()) return;
    addTodo({ courseId: course.id, text: newTodo.trim() });
    setNewTodo('');
  }

  return (
    <div className="course-expanded">
      <div className="course-expanded__section">
        <div className="course-expanded__header">
          <h4>Notes</h4>
          {!editingNotes && (
            <button className="btn btn--small" onClick={() => setEditingNotes(true)}>
              Edit
            </button>
          )}
        </div>
        {editingNotes ? (
          <>
            <textarea rows={3} value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} />
            <div className="form-actions">
              <button className="btn btn--primary btn--small" onClick={saveNotes}>
                Save
              </button>
              <button
                className="btn btn--small"
                onClick={() => {
                  setNotesDraft(course.notes ?? '');
                  setEditingNotes(false);
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : course.notes ? (
          <SimpleMarkdown text={course.notes} />
        ) : (
          <p className="muted">No notes yet.</p>
        )}
      </div>

      <div className="course-expanded__section">
        <h4>To-do</h4>
        <ul className="todo-list">
          {courseTodos.map((t) => (
            <li key={t.id} className={t.done ? 'todo-item todo-item--done' : 'todo-item'}>
              <label>
                <input type="checkbox" checked={t.done} onChange={() => toggleTodo(t.id)} />
                <span>{t.text}</span>
              </label>
              <button className="btn btn--icon" onClick={() => deleteTodo(t.id)} aria-label="Delete to-do">
                ✕
              </button>
            </li>
          ))}
          {courseTodos.length === 0 && <p className="muted">No to-dos for this course yet.</p>}
        </ul>
        <form className="todo-form" onSubmit={handleAddTodo}>
          <input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a to-do..."
          />
          <button type="submit" className="btn btn--small">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

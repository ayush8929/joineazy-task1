export default function CourseCard({ course, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-lg shadow-sm p-5 border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all"
    >
      <h3 className="font-medium text-slate-900">{course.title}</h3>
      {course.description && (
        <p className="text-sm text-slate-500 mt-1">{course.description}</p>
      )}
      {course.professorName && (
        <p className="text-xs text-slate-400 mt-3">
          Taught by {course.professorName}
        </p>
      )}
    </button>
  );
}

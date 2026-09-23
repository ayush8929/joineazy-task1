export default function ProfessorCourseCard({ course, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-lg shadow-sm p-5 border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all"
    >
      <h3 className="font-medium text-slate-900">{course.title}</h3>
      {course.description && (
        <p className="text-sm text-slate-500 mt-1">{course.description}</p>
      )}

      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
        <span>
          <strong className="text-slate-900">{course.studentCount}</strong>{" "}
          students
        </span>
        <span>
          <strong className="text-slate-900">{course.assignmentCount}</strong>{" "}
          assignments
        </span>
        <span>
          <strong className="text-slate-900">
            {course.completionPercentage}%
          </strong>{" "}
          complete
        </span>
      </div>
    </button>
  );
}

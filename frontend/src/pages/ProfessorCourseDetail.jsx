import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { coursesApi } from "../api/courses";
import { assignmentsApi } from "../api/assignments";
import { groupsApi } from "../api/groups";
import EnrollStudentForm from "../components/EnrollStudentForm";
import AssignmentForm from "../components/AssignmentForm";
import SubmissionsTracker from "../components/SubmissionsTracker";

export default function ProfessorCourseDetail() {
  const { courseId } = useParams();
  const numericCourseId = Number(courseId);
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setError("");
    try {
      const [courseList, assignmentList, groupList] = await Promise.all([
        coursesApi.list(),
        assignmentsApi.list(numericCourseId),
        groupsApi.all(),
      ]);
      setCourse(courseList.find((c) => c.id === numericCourseId) || null);
      setAssignments(assignmentList);
      setGroups(groupList);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong loading this course.",
      );
    } finally {
      setLoading(false);
    }
  }, [numericCourseId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <Link to="/admin" className="text-sm text-slate-500 underline">
          ← Back to courses
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <>
          <h1 className="text-xl font-semibold text-slate-900 mb-6">
            {course?.title || "Course"}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h2 className="font-medium text-slate-900 mb-3">
                Enroll a Student
              </h2>
              <EnrollStudentForm
                courseId={numericCourseId}
                onEnrolled={loadAll}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5">
              <h2 className="font-medium text-slate-900 mb-3">
                Post an Assignment
              </h2>
              <AssignmentForm
                groups={groups}
                courseId={numericCourseId}
                onCreated={loadAll}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5 md:col-span-2">
              <h2 className="font-medium text-slate-900 mb-3">
                Submissions Tracker
              </h2>
              <SubmissionsTracker assignments={assignments} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { coursesApi } from "../api/courses";
import ProfessorCourseCard from "../components/ProfessorCourseCard";
import CreateCourseForm from "../components/CreateCourseForm";
import AnalyticsPanel from "../components/AnalyticsPanel";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = useCallback(async () => {
    setError("");
    try {
      const list = await coursesApi.list();
      setCourses(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong loading your courses.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-slate-900">
          Professor Console — {user?.name}
        </h1>
        <button onClick={logout} className="text-sm text-slate-500 underline">
          Log out
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-medium text-slate-900 mb-3">Courses You Teach</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-slate-500">
              You haven't created any courses yet — use the form to create your
              first one.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course) => (
                <ProfessorCourseCard
                  key={course.id}
                  course={course}
                  onClick={() => navigate(`/admin/courses/${course.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h2 className="font-medium text-slate-900 mb-3">Create a Course</h2>
            <CreateCourseForm onCreated={loadCourses} />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5">
            <h2 className="font-medium text-slate-900 mb-3">
              Overall Analytics
            </h2>
            <AnalyticsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

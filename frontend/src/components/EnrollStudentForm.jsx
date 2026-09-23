import { useState } from "react";
import { coursesApi } from "../api/courses";

export default function EnrollStudentForm({ courseId, onEnrolled }) {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const enrollment = await coursesApi.enrollStudent(courseId, identifier);
      setSuccess(`Enrolled ${enrollment.student.name}.`);
      setIdentifier("");
      onEnrolled();
    } catch (err) {
      setError(err.response?.data?.message || "Could not enroll that student.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
      <input
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Student email or student ID"
        required
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
      <button
        disabled={busy}
        className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
      >
        {busy ? "Enrolling..." : "Enroll Student"}
      </button>
    </form>
  );
}

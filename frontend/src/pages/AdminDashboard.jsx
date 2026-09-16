import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-slate-900">Professor Console — {user?.name}</h1>
        <button onClick={logout} className="text-sm text-slate-500 underline">
          Log out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="font-medium text-slate-900 mb-1">Assignments</h2>
          <p className="text-sm text-slate-500">Create & edit assignments — Phase 7.</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="font-medium text-slate-900 mb-1">Submissions Tracker</h2>
          <p className="text-sm text-slate-500">Group/student-wise status — Phase 7.</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="font-medium text-slate-900 mb-1">Analytics</h2>
          <p className="text-sm text-slate-500">Completion charts & counts — Phase 7.</p>
        </div>
      </div>
    </div>
  );
}

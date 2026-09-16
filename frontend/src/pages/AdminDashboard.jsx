import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { assignmentsApi } from '../api/assignments';
import { groupsApi } from '../api/groups';
import AssignmentForm from '../components/AssignmentForm';
import SubmissionsTracker from '../components/SubmissionsTracker';
import AnalyticsPanel from '../components/AnalyticsPanel';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setError('');
    try {
      const [assignmentList, groupList] = await Promise.all([
        assignmentsApi.list(),
        groupsApi.all(),
      ]);
      setAssignments(assignmentList);
      setGroups(groupList);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong loading the dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-slate-900">Professor Console — {user?.name}</h1>
        <button onClick={logout} className="text-sm text-slate-500 underline">
          Log out
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>}

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h2 className="font-medium text-slate-900 mb-3">Post an Assignment</h2>
            <AssignmentForm groups={groups} onCreated={loadAll} />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5">
            <h2 className="font-medium text-slate-900 mb-3">Analytics</h2>
            <AnalyticsPanel />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5 md:col-span-2">
            <h2 className="font-medium text-slate-900 mb-3">Submissions Tracker</h2>
            <SubmissionsTracker assignments={assignments} />
          </div>
        </div>
      )}
    </div>
  );
}

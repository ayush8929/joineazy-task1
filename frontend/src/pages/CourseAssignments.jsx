import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { groupsApi } from "../api/groups";
import { assignmentsApi } from "../api/assignments";
import { submissionsApi } from "../api/submissions";
import GroupPanel from "../components/GroupPanel";
import AssignmentList from "../components/AssignmentList";
import ProgressBar from "../components/ProgressBar";

export default function CourseAssignments() {
  const { courseId } = useParams();
  const [group, setGroup] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setError("");
    try {
      const groups = await groupsApi.mine();
      const myGroup = groups[0] || null; // one group per student, same as before — not course-scoped yet

      const list = await assignmentsApi.list(courseId);
      setAssignments(list);
      setGroup(myGroup);

      if (myGroup) {
        // NOTE: /groups/:id/progress is currently global (all assignments visible
        // to the group across every course), not scoped to this one course yet.
        const p = await groupsApi.progress(myGroup.id);
        setProgress(p);
      } else {
        setProgress(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong loading this course.",
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleConfirmSubmission(assignment) {
    try {
      const groupId =
        assignment.submissionType === "individual" ? undefined : group?.id;
      await submissionsApi.confirm(assignment.id, groupId);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not confirm submission.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <Link to="/dashboard" className="text-sm text-slate-500 underline">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h2 className="font-medium text-slate-900 mb-3">My Group</h2>
            <GroupPanel
              group={group}
              onGroupCreated={(g) => setGroup({ ...g, members: g.members })}
              onMemberAdded={loadAll}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5 md:col-span-2">
            <h2 className="font-medium text-slate-900 mb-3">Assignments</h2>
            <AssignmentList
              assignments={assignments}
              onConfirmed={handleConfirmSubmission}
            />
          </div>

          {progress && (
            <div className="bg-white rounded-lg shadow-sm p-5 md:col-span-3">
              <h2 className="font-medium text-slate-900 mb-3">
                Group Progress
              </h2>
              <ProgressBar
                percentage={progress.percentage}
                label={`${progress.confirmed} of ${progress.total} assignments confirmed`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

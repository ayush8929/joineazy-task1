import { useState, useEffect } from "react";
import { assignmentsApi } from "../api/assignments";

function StatusBadge({ status }) {
  const isConfirmed = status === "confirmed";
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${
        isConfirmed
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {isConfirmed ? "Confirmed" : "Pending"}
    </span>
  );
}

export default function SubmissionsTracker({ assignments }) {
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setData(null);
      return;
    }
    setLoading(true);
    assignmentsApi
      .submissions(selectedId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [selectedId]);

  return (
    <div className="space-y-3">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        <option value="">Select an assignment...</option>
        {assignments.map((a) => (
          <option key={a.id} value={a.id}>
            {a.title} (
            {a.submissionType === "individual" ? "Individual" : "Group"})
          </option>
        ))}
      </select>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}

      {data && data.submissionType === "group" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4">Group</th>
                <th className="py-2 pr-4">Leader</th>
                <th className="py-2 pr-4">Members</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Confirmed At</th>
              </tr>
            </thead>
            <tbody>
              {data.groups.map((g) => (
                <tr key={g.groupId} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-900">
                    {g.groupName}
                  </td>
                  <td className="py-2 pr-4 text-slate-600">
                    {g.leader || "—"}
                  </td>
                  <td className="py-2 pr-4 text-slate-600">
                    {g.members.map((m) => m.name).join(", ") || "—"}
                  </td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={g.status} />
                  </td>
                  <td className="py-2 text-slate-500">
                    {g.confirmedAt
                      ? new Date(g.confirmedAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.submissionType === "individual" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Confirmed At</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((s) => (
                <tr key={s.studentId} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-900">
                    {s.studentName}
                  </td>
                  <td className="py-2 pr-4 text-slate-600">{s.studentEmail}</td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="py-2 text-slate-500">
                    {s.confirmedAt
                      ? new Date(s.confirmedAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

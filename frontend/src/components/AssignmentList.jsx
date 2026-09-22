import { useState } from "react";
import ConfirmSubmissionModal from "./ConfirmSubmissionModal";

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

export default function AssignmentList({ assignments, onConfirmed }) {
  const [modalAssignment, setModalAssignment] = useState(null);

  async function handleConfirm(assignment) {
    await onConfirmed(assignment);
    setModalAssignment(null);
  }

  if (assignments.length === 0) {
    return <p className="text-sm text-slate-500">No assignments posted yet.</p>;
  }

  return (
    <div className="space-y-3">
      {assignments.map((a) => {
        const isIndividual = a.submissionType === "individual";
        const isConfirmed = a.submissionStatus === "confirmed";
        // Backend already computes whether *this* student is allowed to confirm —
        // always true for individual assignments, leader-only for group ones.
        const canConfirm = a.canConfirm ?? true;

        return (
          <div key={a.id} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-900">{a.title}</h4>
                  <span className="text-xs text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">
                    {isIndividual ? "Individual" : "Group"}
                  </span>
                </div>
                {a.description && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    {a.description}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Due {new Date(a.dueDate).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={a.submissionStatus} />
            </div>

            <div className="flex items-center gap-3 mt-3">
              <a
                href={a.oneDriveLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 underline"
              >
                Open OneDrive link
              </a>

              {!isConfirmed && canConfirm && (
                <button
                  onClick={() => setModalAssignment(a)}
                  className="text-sm bg-slate-900 text-white px-3 py-1.5 rounded-md hover:bg-slate-800"
                >
                  Yes, I have submitted
                </button>
              )}

              {!isConfirmed && !canConfirm && (
                <span className="text-sm text-slate-400 italic">
                  Waiting on group leader to confirm
                </span>
              )}
            </div>
          </div>
        );
      })}

      {modalAssignment && (
        <ConfirmSubmissionModal
          assignmentTitle={modalAssignment.title}
          isIndividual={modalAssignment.submissionType === "individual"}
          onClose={() => setModalAssignment(null)}
          onConfirm={() => handleConfirm(modalAssignment)}
        />
      )}
    </div>
  );
}

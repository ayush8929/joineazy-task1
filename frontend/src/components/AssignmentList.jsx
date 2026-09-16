import { useState } from 'react';
import ConfirmSubmissionModal from './ConfirmSubmissionModal';

function StatusBadge({ status }) {
  const isConfirmed = status === 'confirmed';
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${
        isConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {isConfirmed ? 'Confirmed' : 'Pending'}
    </span>
  );
}

export default function AssignmentList({ assignments, groupId, onConfirmed }) {
  const [modalAssignment, setModalAssignment] = useState(null);

  async function handleConfirm(assignment) {
    await onConfirmed(assignment.id);
    setModalAssignment(null);
  }

  if (assignments.length === 0) {
    return <p className="text-sm text-slate-500">No assignments posted yet.</p>;
  }

  return (
    <div className="space-y-3">
      {assignments.map((a) => (
        <div key={a.id} className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-medium text-slate-900">{a.title}</h4>
              {a.description && <p className="text-sm text-slate-500 mt-0.5">{a.description}</p>}
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

            {a.submissionStatus !== 'confirmed' && groupId && (
              <button
                onClick={() => setModalAssignment(a)}
                className="text-sm bg-slate-900 text-white px-3 py-1.5 rounded-md hover:bg-slate-800"
              >
                Yes, I have submitted
              </button>
            )}
          </div>
        </div>
      ))}

      {modalAssignment && (
        <ConfirmSubmissionModal
          assignmentTitle={modalAssignment.title}
          onClose={() => setModalAssignment(null)}
          onConfirm={() => handleConfirm(modalAssignment)}
        />
      )}
    </div>
  );
}

import { useState } from 'react';

/**
 * The "two-step verification" required by the spec:
 * Step 1: student clicks "Yes, I have submitted"
 * Step 2: a confirmation dialog appears; they must click "Confirm" to finalize.
 * Only step 2 actually calls the API (see onConfirm).
 */
export default function ConfirmSubmissionModal({ assignmentTitle, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    await onConfirm();
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
        <h3 className="font-semibold text-slate-900">Confirm submission</h3>
        <p className="text-sm text-slate-600">
          You're about to confirm that your group has submitted <strong>{assignmentTitle}</strong>.
          This action can't be undone. Are you sure?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-sm rounded-md text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

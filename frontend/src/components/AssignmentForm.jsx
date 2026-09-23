import { useState } from "react";
import { assignmentsApi } from "../api/assignments";

export default function AssignmentForm({ groups, courseId, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [oneDriveLink, setOneDriveLink] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [submissionType, setSubmissionType] = useState("group");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function toggleGroup(id) {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (
      submissionType === "group" &&
      targetType === "group" &&
      selectedGroups.length === 0
    ) {
      setError('Select at least one group, or switch to "All groups".');
      return;
    }

    setBusy(true);
    try {
      await assignmentsApi.create({
        title,
        description,
        due_date: new Date(dueDate).toISOString(),
        onedrive_link: oneDriveLink,
        target_type: submissionType === "individual" ? "all" : targetType,
        group_ids:
          submissionType === "group" && targetType === "group"
            ? selectedGroups
            : undefined,
        submission_type: submissionType,
        course_id: courseId,
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setOneDriveLink("");
      setTargetType("all");
      setSubmissionType("group");
      setSelectedGroups([]);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create assignment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Assignment title"
        required
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <input
          value={oneDriveLink}
          onChange={(e) => setOneDriveLink(e.target.value)}
          placeholder="OneDrive link"
          required
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 mb-1">
          Submission type
        </p>
        <div className="flex gap-2">
          {["group", "individual"].map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setSubmissionType(t)}
              className={`flex-1 py-2 rounded-md text-sm font-medium border ${
                submissionType === t
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-300"
              }`}
            >
              {t === "group" ? "Group" : "Individual"}
            </button>
          ))}
        </div>
      </div>

      {submissionType === "group" && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Assign to</p>
          <div className="flex gap-2">
            {["all", "group"].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTargetType(t)}
                className={`flex-1 py-2 rounded-md text-sm font-medium border ${
                  targetType === t
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-300"
                }`}
              >
                {t === "all" ? "All groups" : "Specific groups"}
              </button>
            ))}
          </div>
        </div>
      )}

      {submissionType === "group" && targetType === "group" && (
        <div className="border border-slate-200 rounded-md p-3 max-h-32 overflow-y-auto space-y-1">
          {groups.length === 0 && (
            <p className="text-xs text-slate-400">No groups exist yet.</p>
          )}
          {groups.map((g) => (
            <label
              key={g.id}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={selectedGroups.includes(g.id)}
                onChange={() => toggleGroup(g.id)}
              />
              {g.name}
            </label>
          ))}
        </div>
      )}

      {submissionType === "individual" && (
        <p className="text-xs text-slate-400">
          Every student enrolled in this course confirms their own submission —
          no group involved.
        </p>
      )}

      <button
        disabled={busy}
        className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
      >
        {busy ? "Creating..." : "Post Assignment"}
      </button>
    </form>
  );
}

import { useState } from 'react';
import { groupsApi } from '../api/groups';

export default function GroupPanel({ group, onGroupCreated, onMemberAdded }) {
  const [groupName, setGroupName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const newGroup = await groupsApi.create(groupName);
      onGroupCreated(newGroup);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create group.');
    } finally {
      setBusy(false);
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await groupsApi.addMember(group.id, identifier);
      setIdentifier('');
      onMemberAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add member.');
    } finally {
      setBusy(false);
    }
  }

  if (!group) {
    return (
      <form onSubmit={handleCreate} className="space-y-3">
        <p className="text-sm text-slate-500">You're not in a group yet. Create one to get started.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name"
          required
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <button
          disabled={busy}
          className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          {busy ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-slate-900">{group.name}</h3>
        <ul className="mt-2 space-y-1">
          {group.members.map((m) => (
            <li key={m.id} className="text-sm text-slate-600">
              {m.user.name} <span className="text-slate-400">({m.user.email})</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleAddMember} className="space-y-2">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Add member by email or student ID"
          required
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <button
          disabled={busy}
          className="w-full bg-slate-100 text-slate-900 rounded-md py-2 text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
        >
          {busy ? 'Adding...' : 'Add Member'}
        </button>
      </form>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert.jsx';
import MaintenancePanel from '../components/MaintenancePanel.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import SpaceForm from '../components/SpaceForm.jsx';
import { readApiError } from '../api/client.js';
import { spacesApi } from '../api/endpoints.js';
import { SPACE_TYPE_LABELS } from '../utils/format.js';

export default function AdminSpacesPage() {
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // One of: null, { mode: 'create' }, { mode: 'edit' | 'maintenance', space }
  const [dialog, setDialog] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    return spacesApi
      .list({ page, limit: 10, ...(applied ? { search: applied } : {}) })
      .then(setResult)
      .catch((err) => setError(readApiError(err, 'Could not load spaces')))
      .finally(() => setLoading(false));
  }, [page, applied]);

  useEffect(() => {
    load();
  }, [load]);

  const afterWrite = async (text) => {
    setDialog(null);
    setMessage(text);
    setError('');
    await load();
  };

  const remove = async (space) => {
    if (!window.confirm(`Delete "${space.name}"? Its bookings will be removed too.`)) return;

    setError('');
    setMessage('');
    try {
      await spacesApi.remove(space.id);
      await afterWrite(`${space.name} was deleted.`);
    } catch (err) {
      setError(readApiError(err, 'Could not delete that space'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Manage spaces</h1>
          <p className="mt-1 text-sm text-slate-500">
            Add desks and meeting rooms, and block out maintenance windows.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setDialog({ mode: 'create' })}>
          Add space
        </button>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setApplied(search);
          setPage(1);
        }}
      >
        <input
          className="field max-w-xs"
          placeholder="Search spaces"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search spaces"
        />
        <button type="submit" className="btn-secondary">
          Search
        </button>
      </form>

      <Alert>{error}</Alert>
      <Alert tone="success">{message}</Alert>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading spaces...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Amenities</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.data.map((space) => (
                <tr key={space.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{space.name}</td>
                  <td className="px-4 py-3 text-slate-600">{SPACE_TYPE_LABELS[space.type]}</td>
                  <td className="px-4 py-3 text-slate-600">{space.capacity}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {space.amenities.join(', ') || <span className="text-slate-300">None</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1.5"
                        onClick={() => setDialog({ mode: 'maintenance', space })}
                      >
                        Maintenance
                      </button>
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1.5"
                        onClick={() => setDialog({ mode: 'edit', space })}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger px-3 py-1.5"
                        onClick={() => remove(space)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={result.pagination} onChange={setPage} />

      {dialog?.mode === 'create' && (
        <Modal title="Add a space" onClose={() => setDialog(null)}>
          <SpaceForm
            onCancel={() => setDialog(null)}
            onSubmit={async (payload) => {
              await spacesApi.create(payload);
              await afterWrite(`${payload.name} was created.`);
            }}
          />
        </Modal>
      )}

      {dialog?.mode === 'edit' && (
        <Modal title={`Edit ${dialog.space.name}`} onClose={() => setDialog(null)}>
          <SpaceForm
            space={dialog.space}
            onCancel={() => setDialog(null)}
            onSubmit={async (payload) => {
              await spacesApi.update(dialog.space.id, payload);
              await afterWrite(`${payload.name} was updated.`);
            }}
          />
        </Modal>
      )}

      {dialog?.mode === 'maintenance' && (
        <Modal title={`Maintenance for ${dialog.space.name}`} onClose={() => setDialog(null)}>
          <MaintenancePanel space={dialog.space} />
        </Modal>
      )}
    </div>
  );
}

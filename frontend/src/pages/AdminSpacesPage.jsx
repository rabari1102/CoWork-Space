import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import MaintenancePanel from '../components/MaintenancePanel.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import SpaceForm from '../components/SpaceForm.jsx';
import { readApiError } from '../api/client.js';
import { spacesApi } from '../api/endpoints.js';
import { useToast } from '../context/ToastContext.jsx';
import { SPACE_TYPE_LABELS } from '../utils/format.js';

export default function AdminSpacesPage() {
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // One of: null, { mode: 'create' }, { mode: 'edit' | 'maintenance' | 'delete', space }
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

  const afterWrite = async (message) => {
    setDialog(null);
    setError('');
    toast(message);
    await load();
  };

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Administration
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Manage spaces</h1>
        </div>
        <button type="button" className="btn-primary w-fit" onClick={() => setDialog({ mode: 'create' })}>
          <i className="ph ph-plus" /> Add space
        </button>
      </div>

      <Alert>{error}</Alert>

      <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <form
          className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/50 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            setApplied(search);
            setPage(1);
          }}
        >
          <div className="relative w-64 max-w-full">
            <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search spaces..."
              aria-label="Search spaces"
              className="field py-1.5 pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <span className="shrink-0 text-xs font-medium text-slate-500">
            {result.pagination?.total ?? 0} spaces
          </span>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Name</th>
                <th className="th">Type</th>
                <th className="th hidden sm:table-cell">Capacity</th>
                <th className="th hidden lg:table-cell">Amenities</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm">
              {loading ? (
                <tr>
                  <td className="td text-slate-500" colSpan={5}>
                    Loading spaces...
                  </td>
                </tr>
              ) : result.data.length === 0 ? (
                <tr>
                  <td className="td text-slate-500" colSpan={5}>
                    No spaces match that search.
                  </td>
                </tr>
              ) : (
                result.data.map((space) => (
                  <tr key={space.id} className="group transition-colors hover:bg-slate-50/50">
                    <td className="td font-medium text-slate-900">{space.name}</td>
                    <td className="td">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                        {SPACE_TYPE_LABELS[space.type]}
                      </span>
                    </td>
                    <td className="td hidden text-slate-500 sm:table-cell">{space.capacity} seats</td>
                    <td className="td hidden lg:table-cell">
                      <div className="flex gap-1">
                        <span className="chip">{space.amenities[0] || '-'}</span>
                        {space.amenities.length > 1 && (
                          <span className="chip text-slate-400">+{space.amenities.length - 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="td text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          title="Maintenance"
                          aria-label={`Maintenance for ${space.name}`}
                          onClick={() => setDialog({ mode: 'maintenance', space })}
                          className="p-1 text-slate-400 hover:text-purple-600"
                        >
                          <i className="ph ph-wrench text-lg" />
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          aria-label={`Edit ${space.name}`}
                          onClick={() => setDialog({ mode: 'edit', space })}
                          className="p-1 text-slate-400 hover:text-brand-600"
                        >
                          <i className="ph ph-pencil-simple text-lg" />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          aria-label={`Delete ${space.name}`}
                          onClick={() => setDialog({ mode: 'delete', space })}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <i className="ph ph-trash text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination pagination={result.pagination} onChange={setPage} noun="space" />

      {dialog?.mode === 'create' && (
        <Modal
          title="Add a space"
          subtitle="Create a workspace for members to book."
          onClose={() => setDialog(null)}
        >
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
        <Modal
          title="Edit space"
          subtitle={dialog.space.name}
          onClose={() => setDialog(null)}
        >
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
        <Modal
          title="Maintenance windows"
          subtitle={dialog.space.name}
          onClose={() => setDialog(null)}
        >
          <MaintenancePanel space={dialog.space} />
        </Modal>
      )}

      {dialog?.mode === 'delete' && (
        <ConfirmDialog
          title={`Delete ${dialog.space.name}?`}
          icon="ph-trash"
          tone="danger"
          rows={[
            { label: 'Type', value: SPACE_TYPE_LABELS[dialog.space.type] },
            { label: 'Capacity', value: `${dialog.space.capacity} seats` },
          ]}
          note="Every booking and maintenance window for this space is removed with it. This cannot be undone."
          cancelLabel="Keep space"
          confirmLabel="Delete space"
          onConfirm={async () => {
            await spacesApi.remove(dialog.space.id);
            await afterWrite(`${dialog.space.name} was deleted.`);
          }}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}

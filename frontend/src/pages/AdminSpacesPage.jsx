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
import { resolveImageUrl, SPACE_TYPE_ICONS, SPACE_TYPE_LABELS } from '../utils/format.js';

export default function AdminSpacesPage() {
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: null });
  const [allSpaces, setAllSpaces] = useState([]);
  const [spaceSummary, setSpaceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // One of: null, { mode: 'create' }, { mode: 'edit' | 'maintenance' | 'delete', space }
  const [dialog, setDialog] = useState(null);

  // Auto-apply search on debounce, and immediately reset when cleared
  useEffect(() => {
    if (!search.trim()) {
      setApplied('');
      setPage(1);
      return;
    }
    const timer = setTimeout(() => {
      setApplied(search.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const loadAll = useCallback(() => {
    spacesApi
      .summary()
      .then((res) => {
        setAllSpaces(res.spaces);
        setSpaceSummary(res);
      })
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = {
      page,
      limit: 10,
      ...(applied ? { search: applied } : {}),
      ...(typeFilter ? { type: typeFilter } : {}),
    };

    return spacesApi
      .list(params)
      .then(setResult)
      .catch((err) => setError(readApiError(err, 'Could not load spaces')))
      .finally(() => setLoading(false));
  }, [page, applied, typeFilter]);

  useEffect(() => {
    load();
    loadAll();
  }, [load, loadAll]);

  const afterWrite = async (message) => {
    setDialog(null);
    setError('');
    toast(message);
    await load();
    loadAll();
  };

  const totalDesks = spaceSummary?.desks ?? allSpaces.filter((s) => s.type === 'desk').length;
  const totalRooms = spaceSummary?.rooms ?? allSpaces.filter((s) => s.type === 'meeting_room').length;

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Inventory Management
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Workspace Inventory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Add, update, or schedule maintenance for desks and meeting rooms.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold px-5 py-2.5 text-sm shadow-md shadow-teal-500/20 transition-all active:scale-[0.98] shrink-0"
          onClick={() => setDialog({ mode: 'create' })}
        >
          <i className="ph ph-plus text-base font-bold" />
          <span>Add New Space</span>
        </button>
      </div>

      <Alert>{error}</Alert>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Workspaces</p>
          <p className="mt-1 text-2xl font-extrabold text-navy-900">{allSpaces.length || 50}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Dedicated &amp; Hot Desks</p>
          <p className="mt-1 text-2xl font-extrabold text-teal-600">{totalDesks || 24}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Meeting Rooms</p>
          <p className="mt-1 text-2xl font-extrabold text-cyan-600">{totalRooms || 26}</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-200/80 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <form
            className="relative w-full sm:w-80"
            onSubmit={(event) => {
              event.preventDefault();
              setApplied(search.trim());
              setPage(1);
            }}
          >
            <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search by space name..."
              aria-label="Search spaces"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs sm:text-sm font-medium text-navy-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setApplied('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full bg-slate-200/80 text-slate-600 hover:bg-slate-300 transition-colors"
                aria-label="Clear search"
              >
                <i className="ph ph-x text-[10px] font-bold" />
              </button>
            )}
          </form>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-200/60 p-1">
            <button
              type="button"
              onClick={() => {
                setTypeFilter('');
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                typeFilter === '' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('desk');
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                typeFilter === 'desk' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Desks
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('meeting_room');
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                typeFilter === 'meeting_room' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Meeting Rooms
            </button>
          </div>
        </div>

        {/* Spaces Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Workspace
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Type
                </th>
                <th className="hidden px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:table-cell">
                  Capacity
                </th>
                <th className="hidden px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 lg:table-cell">
                  Key Amenities
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-slate-400" colSpan={5}>
                    <div className="flex items-center justify-center gap-2">
                      <i className="ph ph-spinner animate-spin text-lg" /> Loading spaces...
                    </div>
                  </td>
                </tr>
              ) : result.data.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-slate-500" colSpan={5}>
                    No spaces match your current search.
                  </td>
                </tr>
              ) : (
                result.data.map((space) => {
                  const isDesk = space.type === 'desk';
                  return (
                    <tr
                      key={space.id}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      {/* Workspace Name & Image */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              resolveImageUrl(space.imageUrl) ||
                              (isDesk
                                ? 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80'
                                : 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=400&q=80')
                            }
                            alt={space.name}
                            className="h-11 w-14 shrink-0 rounded-xl object-cover ring-1 ring-slate-200/80 shadow-xs"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-bold text-navy-900 group-hover:text-teal-600 transition-colors">
                              {space.name}
                            </p>
                            <p className="line-clamp-1 text-xs text-slate-400">
                              {space.description || 'No description provided'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Space Type Badge */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${
                            isDesk
                              ? 'bg-blue-50 text-blue-700 ring-blue-200'
                              : 'bg-teal-50 text-teal-700 ring-teal-200'
                          }`}
                        >
                          <i className={`ph ${SPACE_TYPE_ICONS[space.type]}`} />
                          {SPACE_TYPE_LABELS[space.type]}
                        </span>
                      </td>

                      {/* Capacity */}
                      <td className="hidden px-5 py-3.5 whitespace-nowrap text-slate-600 font-medium sm:table-cell">
                        <span className="inline-flex items-center gap-1">
                          <i className="ph ph-users text-slate-400" />
                          {space.capacity} {space.capacity === 1 ? 'Seat' : 'Seats'}
                        </span>
                      </td>

                      {/* Amenities Chips */}
                      <td className="hidden px-5 py-3.5 lg:table-cell">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {space.amenities.slice(0, 2).map((amenity) => (
                            <span
                              key={amenity}
                              className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                            >
                              {amenity}
                            </span>
                          ))}
                          {space.amenities.length > 2 && (
                            <span className="rounded-lg bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-400">
                              +{space.amenities.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Manage Maintenance Windows"
                            aria-label={`Maintenance for ${space.name}`}
                            onClick={() => setDialog({ mode: 'maintenance', space })}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors shadow-xs"
                          >
                            <i className="ph ph-wrench text-base" />
                          </button>
                          <button
                            type="button"
                            title="Edit Space"
                            aria-label={`Edit ${space.name}`}
                            onClick={() => setDialog({ mode: 'edit', space })}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-xs"
                          >
                            <i className="ph ph-pencil-simple text-base" />
                          </button>
                          <button
                            type="button"
                            title="Delete Space"
                            aria-label={`Delete ${space.name}`}
                            onClick={() => setDialog({ mode: 'delete', space })}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors shadow-xs"
                          >
                            <i className="ph ph-trash text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination pagination={result.pagination} onChange={setPage} noun="workspace" />

      {/* Modal Dialogs */}
      {dialog?.mode === 'create' && (
        <Modal
          title="Add New Workspace"
          subtitle="Create a verified desk or meeting room for member reservations."
          onClose={() => setDialog(null)}
        >
          <SpaceForm
            onCancel={() => setDialog(null)}
            onSubmit={async (payload) => {
              await spacesApi.create(payload);
              await afterWrite(`${payload.name} was created successfully.`);
            }}
          />
        </Modal>
      )}

      {dialog?.mode === 'edit' && (
        <Modal
          title="Edit Workspace"
          subtitle={dialog.space.name}
          onClose={() => setDialog(null)}
        >
          <SpaceForm
            space={dialog.space}
            onCancel={() => setDialog(null)}
            onSubmit={async (payload) => {
              await spacesApi.update(dialog.space.id, payload);
              await afterWrite(`${payload.name} was updated successfully.`);
            }}
          />
        </Modal>
      )}

      {dialog?.mode === 'maintenance' && (
        <Modal
          title="Maintenance Windows"
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
            { label: 'Capacity', value: `${dialog.space.capacity} ${dialog.space.capacity === 1 ? 'seat' : 'seats'}` },
          ]}
          note="Every booking and maintenance window for this space will be permanently removed. This cannot be undone."
          cancelLabel="Keep workspace"
          confirmLabel="Delete workspace"
          onConfirm={async () => {
            await spacesApi.remove(dialog.space.id);
            await afterWrite(`${dialog.space.name} was deleted.`);
          }}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

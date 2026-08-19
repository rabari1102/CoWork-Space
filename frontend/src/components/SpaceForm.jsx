import { useState } from 'react';
import Alert from './Alert.jsx';
import Select from './Select.jsx';
import { readApiError } from '../api/client.js';

const BLANK = { name: '', type: 'meeting_room', capacity: 1, amenities: '', description: '' };

/** Shared by the create and edit modals on the admin spaces page. */
export default function SpaceForm({ space, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    space
      ? {
          name: space.name,
          type: space.type,
          capacity: space.capacity,
          amenities: space.amenities.join(', '),
          description: space.description,
        }
      : BLANK,
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onSubmit({
        name: form.name,
        type: form.type,
        capacity: Number(form.capacity),
        amenities: form.amenities
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        description: form.description,
      });
    } catch (err) {
      setError(readApiError(err, 'Could not save the space'));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="space-name">
          Name
        </label>
        <input id="space-name" className="field" required value={form.name} onChange={update('name')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="space-type">
            Type
          </label>
          <Select
            id="space-type"
            ariaLabel="Type"
            options={[
              { value: 'meeting_room', label: 'Meeting room' },
              { value: 'desk', label: 'Desk' },
            ]}
            value={form.type}
            onChange={(value) => setForm({ ...form, type: value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="space-capacity">
            Capacity (seats)
          </label>
          <input
            id="space-capacity"
            type="number"
            min="1"
            className="field"
            required
            value={form.capacity}
            onChange={update('capacity')}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="space-amenities">
          Amenities
        </label>
        <input
          id="space-amenities"
          className="field"
          placeholder="e.g. Projector, Whiteboard, Coffee"
          value={form.amenities}
          onChange={update('amenities')}
        />
        <p className="mt-1 text-xs text-slate-500">Separate amenities with commas.</p>
      </div>

      <div>
        <label className="label" htmlFor="space-description">
          Description
        </label>
        <textarea
          id="space-description"
          className="field"
          rows={3}
          value={form.description}
          onChange={update('description')}
        />
      </div>

      <Alert>{error}</Alert>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save space'}
        </button>
      </div>
    </form>
  );
}

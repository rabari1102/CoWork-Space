import { useState } from 'react';
import Alert from './Alert.jsx';
import { readApiError } from '../api/client.js';

const BLANK = { name: '', type: 'desk', capacity: 1, amenities: '', description: '' };

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
    } finally {
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="space-type">
            Type
          </label>
          <select id="space-type" className="field" value={form.type} onChange={update('type')}>
            <option value="desk">Desk</option>
            <option value="meeting_room">Meeting room</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="space-capacity">
            Capacity
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
          placeholder="Monitor, Whiteboard, Projector"
          value={form.amenities}
          onChange={update('amenities')}
        />
        <p className="mt-1 text-xs text-slate-500">Separate each amenity with a comma.</p>
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

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save space'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

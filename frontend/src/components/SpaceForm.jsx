import { useRef, useState } from 'react';
import Alert from './Alert.jsx';
import Select from './Select.jsx';
import { readApiError } from '../api/client.js';
import { uploadApi } from '../api/endpoints.js';
import { resolveImageUrl } from '../utils/format.js';

const BLANK = {
  name: '',
  type: 'meeting_room',
  capacity: 4,
  amenities: '',
  description: '',
  imageUrl: '',
};

const SUGGESTED_AMENITIES = [
  'Dual 4K Displays',
  'Ergonomic Chair',
  'Gigabit Fiber WiFi',
  'Smart Whiteboard',
  'AV Conferencing',
  'Soundproof Acoustic Walls',
  'Coffee & Lounge Access',
  'Sit-Stand Converter',
];

export default function SpaceForm({ space, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    space
      ? {
          name: space.name,
          type: space.type,
          capacity: space.capacity,
          amenities: space.amenities.join(', '),
          description: space.description,
          imageUrl: space.imageUrl || '',
        }
      : BLANK,
  );
  const [imageMode, setImageMode] = useState(
    space?.imageUrl?.startsWith('http') && !space?.imageUrl?.includes('/uploads/')
      ? 'url'
      : 'file',
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const currentAmenities = form.amenities
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const toggleAmenity = (item) => {
    let updated;
    if (currentAmenities.includes(item)) {
      updated = currentAmenities.filter((a) => a !== item);
    } else {
      updated = [...currentAmenities, item];
    }
    setForm({ ...form, amenities: updated.join(', ') });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB.');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const res = await uploadApi.uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: res.url }));
    } catch (err) {
      setUploadError(readApiError(err, 'Failed to upload image. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onSubmit({
        name: form.name.trim(),
        type: form.type,
        capacity: Number(form.capacity),
        amenities: form.amenities
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
      });
    } catch (err) {
      setError(readApiError(err, 'Could not save the workspace'));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3.5">
      {/* Row 1: Name & Type */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="label text-xs font-bold text-navy-900" htmlFor="space-name">
            Workspace Name
          </label>
          <input
            id="space-name"
            className="field py-2 text-xs sm:text-sm"
            required
            placeholder="e.g. Executive Meeting Room 4A"
            value={form.name}
            onChange={update('name')}
          />
        </div>

        <div>
          <label className="label text-xs font-bold text-navy-900" htmlFor="space-type">
            Type
          </label>
          <Select
            id="space-type"
            ariaLabel="Type"
            options={[
              { value: 'meeting_room', label: 'Meeting Room' },
              { value: 'desk', label: 'Desk' },
            ]}
            value={form.type}
            onChange={(value) => setForm({ ...form, type: value })}
          />
        </div>
      </div>

      {/* Row 2: Capacity */}
      <div>
        <label className="label text-xs font-bold text-navy-900" htmlFor="space-capacity">
          Capacity (Seats)
        </label>
        <input
          id="space-capacity"
          type="number"
          min="1"
          max="100"
          className="field py-2 text-xs sm:text-sm"
          required
          value={form.capacity}
          onChange={update('capacity')}
        />
      </div>

      {/* Row 3: Photo Selection (Local Upload or Web URL) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label text-xs font-bold text-navy-900 mb-0">Workspace Photo</label>
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setImageMode('file')}
              className={`rounded-md px-2 py-0.5 transition-all ${
                imageMode === 'file' ? 'bg-white text-navy-900 shadow-xs font-bold' : 'text-slate-500 hover:text-navy-900'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setImageMode('url')}
              className={`rounded-md px-2 py-0.5 transition-all ${
                imageMode === 'url' ? 'bg-white text-navy-900 shadow-xs font-bold' : 'text-slate-500 hover:text-navy-900'
              }`}
            >
              Web URL
            </button>
          </div>
        </div>

        {imageMode === 'file' ? (
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            {form.imageUrl ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={resolveImageUrl(form.imageUrl)}
                    alt="Uploaded preview"
                    className="h-12 w-16 shrink-0 rounded-xl object-cover ring-1 ring-slate-200 shadow-xs"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-navy-900 truncate">
                      {form.imageUrl.startsWith('/uploads/')
                        ? form.imageUrl.replace('/uploads/', '')
                        : 'Custom Workspace Photo'}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                      <i className="ph ph-check-circle-fill" /> Ready to save
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                    className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-rose-600 ring-1 ring-slate-200 hover:bg-rose-50 transition-colors"
                    aria-label="Remove image"
                  >
                    <i className="ph ph-trash" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-teal-500 bg-teal-50/50'
                    : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 py-1">
                    <i className="ph ph-spinner animate-spin text-base" /> Uploading image from your device...
                  </div>
                ) : (
                  <>
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-600 mb-1.5">
                      <i className="ph ph-upload-simple text-lg font-bold" />
                    </div>
                    <p className="text-xs font-bold text-navy-900">
                      Click to choose photo <span className="font-normal text-slate-500">or drag &amp; drop</span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      PNG, JPG, WEBP, or GIF up to 10MB
                    </p>
                  </>
                )}
              </div>
            )}

            {uploadError && <p className="text-[11px] font-semibold text-rose-600">{uploadError}</p>}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              id="space-image"
              className="field py-2 text-xs sm:text-sm flex-1"
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={form.imageUrl}
              onChange={update('imageUrl')}
            />
            {form.imageUrl ? (
              <img
                src={resolveImageUrl(form.imageUrl)}
                alt="Preview"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                className="h-9 w-12 shrink-0 rounded-xl object-cover ring-1 ring-slate-200 shadow-xs"
              />
            ) : (
              <div className="grid h-9 w-12 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
                <i className="ph ph-image text-base" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 4: Amenities & Quick Chips */}
      <div>
        <label className="label text-xs font-bold text-navy-900" htmlFor="space-amenities">
          Amenities
        </label>
        <input
          id="space-amenities"
          className="field py-2 text-xs sm:text-sm"
          placeholder="e.g. Dual 4K Displays, Ergonomic Chair, Whiteboard"
          value={form.amenities}
          onChange={update('amenities')}
        />
        <div className="mt-1.5 flex flex-wrap gap-1">
          {SUGGESTED_AMENITIES.map((item) => {
            const isSelected = currentAmenities.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleAmenity(item)}
                className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-all ${
                  isSelected
                    ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 5: Description */}
      <div>
        <label className="label text-xs font-bold text-navy-900" htmlFor="space-description">
          Description
        </label>
        <textarea
          id="space-description"
          className="field text-xs sm:text-sm"
          rows={2}
          placeholder="Describe lighting, audio-visual equipment, atmosphere, or special guidelines..."
          value={form.description}
          onChange={update('description')}
        />
      </div>

      <Alert>{error}</Alert>

      {/* Row 6: Action Buttons */}
      <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
        <button
          type="button"
          className="btn-secondary py-2 text-xs sm:text-sm"
          onClick={onCancel}
          disabled={submitting || uploading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-500/20 hover:from-teal-600 hover:to-cyan-700 transition-all active:scale-[0.98]"
          disabled={submitting || uploading}
        >
          {submitting ? (
            <>
              <i className="ph ph-circle-notch animate-spin text-sm" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Workspace</span>
          )}
        </button>
      </div>
    </form>
  );
}

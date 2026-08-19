import { useState } from 'react';
import Alert from './Alert.jsx';
import Modal from './Modal.jsx';
import { readApiError } from '../api/client.js';
import { authApi } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ProfileModal({ initialTab = 'view', onClose }) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e?.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (!email.trim()) {
      setError('Email cannot be empty.');
      return;
    }
    if (password && password.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
      };
      if (password) {
        payload.password = password;
      }

      const updatedUser = await authApi.updateProfile(payload);
      updateUser(updatedUser);
      toast('Profile updated successfully.', 'success');
      setPassword('');
      setConfirmPassword('');
      setActiveTab('view');
    } catch (err) {
      setError(readApiError(err, 'Could not update profile.'));
    } finally {
      setLoading(false);
    }
  };

  const roleBadge =
    user?.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-brand-50 text-brand-700';

  return (
    <Modal
      title={activeTab === 'view' ? 'User Profile' : 'Edit Profile'}
      subtitle={activeTab === 'view' ? 'View and manage your account details.' : 'Update your personal details or password.'}
      onClose={onClose}
      footer={
        activeTab === 'view' ? (
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className="btn-primary flex items-center gap-2"
            >
              <i className="ph ph-pencil-simple text-base" />
              <span>Edit Profile</span>
            </button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setActiveTab('view');
                setError('');
              }}
              className="btn-ghost text-xs"
              disabled={loading}
            >
              Back to View
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        )
      }
    >
      <div className="space-y-6">
        {/* User Card Info */}
        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-cyan-500 text-xl font-bold text-white shadow-md">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-base font-bold text-navy-900">{user?.name}</h4>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${roleBadge} rounded-full px-2 py-0.5`}
              >
                {user?.role}
              </span>
            </div>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('view');
              setError('');
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'view'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <i className="ph ph-user mr-1.5" />
            Overview
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('edit');
              setError('');
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'edit'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <i className="ph ph-pencil-simple mr-1.5" />
            Edit & Update
          </button>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        {activeTab === 'view' ? (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <span className="text-xs font-medium text-slate-400">Full Name</span>
              <p className="mt-0.5 font-semibold text-slate-800">{user?.name}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <span className="text-xs font-medium text-slate-400">Email Address</span>
              <p className="mt-0.5 font-semibold text-slate-800">{user?.email}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <span className="text-xs font-medium text-slate-400">Account Role</span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${roleBadge} rounded-full px-2 py-0.5`}
                >
                  {user?.role}
                </span>
                <span className="text-xs text-slate-500">
                  {user?.role === 'admin'
                    ? 'Full administrative access to manage spaces, bookings, and users'
                    : 'Standard member account to browse and book workspaces'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="label">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="label">
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <i className="ph ph-lock text-sm text-slate-500" />
                <span>Change Password (optional)</span>
              </div>

              <div>
                <label htmlFor="profile-password" className="text-xs text-slate-500 block mb-1">
                  New Password
                </label>
                <input
                  id="profile-password"
                  type="password"
                  className="field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep unchanged"
                />
              </div>

              {password && (
                <div>
                  <label htmlFor="profile-confirm-password" className="text-xs text-slate-500 block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="profile-confirm-password"
                    type="password"
                    className="field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

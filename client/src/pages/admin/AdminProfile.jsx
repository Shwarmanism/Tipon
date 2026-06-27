import { useState, useEffect } from 'react';
import './admin.css';

function AdminProfile() {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [editMode, setEditMode]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({ name: '', email: '' });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess]   = useState(false);
  const [passwordError, setPasswordError]       = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setUser(data);
      setForm({ name: data.name, email: data.email });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();
      setUser(data);
      setEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password change failed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  }

  function handleCancel() {
    setForm({ name: user.name, email: user.email });
    setEditMode(false);
  }

  if (loading) return <p className="text-muted p-4">Loading profile...</p>;
  if (!user)   return <p className="text-muted p-4">Profile not found.</p>;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="admin-profile-page">

      {/* ── Page title ───────────────────────────────────────────────────── */}
      <div className="admin-page-header">
        <h4 className="admin-page-title">My Profile</h4>
        <p className="admin-page-subtitle">Manage your account information and password.</p>
      </div>

      {/* ── Avatar + name header ─────────────────────────────────────────── */}
      <div className="profile-header">
        <div className="profile-avatar admin-avatar">{initials}</div>
        <div>
          <h4 className="profile-name">{user.name}</h4>
          <p className="profile-email-display">{user.email}</p>
          <span className="admin-role-badge">
            <i className="bi bi-shield-check me-1"></i>Admin Staff
          </span>
        </div>
      </div>

      {/* Success toast */}
      {saveSuccess && (
        <div className="profile-toast">
          <i className="bi bi-check-circle-fill"></i> Profile updated successfully!
        </div>
      )}

      {/* ── Personal Information Card ─────────────────────────────────────── */}
      <div className="profile-card">
        <div className="profile-card-header">
          <h5 className="profile-card-title">Personal Information</h5>
          {!editMode && (
            <button
              className="btn btn-profile-edit"
              onClick={() => setEditMode(true)}
            >
              <i className="bi bi-pencil me-1"></i> Edit
            </button>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleSave}>
            <div className="profile-field">
              <label className="profile-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="profile-input"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="profile-field">
              <label className="profile-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="profile-input"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="profile-form-actions">
              <button
                type="button"
                className="btn btn-profile-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-profile-save"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="profile-field">
              <label className="profile-label">Full Name</label>
              <p className="profile-value">{user.name}</p>
            </div>
            <div className="profile-field">
              <label className="profile-label">Email Address</label>
              <p className="profile-value">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Change Password Card ──────────────────────────────────────────── */}
      <div className="profile-card">
        <div className="profile-card-header">
          <h5 className="profile-card-title">Change Password</h5>
        </div>

        {passwordSuccess && (
          <div className="profile-toast">
            <i className="bi bi-check-circle-fill"></i> Password changed successfully!
          </div>
        )}

        {passwordError && (
          <div className="profile-error">
            <i className="bi bi-exclamation-circle-fill"></i> {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="profile-field">
            <label className="profile-label">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              className="profile-input"
              placeholder="Enter current password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="profile-field">
            <label className="profile-label">New Password</label>
            <input
              type="password"
              name="newPassword"
              className="profile-input"
              placeholder="Minimum 8 characters"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="profile-field">
            <label className="profile-label">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="profile-input"
              placeholder="Re-enter your new password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="profile-form-actions">
            <button
              type="submit"
              className="btn btn-profile-save"
              disabled={changingPassword}
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

export default AdminProfile;

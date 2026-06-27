import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './auth.css';

// ─── Role options (keep in sync with backend) ─────────────────────────────────
const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'admin',   label: 'Admin'   },
];
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name:                  '',
  email:                 '',
  role:                  '',
  password:              '',
  password_confirmation: '',
};

export default function Register() {
  const navigate                      = useNavigate();
  const [form, setForm]               = useState(EMPTY_FORM);
  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [errors, setErrors]           = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim())                  newErrors.name     = 'Full name is required.';
    if (!form.email.trim())                 newErrors.email    = 'University email is required.';
    if (!form.role)                         newErrors.role     = 'Please select a role.';
    if (!form.password)                     newErrors.password = 'Password is required.';
    if (form.password !== form.password_confirmation)
      newErrors.password_confirmation = 'Passwords do not match.';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name:                  form.name,
          email:                 form.email,
          role:                  form.role,
          password:              form.password,
          password_confirmation: form.password_confirmation,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors(data.errors ?? { email: 'Registration failed. Check your inputs.' });
        return;
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);

      if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
      } else {
          navigate('/');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setSubmitting(false);
    }
  }

  return (

      <div className="auth-card">

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">
          Only PUP students with an official university email may register.
        </p>

        <form onSubmit={handleSubmit} noValidate>

          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label-custom">Full Name</label>
            <div className="auth-input-wrapper">
              <i className="bi bi-person auth-input-icon"></i>
              <input
                type="text"
                name="name"
                className={`form-control form-control-custom auth-input ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
          </div>

          {/* Email + Role */}
          <div className="row g-3 mb-3">
            <div className="col-8">
              <label className="form-label-custom">University Email</label>
              <div className="auth-input-wrapper">
                <i className="bi bi-envelope auth-input-icon"></i>
                <input
                  type="email"
                  name="email"
                  className={`form-control form-control-custom auth-input ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="juan@iskolarngbayan.pup.edu.ph"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <p className="auth-hint">Use your official PUP Iskolar ng Bayan email.</p>
            </div>
            <div className="col-4">
              <label className="form-label-custom">Role</label>
              <select
                name="role"
                className={`form-select form-control-custom ${errors.role ? 'is-invalid' : ''}`}
                value={form.role}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {errors.role && <div className="invalid-feedback">{errors.role}</div>}
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label-custom">Password</label>
            <div className="auth-input-wrapper">
              <i className="bi bi-lock auth-input-icon"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`form-control form-control-custom auth-input auth-input-icon-right ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((p) => !p)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label-custom">Confirm Password</label>
            <div className="auth-input-wrapper">
              <i className="bi bi-lock auth-input-icon"></i>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="password_confirmation"
                className={`form-control form-control-custom auth-input auth-input-icon-right ${errors.password_confirmation ? 'is-invalid' : ''}`}
                placeholder="Confirm your password"
                value={form.password_confirmation}
                onChange={handleChange}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowConfirmPassword((p) => !p)}
              >
                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
              {errors.password_confirmation && (
                <div className="invalid-feedback">{errors.password_confirmation}</div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-create-event w-100 py-2"
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>

          {/* Sign in link */}
          <p className="text-center mt-3 mb-0" style={{ fontSize: '0.875rem', color: '#888' }}>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign In</Link>
          </p>

        </form>
      </div>
  );
}

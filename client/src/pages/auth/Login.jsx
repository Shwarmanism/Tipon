import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './auth.css';
import logo from '../../assets/images/logo.png';

const EMPTY_FORM = {
  email:    '',
  password: '',
};

export default function Login() {
  const navigate                        = useNavigate();
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [errors, setErrors]             = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email    = 'Email is required.';
    if (!form.password)     newErrors.password = 'Password is required.';
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
      // Point directly to the Laravel local server
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email:    form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        // Catch the specific error structure we built in Laravel
        setErrors(data.errors || { email: 'Invalid credentials.' });
        return;
      }

      const data = await res.json();
      
      // Store the token in the browser so you can use it for future API calls
      localStorage.setItem('token', data.token);
      
      // Check the user role to route them to the correct dashboard
      if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
      } else {
          navigate('/user/dashboard'); // Student Bulletin Board
      }

    } catch (error) {
      console.error('Login failed:', error);
      setErrors({ email: 'Server connection failed. Is Laravel running?' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">

      {/* Logo */}
      <div className="text-center mb-4">
        <img src={logo} alt="Tipon" className="auth-logo" />
      </div>

      <h1 className="auth-title">Welcome Back</h1>
      <p className="auth-subtitle">Sign in to your Tipon account</p>

      <form onSubmit={handleSubmit} noValidate>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label-custom">Webmail</label>
          <div className="auth-input-wrapper">
            <i className="bi bi-envelope auth-input-icon"></i>
            <input
              type="email"
              name="email"
              className={`form-control form-control-custom auth-input ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
        </div>

        {/* Password */}
        <div className="mb-2">
          <label className="form-label-custom">Password</label>
          <div className="auth-input-wrapper">
            <i className="bi bi-lock auth-input-icon"></i>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              className={`form-control form-control-custom auth-input auth-input-icon-right ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Enter your password"
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

        {/* Forgot password */}
        <div className="text-end mb-4">
          <a href="/forgot-password" className="auth-link" style={{ fontSize: '0.82rem' }}>
            Forgot Password?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-create-event w-100 py-2"
          disabled={submitting}
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Register link */}
        <p className="text-center mt-3 mb-0" style={{ fontSize: '0.875rem', color: '#888' }}>
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Sign Up</Link>
        </p>

      </form>
    </div>
  );
}
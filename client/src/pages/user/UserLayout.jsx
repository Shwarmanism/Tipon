import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './user.css';
import logo from '../../assets/images/logo.png';

function UserLayout() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearch(e) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // TODO (backend): no dedicated search endpoint in web.php yet.
      // Filtering is done client-side in UserDashboard.
      // If backend adds GET /search?q=... later, navigate here:
      // navigate(`/user/dashboard?q=${encodeURIComponent(searchQuery)}`);
      navigate('/user/dashboard');
    }
  }

  async function handleLogout() {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://127.0.0.1:8000/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }

  return (
    <div className="user-page">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="user-navbar">
        <div className="user-navbar-inner">

          {/* Logo */}
          <div className="user-navbar-logo">
            <img src={logo} alt="Tipon" className="user-navbar-logo-img" />
          </div>

          {/* Nav links */}
          <div className="user-nav-links">
            <NavLink
              to="/user/dashboard"
              className={({ isActive }) =>
                'user-nav-link' + (isActive ? ' active' : '')
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/user/tickets"
              className={({ isActive }) =>
                'user-nav-link' + (isActive ? ' active' : '')
              }
            >
              Wallet
            </NavLink>
            <NavLink
              to="/user/profile"
              className={({ isActive }) =>
                'user-nav-link' + (isActive ? ' active' : '')
              }
            >
              Profile
            </NavLink>
          </div>

          {/* Search */}
          <div className="user-search-wrapper">
            <input
              type="text"
              className="user-search-input"
              placeholder="Search. . ."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <i className="bi bi-sliders user-search-icon"></i>
          </div>

          {/* Logout */}
          <button
            className="btn user-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>

        </div>
      </nav>

      {/* ── Page Content ────────────────────────────────────────────────── */}
      <main className="user-main">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="user-footer">
        © 2026 Tipon. All rights reserved | Developed by Group 7 of BSCS 3–5.
      </footer>

    </div>
  );
}

export default UserLayout;

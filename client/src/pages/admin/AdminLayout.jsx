import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './admin.css';

function AdminLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className="admin-wrapper">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-placeholder"></div>
          <span className="logo-text">Tipon</span>
        </div>

        <hr className="sidebar-divider" />

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-section-label">OVERVIEW</p>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            <i className="bi bi-grid me-2"></i>
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/events"
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            <i className="bi bi-calendar-event me-2"></i>
            Events
          </NavLink>

          <p className="sidebar-section-label mt-3">ACCOUNT</p>
          <NavLink
            to="/admin/profile"
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            <i className="bi bi-person me-2"></i>
            Profile
          </NavLink>
        </nav>

        {/* Bottom user info */}
        <div className="sidebar-user-wrapper">
          <div className="sidebar-user">
            <div className="user-avatar-placeholder"></div>
            <div className="user-info">
              <span className="user-name">Admin Portal</span>
              <span className="user-role">Tipon Admin Staff</span>
            </div>
            <button
              className="btn btn-link sidebar-user-menu p-0"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              <i className="bi bi-three-dots-vertical"></i>
            </button>
          </div>

          {menuOpen && (
            <div className="sidebar-user-dropdown">
              <button
                className="sidebar-user-dropdown-item"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;

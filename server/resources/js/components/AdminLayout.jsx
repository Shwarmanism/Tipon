import { NavLink, Outlet } from 'react-router-dom';
import AdminDashboard from "../pages/AdminDashboard";
import '../../css/admin.css';

function AdminLayout() {
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
        </nav>

        {/* Bottom user info */}
        <div className="sidebar-user">
          <div className="user-avatar-placeholder"></div>
          <div className="user-info">
            <span className="user-name">Admin Portal</span>
            <span className="user-role">Tipon Admin Staff</span>
          </div>
          <button className="btn btn-link sidebar-user-menu p-0">
            <i className="bi bi-three-dots-vertical"></i>
          </button>
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

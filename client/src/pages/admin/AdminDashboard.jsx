import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

// ─── Mock Data (replace with real API responses) ──────────────────────────────
const MOCK_STATS = [
  { label: 'Total Active Events', value: 0 },
  { label: 'Total Registrations', value: 0 },
  { label: 'Total Attendees Checked In', value: 0 },
];

const MOCK_EVENTS = [
  {
    id: 1,
    title: 'CCIS OJT General Assembly',
    category: 'Academic',
    date: 'May 15, 2026',
    venue: 'PUP Gymnasium',
    registrations: '42/50',
    registrationPercent: 84,
    status: 'published',
  },
];
// ─────────────────────────────────────────────────────────────────────────────

function DeleteModal({ event, onConfirm, onCancel }) {
  if (!event) return null;
  return (
    <div className="modal-backdrop-custom" onClick={onCancel}>
      <div
        className="modal-box-custom"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div className="modal-icon-wrap danger">
          <i className="bi bi-trash3"></i>
        </div>
        <h5 className="modal-box-title" id="delete-modal-title">Delete Event</h5>
        <p className="modal-box-body">
          Are you sure you want to delete{' '}
          <strong>&ldquo;{event.title}&rdquo;</strong>?
          This action cannot be undone.
        </p>
        <div className="modal-box-actions">
          <button className="btn btn-modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-modal-danger" onClick={onConfirm}>
            <i className="bi bi-trash3 me-1"></i> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(MOCK_STATS);
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:8000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      setStats(data.stats);
      setEvents(data.events);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleScan(eventId) {
    navigate(`/admin/events/${eventId}/scan`);
  }

  function handleReport(eventId) {
    navigate(`/admin/events/${eventId}/report`);
  }

  function handleEdit(eventId) {
    navigate(`/admin/events/${eventId}/edit`);
  }

  function handleDeleteClick(event) {
    setEventToDelete(event);
  }

  async function handleDeleteConfirm() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://127.0.0.1:8000/api/admin/event/delete/${eventToDelete.id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error('Failed to delete event');
      setEventToDelete(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  }

  function handleDeleteCancel() {
    setEventToDelete(null);
  }

  function handleCreateEvent() {
    navigate('/admin/events/create');
  }

  const STATUS_LABELS = {
    published: 'Published',
    draft: 'Draft',
    cancelled: 'Cancelled',
  };

  return (
    <div className="admin-content">
      {/* Delete confirmation modal */}
      <DeleteModal
        event={eventToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="admin-page-title mb-1">Dashboard</h4>
          <p className="admin-page-subtitle mb-0">
            Overview of all active events and registrations.
          </p>
        </div>
        <button className="btn btn-create-event" onClick={handleCreateEvent}>
          <i className="bi bi-plus me-1"></i> Create Event
        </button>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="stat-icon mb-2"><i className="bi bi-calendar2-check"></i></div>
            <h3 className="stat-value">{loading ? '—' : String(stats[0].value).padStart(2, '0')}</h3>
            <p className="stat-label mb-0">{stats[0].label}</p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="stat-icon mb-2"><i className="bi bi-person-lines-fill"></i></div>
            <h3 className="stat-value">{loading ? '—' : String(stats[1].value).padStart(2, '0')}</h3>
            <p className="stat-label mb-0">{stats[1].label}</p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div className="stat-icon mb-2"><i className="bi bi-patch-check-fill"></i></div>
            <h3 className="stat-value">{loading ? '—' : String(stats[2].value).padStart(2, '0')}</h3>
            <p className="stat-label mb-0">{stats[2].label}</p>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="events-table-wrapper">
        <table className="table admin-table mb-0">
          <thead>
            <tr>
              <th>EVENT TITLE</th>
              <th>CATEGORY</th>
              <th>DATE</th>
              <th>VENUE</th>
              <th>REGISTRATIONS</th>
              <th>STATUS</th>
              <th className="text-end">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  Loading events...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  No events found.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id}>
                  <td className="event-title-cell">{event.title}</td>
                  <td>
                    <span className="badge-category">{event.category}</span>
                  </td>
                  <td>{event.date}</td>
                  <td>{event.venue}</td>
                  <td>
                    <div className="reg-cell">
                      <span className="reg-count">{event.registrations}</span>
                      <div className="progress reg-progress">
                        <div
                          className="progress-bar reg-progress-bar"
                          style={{ width: `${event.registrationPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-status ${event.status}`}>
                      {STATUS_LABELS[event.status] ?? event.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-action-outline"
                        onClick={() => handleScan(event.id)}
                      >
                        <i className="bi bi-qr-code-scan me-1"></i> Scan
                      </button>
                      <button
                        className="btn btn-action-outline"
                        onClick={() => handleReport(event.id)}
                      >
                        <i className="bi bi-file-earmark-text me-1"></i> Report
                      </button>
                      <button
                        className="btn btn-action-edit"
                        onClick={() => handleEdit(event.id)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-action-delete"
                        onClick={() => handleDeleteClick(event)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;

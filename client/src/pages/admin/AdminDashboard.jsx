import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

// ─── Mock Data (replace with real API responses) ──────────────────────────────
// These mirror the shape of what Laravel should return.
// You need to hit the endpoints and set state with the response.

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
    status: 'published', // must match CSS: 'published' | 'draft' | 'cancelled'
  },
];
// ─────────────────────────────────────────────────────────────────────────────

function AdminDashboard() {
  const [stats, setStats] = useState(MOCK_STATS);
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // TODO (backend): replace URLs with your real Laravel API endpoints
      // Expected shape for stats:
      //   [{ label: string, value: number }, ...]
      // Expected shape for events:
      //   [{ id, title, category, date, venue, registrations, registrationPercent, status }, ...]

      // const [statsRes, eventsRes] = await Promise.all([
      //   fetch('/api/admin/stats'),
      //   fetch('/api/admin/events'),
      // ]);
      // const statsData = await statsRes.json();
      // const eventsData = await eventsRes.json();
      // setStats(statsData);
      // setEvents(eventsData);

      // Remove the two lines below once the API is connected:
      setStats(MOCK_STATS);
      setEvents(MOCK_EVENTS);
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
    // TODO (backend): navigate to report page for this event
    console.log('Report event:', eventId);
  }

  function handleEdit(eventId) {
    navigate(`/admin/events/${eventId}/edit`);
  }

  function handleDelete(eventId) {
    // TODO (backend): call DELETE /api/admin/events/:id then refetch
    console.log('Delete event:', eventId);
  }

  function handleCreateEvent() {
    navigate('/admin/events/create');
  }

  // ─── Status label display (matches CSS class names) ─────────────────────────
  const STATUS_LABELS = {
    published: 'Published',
    draft: 'Draft',
    cancelled: 'Cancelled',
  };

  return (
    <div className="admin-content">
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
                        onClick={() => handleDelete(event.id)}
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

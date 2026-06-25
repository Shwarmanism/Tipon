import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

// ─── Mock Data (replace with real API responses) ──────────────────────────────
// Expected shape from GET /api/admin/events/published:
// [{ id, title, date, venue, category, totalSlots, registeredCount, posterUrl, status }]

const MOCK_EVENTS = [
  {
    id: 1,
    title: 'CCIS OJT General Assembly',
    date: 'May 15, 2026',
    venue: 'PUP Gymnasium',
    category: 'Academic',
    totalSlots: 50,
    registeredCount: 42,
    posterUrl: null,
    status: 'published',
  },
  {
    id: 2,
    title: 'PUP AWS Cloud Summit',
    date: 'Jun 10, 2026',
    venue: 'Claro M. Recto Hall',
    category: 'Conference',
    totalSlots: 150,
    registeredCount: 0,
    posterUrl: null,
    status: 'published',
  },
  {
    id: 3,
    title: 'BSCS Recognition Night',
    date: 'Jul 28, 2026',
    venue: 'PUP Gymnasium',
    category: 'Cultural',
    totalSlots: 200,
    registeredCount: 85,
    posterUrl: null,
    status: 'published',
  },
];
// ─────────────────────────────────────────────────────────────────────────────

function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents]       = useState(MOCK_EVENTS);
  const [loading, setLoading]     = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered]   = useState(MOCK_EVENTS);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      // TODO (backend): fetch published events
      // Maps to: GET /api/admin/events/published
      // Expected shape: [{ id, title, date, venue, category, totalSlots, registeredCount, posterUrl, status }]
      //
      // const token = localStorage.getItem('token');
      // const res = await fetch('http://127.0.0.1:8000/api/admin/events/published', {
      //   headers: {
      //     'Accept': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });
      // if (!res.ok) throw new Error('Failed to fetch events');
      // const data = await res.json();
      // setEvents(data);
      // setFiltered(data);

      // Remove once API is connected:
      setEvents(MOCK_EVENTS);
      setFiltered(MOCK_EVENTS);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents(MOCK_EVENTS);
      setFiltered(MOCK_EVENTS);
    } finally {
      setLoading(false);
    }
  }

  // ─── Search — filters locally ─────────────────────────────────────────────
  function handleSearch(e) {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setFiltered(events);
      return;
    }
    setFiltered(
      events.filter(
        (ev) =>
          ev.title.toLowerCase().includes(query.toLowerCase()) ||
          ev.venue.toLowerCase().includes(query.toLowerCase()) ||
          ev.category.toLowerCase().includes(query.toLowerCase())
      )
    );
  }

  function handleViewEvent(eventId) {
    navigate(`/admin/events/${eventId}/details`);
  }

  return (
    <div className="admin-content">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="admin-page-title mb-1">Events</h4>
          <p className="admin-page-subtitle mb-0">
            Browse all published events visible to users.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control form-control-custom"
            placeholder="Search events..."
            value={searchQuery}
            onChange={handleSearch}
            style={{ width: 260, paddingRight: '2.2rem' }}
          />
          <i
            className="bi bi-search"
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#bbb',
              fontSize: '0.875rem',
            }}
          ></i>
        </div>
      </div>

      {/* ── Events Grid ─────────────────────────────────────────────────── */}
      {loading ? (
        <p className="text-muted">Loading events...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">No published events found.</p>
      ) : (
        <div className="admin-events-grid">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="admin-event-card"
              onClick={() => handleViewEvent(event.id)}
            >
              {/* Poster */}
              <div className="admin-event-card-poster">
                {/* Top bar */}
                <div className="user-card-top-bar">
                  <div className="user-card-slots">
                    <i className="bi bi-people-fill user-card-slots-icon"></i>
                    <div className="user-slots-progress">
                      <div
                        className="user-slots-bar"
                        style={{
                          width: `${(event.registeredCount / event.totalSlots) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="user-slots-count">
                      {event.registeredCount}/{event.totalSlots}
                    </span>
                  </div>
                  <span className="user-card-category">{event.category}</span>
                </div>

                {event.posterUrl ? (
                  <img
                    src={event.posterUrl}
                    alt={event.title}
                    className="admin-event-card-poster-img"
                  />
                ) : (
                  <div className="admin-event-card-poster-placeholder"></div>
                )}
              </div>

              {/* Card body */}
              <div className="admin-event-card-body">
                <h5 className="admin-event-card-title">{event.title}</h5>
                <p className="admin-event-card-meta">
                  <i className="bi bi-calendar3 me-2"></i>{event.date}
                </p>
                <p className="admin-event-card-meta">
                  <i className="bi bi-geo-alt me-2"></i>{event.venue}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminEvents;

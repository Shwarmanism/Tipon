import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './user.css';

// ─── Mock Data (replace with real API responses) ──────────────────────────────
// These mirror the shape of what Laravel should return.
// Expected event shape from GET /dashboard:
// {
//   id, title, date, venue, category,
//   totalSlots, registeredCount, posterUrl,
//   status: 'available' | 'full' | 'coming_soon' | 'slots_left' | 'registered'
//   slotsLeft: number (null if not applicable)
// }

const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Event Title',
    date: 'Mon Jul 28, 2026 – 2–5 PM',
    venue: 'Claro M. Recto Hall',
    category: 'Tag Here',
    totalSlots: 50,
    registeredCount: 1,
    posterUrl: null,
    status: 'slots_left',
    slotsLeft: 5,
  },
  {
    id: 2,
    title: 'Event Title',
    date: 'Mon Jul 28, 2026 – 2–5 PM',
    venue: 'Claro M. Recto Hall',
    category: 'Conference',
    totalSlots: 50,
    registeredCount: 1,
    posterUrl: null,
    status: 'full',
    slotsLeft: 0,
  },
  {
    id: 3,
    title: 'Event Title',
    date: 'Mon Jul 28, 2026 – 2–5 PM',
    venue: 'Claro M. Recto Hall',
    category: 'Conference',
    totalSlots: 50,
    registeredCount: 1,
    posterUrl: null,
    status: 'registered',
    slotsLeft: 0,
  },
  {
    id: 4,
    title: 'Event Title',
    date: 'Mon Jul 28, 2026 – 2–5 PM',
    venue: 'Claro M. Recto Hall',
    category: 'Tag Here',
    totalSlots: 50,
    registeredCount: 1,
    posterUrl: null,
    status: 'available',
    slotsLeft: null,
  },
  {
    id: 5,
    title: 'Event Title',
    date: 'Mon Jul 28, 2026 – 2–5 PM',
    venue: 'Claro M. Recto Hall',
    category: 'Tag Here',
    totalSlots: 50,
    registeredCount: 1,
    posterUrl: null,
    status: 'coming_soon',
    slotsLeft: null,
  },
  {
    id: 6,
    title: 'Event Title',
    date: 'Mon Jul 28, 2026 – 2–5 PM',
    venue: 'Claro M. Recto Hall',
    category: 'Tag Here',
    totalSlots: 50,
    registeredCount: 1,
    posterUrl: null,
    status: 'slots_left',
    slotsLeft: 15,
  },
];
// ─────────────────────────────────────────────────────────────────────────────

function UserDashboard() {
  const navigate = useNavigate();
  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:8000/api/user/dashboard', {
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data.events);
      setTotalEvents(data.total);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }

  // ─── Register for event ───────────────────────────────────────────────────
  async function handleRegister(eventId) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/api/user/register/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      alert(data.message);
      await fetchEvents(); // refetch to update status
    } catch (error) {
      console.error('Failed to register:', error);
      alert('Registration failed: ' + error.message);
    }
  }

  // ─── Join waitlist ─────────────────────────────────────────────────────────
  function handleJoinWaitlist(eventId) {
    // We use the same register endpoint for waitlisting
    handleRegister(eventId);
  }

  // ─── View ticket ──────────────────────────────────────────────────────────
  function handleViewTicket(eventId) {
    // Maps to: GET /ticket/{id}  (TicketController@showQR)
    navigate(`/user/tickets/${eventId}`);
  }

  // ─── Navigate to event details ────────────────────────────────────────────
  function handleViewEvent(eventId) {
    // Maps to: GET /event/{id}  (EventController@show)
    navigate(`/user/events/${eventId}`);
  }

  // ─── Status badge config ──────────────────────────────────────────────────
  function getStatusBadge(event) {
    switch (event.status) {
      case 'slots_left':
        return (
          <span className="user-status-badge slots-left">
            {event.slotsLeft} slots left!
          </span>
        );
      case 'full':
        return (
          <span className="user-status-badge full">
            Full slots reached!
          </span>
        );
      case 'registered':
        return null;
      case 'available':
        return (
          <span className="user-status-badge available">
            Available
          </span>
        );
      case 'coming_soon':
        return (
          <span className="user-status-badge coming-soon">
            Coming soon
          </span>
        );
      default:
        return null;
    }
  }

  // ─── Action button config ─────────────────────────────────────────────────
  function getActionButton(event) {
    switch (event.status) {
      case 'available':
      case 'slots_left':
        return (
          <button
            className="btn btn-user-register"
            onClick={() => handleViewEvent(event.id)}
          >
            Register
          </button>
        );
      case 'full':
        return (
          <button
            className="btn btn-user-waitlist"
            onClick={() => handleViewEvent(event.id)}
          >
            Join Waitlist
          </button>
        );
      case 'registered':
        return (
          <button
            className="btn btn-user-ticket"
            onClick={() => handleViewTicket(event.id)}
          >
            View Ticket
          </button>
        );
      case 'coming_soon':
        return null;
      default:
        return null;
    }
  }

  return (
    <div>
      {/* Section heading */}
      <div className="mb-4">
        <h4 className="user-section-title">
          Upcoming Events ({loading ? '—' : totalEvents})
        </h4>
        <p className="user-section-subtitle">
          List of events publish by different organizations
        </p>
      </div>

      {/* Event Cards Grid */}
      {loading ? (
        <p className="text-muted">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-muted">No events found.</p>
      ) : (
        <div className="user-events-grid">
          {events.map((event) => (
            <div
              key={event.id}
              className="user-event-card"
              onClick={() => handleViewEvent(event.id)}
            >
              {/* Poster / Image area */}
              <div className="user-card-poster">

                {/* Top bar: slots progress + category */}
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

                {/* Poster image or gradient placeholder */}
                {event.posterUrl ? (
                  <img
                    src={event.posterUrl}
                    alt={event.title}
                    className="user-card-poster-img"
                  />
                ) : (
                  <div className="user-card-poster-placeholder"></div>
                )}

                {/* Status badge overlay */}
                <div className="user-card-status-overlay">
                  {getStatusBadge(event)}
                </div>

              </div>

              {/* Card body */}
              <div className="user-card-body">
                <h5 className="user-card-title">{event.title}</h5>
                <p className="user-card-meta">
                  <i className="bi bi-calendar3 me-2"></i>{event.date}
                </p>
                <p className="user-card-meta">
                  <i className="bi bi-geo-alt me-2"></i>{event.venue}
                </p>

                {/* Action button */}
                <div
                  className="user-card-action"
                  onClick={(e) => e.stopPropagation()}
                >
                  {getActionButton(event)}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;

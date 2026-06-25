import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './user.css';

// ─── Mock Data (replace with real API response) ────────────────────────────
// Expected shape from GET /ticket/{id} (TicketController@showQR):
// {
//   ticketCode, qrUrl, eventStartsAt,
//   event: { id, title, date, venue, audience, organizer,
//             category, description, totalSlots, registeredCount,
//             waitlistedCount, posterUrl }
// }
const MOCK_TICKET = {
  ticketCode: 'TK - 001',
  qrUrl: null, // replace with actual QR image URL from backend
  eventStartsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 2 days 4 hours from now
  event: {
    id: 1,
    title: 'Event Title',
    date: 'Mon Jul 28, 2026, 2:00 – 5:00 PM',
    venue: 'Claro M. Recto Hall',
    audience: 'Open for Computer Science Students',
    organizer: 'Organized by PUP AWS Cloud Club',
    category: 'Conference',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    totalSlots: 50,
    registeredCount: 2,
    waitlistedCount: 0,
    posterUrl: null,
  },
};
// ──────────────────────────────────────────────────────────────────────────

function getCountdown(targetDate) {
  const diff = targetDate - new Date();
  if (diff <= 0) return 'Event has started';
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} min`;
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

function RegisteredEventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(false);
  const [countdown, setCountdown] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  // Live countdown timer
  useEffect(() => {
    if (!ticket) return;
    setCountdown(getCountdown(ticket.eventStartsAt));
    const interval = setInterval(() => {
      setCountdown(getCountdown(ticket.eventStartsAt));
    }, 60000);
    return () => clearInterval(interval);
  }, [ticket]);

  async function fetchTicket() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/api/user/ticket/${id}`, {
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!res.ok) throw new Error('Failed to fetch ticket');
      const data = await res.json();
      data.ticket.eventStartsAt = new Date(data.ticket.event.date); // Based on how event date is formatted
      setTicket(data.ticket);
    } catch (err) {
      console.error('Failed to fetch ticket:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/api/user/cancel/${id}`, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!res.ok) throw new Error('Cancellation failed');

      alert('Registration cancelled successfully.');
      navigate('/user/tickets');
    } catch (err) {
      console.error('Cancellation failed:', err);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <p className="text-muted p-4">Loading ticket...</p>;
  if (!ticket)  return <p className="text-muted p-4">Ticket not found.</p>;

  const { event } = ticket;
  const slotPercent = (event.registeredCount / event.totalSlots) * 100;

  return (
    <div className="event-details-page">

      {/* Back link */}
      <div className="event-details-header">
        <button className="btn-back" onClick={() => navigate('/user/tickets')}>
          <i className="bi bi-chevron-left"></i> Back to My Tickets
        </button>
        <div style={{ width: 160 }}></div>
      </div>

      <div className="event-details-body">

        {/* ── Left column: event info ──────────────────────────── */}
        <div className="event-details-left">

          {/* Poster */}
          <div className="event-poster-wrapper">
            <div className="user-card-top-bar">
              <div className="user-card-slots">
                <i className="bi bi-people-fill user-card-slots-icon"></i>
                <div className="user-slots-progress" style={{ width: 200 }}>
                  <div
                    className="user-slots-bar"
                    style={{ width: `${slotPercent}%` }}
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
                className="event-poster-img"
              />
            ) : (
              <div className="event-poster-placeholder"></div>
            )}
          </div>

          {/* Event metadata */}
          <div className="event-info-section">
            <h2 className="event-info-title">{event.title}</h2>
            <p className="event-info-meta">
              <i className="bi bi-calendar3"></i> {event.date}
            </p>
            <p className="event-info-meta">
              <i className="bi bi-geo-alt"></i> {event.venue}
            </p>
            <p className="event-info-meta">
              <i className="bi bi-people"></i> {event.targetAudience || event.target_audience}
            </p>

            <hr className="event-divider" />

            {/* About */}
            <h6 className="event-section-label">About this Event</h6>
            <p className="event-description">
              {expanded
                ? event.description
                : `${event.description.slice(0, 80)}...`}
              {!expanded && (
                <button
                  className="btn-read-more"
                  onClick={() => setExpanded(true)}
                >
                  {' '}Read More
                </button>
              )}
            </p>

            <hr className="event-divider" />

            {/* Available Slots */}
            <div className="event-slots-row">
              <i className="bi bi-people-fill event-slots-icon"></i>
              <div className="event-slots-bar-wrapper">
                <div
                  className="user-slots-bar"
                  style={{ width: `${slotPercent}%` }}
                ></div>
              </div>
              <span className="event-slots-count">
                {event.registeredCount} / {event.totalSlots}
              </span>
            </div>
            <p className="event-slots-sub">
              {event.registeredCount} registered · {event.waitlistedCount} waitlisted
            </p>
          </div>
        </div>

        {/* ── Right column: ticket ─────────────────────────────── */}
        <div className="event-details-right">
          <div className="event-reg-card">
            <h5 className="event-reg-title">Your Ticket</h5>
            <p className="ticket-registered-label">
              You're registered for this event!
            </p>

            {/* Countdown */}
            <div className="ticket-countdown">
              <i className="bi bi-alarm"></i>
              <span>
                Event starts in <strong>{countdown}</strong>
              </span>
            </div>

            {/* QR instruction */}
            <p className="ticket-qr-instruction">
              Present this QR code at the venue entrance to check in.
            </p>

            {/* QR Code */}
            <div className="ticket-qr-wrapper">
              {ticket.qrUrl ? (
                <img
                  src={ticket.qrUrl}
                  alt="QR Code"
                  className="ticket-qr-img"
                />
              ) : (
                <div className="ticket-qr-placeholder">
                  <i className="bi bi-qr-code"></i>
                </div>
              )}
            </div>

            {/* Ticket code */}
            <p className="ticket-code">{ticket.ticketCode}</p>

            {/* Cancel button */}
            <div className="ticket-cancel-wrapper">
              <button
                className="btn btn-ticket-cancel"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Registration'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RegisteredEventDetails;

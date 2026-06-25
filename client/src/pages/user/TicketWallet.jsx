import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './user.css';

// ─── Mock Data (replace with real API response) ────────────────────────────
// Expected shape from GET /tickets (TicketController@list):
// [
//   {
//     id, ticketCode, qrUrl,
//     status: 'active' | 'waitlisted' | 'attended',
//     event: { id, title, date, venue }
//   }
// ]
const MOCK_TICKETS = [
  {
    id: 1,
    ticketCode: 'TK - 001',
    qrUrl: null,
    status: 'active',
    event: {
      id: 1,
      title: 'Event Title',
      date: 'Mon Jul 28, 2026, 2:00 – 5:00 PM',
      venue: 'Claro M. Recto Hall',
    },
  },
  {
    id: 2,
    ticketCode: 'TK - 002',
    qrUrl: null,
    status: 'waitlisted',
    event: {
      id: 2,
      title: 'Event Title',
      date: 'Mon Jul 28, 2026, 2:00 – 5:00 PM',
      venue: 'Claro M. Recto Hall',
    },
  },
  {
    id: 3,
    ticketCode: 'TK - 003',
    qrUrl: null,
    status: 'attended',
    event: {
      id: 3,
      title: 'Event Title',
      date: 'Mon Jul 28, 2026, 2:00 – 5:00 PM',
      venue: 'Claro M. Recto Hall',
    },
  },
];
// ──────────────────────────────────────────────────────────────────────────

const TABS = ['all', 'active', 'waitlisted', 'attended'];

function TicketWallet() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    setLoading(true);
    try {
      // TODO (backend): GET /tickets  (TicketController@list)
      //
      // const res = await fetch('/tickets', {
      //   headers: { Accept: 'application/json' },
      // });
      // const data = await res.json();
      // setTickets(data);

      // Remove once API is connected:
      setTickets(MOCK_TICKETS);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(ticketId) {
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    try {
      // TODO (backend): GET /cancel/{id}  (TicketController@cancel)
      //
      // const res = await fetch(`/cancel/${ticketId}`, {
      //   headers: { Accept: 'application/json' },
      // });
      // if (!res.ok) throw new Error('Cancellation failed');
      // await fetchTickets();

      console.log('Cancel ticket:', ticketId);
    } catch (err) {
      console.error('Cancellation failed:', err);
    }
  }

  function handleEvaluate(eventId) {
    // TODO (backend): GET /feedback/{event_id}  (EventController@feedbackForm)
    navigate(`/user/evaluation/${eventId}`);
  }

  function handleViewTicket(ticketId) {
    navigate(`/user/tickets/${ticketId}`);
  }

  // Tab counts
  function countByStatus(status) {
    return tickets.filter((t) => t.status === status).length;
  }

  // Filtered list
  const filtered =
    activeTab === 'all'
      ? tickets
      : tickets.filter((t) => t.status === activeTab);

  // Tab label helper
  function tabLabel(tab) {
    if (tab === 'all') return `All (${tickets.length})`;
    return `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${countByStatus(tab)})`;
  }

  return (
    <div className="ticket-wallet-page">

      {/* Back link */}
      <button className="btn-back mb-3" onClick={() => navigate('/user/dashboard')}>
        <i className="bi bi-chevron-left"></i> Back to Home
      </button>

      {/* Page title */}
      <h4 className="ticket-wallet-title">My Tickets</h4>

      {/* Filter tabs */}
      <div className="ticket-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`ticket-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      {/* Ticket cards */}
      {loading ? (
        <p className="text-muted">Loading tickets...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">No tickets found.</p>
      ) : (
        <div className="ticket-cards-grid">
          {filtered.map((ticket) => (
            <div
              key={ticket.id}
              className={`ticket-card ticket-card--${ticket.status}`}
              onClick={() => handleViewTicket(ticket.id)}
            >
              {/* Card header */}
              <div className="ticket-card-header">
                <span className="ticket-card-number">
                  Ticket # {String(ticket.id).padStart(3, '0')}
                </span>
                <span className={`ticket-status-badge ticket-status--${ticket.status}`}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>
              </div>

              {/* Event info */}
              <div className="ticket-card-event">
                <h6 className="ticket-card-title">{ticket.event.title}</h6>
                <p className="ticket-card-meta">
                  <i className="bi bi-calendar3"></i> {ticket.event.date}
                </p>
                <p className="ticket-card-meta">
                  <i className="bi bi-geo-alt"></i> {ticket.event.venue}
                </p>
              </div>

              {/* QR Code area */}
              <div
                className="ticket-card-qr"
                onClick={(e) => e.stopPropagation()}
              >
                {ticket.status === 'waitlisted' ? (
                  <div className="ticket-qr-locked">
                    <div className="ticket-qr-locked-inner">
                      <i className="bi bi-lock-fill ticket-lock-icon"></i>
                      <p className="ticket-qr-locked-text">
                        QR unlocks when your slot is confirmed.
                      </p>
                    </div>
                  </div>
                ) : ticket.qrUrl ? (
                  <img
                    src={ticket.qrUrl}
                    alt="QR Code"
                    className="ticket-card-qr-img"
                  />
                ) : (
                  <div className="ticket-card-qr-placeholder">
                    <i className="bi bi-qr-code"></i>
                  </div>
                )}
              </div>

              {/* Ticket code (not shown for waitlisted) */}
              {ticket.status !== 'waitlisted' && (
                <p className="ticket-card-code">{ticket.ticketCode}</p>
              )}

              {/* Action buttons */}
              <div
                className="ticket-card-actions"
                onClick={(e) => e.stopPropagation()}
              >
                {ticket.status === 'active' && (
                  <button
                    className="btn btn-ticket-cancel"
                    onClick={() => handleCancel(ticket.id)}
                  >
                    Cancel Registration
                  </button>
                )}
                {ticket.status === 'waitlisted' && (
                  <button
                    className="btn btn-ticket-cancel"
                    onClick={() => handleCancel(ticket.id)}
                  >
                    Cancel Registration
                  </button>
                )}
                {ticket.status === 'attended' && (
                  <button
                    className="btn btn-ticket-evaluate"
                    onClick={() => handleEvaluate(ticket.event.id)}
                  >
                    Evaluate Event
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TicketWallet;

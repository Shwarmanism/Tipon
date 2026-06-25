import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './user.css';

// ─── Mock Data (replace with real API response) ────────────────────────────
// Expected shape from GET /event/{id} (EventController@show):
// {
//   id, title, date, venue, audience, organizer,
//   category, description, totalSlots, registeredCount,
//   waitlistedCount, posterUrl
// }
const MOCK_EVENT = {
  id: 1,
  title: 'Event Title',
  date: 'Mon Jul 28, 2026, 2:00 – 5:00 PM',
  venue: 'Claro M. Recto Hall',
  audience: 'Open for Computer Science Students',
  organizer: 'Organized by PUP AWS Cloud Club',
  category: 'Conference',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  totalSlots: 50,
  registeredCount: 1,
  waitlistedCount: 0,
  posterUrl: null,
};
// ──────────────────────────────────────────────────────────────────────────

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    institution: '',
    studentNumber: '',
    consent: false,
  });

  useEffect(() => {
    fetchEvent();
  }, [id]);

  async function fetchEvent() {
    setLoading(true);
    try {
      // TODO (backend): GET /event/{id}  (EventController@show)
      //
      // const res = await fetch(`/event/${id}`, {
      //   headers: { Accept: 'application/json' },
      // });
      // const data = await res.json();
      // setEvent(data);

      // Remove once API is connected:
      setEvent(MOCK_EVENT);
    } catch (err) {
      console.error('Failed to fetch event:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.consent) {
      alert('Please consent to data collection before registering.');
      return;
    }
    setSubmitting(true);
    try {
      // TODO (backend): POST /register/{event_id}  (TicketController@store)
      //
      // const res = await fetch(`/register/${id}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Accept: 'application/json',
      //   },
      //   body: JSON.stringify(form),
      // });
      // if (!res.ok) throw new Error('Registration failed');

      console.log('Submitting registration:', form);
      setSubmitted(true);
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setSubmitting(false);
    }
  }

  const slotPercent = event
    ? (event.registeredCount / event.totalSlots) * 100
    : 0;

  if (loading) return <p className="text-muted p-4">Loading event...</p>;
  if (!event)  return <p className="text-muted p-4">Event not found.</p>;

  return (
    <div className="event-details-page">

      {/* Back link + Page title */}
      <div className="event-details-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <i className="bi bi-chevron-left"></i> Back to Events
        </button>
        <h5 className="event-details-page-title">Event Registration</h5>
        <div style={{ width: 120 }}></div>
      </div>

      <div className="event-details-body">

        {/* ── Left column: event info ──────────────────────────── */}
        <div className="event-details-left">

          {/* Poster */}
          <div className="event-poster-wrapper">
            {/* Top bar */}
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
              <i className="bi bi-people"></i> {event.audience}
            </p>
            <p className="event-info-meta">
              <i className="bi bi-people"></i> {event.organizer}
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
            <h6 className="event-section-label">Available Slots</h6>
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

        {/* ── Right column: registration form ─────────────────── */}
        <div className="event-details-right">
          <div className="event-reg-card">
            <h5 className="event-reg-title">Event Registration</h5>

            {submitted ? (
              <div className="event-reg-success">
                <i className="bi bi-check-circle-fill"></i>
                <p>You have successfully registered for this event!</p>
                <button
                  className="btn btn-user-ticket mt-2"
                  onClick={() => navigate('/user/tickets')}
                >
                  View My Tickets
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="event-reg-row">
                  <div className="event-reg-field">
                    <label className="event-reg-label">
                      First Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      className="event-reg-input"
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="event-reg-field">
                    <label className="event-reg-label">
                      Last Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      className="event-reg-input"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="event-reg-row">
                  <div className="event-reg-field">
                    <label className="event-reg-label">
                      PUP Webmail<span className="req">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="event-reg-input"
                      placeholder="juandcruz@gmail.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="event-reg-field">
                    <label className="event-reg-label">
                      Mobile Number <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      className="event-reg-input"
                      placeholder="+639XXXXXXXXX"
                      value={form.mobile}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="event-reg-field">
                  <label className="event-reg-label">
                    Institution / College <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="institution"
                    className="event-reg-input"
                    placeholder="PUP CCIS"
                    value={form.institution}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="event-reg-field">
                  <label className="event-reg-label">
                    Student / Employee Number
                  </label>
                  <input
                    type="text"
                    name="studentNumber"
                    className="event-reg-input"
                    placeholder="202X-XXXX-MN-X"
                    value={form.studentNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="event-reg-consent">
                  <input
                    type="checkbox"
                    name="consent"
                    id="consent"
                    checked={form.consent}
                    onChange={handleChange}
                  />
                  <label htmlFor="consent" className="event-reg-consent-label">
                    I consent to the collection of my data for event registration purposes.
                  </label>
                </div>

                <div className="event-reg-submit">
                  <button
                    type="submit"
                    className="btn btn-reg-submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Registering...' : 'Register for this Event'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default EventDetails;

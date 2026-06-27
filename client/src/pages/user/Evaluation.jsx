import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './user.css';

// ─── Mock Data (replace with real API response) ────────────────────────────
// Expected shape from GET /feedback/{event_id} (EventController@feedbackForm):
// { id, title, date, venue }
const MOCK_EVENT = {
  id: 1,
  title: 'Lorem Ipsum Event ni Sir AJ',
  date: 'Mon Jul 28, 2026, 2:00 – 5:00 PM',
  venue: 'Claro M. Recto Hall',
};
// ──────────────────────────────────────────────────────────────────────────

const RATING_FIELDS = [
  { key: 'overallRating',     label: 'Overall rating' },
  { key: 'contentQuality',    label: 'Content quality' },
  { key: 'eventOrganization', label: 'Event organization' },
];

const HEAR_OPTIONS = [
  'Social Media',
  'Email',
  'Word of Mouth',
  'Physical Poster',
];

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="eval-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`eval-star ${star <= (hovered || value) ? 'filled' : ''}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`${star} star`}
        >
          <i className={`bi ${star <= (hovered || value) ? 'bi-star-fill' : 'bi-star'}`}></i>
        </button>
      ))}
      {value > 0 && (
        <span className="eval-star-label">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
}

function EvaluationForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const [form, setForm] = useState({
    overallRating:     0,
    contentQuality:    0,
    eventOrganization: 0,
    enjoyed:           '',
    improved:          '',
    attendAgain:       null, // true | false | null
    heardFrom:         '',
  });

  // Count how many required ratings are filled
  const ratingsComplete = RATING_FIELDS.filter(
    (f) => form[f.key] > 0
  ).length;

  useEffect(() => {
    fetchEvent();
  }, [id]);

  async function fetchEvent() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/event/${id}`, {
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!res.ok) throw new Error('Failed to fetch event');
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      console.error('Failed to fetch event:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleRating(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (ratingsComplete < 3) {
      alert('Please complete all 3 required ratings before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/feedback/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ event_id: id, ...form }),
      });
      if (!res.ok) throw new Error('Submission failed');

      setSubmitted(true);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)  return <p className="text-muted p-4">Loading evaluation form...</p>;
  if (!event)   return <p className="text-muted p-4">Event not found.</p>;

  if (submitted) {
    return (
      <div className="eval-page">
        <div className="eval-submitted">
          <i className="bi bi-check-circle-fill eval-submitted-icon"></i>
          <h4>Thank you for your feedback!</h4>
          <p>Your evaluation has been submitted successfully.</p>
          <button
            className="btn btn-profile-save mt-3"
            onClick={() => navigate('/user/tickets')}
          >
            Back to My Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="eval-page">

      {/* Back + title */}
      <div className="event-details-header mb-4">
        <button className="btn-back" onClick={() => navigate('/user/tickets')}>
          <i className="bi bi-chevron-left"></i> Back to My Tickets
        </button>
        <h5 className="event-details-page-title">Event Evaluation</h5>
        <div style={{ width: 160 }}></div>
      </div>

      <div className="eval-card">

        {/* Event info */}
        <div className="eval-event-header">
          <h4 className="eval-event-title">{event.title}</h4>
          <div className="eval-event-meta">
            <span>
              <i className="bi bi-calendar3"></i> {event.date}
            </span>
            <span className="eval-meta-divider">|</span>
            <span>
              <i className="bi bi-geo-alt"></i> {event.venue}
            </span>
          </div>
        </div>

        <hr className="event-divider" />

        <form onSubmit={handleSubmit}>

          {/* Progress indicator */}
          <p className="eval-progress">
            <span className={ratingsComplete === 3 ? 'eval-progress-done' : ''}>
              {ratingsComplete} of 3
            </span>{' '}
            required ratings complete
          </p>

          {/* ── Overall Experience ───────────────────────── */}
          <section className="eval-section">
            <h6 className="eval-section-label">OVERALL EXPERIENCE</h6>
            <div className="eval-ratings-grid">
              {RATING_FIELDS.map((field) => (
                <div key={field.key} className="eval-rating-item">
                  <p className="eval-rating-label">
                    {field.label} <span className="req">*</span>
                  </p>
                  <StarRating
                    value={form[field.key]}
                    onChange={(val) => handleRating(field.key, val)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ── Written Feedback ─────────────────────────── */}
          <section className="eval-section">
            <h6 className="eval-section-label">WRITTEN FEEDBACK</h6>

            <div className="eval-field">
              <label className="eval-field-label">
                What did you enjoy most?
              </label>
              <textarea
                name="enjoyed"
                className="eval-textarea"
                placeholder="Tell us what worked well..."
                value={form.enjoyed}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="eval-field">
              <label className="eval-field-label">
                What could be improved?
              </label>
              <textarea
                name="improved"
                className="eval-textarea"
                placeholder="Share suggestions for next time..."
                value={form.improved}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </section>

          {/* ── Quick Check ──────────────────────────────── */}
          <section className="eval-section">
            <h6 className="eval-section-label">QUICK CHECK</h6>

            <div className="eval-field">
              <label className="eval-field-label">
                Would you attend another event by this organization?
              </label>
              <div className="eval-yn-buttons">
                <button
                  type="button"
                  className={`eval-yn-btn ${form.attendAgain === true ? 'selected' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, attendAgain: true }))}
                >
                  <i className="bi bi-hand-thumbs-up me-1"></i> Yes
                </button>
                <button
                  type="button"
                  className={`eval-yn-btn ${form.attendAgain === false ? 'selected-no' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, attendAgain: false }))}
                >
                  <i className="bi bi-hand-thumbs-down me-1"></i> No
                </button>
              </div>
            </div>

            <div className="eval-field">
              <label className="eval-field-label">
                How did you hear about this event?
              </label>
              <select
                name="heardFrom"
                className="eval-select"
                value={form.heardFrom}
                onChange={handleChange}
              >
                <option value="">Select an option</option>
                {HEAR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Submit */}
          <div className="eval-submit">
            <button
              type="submit"
              className="btn btn-reg-submit"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EvaluationForm;

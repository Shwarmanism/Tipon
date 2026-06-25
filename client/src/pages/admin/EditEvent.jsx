import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './admin.css';

// ─── Category options (keep in sync with CreateEvent.jsx) ────────────────────
const CATEGORY_OPTIONS = [
  'Academic',
  'Cultural',
  'Sports',
  'Organizational',
  'Seminar',
  'Workshop',
  'Other',
];
// ─────────────────────────────────────────────────────────────────────────────

// ─── Mock existing event (remove once API is connected) ──────────────────────
const MOCK_EVENT = {
  title: 'CCIS OJT General Assembly',
  description: 'Annual general assembly for all CCIS OJT students.',
  category: 'Academic',
  targetAudience: 'All CCIS students',
  eventDate: '2026-05-15',
  venue: 'PUP Gymnasium',
  startTime: '09:00',
  endTime: '12:00',
  totalSlots: '50',
  poster: null,
  posterPreview: '',
};
// ─────────────────────────────────────────────────────────────────────────────

function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams(); // expects route: /admin/events/:id/edit
  const [form, setForm] = useState(null); // null = still loading
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEvent();
  }, [id]);

  async function fetchEvent() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/api/admin/event/edit/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch event');
      const data = await res.json();
      setForm({
        title: data.event.title,
        description: data.event.description,
        category: data.event.category,
        targetAudience: data.event.target_audience,
        eventDate: data.event.event_date,       // must be 'YYYY-MM-DD' for date input
        venue: data.event.venue,
        startTime: data.event.start_time,       // must be 'HH:MM' for time input
        endTime: data.event.end_time,
        totalSlots: String(data.event.total_slots),
        poster: null,
        posterPreview: data.event.poster_path ? `http://127.0.0.1:8000/storage/${data.event.poster_path}` : '',
      });
    } catch (error) {
      console.error('Failed to fetch event:', error);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function handlePosterChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      poster: file,
      posterPreview: URL.createObjectURL(file),
    }));
  }

  function handlePosterDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      poster: file,
      posterPreview: URL.createObjectURL(file),
    }));
  }

  function validate() {
    const required = [
      'title', 'description', 'category',
      'targetAudience', 'eventDate', 'venue',
      'startTime', 'endTime', 'totalSlots',
    ];
    const newErrors = {};
    required.forEach((field) => {
      if (!form[field].toString().trim()) newErrors[field] = 'This field is required.';
    });
    return newErrors;
  }

  async function submitEvent(status) {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT'); // Laravel method spoofing
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('target_audience', form.targetAudience);
      formData.append('event_date', form.eventDate);
      formData.append('venue', form.venue);
      formData.append('start_time', form.startTime);
      formData.append('end_time', form.endTime);
      formData.append('total_slots', form.totalSlots);
      formData.append('status', status);
      if (form.poster) formData.append('poster', form.poster);

      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/api/admin/event/update/${id}`, {
        method: 'POST', // POST with _method: PUT for FormData
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Validation errors:', errorData);
        throw new Error('Failed to update event');
      }
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Failed to update event:', error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate('/admin/dashboard');
  }

  // Loading state while fetching event data
  if (!form) {
    return (
      <div className="admin-content">
        <p className="text-muted">Loading event...</p>
      </div>
    );
  }

  return (
    <div className="admin-content">
      {/* Header */}
      <div className="mb-4">
        <h4 className="admin-page-title mb-1">Edit event</h4>
        <p className="admin-page-subtitle mb-0">
          Fill in the details below to publish an event for your organization.
        </p>
      </div>

      <div className="create-event-form">

        {/* ── BASIC INFORMATION ─────────────────────────────────────────── */}
        <div className="form-section">
          <p className="form-section-label">BASIC INFORMATION</p>

          <div className="mb-3">
            <label className="form-label-custom">
              Event Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="title"
              className={`form-control form-control-custom ${errors.title ? 'is-invalid' : ''}`}
              placeholder="e.g., CCIS OJT General Assembly"
              value={form.title}
              onChange={handleChange}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label-custom">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              name="description"
              className={`form-control form-control-custom ${errors.description ? 'is-invalid' : ''}`}
              placeholder="Describe your event..."
              rows={4}
              value={form.description}
              onChange={handleChange}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label-custom">
                Category <span className="text-danger">*</span>
              </label>
              <select
                name="category"
                className={`form-select form-control-custom ${errors.category ? 'is-invalid' : ''}`}
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <div className="invalid-feedback">{errors.category}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label-custom">
                Target Audience <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="targetAudience"
                className={`form-control form-control-custom ${errors.targetAudience ? 'is-invalid' : ''}`}
                placeholder="e.g., All CCIS students"
                value={form.targetAudience}
                onChange={handleChange}
              />
              {errors.targetAudience && <div className="invalid-feedback">{errors.targetAudience}</div>}
            </div>
          </div>
        </div>

        {/* ── LOGISTICS ─────────────────────────────────────────────────── */}
        <div className="form-section">
          <p className="form-section-label">LOGISTICS</p>

          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label-custom">
                Event Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                name="eventDate"
                className={`form-control form-control-custom ${errors.eventDate ? 'is-invalid' : ''}`}
                value={form.eventDate}
                onChange={handleChange}
              />
              {errors.eventDate && <div className="invalid-feedback">{errors.eventDate}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label-custom">
                Venue <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="venue"
                className={`form-control form-control-custom ${errors.venue ? 'is-invalid' : ''}`}
                placeholder="e.g., PUP Gymnasium"
                value={form.venue}
                onChange={handleChange}
              />
              {errors.venue && <div className="invalid-feedback">{errors.venue}</div>}
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label-custom">
                Start time <span className="text-danger">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                className={`form-control form-control-custom ${errors.startTime ? 'is-invalid' : ''}`}
                value={form.startTime}
                onChange={handleChange}
              />
              {errors.startTime && <div className="invalid-feedback">{errors.startTime}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label-custom">
                End time <span className="text-danger">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                className={`form-control form-control-custom ${errors.endTime ? 'is-invalid' : ''}`}
                value={form.endTime}
                onChange={handleChange}
              />
              {errors.endTime && <div className="invalid-feedback">{errors.endTime}</div>}
            </div>
          </div>
        </div>

        {/* ── CAPACITY ──────────────────────────────────────────────────── */}
        <div className="form-section">
          <p className="form-section-label">CAPACITY</p>
          <div className="col-12">
            <label className="form-label-custom">
              Total slots <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              name="totalSlots"
              className={`form-control form-control-custom ${errors.totalSlots ? 'is-invalid' : ''}`}
              placeholder="e.g., 200"
              min={1}
              value={form.totalSlots}
              onChange={handleChange}
            />
            {errors.totalSlots && <div className="invalid-feedback">{errors.totalSlots}</div>}
          </div>
        </div>

        {/* ── MEDIA ─────────────────────────────────────────────────────── */}
        <div className="form-section">
          <p className="form-section-label">MEDIA</p>
          <div
            className="poster-upload-area"
            onClick={() => document.getElementById('posterInput').click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handlePosterDrop}
          >
            <input
              id="posterInput"
              type="file"
              accept="image/png, image/jpeg"
              style={{ display: 'none' }}
              onChange={handlePosterChange}
            />
            {form.posterPreview ? (
              <img
                src={form.posterPreview}
                alt="Poster preview"
                className="poster-preview-img"
              />
            ) : (
              <div className="poster-upload-placeholder">
                <i className="bi bi-cloud-arrow-up poster-upload-icon"></i>
                <p className="mb-1">Click to upload promotional poster</p>
                <p className="text-muted small mb-0">PNG, JPG up to 5MB — optional</p>
              </div>
            )}
          </div>
        </div>

        {/* ── ACTION BUTTONS ────────────────────────────────────────────── */}
        <div className="form-actions">
          <button
            className="btn btn-form-cancel"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-form-draft"
            onClick={() => submitEvent('draft')}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save as draft'}
          </button>
          <button
            className="btn btn-create-event"
            onClick={() => submitEvent('published')}
            disabled={submitting}
          >
            {submitting ? 'Publishing...' : 'Publish edit'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditEvent;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

// ─── Category options (edit this list to match DB categories) ────────────
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

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  targetAudience: '',
  eventDate: '',
  venue: '',
  startTime: '',
  endTime: '',
  totalSlots: '',
  poster: null,       // File object
  posterPreview: '',  // Local URL for preview
};

function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ─── Field change handler ──────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // clear field error on change
  }

  // ─── Poster upload handler ─────────────────────────────────────────────────
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

  // ─── Validation ────────────────────────────────────────────────────────────
  function validate() {
    const required = [
      'title', 'description', 'category',
      'targetAudience', 'eventDate', 'venue',
      'startTime', 'endTime', 'totalSlots',
    ];
    const newErrors = {};
    required.forEach((field) => {
      if (!form[field].trim()) newErrors[field] = 'This field is required.';
    });
    return newErrors;
  }

  // ─── Submit handlers ───────────────────────────────────────────────────────
  async function submitEvent(status) {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      // TODO (backend): POST to your Laravel endpoint
      // Use FormData so the poster file is included
      //
      // const formData = new FormData();
      // formData.append('title', form.title);
      // formData.append('description', form.description);
      // formData.append('category', form.category);
      // formData.append('target_audience', form.targetAudience);
      // formData.append('event_date', form.eventDate);
      // formData.append('venue', form.venue);
      // formData.append('start_time', form.startTime);
      // formData.append('end_time', form.endTime);
      // formData.append('total_slots', form.totalSlots);
      // formData.append('status', status); // 'draft' or 'published'
      // if (form.poster) formData.append('poster', form.poster);
      //
      // const res = await fetch('/event/submit', {
      //   method: 'POST',
      //   headers: { 'Accept': 'application/json' },
      //   body: formData,
      // });
      // if (!res.ok) throw new Error('Failed to create event');
      // navigate('/admin/dashboard');

      // Remove this log once API is connected:
      console.log('Submitting event:', { ...form, status });
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate('/admin/dashboard');
  }

  return (
    <div className="admin-content">
      {/* Header */}
      <div className="mb-4">
        <h4 className="admin-page-title mb-1">Create new event</h4>
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
            {submitting ? 'Publishing...' : 'Publish event'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default CreateEvent;

// Fallback Page for Tipon

export default function NotFound() {
  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center justify-content-center"
      style={{ backgroundColor: '#faf9f7' }}
    >
      <h1 style={{ fontSize: '6rem', fontWeight: 800, color: '#e8611a' }}>
        404
      </h1>

      <h2 className="fw-bold mt-3" style={{ color: '#333' }}>
        Page Not Found
      </h2>

      <p className="mt-3 text-muted text-center" style={{ maxWidth: '420px' }}>
        The page you are looking for may have been moved, deleted, or never existed.
      </p>

      <a
        href="/login"
        className="btn btn-create-event mt-4 px-4 py-2"
        style={{ borderRadius: '10px', fontWeight: 600 }}
      >
        Return Home
      </a>
    </div>
  );
}

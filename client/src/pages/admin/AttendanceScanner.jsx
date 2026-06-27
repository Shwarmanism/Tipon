import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './admin.css';

// ─── Mock Data (replace with real API responses) ──────────────────────────────
// These mirror the shape of what Laravel should return.

const MOCK_EVENT_INFO = {
  title: 'CCIS OJT General Assembly',
  date: 'May 15, 2026',
  venue: 'PUP Gymnasium',
};

const MOCK_ATTENDEES = [
  { id: 1, name: 'Anthea Lyn Espiritu',   studentNo: '2023-01236-MN-0', status: 'active',   attended: false },
  { id: 2, name: 'Felicity Faith Villeta', studentNo: '2023-01236-MN-0', status: 'active',   attended: false },
  { id: 3, name: 'Ed Marcel Lasco',        studentNo: '2023-01236-MN-0', status: 'active',   attended: false },
];
// ─────────────────────────────────────────────────────────────────────────────

function AttendanceScanner() {
  const navigate = useNavigate();
  const { id } = useParams(); // expects route: /admin/events/:id/scan

  const [eventInfo, setEventInfo] = useState(MOCK_EVENT_INFO);
  const [attendees, setAttendees] = useState(MOCK_ATTENDEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null); // null = not searched yet
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchEventInfo();
  }, [id]);

  // ─── Fetch event details and attendees ─────────────────────────────────
  async function fetchEventInfo() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/checkin/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch event info');
      const data = await res.json();
      
      setEventInfo({
        title: data.event.title,
        date: data.event.event_date,
        venue: data.event.venue,
      });

      // data.attendees is populated from the backend now
      setAttendees(data.attendees || []);
    } catch (error) {
      console.error('Failed to fetch event info and attendees:', error);
    } finally {
      setLoading(false);
    }
  }

  // ─── Manual search ────────────────────────────────────────────────────────
  function handleSearch() {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    // filter from already loaded attendees — no fetch needed
    const filtered = attendees.filter(
      (a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.studentNo.includes(searchQuery)
    );
    setSearchResults(filtered);
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  function handleClearSearch() {
    setSearchQuery('');
    setSearchResults(null);
  }

  // ─── Mark attended ────────────────────────────────────────────────────────
  async function handleMarkAttended(attendeeId) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/checkin/manual`,
        { 
          method: 'POST', 
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ticket_id: attendeeId })
        }
      );
      if (!res.ok) throw new Error('Failed to mark attended');

      // Optimistic UI update:
      const update = (list) =>
        list.map((a) => (a.id === attendeeId ? { ...a, attended: true, status: 'attended' } : a));
      setAttendees((prev) => update(prev));
      if (searchResults) setSearchResults((prev) => update(prev));
    } catch (error) {
      console.error('Failed to mark attended:', error);
    }
  }

  // ─── QR scan result handler (called by scanner library) ──────────────────
  async function handleQRScan(scannedData) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/checkin/scan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ qr_code_uuid: scannedData, event_id: id }),
      });
      if (!res.ok) throw new Error('Failed to scan QR code');
      console.log('QR scanned successfully:', scannedData);
      
      // Update UI if needed (for now just optimistic update if it was in the list)
      const update = (list) =>
        list.map((a) => (a.studentNo === scannedData ? { ...a, attended: true, status: 'attended' } : a));
      setAttendees((prev) => update(prev));
    } catch (error) {
      console.error('QR scan error:', error);
    }
  }

  // ─── Status badge ─────────────────────────────────────────────────────────
  const STATUS_LABELS = {
    active:   'Active',
    attended: 'Attended',
    inactive: 'Inactive',
  };

  const STATUS_CLASS = {
    active:   'scanner-badge-active',
    attended: 'scanner-badge-attended',
    inactive: 'scanner-badge-inactive',
  };

  const displayList = searchResults !== null ? searchResults : attendees;

  return (
    <div className="admin-content">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <h4 className="admin-page-title mb-1">Attendance Scanner</h4>
        <p className="admin-page-subtitle mb-0">
          Scan attendee QR codes at the venue entrance.
        </p>
      </div>

      <div className="scanner-layout">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="scanner-left">

          {/* Event info bar */}
          <div className="scanner-info-bar mb-3">
            <div className="scanner-info-item">
              <span className="scanner-info-label">SCANNING FOR</span>
              <span className="scanner-info-value">{eventInfo.title}</span>
            </div>
            <div className="scanner-info-item">
              <span className="scanner-info-label">DATE</span>
              <span className="scanner-info-value">{eventInfo.date}</span>
            </div>
            <div className="scanner-info-item">
              <span className="scanner-info-label">VENUE</span>
              <span className="scanner-info-value">{eventInfo.venue}</span>
            </div>
          </div>

          {/* Camera / QR feed */}
          <div className="scanner-camera-area">
            {/* Corner brackets */}
            <span className="scanner-corner tl"></span>
            <span className="scanner-corner tr"></span>
            <span className="scanner-corner bl"></span>
            <span className="scanner-corner br"></span>

            {/* 
              TODO (backend/integration): replace the placeholder below with a
              real QR scanner component, e.g. react-qr-reader or html5-qrcode.
              Pass handleQRScan as the onScan callback.

              Example with html5-qrcode:
              <Html5QrcodeScanner
                qrCodeSuccessCallback={handleQRScan}
                qrCodeErrorCallback={(err) => console.warn(err)}
              />
            */}
            <div className="scanner-placeholder">
              <i className="bi bi-camera scanner-placeholder-icon"></i>
              <p className="mb-0">Camera feed will appear here</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
        <div className="scanner-right">

          {/* Manual check-in label */}
          <p className="scanner-section-label mb-3">MANUAL CHECK IN</p>

          {/* Search bar */}
          <div className="scanner-search-row mb-3">
            <input
              type="text"
              className="form-control scanner-search-input"
              placeholder="Search by name or email . . ."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button className="btn btn-scanner-search" onClick={handleSearch}>
              <i className="bi bi-search"></i>
            </button>
          </div>

          {/* Attendees table */}
          <div className="scanner-table-wrapper">
            <table className="table admin-table mb-0">
              <thead>
                <tr>
                  <th>STUDENT NAME</th>
                  <th>EMAIL</th>
                  <th>STATUS</th>
                  <th className="text-end">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      Loading attendees...
                    </td>
                  </tr>
                ) : displayList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      {searchResults !== null ? 'No results found.' : 'No attendees yet.'}
                    </td>
                  </tr>
                ) : (
                  displayList.map((attendee) => (
                    <tr key={attendee.id}>
                      <td className="event-title-cell">{attendee.name}</td>
                      <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {attendee.studentNo}
                      </td>
                      <td>
                        <span className={`scanner-badge ${STATUS_CLASS[attendee.status] ?? ''}`}>
                          {STATUS_LABELS[attendee.status] ?? attendee.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {attendee.attended ? (
                          <span className="scanner-attended-label">
                            <i className="bi bi-check-circle-fill me-1"></i> Done
                          </span>
                        ) : (
                          <button
                            className="btn btn-action-outline"
                            onClick={() => handleMarkAttended(attendee.id)}
                          >
                            Mark Attended
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Clear search */}
          {searchResults !== null && (
            <button
              className="btn btn-link mt-2 p-0"
              style={{ fontSize: '0.8rem', color: '#aaa' }}
              onClick={handleClearSearch}
            >
              Clear search
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendanceScanner;

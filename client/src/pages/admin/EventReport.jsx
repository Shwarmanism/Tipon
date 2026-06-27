import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import './admin.css';

// ─── Mock Data (replace with real API responses) ──────────────────────────────

const MOCK_EVENT_INFO = {
  title: 'CCIS OJT General Assembly',
  date: 'May 15, 2026',
  venue: 'PUP Gymnasium',
  organizedBy: 'Admin Portal',
};

const MOCK_STATS = {
  totalRegistered: 42,
  totalAttended: 35,
  attendanceYield: 83,   // percentage
  noShows: 7,
};

const MOCK_PIE_DATA = [
  { name: 'Attended',     value: 35 },
  { name: 'Did Not Show', value: 7  },
];

const MOCK_BAR_DATA = [
  { college: 'CCIS',  attendees: 20 },
  { college: 'CAF',   attendees: 5  },
  { college: 'COED',  attendees: 4  },
  { college: 'CE',    attendees: 3  },
  { college: 'CBA',   attendees: 3  },
];

const MOCK_MANIFEST = [
  { no: 1, name: 'Anthea Lyn Czeisler Espiritu', email: 'anthealynczeislerpespiritu@iskolarnybayan.pup.edu.ph', checkInTime: '9:14 am', status: 'attended' },
  { no: 2, name: 'Felicity Faith Villeta',        email: 'felicityfaithlvilleta@iskolarnybayan.pup.edu.ph',      checkInTime: '9:26 am', status: 'attended' },
];
// ─────────────────────────────────────────────────────────────────────────────

const PIE_COLORS = ['#e8611a', '#e0ddd8'];

function CertificateConfigModal({ onClose, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSubmit(formData);
  };

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div
        className="modal-box-custom"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '550px', textAlign: 'left', padding: '2rem' }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="modal-box-title mb-0" style={{ color: '#e8611a' }}>E-Certificate Configuration</h4>
          <button className="btn-close" onClick={onClose} style={{ fontSize: '0.8rem' }}></button>
        </div>
        
        <p className="modal-box-body">
          Provide the names and upload the digital signatures (transparent PNGs recommended) for the signatories to be printed on the certificates.
        </p>

        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <h6 style={{ fontWeight: '600', color: '#555', borderBottom: '1px solid #eeebe6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <i className="bi bi-person-badge me-2"></i>Organization Head
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Name</label>
                <input type="text" name="org_head_name" placeholder="e.g. John Doe" required className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Signature Image</label>
                <input type="file" name="org_head_signature" accept="image/*" required className="form-control" />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h6 style={{ fontWeight: '600', color: '#555', borderBottom: '1px solid #eeebe6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <i className="bi bi-person-workspace me-2"></i>TIPON Coordinator
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Name</label>
                <input type="text" name="tipon_coord_name" placeholder="e.g. Jane Smith" required className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Signature Image</label>
                <input type="file" name="tipon_coord_signature" accept="image/*" required className="form-control" />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h6 style={{ fontWeight: '600', color: '#555', borderBottom: '1px solid #eeebe6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <i className="bi bi-person-rolodex me-2"></i>Event Head
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Name</label>
                <input type="text" name="event_head_name" placeholder="e.g. Juan Dela Cruz" required className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Signature Image</label>
                <input type="file" name="event_head_signature" accept="image/*" required className="form-control" />
              </div>
            </div>
          </div>

          <div className="modal-box-actions mt-4 d-flex justify-content-end gap-2">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-create-event" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
              <i className="bi bi-cloud-arrow-down me-2"></i>Generate & Download
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EventReport() {
  const { id } = useParams(); // expects route: /admin/events/:id/report

  const [eventInfo, setEventInfo]   = useState(MOCK_EVENT_INFO);
  const [stats, setStats]           = useState(MOCK_STATS);
  const [pieData, setPieData]       = useState(MOCK_PIE_DATA);
  const [barData, setBarData]       = useState(MOCK_BAR_DATA);
  const [manifest, setManifest]     = useState(MOCK_MANIFEST);
  const [loading, setLoading]       = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  async function fetchReport() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/api/admin/report/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch report');
      const data = await res.json();
      
      setEventInfo(data.event || MOCK_EVENT_INFO);
      setStats({
        totalRegistered: data.totalRegistered || 0,
        totalAttended: data.totalAttended || 0,
        attendanceYield: data.totalRegistered ? Math.round((data.totalAttended / data.totalRegistered) * 100) : 0,
        noShows: (data.totalRegistered || 0) - (data.totalAttended || 0),
      });

      setPieData([
        { name: 'Attended', value: data.totalAttended || 0 },
        { name: 'Did Not Show', value: (data.totalRegistered || 0) - (data.totalAttended || 0) },
      ]);

      // Using mock for this chart until backend provides them
      setBarData(MOCK_BAR_DATA);
      setManifest(data.manifest || []);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  }

  // ─── Action handlers ───────────────────────────────────────────────────────
  async function handleDistributeCertificates(formData) {
    try {
      setShowCertModal(false);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/api/admin/events/${id}/export/certificates`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Failed to generate certificates');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificates_event_${id}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error distributing certificates:', error);
      alert('Failed to distribute certificates. Please try again later.');
    }
  }

  async function handleExportExcel() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/api/admin/events/${id}/export/excel`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to export Excel');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event_${id}_manifest.xls`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel.');
    }
  }

  async function handleExportCSV() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/api/admin/events/${id}/export/csv`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to export CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event_${id}_manifest.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV.');
    }
  }

  // ─── Status badge ──────────────────────────────────────────────────────────
  const STATUS_CLASS = {
    attended: 'scanner-badge-active',
    absent:   'scanner-badge-inactive',
  };

  const STATUS_LABELS = {
    attended: 'Attended',
    absent:   'Absent',
  };

  return (
    <div className="admin-content">
      {showCertModal && (
        <CertificateConfigModal 
          onClose={() => setShowCertModal(false)} 
          onSubmit={handleDistributeCertificates} 
        />
      )}
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="admin-page-title mb-1">Event Report</h4>
          <p className="admin-page-subtitle mb-0">
            Post-event analytics and attendance manifest.
          </p>
        </div>
        <div className="report-header-actions">
          <button className="btn btn-action-outline" onClick={() => setShowCertModal(true)}>
            <i className="bi bi-award me-2"></i>Distribute E-Certificates
          </button>
          <button className="btn btn-action-outline" onClick={handleExportExcel}>
            <i className="bi bi-file-earmark-spreadsheet me-2"></i>Export Excel
          </button>
          <button className="btn btn-create-event" onClick={handleExportCSV}>
            <i className="bi bi-file-earmark-arrow-down me-2"></i>Export CSV
          </button>
        </div>
      </div>

      {/* ── Event Info Bar ───────────────────────────────────────────────── */}
      <div className="scanner-info-bar mb-4">
        <div className="scanner-info-item">
          <span className="scanner-info-label">EVENT</span>
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
        <div className="scanner-info-item">
          <span className="scanner-info-label">ORGANIZED BY</span>
          <span className="scanner-info-value">{eventInfo.organizedBy}</span>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <h3 className="stat-value">{loading ? '—' : stats.totalRegistered}</h3>
            <p className="stat-label mb-0">Total Registered</p>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <h3 className="stat-value">{loading ? '—' : stats.totalAttended}</h3>
            <p className="stat-label mb-0">Total Attended</p>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <h3 className="stat-value report-yield">
              {loading ? '—' : `${stats.attendanceYield}%`}
            </h3>
            <p className="stat-label mb-0">Attendance Yield</p>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <h3 className="stat-value">{loading ? '—' : stats.noShows}</h3>
            <p className="stat-label mb-0">No-shows</p>
          </div>
        </div>
      </div>

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      <div className="row g-3 mb-4">

        {/* Pie Chart */}
        <div className="col-12 col-md-6">
          <div className="report-chart-card">
            <p className="report-chart-title">Registration vs. Attendance (Pie Chart)</p>
            {loading ? (
              <div className="report-chart-placeholder">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="col-12 col-md-6">
          <div className="report-chart-card">
            <p className="report-chart-title">Attendees by College / Department (Bar Chart)</p>
            {loading ? (
              <div className="report-chart-placeholder">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis dataKey="college" tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#888' }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="attendees" fill="#e8611a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Attendance Manifest Table ─────────────────────────────────────── */}
      <div className="events-table-wrapper">
        <table className="table admin-table mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>STUDENT NAME</th>
              <th>UNIVERSITY EMAIL</th>
              <th>CHECK-IN TIME</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  Loading manifest...
                </td>
              </tr>
            ) : manifest.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  No attendance records yet.
                </td>
              </tr>
            ) : (
              manifest.map((row) => (
                <tr key={row.no}>
                  <td className="text-muted">{row.no}</td>
                  <td className="event-title-cell">{row.name}</td>
                  <td style={{ fontSize: '0.85rem', color: '#555' }}>{row.email}</td>
                  <td style={{ fontSize: '0.85rem' }}>{row.checkInTime}</td>
                  <td>
                    <span className={`scanner-badge ${STATUS_CLASS[row.status] ?? ''}`}>
                      {STATUS_LABELS[row.status] ?? row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default EventReport;

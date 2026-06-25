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

function EventReport() {
  const { id } = useParams(); // expects route: /admin/events/:id/report

  const [eventInfo, setEventInfo]   = useState(MOCK_EVENT_INFO);
  const [stats, setStats]           = useState(MOCK_STATS);
  const [pieData, setPieData]       = useState(MOCK_PIE_DATA);
  const [barData, setBarData]       = useState(MOCK_BAR_DATA);
  const [manifest, setManifest]     = useState(MOCK_MANIFEST);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  async function fetchReport() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/api/admin/report/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch report');
      const data = await res.json();
      
      const totalRegistered = data.totalRegistered || 0;
      const totalAttended = data.totalAttended || 0;
      const noShows = Math.max(0, totalRegistered - totalAttended);
      const attendanceYield = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

      setEventInfo({
        title: data.event.title,
        date: data.event.event_date,
        venue: data.event.venue,
        organizedBy: 'Admin Portal',
      });
      
      setStats({
        totalRegistered,
        totalAttended,
        attendanceYield,
        noShows,
      });

      setPieData([
        { name: 'Attended', value: totalAttended },
        { name: 'Did Not Show', value: noShows },
      ]);

      // Using mock for these until backend provides them
      setBarData(MOCK_BAR_DATA);
      setManifest(MOCK_MANIFEST);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  }

  // ─── Action handlers ───────────────────────────────────────────────────────
  function handleDistributeCertificates() {
    // TODO (backend): POST /api/admin/events/:id/certificates
    console.log('Distribute e-certificates for event:', id);
  }

  function handleExportExcel() {
    // TODO (backend): GET /api/admin/events/:id/report/export?format=xlsx
    console.log('Export Excel for event:', id);
  }

  function handleExportCSV() {
    // TODO (backend): GET /api/admin/events/:id/report/export?format=csv
    console.log('Export CSV for event:', id);
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

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="admin-page-title mb-1">Event Report</h4>
          <p className="admin-page-subtitle mb-0">
            Post-event analytics and attendance manifest.
          </p>
        </div>
        <div className="report-header-actions">
          <button className="btn btn-action-outline" onClick={handleDistributeCertificates}>
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

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateEvent from './pages/admin/CreateEvent';
import EditEvent from './pages/admin/EditEvent';
import AttendanceScanner from './pages/admin/AttendanceScanner';
import EventReport from './pages/admin/EventReport';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events/create" element={<CreateEvent />} />
          <Route path="events/:id/edit" element={<EditEvent />} />
          <Route path="events/:id/scan" element={<AttendanceScanner />} />
          <Route path="events/:id/report" element={<EventReport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
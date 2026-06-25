import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from './components/AuthLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import UserLayout from './pages/user/UserLayout';
import UserDashboard from './pages/user/UserDashboard';
import EventDetails from './pages/user/EventDetails';
import RegisteredEvents from './pages/user/RegisteredEvents';
import TicketWallet from './pages/user/TicketWallet';
import UserProfile from './pages/user/UserProfile';
import Evaluation from './pages/user/Evaluation';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateEvent from './pages/admin/CreateEvent';
import EditEvent from './pages/admin/EditEvent';
import AttendanceScanner from './pages/admin/AttendanceScanner';
import EventReport from './pages/admin/EventReport';
import AdminEvents from './pages/admin/AdminEvents';
import AdminProfile from './pages/admin/AdminProfile';

import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* User routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="registered" element={<RegisteredEvents />} />
          <Route path="tickets" element={<TicketWallet />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="evaluation/:id" element={<Evaluation />} />  
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events/create" element={<CreateEvent />} />
          <Route path="events/:id/edit" element={<EditEvent />} />
          <Route path="events/:id/scan" element={<AttendanceScanner />} />
          <Route path="events/:id/report" element={<EventReport />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { Outlet } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import illustration from '../assets/images/illustration.png';
import '../pages/auth/auth.css';

export default function AuthLayout() {
  return (
    <div className="auth-wrapper">
      <div className="auth-left-panel">
        <img src={logo} alt="Tipon Logo" className="auth-logo" />
        <img src={illustration} alt="Community Illustration" className="auth-illustration" />
        <div className="text-center mt-4">
          <h2 className="auth-panel-title">Building Stronger Communities</h2>
          <p className="auth-panel-subtitle">Through Better Events</p>
        </div>
      </div>
      <div className="auth-right-panel">
        <Outlet />  {/* ← replaces {children} */}
      </div>
    </div>
  );
}
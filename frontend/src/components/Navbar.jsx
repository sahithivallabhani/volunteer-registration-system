import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, LayoutDashboard, User, CheckSquare, BarChart3, Shield } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => setActivePage(isAdmin ? 'admin-dashboard' : 'dashboard')}>
          <Shield size={24} className="text-primary" />
          <span>VolunTrack</span>
        </div>

        <div className="navbar-links">
          {isAdmin ? (
            <>
              <button 
                onClick={() => setActivePage('admin-dashboard')}
                className={`btn btn-secondary nav-link ${activePage === 'admin-dashboard' ? 'nav-link-active' : ''}`}
                style={{ padding: '0.5rem 1rem', background: 'none', border: 'none' }}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
              <button 
                onClick={() => setActivePage('admin-events')}
                className={`btn btn-secondary nav-link ${activePage === 'admin-events' ? 'nav-link-active' : ''}`}
                style={{ padding: '0.5rem 1rem', background: 'none', border: 'none' }}
              >
                <Calendar size={18} />
                Manage Events
              </button>
              <button 
                onClick={() => setActivePage('admin-hours')}
                className={`btn btn-secondary nav-link ${activePage === 'admin-hours' ? 'nav-link-active' : ''}`}
                style={{ padding: '0.5rem 1rem', background: 'none', border: 'none' }}
              >
                <CheckSquare size={18} />
                Approve Hours
              </button>
              <button 
                onClick={() => setActivePage('admin-reports')}
                className={`btn btn-secondary nav-link ${activePage === 'admin-reports' ? 'nav-link-active' : ''}`}
                style={{ padding: '0.5rem 1rem', background: 'none', border: 'none' }}
              >
                <BarChart3 size={18} />
                Reports
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setActivePage('dashboard')}
                className={`btn btn-secondary nav-link ${activePage === 'dashboard' ? 'nav-link-active' : ''}`}
                style={{ padding: '0.5rem 1rem', background: 'none', border: 'none' }}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
              <button 
                onClick={() => setActivePage('events')}
                className={`btn btn-secondary nav-link ${activePage === 'events' ? 'nav-link-active' : ''}`}
                style={{ padding: '0.5rem 1rem', background: 'none', border: 'none' }}
              >
                <Calendar size={18} />
                Browse Events
              </button>
              <button 
                onClick={() => setActivePage('profile')}
                className={`btn btn-secondary nav-link ${activePage === 'profile' ? 'nav-link-active' : ''}`}
                style={{ padding: '0.5rem 1rem', background: 'none', border: 'none' }}
              >
                <User size={18} />
                Profile
              </button>
            </>
          )}

          <div className="nav-profile">
            <div className="nav-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info-text">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button 
              onClick={logout} 
              className="btn btn-secondary nav-link" 
              style={{ padding: '0.5rem', background: 'none', border: 'none', marginLeft: '0.5rem' }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import VolunteerDashboard from './pages/VolunteerDashboard';
import BrowseEvents from './pages/BrowseEvents';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import { Shield } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();
  
  // State-based routing
  const [activePage, setActivePage] = useState('dashboard');
  const [adminSubTab, setAdminSubTab] = useState('overview');
  const [isRegistering, setIsRegistering] = useState(false);

  // Sync active page with user role on login/load
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setActivePage('admin-dashboard');
        setAdminSubTab('overview');
      } else {
        setActivePage('dashboard');
      }
    }
  }, [user]);

  // Loader screen
  if (loading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          gap: '1.5rem'
        }}
      >
        <div 
          style={{ 
            width: '50px', 
            height: '50px', 
            borderRadius: '50%', 
            border: '3px solid var(--border-color)', 
            borderTopColor: 'var(--primary)',
            animation: 'spin 1s linear infinite'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Shield className="text-primary animate-pulse" size={20} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Loading VolunTrack...</span>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Auth screen routing
  if (!user) {
    return isRegistering ? (
      <Register 
        onToggleAuth={() => setIsRegistering(false)} 
        onRegisterSuccess={() => setIsRegistering(false)}
      />
    ) : (
      <Login 
        onToggleAuth={() => setIsRegistering(true)} 
        onLoginSuccess={() => setIsRegistering(false)}
      />
    );
  }

  // Routing Map helper
  const renderPage = () => {
    switch (activePage) {
      // Volunteer Pages
      case 'dashboard':
        return <VolunteerDashboard setActivePage={setActivePage} />;
      case 'events':
        return <BrowseEvents />;
      case 'profile':
        return <Profile />;
      
      // Admin Pages
      case 'admin-dashboard':
        return <AdminDashboard activeSubTab={adminSubTab} setActiveSubTab={setAdminSubTab} />;
      
      default:
        return <VolunteerDashboard setActivePage={setActivePage} />;
    }
  };

  // Handler for navbar page requests
  const handlePageChange = (page) => {
    if (page === 'admin-dashboard') {
      setActivePage('admin-dashboard');
      setAdminSubTab('overview');
    } else if (page === 'admin-events') {
      setActivePage('admin-dashboard');
      setAdminSubTab('events');
    } else if (page === 'admin-hours') {
      setActivePage('admin-dashboard');
      setAdminSubTab('hours');
    } else if (page === 'admin-reports') {
      setActivePage('admin-dashboard');
      setAdminSubTab('reports');
    } else {
      setActivePage(page);
    }
  };

  return (
    <div className="app-container">
      <Navbar activePage={activePage === 'admin-dashboard' ? `admin-${adminSubTab}` : activePage} setActivePage={handlePageChange} />
      
      <main className="main-content">
        {renderPage()}
      </main>

      <footer 
        className="no-print"
        style={{ 
          textAlign: 'center', 
          padding: '2rem 1.5rem', 
          color: 'var(--text-muted)', 
          fontSize: '0.85rem',
          borderTop: '1px solid var(--border-color)',
          marginTop: 'auto'
        }}
      >
        &copy; {new Date().getFullYear()} VolunTrack Portal. Developed for Internship Portfolio. All rights reserved.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

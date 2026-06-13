import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import Certificate from '../components/Certificate';
import { Award, Calendar, CheckSquare, Clock, PlusCircle, AlertCircle } from 'lucide-react';

export default function VolunteerDashboard({ setActivePage }) {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalApprovedHours: 0,
    totalEventsJoined: 0,
    completedEvents: 0,
    skills: [],
    interestAreas: []
  });
  
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [hoursLogs, setHoursLogs] = useState([]);
  
  // Hours log form
  const [selectedEventId, setSelectedEventId] = useState('');
  const [hoursToLog, setHoursToLog] = useState('');
  const [logDescription, setLogDescription] = useState('');
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.volunteer.getStats();
      setStats(statsRes);
      
      const regsRes = await api.registrations.getMy();
      // Only show events where the registration is approved
      const approvedRegs = regsRes.filter(r => r.status === 'approved');
      setRegisteredEvents(approvedRegs);

      const logsRes = await api.hours.getMy();
      setHoursLogs(logsRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const handleLogHours = async (e) => {
    e.preventDefault();
    if (!selectedEventId || !hoursToLog || !logDescription) {
      setFormError('Please fill in all fields.');
      return;
    }

    setFormError('');
    setFormSuccess('');
    setLoading(true);

    try {
      await api.hours.log({
        eventId: selectedEventId,
        hours: parseFloat(hoursToLog),
        description: logDescription
      });

      setFormSuccess('Hours logged successfully. Awaiting administrator approval!');
      setSelectedEventId('');
      setHoursToLog('');
      setLogDescription('');
      
      // Refresh dashboard
      fetchDashboardData();
    } catch (err) {
      setFormError(err.message || 'Failed to log hours.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-view" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Welcome Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem', background: 'linear-gradient(90deg, #fff 0%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Hello, {user.name}!
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome to your volunteer portal. Track your hours and register for events.</p>
        </div>

        {stats.totalApprovedHours > 0 ? (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowCertificate(true)}
            style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' }}
          >
            <Award size={18} />
            Generate Certificate
          </button>
        ) : (
          <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--warning-glow)' }}>
            <AlertCircle size={16} className="text-warning" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Log approved hours to get certified</span>
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="dashboard-grid">
        <StatCard 
          title="Approved Hours" 
          value={`${stats.totalApprovedHours} hrs`} 
          icon={Clock} 
          glowType="primary" 
        />
        <StatCard 
          title="Registered Events" 
          value={stats.totalEventsJoined} 
          icon={Calendar} 
          glowType="secondary" 
        />
        <StatCard 
          title="Completed Events" 
          value={stats.completedEvents} 
          icon={CheckSquare} 
          glowType="success" 
        />
      </div>

      <div className="two-column-layout">
        
        {/* Left Column: Log Hours & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Hour Logging Form */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              <PlusCircle size={20} className="text-primary" />
              Log Volunteer Hours
            </h3>

            {formError && (
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            {formSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {formSuccess}
              </div>
            )}

            {registeredEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: '1rem' }}>You must be registered for an upcoming or completed event to log hours.</p>
                <button className="btn btn-secondary" onClick={() => setActivePage('events')}>
                  Browse Opportunities
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogHours}>
                <div className="form-group">
                  <label className="form-label">Select Event</label>
                  <select 
                    className="form-input" 
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    disabled={loading}
                    style={{ appearance: 'none' }}
                  >
                    <option value="">-- Choose registered event --</option>
                    {registeredEvents.map(reg => (
                      <option key={reg.id} value={reg.eventId}>
                        {reg.event ? reg.event.title : 'Event'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Hours Spent</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    min="0.5"
                    className="form-input" 
                    placeholder="e.g. 4.5"
                    value={hoursToLog}
                    onChange={(e) => setHoursToLog(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Brief Work Description</label>
                  <textarea 
                    className="form-input" 
                    rows="3"
                    placeholder="Describe your contribution (tasks, achievements)..."
                    value={logDescription}
                    onChange={(e) => setLogDescription(e.target.value)}
                    disabled={loading}
                    style={{ resize: 'none' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Hours for Verification'}
                </button>
              </form>
            )}
          </div>

          {/* Hours Log History */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              Verification Status Logs
            </h3>

            {hoursLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No logged hours found. Submit hours to track approval status.
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', margin: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Hours</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hoursLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontWeight: 500 }}>{log.eventTitle}</td>
                        <td style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{log.hours} hrs</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={log.description}>
                          {log.description}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`badge badge-${log.status}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profile Summary & Registered Events list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Skills Resume Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Your Volunteer Profile</h4>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Core Skills
              </span>
              <div className="tag-container">
                {stats.skills && stats.skills.length > 0 ? (
                  stats.skills.map((skill, idx) => (
                    <span key={idx} className="tag tag-active" style={{ cursor: 'default' }}>{skill}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No skills added. Update profile to add.</span>
                )}
              </div>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Interest Areas
              </span>
              <div className="tag-container">
                {stats.interestAreas && stats.interestAreas.length > 0 ? (
                  stats.interestAreas.map((interest, idx) => (
                    <span key={idx} className="tag" style={{ border: '1px solid var(--secondary)', color: 'var(--secondary)', cursor: 'default' }}>{interest}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No interests selected.</span>
                )}
              </div>
            </div>
          </div>

          {/* Registered Events list */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Active Event Registrations</h4>
            
            {registeredEvents.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0', textAlign: 'center' }}>
                No active event registrations. Join an event to get started.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {registeredEvents.map(reg => (
                  <div 
                    key={reg.id} 
                    className="glass-panel" 
                    style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed' }}
                  >
                    <h5 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      {reg.event ? reg.event.title : 'Active Event'}
                    </h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>{reg.event ? reg.event.date : ''}</span>
                      <span className="badge badge-approved" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
                        Registered
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <Certificate 
          volunteerName={user.name} 
          totalHours={stats.totalApprovedHours} 
          onClose={() => setShowCertificate(false)} 
        />
      )}
    </div>
  );
}

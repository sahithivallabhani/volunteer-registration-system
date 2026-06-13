import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { BarChart, DonutChart, RankingList } from '../components/CustomChart';
import { 
  Users, Calendar, Clock, CheckSquare, PlusCircle, Trash2, 
  Check, X, FileText, Download, Printer, AlertCircle 
} from 'lucide-react';

const CATEGORIES = ['Environment', 'Education', 'Healthcare', 'Crisis Relief', 'Community Outreach', 'Animal Welfare'];

export default function AdminDashboard({ activeSubTab = 'overview', setActiveSubTab }) {
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [hoursLogs, setHoursLogs] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCapacity, setNewCapacity] = useState('20');
  
  const [eventFormError, setEventFormError] = useState('');
  const [eventFormSuccess, setEventFormSuccess] = useState('');
  
  // Feedback messages
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'overview') {
        const data = await api.reports.getAnalytics();
        setAnalytics(data);
      } else if (activeSubTab === 'events') {
        const data = await api.events.getAll();
        setEvents(data);
      } else if (activeSubTab === 'hours') {
        const data = await api.hours.getAll();
        setHoursLogs(data);
      } else if (activeSubTab === 'reports') {
        const allEvents = await api.events.getAll();
        setEvents(allEvents);
        const allLogs = await api.hours.getAll();
        setHoursLogs(allLogs);
        const allRegs = await api.registrations.getAll();
        setRegistrations(allRegs);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newCategory || !newDate || !newTime || !newLocation || !newCapacity) {
      setEventFormError('Please fill in all fields.');
      return;
    }

    setEventFormError('');
    setEventFormSuccess('');

    try {
      await api.events.create({
        title: newTitle,
        description: newDesc,
        category: newCategory,
        date: newDate,
        time: newTime,
        location: newLocation,
        capacity: parseInt(newCapacity)
      });

      setEventFormSuccess('Event created successfully!');
      
      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewCategory(CATEGORIES[0]);
      setNewDate('');
      setNewTime('');
      setNewLocation('');
      setNewCapacity('20');
      
      // Reload events list
      const data = await api.events.getAll();
      setEvents(data);
    } catch (err) {
      setEventFormError(err.message || 'Failed to create event.');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This will delete all registrations.')) return;
    try {
      await api.events.delete(id);
      setActionMessage('Event deleted successfully.');
      setEvents(events.filter(e => e.id !== id));
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to delete event.');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleApproveHours = async (id, status) => {
    try {
      await api.hours.approve(id, status);
      setActionMessage(`Hours log has been successfully ${status}!`);
      
      // Refresh list
      const data = await api.hours.getAll();
      setHoursLogs(data);
      
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to process hours.');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  // --- REPORT EXPORT FUNCTIONS ---
  
  const handleExportCSV = () => {
    if (hoursLogs.length === 0) return;
    
    // Create CSV content
    const headers = ['Volunteer Name', 'Volunteer Email', 'Event Name', 'Hours Worked', 'Logged Date', 'Status', 'Description'];
    const rows = hoursLogs.map(log => [
      `"${log.userName}"`,
      `"${log.userEmail}"`,
      `"${log.eventTitle}"`,
      log.hours,
      new Date(log.createdAt).toLocaleDateString(),
      `"${log.status}"`,
      `"${log.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VolunTrack_Hours_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-view" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Tab Navigation header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
            Administrator Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure schedules, verify volunteer logs, and export reporting metrics.</p>
        </div>
      </div>

      {/* Global Alerts */}
      {actionMessage && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {actionMessage}
        </div>
      )}
      {actionError && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {actionError}
        </div>
      )}

      {/* --- OVERVIEW TAB --- */}
      {activeSubTab === 'overview' && analytics && (
        <div>
          {/* Quick Metrics */}
          <div className="dashboard-grid">
            <StatCard title="Total Volunteers" value={analytics.summary.totalVolunteers} icon={Users} glowType="primary" />
            <StatCard title="Total Events" value={analytics.summary.totalEvents} icon={Calendar} glowType="secondary" />
            <StatCard title="Total Service Hours" value={`${analytics.summary.totalApprovedHours} hrs`} icon={Clock} glowType="success" />
            <StatCard title="Awaiting Verification" value={analytics.summary.pendingHoursCount} icon={CheckSquare} glowType="primary" />
          </div>

          {/* Charts Row */}
          <div className="two-column-layout" style={{ marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>Service Hours by Category</h3>
              <DonutChart data={analytics.charts.hoursByCategory} size={160} />
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>Top Contributing Volunteers</h3>
              <RankingList data={analytics.charts.topVolunteers} />
            </div>
          </div>

          {/* Registration Stats Chart */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>Event Registrations Count</h3>
            <BarChart data={analytics.charts.registrationsByEvent} height={220} />
          </div>
        </div>
      )}

      {/* --- MANAGE EVENTS TAB --- */}
      {activeSubTab === 'events' && (
        <div className="two-column-layout">
          {/* Create Event Form */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <PlusCircle className="text-secondary" />
              Create Volunteering Event
            </h3>

            {eventFormError && (
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {eventFormError}
              </div>
            )}
            {eventFormSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {eventFormSuccess}
              </div>
            )}

            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Planting Day in the Park"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-input"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ appearance: 'none' }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time Frame</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 9:00 AM - 1:00 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Physical address or Online"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="form-input" 
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Event Description</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Provide detailed instruction, requirements..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Publish Event Listing
              </button>
            </form>
          </div>

          {/* Events List Table */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Scheduled Events</h3>
            {events.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No events published yet.</div>
            ) : (
              <div className="table-container" style={{ border: 'none', margin: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Capacity</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(event => (
                      <tr key={event.id}>
                        <td style={{ fontWeight: 500, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {event.title}
                        </td>
                        <td>
                          <span className="tag" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                            {event.category}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{event.date}</td>
                        <td style={{ fontSize: '0.85rem' }}>{event.capacity}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.4rem', borderRadius: '6px' }}
                            onClick={() => handleDeleteEvent(event.id)}
                            title="Delete Event"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- APPROVE HOURS TAB --- */}
      {activeSubTab === 'hours' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Pending Volunteer Hour Logs</h3>
          
          {hoursLogs.filter(h => h.status === 'pending').length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
              <CheckSquare size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3>All caught up!</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>There are no pending volunteer hours logs awaiting approval.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Volunteer</th>
                    <th>Event</th>
                    <th>Hours</th>
                    <th>Description</th>
                    <th>Date Logged</th>
                    <th style={{ textAlign: 'right' }}>Verifications</th>
                  </tr>
                </thead>
                <tbody>
                  {hoursLogs.filter(h => h.status === 'pending').map(log => (
                    <tr key={log.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{log.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.userEmail}</div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{log.eventTitle}</td>
                      <td style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{log.hours} hrs</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                        {log.description}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-success" 
                            style={{ padding: '0.45rem', borderRadius: '8px' }}
                            onClick={() => handleApproveHours(log.id, 'approved')}
                            title="Approve Hours"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.45rem', borderRadius: '8px' }}
                            onClick={() => handleApproveHours(log.id, 'rejected')}
                            title="Reject Hours"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Show processed log history in admin for audits */}
          {hoursLogs.filter(h => h.status !== 'pending').length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>Verification History Log</h3>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Volunteer</th>
                      <th>Event</th>
                      <th>Hours</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hoursLogs.filter(h => h.status !== 'pending').slice(0, 10).map(log => (
                      <tr key={log.id}>
                        <td>{log.userName}</td>
                        <td>{log.eventTitle}</td>
                        <td style={{ fontWeight: 'bold' }}>{log.hours} hrs</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(log.createdAt).toLocaleDateString()}
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
            </div>
          )}
        </div>
      )}

      {/* --- REPORTS GENERATOR TAB --- */}
      {activeSubTab === 'reports' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          
          <div 
            className="no-print"
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: '1rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <FileText className="text-primary" />
                Volunteer Activity Report
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Generate, export, or print analytical activity summaries of volunteer hours logs.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={handlePrint}>
                <Printer size={16} />
                Print PDF
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleExportCSV}
                disabled={hoursLogs.length === 0}
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Printable Report Layout */}
          <div className="print-report-container" style={{ padding: '0.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>VolunTrack Community Service Report</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Generated on: {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}
              </p>
            </div>

            {/* Metrics Snapshot */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Active Events</p>
                <h3 style={{ fontSize: '1.5rem' }}>{events.length}</h3>
              </div>
              <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Service Hours Approved</p>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--success)' }}>
                  {hoursLogs.filter(h => h.status === 'approved').reduce((acc, h) => acc + h.hours, 0)} hrs
                </h3>
              </div>
              <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Hours Awaiting Verify</p>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--warning)' }}>
                  {hoursLogs.filter(h => h.status === 'pending').reduce((acc, h) => acc + h.hours, 0)} hrs
                </h3>
              </div>
            </div>

            {/* Detailed logs table */}
            <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Detailed Service Hours Logs</h4>
            
            {hoursLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>No hours logs compiled.</div>
            ) : (
              <div className="table-container">
                <table className="custom-table" style={{ background: 'transparent' }}>
                  <thead>
                    <tr>
                      <th>Volunteer</th>
                      <th>Email</th>
                      <th>Event</th>
                      <th>Hours</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hoursLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontWeight: 500 }}>{log.userName}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.userEmail}</td>
                        <td>{log.eventTitle}</td>
                        <td style={{ fontWeight: 'bold' }}>{log.hours} hrs</td>
                        <td style={{ fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${log.status}`} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
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
      )}
    </div>
  );
}

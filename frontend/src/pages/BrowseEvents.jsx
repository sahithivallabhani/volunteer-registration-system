import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, MapPin, Calendar, Clock, User, Filter, AlertCircle } from 'lucide-react';

const CATEGORIES = ['All', 'Environment', 'Education', 'Healthcare', 'Crisis Relief', 'Community Outreach', 'Animal Welfare'];

export default function BrowseEvents() {
  const [events, setEvents] = useState([]);
  const [myRegs, setMyRegs] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEventsData();
  }, []);

  const fetchEventsData = async () => {
    setLoading(true);
    try {
      const allEvents = await api.events.getAll();
      setEvents(allEvents);
      
      const regs = await api.registrations.getMy();
      setMyRegs(regs);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    setActionLoading(eventId);
    setError('');
    setMessage('');
    try {
      const res = await api.registrations.register(eventId);
      setMessage(res.message || 'Successfully registered!');
      
      // Refresh registrations
      const regs = await api.registrations.getMy();
      setMyRegs(regs);
    } catch (err) {
      setError(err.message || 'Failed to register.');
    } finally {
      setActionLoading(null);
      // Clear messages after 4 seconds
      setTimeout(() => {
        setMessage('');
        setError('');
      }, 4000);
    }
  };

  // Filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const isUserRegistered = (eventId) => {
    return myRegs.some(reg => reg.eventId === eventId && reg.status === 'approved');
  };

  return (
    <div className="events-view" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
          Volunteering Opportunities
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Find and join events matching your skills and interest areas.</p>
      </div>

      {/* Status Notifications */}
      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.25rem', 
          marginBottom: '2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.25rem' 
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by title, location, keywords..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        {/* Categories selector */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Filter size={14} />
            <span>Filter by Category:</span>
          </div>
          <div className="tag-container" style={{ gap: '0.35rem' }}>
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  className={`tag ${active ? 'tag-active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  style={{ border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          Loading volunteering events...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <AlertCircle size={40} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
          <h3>No events match your criteria</h3>
          <p style={{ marginTop: '0.5rem' }}>Try adjusting your search queries or category filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredEvents.map(event => {
            const registered = isUserRegistered(event.id);
            const isFull = event.registeredCount >= event.capacity;
            const cardActionLoading = actionLoading === event.id;

            return (
              <div 
                key={event.id} 
                className="interactive-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  minHeight: '280px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        color: 'var(--secondary)', 
                        background: 'rgba(6, 182, 212, 0.1)', 
                        padding: '0.25rem 0.6rem', 
                        borderRadius: '6px',
                        border: '1px solid rgba(6, 182, 212, 0.15)'
                      }}
                    >
                      {event.category}
                    </span>
                    <span className={`badge badge-info`} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                      {event.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    {event.title}
                  </h3>

                  <p 
                    style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: '0.85rem', 
                      lineHeight: '1.5', 
                      marginBottom: '1.25rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {event.description}
                  </p>
                </div>

                <div>
                  {/* Event Details Footer inside card */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <Calendar size={14} className="text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <Clock size={14} className="text-primary" />
                      <span>{event.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <MapPin size={14} className="text-primary" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                        {event.location}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <User size={14} className="text-primary" />
                      <span>Capacity: {event.capacity} volunteers max</span>
                    </div>
                  </div>

                  {/* Button */}
                  {registered ? (
                    <button className="btn btn-success" style={{ width: '100%', cursor: 'default' }} disabled={true}>
                      Registered
                    </button>
                  ) : isFull ? (
                    <button className="btn btn-secondary" style={{ width: '100%', cursor: 'not-allowed' }} disabled={true}>
                      Event Full
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                      onClick={() => handleRegister(event.id)}
                      disabled={cardActionLoading}
                    >
                      {cardActionLoading ? 'Registering...' : 'Register Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Check, Shield } from 'lucide-react';

const AVAILABLE_SKILLS = [
  'First Aid', 'Teaching', 'Logistics', 'Marketing', 
  'Web Development', 'Event Coordination', 'Food Prep', 'Public Speaking'
];

const AVAILABLE_INTERESTS = [
  'Environment', 'Education', 'Healthcare', 
  'Crisis Relief', 'Community Outreach', 'Animal Welfare'
];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedSkills, setSelectedSkills] = useState(user?.skills || []);
  const [selectedInterests, setSelectedInterests] = useState(user?.interestAreas || []);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setError('Name is required.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await updateProfile({
        name,
        phone,
        skills: selectedSkills,
        interestAreas: selectedInterests
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-view" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
          Profile Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal details, volunteer skills, and cause areas.</p>
      </div>

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

      <div className="two-column-layout">
        
        {/* Left Form Panel */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Account Information</h3>
            
            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User 
                  size={18} 
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
                />
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone 
                  size={18} 
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
                />
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Select Skills */}
            <div className="form-group">
              <label className="form-label">Your Skills</label>
              <div className="tag-container" style={{ marginTop: '0.25rem' }}>
                {AVAILABLE_SKILLS.map((skill, idx) => {
                  const active = selectedSkills.includes(skill);
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`tag ${active ? 'tag-active' : ''}`}
                      onClick={() => toggleSkill(skill)}
                      style={{ border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {active && <Check size={12} />}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Select Interests */}
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Interest Areas</label>
              <div className="tag-container" style={{ marginTop: '0.25rem' }}>
                {AVAILABLE_INTERESTS.map((interest, idx) => {
                  const active = selectedInterests.includes(interest);
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`tag ${active ? 'tag-active' : ''}`}
                      onClick={() => toggleInterest(interest)}
                      style={{ border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {active && <Check size={12} />}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div 
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                display: 'inline-flex',
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'white',
                marginBottom: '1rem',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{user?.name}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>{user?.email}</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Shield size={12} />
                {user?.role}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TOTAL APPROVED HOURS</p>
              <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                {user?.totalApprovedHours || 0} hrs
              </h3>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

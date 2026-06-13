import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, Check } from 'lucide-react';

const AVAILABLE_SKILLS = [
  'First Aid', 'Teaching', 'Logistics', 'Marketing', 
  'Web Development', 'Event Coordination', 'Food Prep', 'Public Speaking'
];

const AVAILABLE_INTERESTS = [
  'Environment', 'Education', 'Healthcare', 
  'Crisis Relief', 'Community Outreach', 'Animal Welfare'
];

export default function Register({ onToggleAuth, onRegisterSuccess }) {
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        phone,
        skills: selectedSkills,
        interestAreas: selectedInterests
      });
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ padding: '2rem 1.5rem' }}>
      <div className="glass-panel auth-card" style={{ maxWidth: '500px', padding: '2.5rem' }}>
        <div className="auth-header">
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '0.75rem', 
              borderRadius: '50%', 
              background: 'rgba(6, 182, 212, 0.1)', 
              color: 'var(--secondary)',
              marginBottom: '1rem' 
            }}
          >
            <UserPlus size={32} />
          </div>
          <h2>Join VolunTrack</h2>
          <p>Register as a volunteer to make a difference</p>
        </div>

        {error && (
          <div 
            style={{ 
              background: 'rgba(244, 63, 94, 0.1)', 
              border: '1px solid var(--error)', 
              color: 'var(--error)', 
              padding: '0.75rem 1rem', 
              borderRadius: '8px', 
              marginBottom: '1.25rem',
              fontSize: '0.9rem' 
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <input
                type="text"
                className="form-input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <input
                type="email"
                className="form-input"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
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
            <label className="form-label">Select Your Skills</label>
            <div className="tag-container">
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
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Interest Areas</label>
            <div className="tag-container">
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

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1.25rem' }}
            disabled={loading}
          >
            <UserPlus size={18} />
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <span 
            onClick={onToggleAuth} 
            style={{ color: 'var(--secondary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Login here
          </span>
        </div>
      </div>
    </div>
  );
}

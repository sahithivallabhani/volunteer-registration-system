const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const { authenticateToken, requireAdmin, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Volunteer Registration System API is running.' });
});

// --- AUTHENTICATION ---

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, skills, interestAreas } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const existingUser = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ message: 'A user with this email already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = {
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    role: 'volunteer',
    phone: phone || '',
    skills: skills || [],
    interestAreas: interestAreas || [],
    createdAt: new Date().toISOString(),
    totalApprovedHours: 0
  };

  const createdUser = db.insert('users', newUser);
  
  // Create token
  const token = jwt.sign(
    { id: createdUser.id, email: createdUser.email, role: createdUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userWithoutPassword } = createdUser;
  res.status(201).json({
    token,
    user: userWithoutPassword,
    message: 'Registration successful!'
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password.' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    token,
    user: userWithoutPassword,
    message: 'Welcome back!'
  });
});

// Get profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = db.findOne('users', u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Update profile
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { name, phone, skills, interestAreas } = req.body;
  const user = db.findOne('users', u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const updated = db.update('users', u => u.id === req.user.id, {
    name: name || user.name,
    phone: phone !== undefined ? phone : user.phone,
    skills: skills || user.skills,
    interestAreas: interestAreas || user.interestAreas
  });

  const updatedUser = db.findOne('users', u => u.id === req.user.id);
  const { password, ...userWithoutPassword } = updatedUser;
  res.json({ user: userWithoutPassword, message: 'Profile updated successfully.' });
});

// --- EVENTS ---

// Get all events
app.get('/api/events', (req, res) => {
  const events = db.find('events');
  // Sort events so latest or upcoming are logical
  res.json(events.reverse());
});

// Create event (Admin only)
app.post('/api/events', authenticateToken, requireAdmin, (req, res) => {
  const { title, description, category, date, time, location, capacity } = req.body;

  if (!title || !description || !category || !date || !time || !location || !capacity) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const newEvent = {
    title,
    description,
    category,
    date,
    time,
    location,
    capacity: parseInt(capacity),
    status: 'upcoming', // default
    createdAt: new Date().toISOString()
  };

  const createdEvent = db.insert('events', newEvent);
  res.status(201).json({ event: createdEvent, message: 'Event created successfully.' });
});

// Update event (Admin only)
app.put('/api/events/:id', authenticateToken, requireAdmin, (req, res) => {
  const { title, description, category, date, time, location, capacity, status } = req.body;

  const event = db.findOne('events', e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  db.update('events', e => e.id === req.params.id, {
    title: title || event.title,
    description: description || event.description,
    category: category || event.category,
    date: date || event.date,
    time: time || event.time,
    location: location || event.location,
    capacity: capacity !== undefined ? parseInt(capacity) : event.capacity,
    status: status || event.status
  });

  const updatedEvent = db.findOne('events', e => e.id === req.params.id);
  res.json({ event: updatedEvent, message: 'Event updated successfully.' });
});

// Delete event (Admin only)
app.delete('/api/events/:id', authenticateToken, requireAdmin, (req, res) => {
  const deleted = db.delete('events', e => e.id === req.params.id);
  if (deleted === 0) {
    return res.status(404).json({ message: 'Event not found.' });
  }
  // Also clean up registrations for this event
  db.delete('registrations', r => r.eventId === req.params.id);
  db.delete('hours', h => h.eventId === req.params.id);
  res.json({ message: 'Event and associated records deleted successfully.' });
});

// --- REGISTRATIONS ---

// Register for an event
app.post('/api/registrations', authenticateToken, (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  if (!eventId) {
    return res.status(400).json({ message: 'Event ID is required.' });
  }

  // Verify event exists and is not full
  const event = db.findOne('events', e => e.id === eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  // Check if already registered
  const existingReg = db.findOne('registrations', r => r.userId === userId && r.eventId === eventId);
  if (existingReg) {
    return res.status(400).json({ message: 'You are already registered for this event.' });
  }

  const eventRegsCount = db.find('registrations', r => r.eventId === eventId && r.status === 'approved').length;
  if (eventRegsCount >= event.capacity) {
    return res.status(400).json({ message: 'This event is already at full capacity.' });
  }

  const newReg = {
    userId,
    eventId,
    status: 'approved', // Auto-approve registration for simplicity of UI flow (admin can reject if needed)
    createdAt: new Date().toISOString()
  };

  const createdReg = db.insert('registrations', newReg);
  res.status(201).json({ registration: createdReg, message: 'Successfully registered for event!' });
});

// Get volunteer's registrations
app.get('/api/registrations/my', authenticateToken, (req, res) => {
  const regs = db.find('registrations', r => r.userId === req.user.id);
  const detailedRegs = regs.map(reg => {
    const event = db.findOne('events', e => e.id === reg.eventId);
    return { ...reg, event };
  });
  res.json(detailedRegs);
});

// Get all registrations (Admin only)
app.get('/api/registrations', authenticateToken, requireAdmin, (req, res) => {
  const regs = db.find('registrations');
  const detailedRegs = regs.map(reg => {
    const event = db.findOne('events', e => e.id === reg.eventId);
    const user = db.findOne('users', u => u.id === reg.userId);
    const { password, ...userWithoutPassword } = user || {};
    return { ...reg, event, user: userWithoutPassword };
  });
  res.json(detailedRegs.reverse());
});

// Update registration status (Admin only)
app.put('/api/registrations/:id', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid registration status.' });
  }

  const reg = db.findOne('registrations', r => r.id === req.params.id);
  if (!reg) {
    return res.status(404).json({ message: 'Registration not found.' });
  }

  db.update('registrations', r => r.id === req.params.id, { status });
  res.json({ message: `Registration status updated to ${status}.` });
});

// --- HOURS LOG ---

// Log hours
app.post('/api/hours', authenticateToken, (req, res) => {
  const { eventId, hours, description } = req.body;
  const userId = req.user.id;

  if (!eventId || !hours || !description) {
    return res.status(400).json({ message: 'Event ID, hours, and description are required.' });
  }

  // Ensure volunteer registered for the event
  const reg = db.findOne('registrations', r => r.userId === userId && r.eventId === eventId && r.status === 'approved');
  if (!reg) {
    return res.status(400).json({ message: 'You must have an approved registration for this event to log hours.' });
  }

  const newHoursLog = {
    userId,
    eventId,
    hours: parseFloat(hours),
    description,
    status: 'pending', // Always pending until admin approves
    createdAt: new Date().toISOString()
  };

  const createdHoursLog = db.insert('hours', newHoursLog);
  res.status(201).json({ hoursLog: createdHoursLog, message: 'Hours logged successfully. Awaiting admin approval.' });
});

// Get volunteer's logged hours
app.get('/api/hours/my', authenticateToken, (req, res) => {
  const logs = db.find('hours', h => h.userId === req.user.id);
  const detailedLogs = logs.map(log => {
    const event = db.findOne('events', e => e.id === log.eventId);
    return { ...log, eventTitle: event ? event.title : 'Deleted Event' };
  });
  res.json(detailedLogs.reverse());
});

// Get all hours logs (Admin only)
app.get('/api/hours', authenticateToken, requireAdmin, (req, res) => {
  const logs = db.find('hours');
  const detailedLogs = logs.map(log => {
    const event = db.findOne('events', e => e.id === log.eventId);
    const user = db.findOne('users', u => u.id === log.userId);
    return {
      ...log,
      eventTitle: event ? event.title : 'Deleted Event',
      userName: user ? user.name : 'Unknown User',
      userEmail: user ? user.email : ''
    };
  });
  res.json(detailedLogs.reverse());
});

// Approve/reject logged hours (Admin only)
app.put('/api/hours/:id', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
  }

  const log = db.findOne('hours', h => h.id === req.params.id);
  if (!log) {
    return res.status(404).json({ message: 'Hours log not found.' });
  }

  if (log.status !== 'pending') {
    return res.status(400).json({ message: 'This hours log has already been processed.' });
  }

  // Update status
  db.update('hours', h => h.id === req.params.id, { status });

  // If approved, update user's total hours
  if (status === 'approved') {
    const user = db.findOne('users', u => u.id === log.userId);
    if (user) {
      const currentHours = user.totalApprovedHours || 0;
      db.update('users', u => u.id === log.userId, {
        totalApprovedHours: currentHours + log.hours
      });
    }
  }

  res.json({ message: `Hours log has been ${status}.` });
});

// --- ANALYTICS & REPORTS (Admin only) ---

app.get('/api/reports/analytics', authenticateToken, requireAdmin, (req, res) => {
  const volunteers = db.find('users', u => u.role === 'volunteer');
  const events = db.find('events');
  const registrations = db.find('registrations');
  const hoursLogs = db.find('hours');

  const totalVolunteers = volunteers.length;
  const totalEvents = events.length;
  const totalApprovedHours = volunteers.reduce((acc, v) => acc + (v.totalApprovedHours || 0), 0);
  const pendingHoursCount = hoursLogs.filter(h => h.status === 'pending').length;

  // 1. Calculate Hours by Event Category
  const hoursByCategory = {};
  hoursLogs.forEach(h => {
    if (h.status === 'approved') {
      const event = db.findOne('events', e => e.id === h.eventId);
      const cat = event ? event.category : 'General';
      hoursByCategory[cat] = (hoursByCategory[cat] || 0) + h.hours;
    }
  });

  // Convert to chart-friendly format
  const hoursByCategoryData = Object.keys(hoursByCategory).map(key => ({
    name: key,
    value: hoursByCategory[key]
  }));

  // 2. Registrations by Event
  const regsByEventData = events.map(e => {
    const regsCount = registrations.filter(r => r.eventId === e.id).length;
    return {
      name: e.title.length > 20 ? e.title.substring(0, 18) + '..' : e.title,
      value: regsCount
    };
  });

  // 3. Top Volunteers
  const topVolunteers = [...volunteers]
    .sort((a, b) => (b.totalApprovedHours || 0) - (a.totalApprovedHours || 0))
    .slice(0, 5)
    .map(v => ({
      name: v.name,
      hours: v.totalApprovedHours || 0,
      email: v.email
    }));

  res.json({
    summary: {
      totalVolunteers,
      totalEvents,
      totalApprovedHours,
      pendingHoursCount
    },
    charts: {
      hoursByCategory: hoursByCategoryData,
      registrationsByEvent: regsByEventData,
      topVolunteers
    }
  });
});

// --- VOLUNTEER DASHBOARD STATS ---

app.get('/api/volunteer/stats', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const user = db.findOne('users', u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const regs = db.find('registrations', r => r.userId === userId);
  const totalEventsJoined = regs.length;

  const logs = db.find('hours', h => h.userId === userId);
  const approvedLogs = logs.filter(l => l.status === 'approved');
  const completedEvents = new Set(approvedLogs.map(l => l.eventId)).size;

  res.json({
    totalApprovedHours: user.totalApprovedHours || 0,
    totalEventsJoined,
    completedEvents,
    skills: user.skills || [],
    interestAreas: user.interestAreas || []
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

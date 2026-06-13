const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

class Database {
  constructor() {
    this.data = {
      users: [],
      events: [],
      registrations: [],
      hours: []
    };
    this.init();
  }

  init() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error('Error reading database file, resetting database:', err);
        this.save();
      }
    } else {
      this.save();
    }

    // Seed default admin if users are empty or if no admin exists
    const hasAdmin = this.data.users.some(u => u.role === 'admin');
    if (!hasAdmin) {
      this.seedAdmin();
    }
  }

  seedAdmin() {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('admin123', salt);

    const adminUser = {
      id: 'admin-id-default',
      name: 'System Administrator',
      email: 'admin@volunteer.org',
      password: passwordHash,
      role: 'admin',
      phone: '+15550199',
      skills: ['Coordination', 'Management', 'First Aid'],
      interestAreas: ['Crisis Relief', 'Community', 'Education'],
      createdAt: new Date().toISOString(),
      totalApprovedHours: 0
    };

    // Also seed some initial events to make it look impressive immediately!
    this.data.users.push(adminUser);

    if (this.data.events.length === 0) {
      this.data.events = [
        {
          id: 'event-1',
          title: 'Community Green Planting Day',
          description: 'Join us for our annual city green initiative. We will be planting 200+ native saplings in Central Park to improve urban biodiversity. Tools, gloves, and refreshments will be provided.',
          category: 'Environment',
          date: '2026-07-15',
          time: '09:00 AM - 01:00 PM',
          location: 'Central Park North, Sector 4',
          capacity: 30,
          status: 'upcoming',
          createdAt: new Date().toISOString()
        },
        {
          id: 'event-2',
          title: 'Youth Coding BootCamp Mentor',
          description: 'Seeking volunteers skilled in Python or JavaScript to mentor underprivileged children (ages 10-15) during a hands-on intro to software engineering event.',
          category: 'Education',
          date: '2026-06-25',
          time: '02:00 PM - 06:00 PM',
          location: 'City Tech Library, Lab A',
          capacity: 10,
          status: 'upcoming',
          createdAt: new Date().toISOString()
        },
        {
          id: 'event-3',
          title: 'Food Bank Distribution Drive',
          description: 'Help package, categorize, and distribute dry goods and fresh produce to local families in need. Volunteers should be able to lift up to 20 lbs.',
          category: 'Community',
          date: '2026-06-10',
          time: '08:00 AM - 12:00 PM',
          location: 'Community Hope Shelter, Downtown',
          capacity: 15,
          status: 'completed',
          createdAt: new Date().toISOString()
        }
      ];

      // Add a registration and approved hour log for the completed event to make reports immediately populated
      const volunteerUser = {
        id: 'volunteer-demo-id',
        name: 'Sahithi',
        email: 'sahithi@volunteer.org',
        password: bcrypt.hashSync('sahithi123', salt),
        role: 'volunteer',
        phone: '+15550212',
        skills: ['Teaching', 'Web Development', 'Event Coordination'],
        interestAreas: ['Education', 'Community Outreach', 'Environment'],
        createdAt: new Date().toISOString(),
        totalApprovedHours: 4
      };
      this.data.users.push(volunteerUser);

      this.data.registrations.push({
        id: 'reg-demo-1',
        userId: 'volunteer-demo-id',
        eventId: 'event-3',
        status: 'approved',
        createdAt: new Date().toISOString()
      });

      this.data.hours.push({
        id: 'hours-demo-1',
        userId: 'volunteer-demo-id',
        eventId: 'event-3',
        hours: 4,
        description: 'Packaged 45 food boxes and assisted 12 families during distribution.',
        status: 'approved',
        createdAt: new Date().toISOString()
      });
    }

    this.save();
    console.log('Seeded database with default admin and sample events.');
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  // --- QUERY INTERFACE ---
  
  // Find all rows matching condition
  find(table, filterFn) {
    if (!this.data[table]) return [];
    if (!filterFn) return this.data[table];
    return this.data[table].filter(filterFn);
  }

  // Find single row
  findOne(table, filterFn) {
    if (!this.data[table]) return null;
    return this.data[table].find(filterFn) || null;
  }

  // Insert row
  insert(table, row) {
    if (!this.data[table]) this.data[table] = [];
    const newRow = { ...row, id: row.id || Math.random().toString(36).substring(2, 9) };
    this.data[table].push(newRow);
    this.save();
    return newRow;
  }

  // Update rows
  update(table, filterFn, updateObj) {
    if (!this.data[table]) return 0;
    let count = 0;
    this.data[table] = this.data[table].map(row => {
      if (filterFn(row)) {
        count++;
        return { ...row, ...updateObj };
      }
      return row;
    });
    if (count > 0) this.save();
    return count;
  }

  // Delete rows
  delete(table, filterFn) {
    if (!this.data[table]) return 0;
    const initialLen = this.data[table].length;
    this.data[table] = this.data[table].filter(row => !filterFn(row));
    const deletedCount = initialLen - this.data[table].length;
    if (deletedCount > 0) this.save();
    return deletedCount;
  }
}

module.exports = new Database();

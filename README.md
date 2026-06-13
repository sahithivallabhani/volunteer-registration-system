# 🌟 VolunTrack — Volunteer Registration System

A full-stack **Volunteer Registration & Management System** built for an internship portfolio. Features JWT authentication, an admin dashboard with live analytics charts, volunteer hour tracking with approval workflow, and a downloadable Certificate of Appreciation.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite, Vanilla CSS (Glassmorphism) |
| **Backend** | Node.js + Express.js |
| **Database** | Local JSON file (zero-setup, production-ready to swap) |
| **Auth** | JWT (JSON Web Tokens) + bcryptjs password hashing |
| **Icons** | Lucide React |
| **Charts** | Custom SVG Charts (no external library) |

---

## ✨ Features

### 👤 Volunteer Portal
- Register & login securely with JWT authentication
- Browse and filter volunteering events by category/keyword
- Register for events with live capacity tracking
- Log volunteer hours with description (pending approval)
- View real-time approval status of submitted hours
- **Generate & download a personalized Certificate of Appreciation** (HTML5 Canvas, 1920×1080 PNG)
- Manage profile: name, phone, skills, interest areas

### 🛡️ Admin Dashboard
- Live analytics: total volunteers, events, approved hours, pending verifications
- Interactive SVG Donut chart (hours by category) + Bar chart (registrations per event)
- Top Volunteers ranking with animated progress bars
- Create, view, and delete volunteering events
- Approve or reject volunteer hour submissions
- **Export full activity reports as CSV** or print as PDF

---

## 🏃 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/volunteer-registration-system.git
cd volunteer-registration-system

# Install all dependencies (root + backend + frontend)
npm run install:all
```

### Running the App

```bash
npm start
```

This starts both servers concurrently:
- **Backend API** → `http://localhost:5000`
- **Frontend** → `http://localhost:5173`

---

## 🔑 Default Accounts

| Role | Email | Password |
|---|---|---|
| 🔐 Admin | `admin@volunteer.org` | `password` |
| 👤 Volunteer | `sahithi@volunteer.org` | `password` |

> Or register a new volunteer account from the login screen.

---

## 📁 Project Structure

```
volunteer-registration-system/
├── backend/
│   ├── data/               ← Auto-created JSON database (gitignored)
│   ├── middleware/
│   │   └── auth.js         ← JWT verification + admin guard
│   ├── database.js         ← File-based DB engine with seeding
│   ├── server.js           ← Express REST API
│   └── package.json
├── frontend/
│   └── src/
│       ├── components/     ← Navbar, StatCard, CustomChart, Certificate
│       ├── context/        ← AuthContext (JWT state management)
│       ├── pages/          ← Login, Register, Dashboards, Profile
│       ├── services/api.js ← API service layer
│       └── index.css       ← Premium glassmorphic design system
├── package.json            ← Root scripts (concurrently)
└── README.md
```

---

## 📸 Screenshots

> Login · Volunteer Dashboard · Admin Analytics · Certificate Generator

---

## 📄 License

MIT License — Built for internship portfolio demonstration.

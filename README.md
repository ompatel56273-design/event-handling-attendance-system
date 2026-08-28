# 🎫 Event Handling & Attendance Management System

A full-stack, enterprise-grade Event Management and Live QR-Code Attendance Tracking System built with Node.js, Express, MongoDB, React, and Vite.

---

## 🌟 Key Features

### 👥 Multi-Role Access Control
- **Super Admin & Admin**: Full event creation, member assignment, analytics dashboard, participant tracking, and winner declaration.
- **Event Members / Coordinators**: Dedicated scanner interface for live QR attendance validation and marks/evaluation entry.
- **Participants / Users**: Event discovery & registration, digital QR ticket passes, attendance tracking, and certificate/winner results.

### 📱 Live QR Code Attendance System
- Real-time camera QR scanner with automatic validation.
- Instant check-in status verification with anti-duplication mechanisms.
- Manual entry fallback for event staff.

### 📊 Marks & Winner Evaluation
- Evaluation matrix for judging event rounds.
- Automated score aggregation and leaderboard/winner announcements.

### 📧 Automated Notifications
- Email notifications and confirmation passes powered by Brevo.

### ☁️ Media Management
- Cloudinary integration for event banners, profile pictures, and assets.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Routing**: React Router DOM v7
- **Styling**: Vanilla CSS (Modern dark/glassmorphic responsive design)
- **Icons**: React Icons
- **QR Operations**: `html5-qrcode`, `react-qr-code`, `jsqr`
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **File Uploads**: Multer & Cloudinary
- **Emails**: Brevo API
- **Validation**: Express-Validator

---

## 📂 Project Structure

```text
├── backend/
│   ├── config/          # Database & third-party service configs
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, role-check & upload middlewares
│   ├── models/          # Mongoose data models
│   ├── routes/          # API route definitions
│   ├── seed/            # Database seeders
│   ├── services/        # Email and external integrations
│   ├── utils/           # Helper utilities
│   ├── .env.example     # Environment template
│   └── server.js        # Server entry point
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── assets/      # Media & icons
│   │   ├── components/  # Reusable UI & Scanner components
│   │   ├── context/     # Auth and Global state
│   │   ├── pages/       # Admin, Member, User & Auth views
│   │   ├── services/    # API client instances
│   │   ├── App.jsx      # App routing & layouts
│   │   └── main.jsx     # Entry point
│   └── index.html
├── .gitignore           # Global git ignore configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas cloud cluster)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
cd "Event handling Attendens system"
```

---

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/event-handling
JWT_SECRET=your_jwt_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Brevo (Email)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME="Event Handling System"
```

Start the backend server:
```bash
npm run dev
```

---

### 3. Frontend Setup
Open a new terminal tab:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The application will be accessible at: `http://localhost:5173`.

---

## 🔒 Security Best Practices
- Environment variables (`.env`) containing private keys, database strings, and API secrets are ignored from Git commits.
- Passwords are encrypted with `bcryptjs`.
- Protected endpoints require bearer JWT tokens and role verification.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

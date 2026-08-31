require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error.middleware');
const { seedSuperAdmin } = require('./seed/superadmin.seed');

const app = express();

// Connect to MongoDB
connectDB().then(() => {
  seedSuperAdmin();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/registrations', require('./routes/registration.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/marks', require('./routes/marks.routes'));
app.use('/api/winners', require('./routes/winners.routes'));
app.use('/api/qr', require('./routes/qr.routes'));
app.use('/api/admin/users', require('./routes/admin.user.routes'));
app.use('/api/admin/events', require('./routes/admin.event.routes'));
app.use('/api/admin/registrations', require('./routes/admin.registration.routes'));
app.use('/api/admin/attendance', require('./routes/admin.attendance.routes'));
app.use('/api/admin/marks', require('./routes/admin.marks.routes'));
app.use('/api/admin/winners', require('./routes/admin.winners.routes'));
app.use('/api/admin/event-members', require('./routes/admin.eventMember.routes'));
app.use('/api/certificates', require('./routes/certificate.routes'));
app.use('/api/announcements', require('./routes/announcement.routes'));
app.use('/api/feedback', require('./routes/feedback.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

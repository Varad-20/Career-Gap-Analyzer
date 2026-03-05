require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');

// Connect to MongoDB
connectDB();

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded resumes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/student', require('./src/routes/studentRoutes'));
app.use('/api/company', require('./src/routes/companyRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/jobs', require('./src/routes/jobRoutes'));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: '🚀 Career Gap Job Finder API is running', timestamp: new Date() });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`💾 MongoDB: Connected`);
    console.log(`\n📋 Seed admin: POST http://localhost:${PORT}/api/admin/seed\n`);
});

module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');

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
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/skills', require('./src/routes/skillRoutes'));
app.use('/api', require('./src/routes/instructorRoutes'));
app.use('/api/agent', require('./src/routes/agentRoutes'));
app.use('/api/jobs', require('./src/routes/jobRoutes'));
app.use('/api/company', require('./src/routes/companyRoutes'));
app.use('/api/coordinator', require('./src/routes/coordinatorRoutes'));
app.use('/api/drives', require('./src/routes/driveRoutes'));

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

// ─── BOOT ─────────────────────────────────────────────────────────────────────
// IMPORTANT: await connectDB so admin is seeded BEFORE accepting any requests
const PORT = process.env.PORT || 5000;

const { execSync } = require('child_process');

const killPort = (port) => {
    try {
        // Works on Windows (PowerShell)
        execSync(
            `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }`,
            { shell: 'powershell.exe', stdio: 'ignore' }
        );
    } catch (_) { /* ignore — port may already be free */ }
};

const startServer = async (retried = false) => {
    await connectDB(); // ← waits for DB + admin seed to complete

    const server = app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        console.log(`\n✅ Admin login: admin@careergap.com / Admin@123`);
        console.log(`✅ Ready to accept requests\n`);
    });

    server.on('error', async (err) => {
        if (err.code === 'EADDRINUSE') {
            if (!retried) {
                console.warn(`⚠️  Port ${PORT} busy — auto-killing conflicting process...`);
                killPort(PORT);
                await new Promise(r => setTimeout(r, 800)); // brief pause
                server.close();
                return startServer(true); // retry once
            }
            console.error(`❌ Port ${PORT} still in use after auto-kill. Please restart manually.`);
        } else {
            console.error('❌ Server error:', err.message);
        }
        process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => { server.close(); process.exit(0); });
    process.on('SIGINT',  () => { server.close(); process.exit(0); });
};

startServer().catch(err => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
});


module.exports = app;

// Fix for Node.js v17+ DNS resolution issue (IPv6 preferred but blocked on some networks)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careergap';
  const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');

  try {
    if (isLocal) {
      console.log('🔄 Connecting to local MongoDB server...');
    } else {
      console.log('🔄 Connecting to MongoDB Atlas...');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    await seedDefaultUsers();
  } catch (err) {
    console.error(`\n❌ Database connection failed: ${err.message}`);
    
    if (isLocal) {
      console.error('\n════════════════════════════════════════════════════════');
      console.error('  ⚠️  LOCAL MONGODB CONNECTION FAILED');
      console.error('  MongoDB Compass is a viewer; it needs a running MongoDB server.');
      console.error('  Please ensure your local MongoDB Community Server is running:');
      console.error('    1. Press Win + R, type `services.msc`, and press Enter.');
      console.error('    2. Look for "MongoDB Server" or "MongoDB Database Server".');
      console.error('    3. Right-click and select "Start" or "Restart".');
      console.error('  Alternatively, start it via command line (run as Admin):');
      console.error('    net start MongoDB');
      console.error('════════════════════════════════════════════════════════\n');
    } else {
      console.error('\n════════════════════════════════════════════════════════');
      console.error('  ⚠️  ATLAS/REMOTE MONGODB CONNECTION FAILED');
      console.error('  - Check your internet connection.');
      console.error('  - Whitelist your IP at https://cloud.mongodb.com');
      console.error('  - Verify your MONGO_URI in the .env file.');
      console.error('════════════════════════════════════════════════════════\n');
    }
    process.exit(1);
  }
};

// Auto-create default users so login always works (even with in-memory DB)
const seedDefaultUsers = async () => {
  try {
    // ── Admin ──────────────────────────────────────────────────────────────────
    const Admin = require('../models/Admin');
    const existingAdmin = await Admin.findOne({ email: 'admin@careergap.com' });
    if (!existingAdmin) {
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@careergap.com',
        password: 'Admin@123',
      });
      console.log('🔑 Admin seeded: admin@careergap.com / Admin@123');
    } else {
      console.log('🔑 Admin ready: admin@careergap.com / Admin@123');
    }

    // ── Default Student (your personal account) ───────────────────────────────
    const Student = require('../models/Student');
    const studentEmail = 'igharevrd@gmail.com';
    const existingStudent = await Student.findOne({ email: studentEmail });
    if (!existingStudent) {
      await Student.create({
        name: 'Varad Ighare',
        email: studentEmail,
        password: 'Test@1234',
        isVerified: true,
        isProfileComplete: false,
      });
      console.log(`👤 Student seeded: ${studentEmail} / Test@1234`);
    } else {
      console.log(`👤 Student ready: ${studentEmail}`);
    }
  } catch (e) {
    console.error('❌ Default user seed failed:', e.stack);
  }
};

module.exports = connectDB;

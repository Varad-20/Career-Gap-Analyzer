const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // If local MongoDB is not available, use in-memory DB for development
    if (!uri || uri.includes('localhost')) {
      try {
        // First try the local MongoDB connection with a short timeout
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
        console.log('✅ MongoDB Connected: localhost');
        return;
      } catch (localErr) {
        console.log('⚠️  Local MongoDB not found. Starting in-memory database...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        console.log('✅ In-Memory MongoDB started (data resets on restart)');
        console.log('💡 Tip: Install MongoDB locally or use Atlas for persistent data');

        // Seed the in-memory DB with admin account automatically
        process.mongod = mongod; // keep reference to stop it later
      }
    }

    await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    // Auto-seed admin if using in-memory DB
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('localhost')) {
      await seedAdmin();
    }

  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Auto-create admin account so login always works
const seedAdmin = async () => {
  try {
    const Admin = require('../models/Admin');
    const existing = await Admin.findOne({ email: 'admin@careergap.com' });
    if (!existing) {
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@careergap.com',
        password: 'Admin@123',
      });
      console.log('🔑 Admin seeded: admin@careergap.com / Admin@123');
    }
  } catch (e) {
    // Silently ignore seed errors
  }
};

module.exports = connectDB;

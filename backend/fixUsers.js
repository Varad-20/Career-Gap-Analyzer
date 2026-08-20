/**
 * fixUsers.js — Run this to reset/create user accounts in MongoDB
 * Usage: node fixUsers.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
};

// Inline schemas (avoids any model-caching issues)
const adminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, lowercase: true },
    password: String,
    role: { type: String, default: 'admin' }
}, { timestamps: true });

adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const studentSchema = new mongoose.Schema({
    name: String,
    email: { type: String, lowercase: true },
    password: String,
    role: { type: String, default: 'student' },
    degree: { type: String, default: '' },
    isVerified: { type: Boolean, default: true },
    isProfileComplete: { type: Boolean, default: false },
    gapDuration: { type: Number, default: 0 },
    subscription: { plan: { type: String, default: 'free' } }
}, { timestamps: true });

studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const Admin   = mongoose.models.Admin   || mongoose.model('Admin',   adminSchema);
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

const run = async () => {
    await connectDB();

    // ── 1. Ensure admin exists ────────────────────────────────────────────────
    const adminEmail = 'admin@careergap.com';
    const adminPwd   = 'Admin@123';

    let admin = await Admin.findOne({ email: adminEmail });
    if (admin) {
        // Reset password so we know it's correct
        admin.password = adminPwd;
        admin.markModified('password');
        await admin.save();
        console.log(`🔄 Admin password reset → ${adminEmail} / ${adminPwd}`);
    } else {
        await Admin.create({ name: 'Admin', email: adminEmail, password: adminPwd });
        console.log(`✅ Admin created → ${adminEmail} / ${adminPwd}`);
    }

    // ── 2. Ensure your personal student account exists ────────────────────────
    const studentEmail = 'igharevrd@gmail.com';
    const studentPwd   = 'Test@1234';   // set a fresh password you can use

    let student = await Student.findOne({ email: studentEmail });
    if (student) {
        student.password = studentPwd;
        student.markModified('password');
        await student.save();
        console.log(`🔄 Student password reset → ${studentEmail} / ${studentPwd}`);
    } else {
        await Student.create({
            name: 'Varad Ighare',
            email: studentEmail,
            password: studentPwd,
            isVerified: true
        });
        console.log(`✅ Student created → ${studentEmail} / ${studentPwd}`);
    }

    console.log('\n🎉 Done! Use the credentials above to log in.');
    process.exit(0);
};

run().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});

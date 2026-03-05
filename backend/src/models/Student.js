const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, default: 'student' },

    // Profile
    degree: { type: String, default: '' },
    skills: [{ type: String }],
    graduationYear: { type: Number },
    gapDuration: { type: Number, default: 0 }, // in months
    location: { type: String, default: '' },
    phone: { type: String, default: '' },
    bio: { type: String, default: '' },

    // Resume
    resumeURL: { type: String, default: '' },
    extractedResumeText: { type: String, default: '' },

    // AI Generated
    resumeScore: { type: Number, default: 0 },
    gapRiskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    suggestedRoles: [{ type: String }],
    gapJustification: { type: String, default: '' },
    resumeSuggestions: [{ type: String }],

    // Meta
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    isProfileComplete: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    notifications: [{
        message: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Hash password before save
studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password
studentSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);

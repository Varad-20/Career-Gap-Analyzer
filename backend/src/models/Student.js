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

    // Enriched resume data
    certifications: [{ name: String, issuer: String, year: Number }],
    projects: [{ title: String, description: String, techStack: [String] }],
    workExperience: [{
        role: String,
        company: String,
        startDate: String,
        endDate: String,
        isCurrent: Boolean
    }],
    totalExperience: { type: Number, default: 0 },

    // AI Generated
    resumeScore: { type: Number, default: 0 },
    gapRiskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    suggestedRoles: [{ type: String }],
    gapJustification: { type: String, default: '' },
    resumeSuggestions: [{ type: String }],

    // Meta
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    wishlistCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    courseProgress: [{
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        lastAccessed: { type: Date, default: Date.now }
    }],
    subscription: {
        plan: { type: String, enum: ['free', 'premium'], default: 'free' },
        expiresAt: { type: Date }
    },
    isProfileComplete: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

    // AI Career Agent — cached live job results
    liveJobResults: [{
        id: String,
        title: String,
        company: String,
        location: String,
        isRemote: Boolean,
        workType: String,
        description: String,
        applyLink: String,
        source: String,
        sourcePlatform: String,
        postedAt: String,
        requiredSkills: [String],
        experienceLevel: String,
        salaryMin: Number,
        salaryMax: Number,
        salaryDisplay: String,
        salaryCurrency: String,
        logo: String,
        gapFriendly: Boolean,
        matchScore: Number,
        matchedSkills: [String],
    }],
    lastJobSearchAt: { type: Date },
    notifications: [{
        message: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    // ── Placement / College Profile ─────────────────────────────────────────
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    enrollmentNo: { type: String, default: '' },   // College roll / PRN number
    branch: {
        type: String,
        enum: ['CS', 'IT', 'ECE', 'EE', 'ME', 'Civil', 'Chemical', 'MBA', 'MCA', 'Other', ''],
        default: ''
    },
    batch: { type: Number },                        // Graduation year e.g. 2025
    cgpa: { type: Number, default: 0, min: 0, max: 10 },
    percentage10th: { type: Number, default: 0, min: 0, max: 100 },
    percentage12th: { type: Number, default: 0, min: 0, max: 100 },
    activeBacklogs: { type: Number, default: 0 },
    totalBacklogs: { type: Number, default: 0 },

    // Placement Status
    placementStatus: {
        type: String,
        enum: ['not_placed', 'placed', 'opted_out'],
        default: 'not_placed'
    },
    placedAt: {
        company: { type: String, default: '' },
        role: { type: String, default: '' },
        package: { type: Number, default: 0 },  // LPA
        date: { type: Date },
        driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive' },
    },

}, { timestamps: true });

// Hash password before save
studentSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
studentSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);

const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g. "Aptitude Test", "Technical Round 1"
    type: {
        type: String,
        enum: ['aptitude', 'coding', 'gd', 'technical', 'hr', 'assignment', 'other'],
        default: 'other'
    },
    description: { type: String, default: '' },
    venue: { type: String, default: '' }, // online link or physical location
    scheduledAt: { type: Date },
    durationMinutes: { type: Number, default: 60 },
    isCompleted: { type: Boolean, default: false },
});

const placementDriveSchema = new mongoose.Schema({
    // Identity
    title: { type: String, required: true, trim: true }, // "TCS NQT 2025 Campus Drive"
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Coordinator' }, // who created it

    // Drive type
    driveType: { type: String, enum: ['placement', 'internship'], default: 'placement' },

    // Job details
    jobRole: { type: String, required: true }, // "Software Engineer", "Data Analyst"
    jobDescription: { type: String, required: true },
    requiredSkills: [{ type: String }],
    jobLocation: { type: String, default: 'Anywhere' },
    workType: { type: String, enum: ['On-site', 'Remote', 'Hybrid'], default: 'On-site' },

    // Package
    packageMin: { type: Number, default: 0 },   // LPA
    packageMax: { type: Number, default: 0 },
    packageDisplay: { type: String, default: '' }, // e.g. "3.6 - 5 LPA"
    stipend: { type: Number, default: 0 }, // for internships (per month)

    // Bond
    bond: {
        hasBond: { type: Boolean, default: false },
        durationMonths: { type: Number, default: 0 },
        details: { type: String, default: '' },
    },

    // Eligibility Criteria
    eligibility: {
        minCGPA: { type: Number, default: 0 },
        branches: [{ type: String }], // [] means all branches
        maxActiveBacklogs: { type: Number, default: 0 }, // 0 = no backlogs allowed
        minPercentage10th: { type: Number, default: 0 },
        minPercentage12th: { type: Number, default: 0 },
        batchYear: { type: Number }, // which graduating batch
        gapAllowed: { type: Boolean, default: true },
    },

    // Interview Rounds
    rounds: [roundSchema],

    // Logistics
    venue: { type: String, default: '' },
    driveDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },

    // Status
    status: {
        type: String,
        enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    isActive: { type: Boolean, default: true },

    // Stats (auto-computed)
    totalRegistered: { type: Number, default: 0 },
    totalShortlisted: { type: Number, default: 0 },
    totalSelected: { type: Number, default: 0 },

    // Company branding
    companyLogo: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },

    // Notes for students
    additionalInfo: { type: String, default: '' },

}, { timestamps: true });

// Index for fast lookup
placementDriveSchema.index({ college: 1, status: 1 });
placementDriveSchema.index({ company: 1, driveDate: -1 });

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);

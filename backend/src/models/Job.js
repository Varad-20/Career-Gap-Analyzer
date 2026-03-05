const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    companyName: { type: String, required: true },

    // Job Details
    jobRole: { type: String, required: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }],
    experienceRequired: { type: Number, default: 0 }, // years
    location: { type: String, default: '' },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    salaryDisplay: { type: String, default: '' },
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'], default: 'Full-time' },

    // Gap Policy
    acceptGap: { type: Boolean, default: false },
    maxGapAllowed: { type: Number, default: 0 }, // months

    // Status
    isActive: { type: Boolean, default: true },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    views: { type: Number, default: 0 },

    // Deadline
    deadline: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);

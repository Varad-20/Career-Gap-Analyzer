const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },

    // Matching
    matchScore: { type: Number, default: 0 }, // 0-100
    skillMatchPercentage: { type: Number, default: 0 },
    gapCompliant: { type: Boolean, default: false },

    // Cover Letter / Message
    coverLetter: { type: String, default: '' },

    // Status
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'],
        default: 'pending'
    },

    // Timestamps
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },

    // Notes from company
    companyNotes: { type: String, default: '' },

}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

const mongoose = require('mongoose');

const roundResultSchema = new mongoose.Schema({
    roundIndex: { type: Number, required: true }, // 0-based index into drive.rounds[]
    roundName: { type: String },
    status: { type: String, enum: ['pending', 'pass', 'fail', 'absent'], default: 'pending' },
    score: { type: Number }, // optional score
    remarks: { type: String, default: '' },
    evaluatedAt: { type: Date },
    evaluatedBy: { type: String, default: '' }, // coordinator/company name
}, { _id: false });

const driveApplicationSchema = new mongoose.Schema({
    drive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },

    // Application status
    status: {
        type: String,
        enum: [
            'registered',    // just signed up
            'shortlisted',   // cleared initial screening
            'in_process',    // currently in rounds
            'selected',      // got the offer
            'rejected',      // eliminated
            'on_hold',       // pending decision
            'withdrawn',     // student withdrew
        ],
        default: 'registered'
    },

    // Round tracking
    currentRound: { type: Number, default: 0 }, // which round they're at
    roundResults: [roundResultSchema],

    // Offer details (when selected)
    offerLetter: { type: String, default: '' }, // URL to uploaded offer letter
    offeredPackage: { type: Number, default: 0 }, // LPA
    offeredRole: { type: String, default: '' },
    offerDeadline: { type: Date },
    offerAccepted: { type: Boolean },

    // Student snapshot at time of registration (for historical accuracy)
    studentSnapshot: {
        cgpa: Number,
        branch: String,
        activeBacklogs: Number,
        resumeURL: String,
    },

    // Flags
    isEligible: { type: Boolean, default: true },
    registeredAt: { type: Date, default: Date.now },
    placedAt: { type: Date },

}, { timestamps: true });

// Prevent duplicate registrations
driveApplicationSchema.index({ drive: 1, student: 1 }, { unique: true });
driveApplicationSchema.index({ student: 1, status: 1 });
driveApplicationSchema.index({ drive: 1, status: 1 });

module.exports = mongoose.model('DriveApplication', driveApplicationSchema);

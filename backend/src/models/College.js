const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // e.g. "MIT", "VIT"
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    website: { type: String, default: '' },
    logo: { type: String, default: '' },

    // Academic
    departments: [{
        type: String,
        enum: ['CS', 'IT', 'ECE', 'EE', 'ME', 'Civil', 'Chemical', 'MBA', 'MCA', 'Other']
    }],
    currentBatch: { type: Number }, // e.g. 2025 (graduation year)
    affiliatedUniversity: { type: String, default: '' },
    naacGrade: { type: String, default: '' },

    // Placement Coordinator
    coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'Coordinator' },

    // Placement Stats (auto-computed)
    placementStats: {
        totalStudents: { type: Number, default: 0 },
        eligibleStudents: { type: Number, default: 0 },
        placed: { type: Number, default: 0 },
        avgPackage: { type: Number, default: 0 },  // in LPA
        maxPackage: { type: Number, default: 0 },
        placementRate: { type: Number, default: 0 }, // percentage
        lastUpdated: { type: Date }
    },

    // Status
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('College', collegeSchema);

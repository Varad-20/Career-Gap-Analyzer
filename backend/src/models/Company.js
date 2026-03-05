const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const companySchema = new mongoose.Schema({
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, default: 'company' },

    // Company Info
    industry: { type: String, default: '' },
    website: { type: String, default: '' },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    logo: { type: String, default: '' },
    phone: { type: String, default: '' },

    // Status
    isApproved: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

    notifications: [{
        message: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

companySchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

companySchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Company', companySchema);

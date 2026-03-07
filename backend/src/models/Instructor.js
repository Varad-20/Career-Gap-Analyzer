const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const instructorSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, default: 'instructor' },

    // Profile
    bio: { type: String, default: '' },
    specialization: { type: String, default: '' },
    website: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    location: { type: String, default: '' },

    // Payment Details
    paymentDetails: {
        bankName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        ifscCode: { type: String, default: '' },
        upiId: { type: String, default: '' },
        accountHolderName: { type: String, default: '' }
    },

    // Revenue / Courses Stats
    totalEarnings: { type: Number, default: 0 },

    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

instructorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

instructorSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Instructor', instructorSchema);

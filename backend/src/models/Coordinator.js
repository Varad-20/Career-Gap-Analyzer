const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const coordinatorSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, default: 'coordinator' },
    phone: { type: String, default: '' },
    designation: { type: String, default: 'Training & Placement Officer' }, // TPO, Assistant TPO, etc.
    department: { type: String, default: '' },

    // College association
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },

    // Profile
    profilePhoto: { type: String, default: '' },
    bio: { type: String, default: '' },

    // Notifications
    notifications: [{
        message: String,
        type: { type: String, enum: ['info', 'success', 'warning'], default: 'info' },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

}, { timestamps: true });

coordinatorSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

coordinatorSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Coordinator', coordinatorSchema);

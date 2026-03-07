const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    subject: { type: String, required: true },
    messages: [{
        senderModel: { type: String, enum: ['Student', 'Instructor'], required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, required: true },
        text: { type: String, required: true },
        sentAt: { type: Date, default: Date.now }
    }],
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Query', querySchema);

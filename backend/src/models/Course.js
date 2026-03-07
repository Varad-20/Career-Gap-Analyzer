const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    skillTags: [{ type: String }],
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    estimatedTime: { type: String, default: '2 hours' },
    instructor: { type: String, default: 'System' },
    rating: { type: Number, default: 4.5 },
    category: { type: String, default: 'General' },
    isPremium: { type: Boolean, default: false },

    // Instructor & Admin fields
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
    uploadFeePaid: { type: Boolean, default: false },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },

    // Learning Package contents
    modules: [{
        title: String,
        lessons: [{
            title: String,
            videoUrl: String, // Added video support
            content: String,
            duration: String,
            isCompleted: { type: Boolean, default: false }
        }]
    }],
    resources: [{
        title: String,
        url: String, // External link or file path
        type: { type: String, enum: ['PDF', 'Video', 'Code', 'Other'] }
    }],
    mockTests: [{
        title: String,
        description: String,
        duration: Number, // in minutes
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number // index
        }]
    }],
    studyNotesUrl: { type: String },
    roadmapUrl: { type: String },
    practiceExercisesUrl: { type: String },
    interviewPrepUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);

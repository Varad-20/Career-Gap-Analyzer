const Course = require('../models/Course');
const Instructor = require('../models/Instructor');
const Student = require('../models/Student');
const Query = require('../models/Query');

// Instructor: Submit a new course (pending admin approval)
exports.submitCourse = async (req, res) => {
    try {
        const { title, description, skillTags, difficulty, estimatedTime, category, isPremium, modules } = req.body;

        const course = await Course.create({
            title,
            description,
            skillTags: skillTags || [],
            difficulty,
            estimatedTime,
            category,
            isPremium: isPremium || false,
            modules: modules || [],
            instructorId: req.user.id,
            uploadFeePaid: true, // In real app, verify payment first
            approvalStatus: 'pending',
            instructor: req.user.name
        });

        res.status(201).json({ success: true, course, message: 'Course submitted for admin review.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Instructor: Get their own courses
exports.getMyCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instructorId: req.user.id }).sort('-createdAt');
        res.json({ success: true, courses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Instructor: Update course curriculum (modules, videos, materials, mock tests)
exports.updateCurriculum = async (req, res) => {
    try {
        const { modules, resources, mockTests } = req.body;
        const course = await Course.findOne({ _id: req.params.id, instructorId: req.user.id });

        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        // Update curriculum fields
        if (modules) course.modules = modules;
        if (resources) course.resources = resources;
        if (mockTests) course.mockTests = mockTests;

        await course.save();
        res.json({ success: true, course, message: 'Curriculum updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Instructor: Delete their own course
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({ _id: req.params.id, instructorId: req.user.id });
        if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
        res.json({ success: true, message: 'Course deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Instructor: Profile
exports.getProfile = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.user.id).select('-password');
        res.json({ success: true, instructor });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Instructor: Update Profile & Payment Details
exports.updateProfile = async (req, res) => {
    try {
        const { bio, specialization, website, contactNumber, location, paymentDetails } = req.body;
        const instructor = await Instructor.findByIdAndUpdate(
            req.user.id,
            { bio, specialization, website, contactNumber, location, paymentDetails },
            { new: true, runValidators: true }
        ).select('-password');

        if (!instructor) return res.status(404).json({ success: false, message: 'Instructor not found' });
        res.json({ success: true, instructor, message: 'Profile updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Instructor: Get Enrolled Students
exports.getEnrolledStudents = async (req, res) => {
    try {
        // Find all courses by this instructor
        const courses = await Course.find({ instructorId: req.user.id }).select('_id title');
        const courseIds = courses.map(c => c._id);

        // Find students enrolled in any of these courses
        const students = await Student.find({
            'courseProgress.course': { $in: courseIds }
        }).select('name email location degree courseProgress');

        // Format data to show course-wise enrollments
        const formattedData = students.map(s => {
            const enrolledIn = s.courseProgress
                .filter(cp => courseIds.some(id => id.equals(cp.course)))
                .map(cp => {
                    const courseInfo = courses.find(c => c._id.equals(cp.course));
                    return {
                        courseId: cp.course,
                        courseTitle: courseInfo ? courseInfo.title : 'Deleted Course',
                        progress: cp.progress,
                        completed: cp.completed,
                        enrolledAt: cp.lastAccessed
                    };
                });

            return {
                _id: s._id,
                name: s.name,
                email: s.email,
                degree: s.degree,
                enrolledIn
            };
        });

        res.json({ success: true, students: formattedData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Instructor: Get Queries (Chat Sessions)
exports.getQueries = async (req, res) => {
    try {
        const queries = await Query.find({ instructor: req.user.id })
            .populate('student', 'name email')
            .populate('course', 'title')
            .sort('-updatedAt');
        res.json({ success: true, queries });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Instructor: Reply to Query
exports.replyToQuery = async (req, res) => {
    try {
        const { text, status } = req.body; // text: message to send, status: 'open' | 'resolved'
        const query = await Query.findOne({ _id: req.params.id, instructor: req.user.id });

        if (!query) return res.status(404).json({ success: false, message: 'Query not found' });

        if (text) {
            query.messages.push({
                senderModel: 'Instructor',
                sender: req.user.id,
                text
            });
        }

        if (status) query.status = status;

        await query.save();
        res.json({ success: true, query, message: 'Reply sent successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: Approve/Reject courses ───────────────────────────────────────────

exports.adminGetPendingCourses = async (req, res) => {
    try {
        const { status = 'pending' } = req.query;
        const courses = await Course.find({ approvalStatus: status })
            .populate('instructorId', 'name email specialization')
            .sort('-createdAt');
        res.json({ success: true, courses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.adminReviewCourse = async (req, res) => {
    try {
        const { status, reason } = req.body; // 'approved' | 'rejected'
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
        }

        const course = await Course.findByIdAndUpdate(req.params.id,
            { approvalStatus: status },
            { new: true }
        ).populate('instructorId', 'name email');

        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        res.json({ success: true, course, message: `Course ${status} successfully.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: List all instructors
exports.adminGetInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find().select('-password').sort('-createdAt');
        res.json({ success: true, instructors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: Verify or revoke an instructor
exports.adminVerifyInstructor = async (req, res) => {
    try {
        const { isVerified } = req.body;
        const instructor = await Instructor.findByIdAndUpdate(
            req.params.id,
            { isVerified },
            { new: true }
        ).select('-password');
        if (!instructor) return res.status(404).json({ success: false, message: 'Instructor not found' });
        res.json({ success: true, instructor, message: `Instructor ${isVerified ? 'verified' : 'revoked'} successfully.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

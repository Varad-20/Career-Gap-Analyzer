const Course = require('../models/Course');
const Student = require('../models/Student');
const Query = require('../models/Query');

// GET all courses with optional search/filter
exports.searchCourses = async (req, res) => {
    try {
        const { keyword, difficulty, isPremium } = req.query;
        let query = {};

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { skillTags: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (difficulty) query.difficulty = difficulty;
        if (isPremium !== undefined) query.isPremium = isPremium === 'true';

        const courses = await Course.find(query).sort('-createdAt');
        res.json({ success: true, courses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET single course package details
exports.getCourseDetails = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        // If course is premium, enforce subscription check
        if (course.isPremium) {
            const student = await Student.findById(req.user.id);
            if (student.subscription.plan !== 'premium' || (student.subscription.expiresAt && student.subscription.expiresAt < new Date())) {
                return res.status(403).json({ success: false, message: 'Premium subscription required to access full package.' });
            }
        }

        res.json({ success: true, course });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST subscription upgrade
exports.upgradeSubscription = async (req, res) => {
    try {
        const { planId } = req.body; // e.g. "premium_1_month"
        // Dummy logic to just set them to premium
        let expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now

        const student = await Student.findByIdAndUpdate(req.user.id, {
            subscription: {
                plan: 'premium',
                expiresAt: expiryDate
            }
        }, { new: true });

        res.json({ success: true, message: 'Upgraded to Premium successfully!', subscription: student.subscription });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST toggle wishlist
exports.toggleWishlist = async (req, res) => {
    try {
        const { courseId } = req.body;
        const student = await Student.findById(req.user.id);

        const index = student.wishlistCourses.indexOf(courseId);
        if (index > -1) {
            student.wishlistCourses.splice(index, 1);
        } else {
            student.wishlistCourses.push(courseId);
        }
        await student.save();
        res.json({ success: true, wishlistCourses: student.wishlistCourses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST mark progress
exports.updateProgress = async (req, res) => {
    try {
        const { courseId, progress, completed } = req.body;
        const student = await Student.findById(req.user.id);

        let progressEntry = student.courseProgress.find(p => p.course.toString() === courseId);
        if (progressEntry) {
            progressEntry.progress = progress;
            progressEntry.completed = completed;
            progressEntry.lastAccessed = Date.now();
        } else {
            student.courseProgress.push({
                course: courseId,
                progress,
                completed,
                lastAccessed: Date.now()
            });
        }
        await student.save();
        res.json({ success: true, courseProgress: student.courseProgress });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST enroll in course
exports.enrollCourse = async (req, res) => {
    try {
        const { id: courseId } = req.params;
        const student = await Student.findById(req.user.id);
        const course = await Course.findById(courseId);

        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        if (course.isPremium) {
            if (student.subscription.plan !== 'premium' || (student.subscription.expiresAt && student.subscription.expiresAt < new Date())) {
                return res.status(403).json({ success: false, message: 'Premium subscription required to enroll' });
            }
        }

        let progressEntry = student.courseProgress.find(p => p.course.toString() === courseId);
        if (!progressEntry) {
            student.courseProgress.push({
                course: courseId,
                progress: 0,
                completed: false,
                lastAccessed: Date.now()
            });
            await student.save();
        }

        res.json({ success: true, message: 'Successfully enrolled!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET student queries
exports.getStudentQueries = async (req, res) => {
    try {
        const queries = await Query.find({ student: req.user.id })
            .populate('instructor', 'name specialization')
            .populate('course', 'title')
            .sort('-updatedAt');
        res.json({ success: true, queries });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST create student query
exports.createStudentQuery = async (req, res) => {
    try {
        const { courseId, subject, text } = req.body;
        const course = await Course.findById(courseId);

        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const query = await Query.create({
            student: req.user.id,
            instructor: course.instructorId,
            course: courseId,
            subject,
            messages: [{
                senderModel: 'Student',
                sender: req.user.id,
                text
            }]
        });

        res.status(201).json({ success: true, query, message: 'Query sent to instructor!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST reply to query (student side)
exports.replyToQueryStudent = async (req, res) => {
    try {
        const { text } = req.body;
        const query = await Query.findOne({ _id: req.params.id, student: req.user.id });

        if (!query) return res.status(404).json({ success: false, message: 'Query not found' });

        query.messages.push({
            senderModel: 'Student',
            sender: req.user.id,
            text
        });

        await query.save();
        res.json({ success: true, query, message: 'Reply sent!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.seedCourses = async (req, res) => {
    try {
        await Course.deleteMany({});
        const dummyCourses = [
            {
                title: 'Data Science with Python',
                description: 'Complete data science bootcamp covering Pandas, NumPy, Scikit-Learn, and basic deep learning models.',
                skillTags: ['Python', 'Data Science', 'Machine Learning', 'Pandas'],
                difficulty: 'Intermediate',
                estimatedTime: '40 hours',
                instructor: 'Dr. AI Researcher',
                rating: 4.8,
                category: 'Data Science',
                isPremium: true
            },
            {
                title: 'React for Beginners',
                description: 'Start your web development journey. Learn React hooks, context, and modern UI development.',
                skillTags: ['React', 'Web Development', 'JavaScript', 'Frontend'],
                difficulty: 'Beginner',
                estimatedTime: '25 hours',
                instructor: 'Frontend Masters',
                rating: 4.9,
                category: 'Web Development',
                isPremium: false
            },
            {
                title: 'Advanced System Design',
                description: 'Learn to design scalable architectures, microservices, load balancing, and caching strategies.',
                skillTags: ['System Design', 'Backend', 'Architecture'],
                difficulty: 'Advanced',
                estimatedTime: '15 hours',
                instructor: 'Tech Lead',
                rating: 4.7,
                category: 'Software Engineering',
                isPremium: true
            },
            {
                title: 'UI/UX Masterclass',
                description: 'Figma principles, user research, wireframing, and interactive prototyping.',
                skillTags: ['UI/UX', 'Figma', 'Design'],
                difficulty: 'Beginner',
                estimatedTime: '10 hours',
                instructor: 'Design Studio',
                rating: 4.6,
                category: 'Design',
                isPremium: false
            }
        ];

        const created = await Course.insertMany(dummyCourses);
        res.json({ success: true, message: 'Courses seeded', count: created.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

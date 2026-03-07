const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Admin = require('../models/Admin');

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

exports.getAnalytics = async (req, res) => {
    try {
        const [totalStudents, totalCompanies, totalJobs, totalApplications] = await Promise.all([
            Student.countDocuments(),
            Company.countDocuments(),
            Job.countDocuments({ isActive: true }),
            Application.countDocuments()
        ]);

        const gapCandidates = await Student.countDocuments({ gapDuration: { $gt: 0 } });
        const approvedCompanies = await Company.countDocuments({ isApproved: true });
        const pendingCompanies = await Company.countDocuments({ isApproved: false });

        // Most in-demand skills (aggregate from all jobs)
        const skillAgg = await Job.aggregate([
            { $unwind: '$requiredSkills' },
            { $group: { _id: '$requiredSkills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Application status breakdown
        const appStats = await Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            analytics: {
                totalStudents,
                totalCompanies,
                approvedCompanies,
                pendingCompanies,
                totalJobs,
                totalApplications,
                gapCandidates,
                topSkills: skillAgg.map(s => ({ skill: s._id, count: s.count })),
                applicationStats: appStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {})
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().select('-password').sort('-createdAt');
        res.json({ success: true, students });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        await Application.deleteMany({ student: req.params.id });
        res.json({ success: true, message: 'Student deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── COMPANY MANAGEMENT ───────────────────────────────────────────────────────

exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find().select('-password').sort('-createdAt');
        res.json({ success: true, companies });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.approveCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        ).select('-password');

        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

        res.json({ success: true, message: 'Company approved', company });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        await Company.findByIdAndDelete(req.params.id);
        await Job.deleteMany({ company: req.params.id });
        res.json({ success: true, message: 'Company deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── JOB MANAGEMENT ───────────────────────────────────────────────────────────

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('company', 'companyName').sort('-createdAt');
        res.json({ success: true, jobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('student', 'name email skills gapDuration gapRiskLevel')
            .populate('job', 'jobRole location salaryDisplay')
            .populate('company', 'companyName')
            .sort('-createdAt');
        res.json({ success: true, applications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── SEED ADMIN ───────────────────────────────────────────────────────────────

exports.seedAdmin = async (req, res) => {
    try {
        const existing = await Admin.findOne({ email: 'admin@careergap.com' });
        if (existing) return res.json({ success: true, message: 'Admin already exists' });

        await Admin.create({
            name: 'Super Admin',
            email: 'admin@careergap.com',
            password: 'Admin@123'
        });

        res.status(201).json({ success: true, message: 'Admin created: admin@careergap.com / Admin@123' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Student = require('../models/Student');

// ─── GET COMPANY PROFILE ──────────────────────────────────────────────────────

exports.getProfile = async (req, res) => {
    try {
        const company = await Company.findById(req.user._id).select('-password');
        res.json({ success: true, company });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { companyName, industry, website, description, location, phone } = req.body;
        const updated = await Company.findByIdAndUpdate(
            req.user._id,
            { companyName, industry, website, description, location, phone },
            { new: true }
        ).select('-password');
        res.json({ success: true, company: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── JOB MANAGEMENT ───────────────────────────────────────────────────────────

exports.createJob = async (req, res) => {
    try {
        const company = await Company.findById(req.user._id);
        if (!company.isApproved) {
            return res.status(403).json({ success: false, message: 'Your company account is pending approval' });
        }

        const {
            jobRole, description, requiredSkills, experienceRequired,
            location, salaryMin, salaryMax, jobType, acceptGap, maxGapAllowed, deadline
        } = req.body;

        const skillsArray = typeof requiredSkills === 'string'
            ? requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
            : requiredSkills;

        const salaryDisplay = salaryMin && salaryMax
            ? `₹${(salaryMin / 100000).toFixed(1)}L - ₹${(salaryMax / 100000).toFixed(1)}L`
            : 'Negotiable';

        const job = await Job.create({
            company: req.user._id,
            companyName: company.companyName,
            jobRole, description,
            requiredSkills: skillsArray,
            experienceRequired,
            location, salaryMin, salaryMax, salaryDisplay, jobType,
            acceptGap, maxGapAllowed, deadline
        });

        res.status(201).json({ success: true, job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ company: req.user._id }).sort('-createdAt');
        res.json({ success: true, jobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.jobId, company: req.user._id });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        const updated = await Job.findByIdAndUpdate(req.params.jobId, req.body, { new: true });
        res.json({ success: true, job: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.jobId, company: req.user._id });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        res.json({ success: true, message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

exports.getJobApplications = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.jobId, company: req.user._id });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        const applications = await Application.find({ job: req.params.jobId })
            .populate('student', 'name email degree skills gapDuration resumeScore gapRiskLevel location resumeURL phone bio')
            .sort('-matchScore');

        res.json({ success: true, applications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, notes } = req.body;

        const application = await Application.findById(applicationId).populate('job');
        if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
        if (application.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        application.status = status;
        application.companyNotes = notes || '';
        application.reviewedAt = new Date();
        await application.save();

        // Notify student
        const notifMsg = `Your application for ${application.job.jobRole} has been ${status}`;
        await Student.findByIdAndUpdate(application.student, {
            $push: { notifications: { message: notifMsg } }
        });

        res.json({ success: true, application });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

exports.getDashboardStats = async (req, res) => {
    try {
        const jobs = await Job.find({ company: req.user._id });
        const jobIds = jobs.map(j => j._id);
        const applications = await Application.find({ job: { $in: jobIds } });

        const stats = {
            totalJobs: jobs.length,
            activeJobs: jobs.filter(j => j.isActive).length,
            totalApplications: applications.length,
            pendingReview: applications.filter(a => a.status === 'pending').length,
            shortlisted: applications.filter(a => a.status === 'shortlisted').length,
            accepted: applications.filter(a => a.status === 'accepted').length,
        };

        res.json({ success: true, stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const path = require('path');
const Student = require('../models/Student');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { analyzeResume, generateGapJustification, getResumeSuggestions } = require('../services/openaiService');
const { getMatchedJobs } = require('../services/matchingEngine');
const { extractTextFromPDF } = require('../utils/fileUtils');

// ─── GET PROFILE ──────────────────────────────────────────────────────────────

exports.getProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id).select('-password');
        res.json({ success: true, student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────

exports.updateProfile = async (req, res) => {
    try {
        const { name, degree, skills, graduationYear, location, phone, bio } = req.body;

        const skillsArray = typeof skills === 'string'
            ? skills.split(',').map(s => s.trim()).filter(Boolean)
            : skills;

        const updated = await Student.findByIdAndUpdate(
            req.user._id,
            { name, degree, skills: skillsArray, graduationYear, location, phone, bio, isProfileComplete: true },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ success: true, student: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UPLOAD RESUME + AI ANALYSIS ─────────────────────────────────────────────

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
        }

        const resumeURL = `/uploads/${req.file.filename}`;
        const filePath = path.join(__dirname, '../../uploads', req.file.filename);

        // Step 1: Extract text from PDF
        const { success: pdfSuccess, text: resumeText } = await extractTextFromPDF(filePath);

        if (!pdfSuccess || !resumeText.trim()) {
            return res.status(400).json({ success: false, message: 'Could not extract text from PDF. Ensure the PDF is text-based.' });
        }

        // Step 2: Analyze with OpenAI
        const { success: aiSuccess, data } = await analyzeResume(resumeText);

        // Step 3: Update student profile with extracted data
        const updateData = {
            resumeURL,
            extractedResumeText: resumeText,
            skills: data.skills?.length ? data.skills : req.user.skills,
            graduationYear: data.graduationYear || req.user.graduationYear,
            gapDuration: data.gapDuration || 0,
            gapRiskLevel: data.gapRiskLevel || 'Low',
            suggestedRoles: data.suggestedRoles || [],
            gapJustification: data.gapJustification || '',
            resumeSuggestions: data.resumeSuggestions || [],
            resumeScore: data.resumeScore || 50,
        };

        const student = await Student.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');

        res.json({
            success: true,
            message: 'Resume uploaded and analyzed successfully',
            student,
            analysis: {
                skills: data.skills,
                gapDuration: data.gapDuration,
                gapRiskLevel: data.gapRiskLevel,
                resumeScore: data.resumeScore,
                suggestedRoles: data.suggestedRoles,
                gapJustification: data.gapJustification,
                resumeSuggestions: data.resumeSuggestions,
                aiPowered: aiSuccess
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET MATCHED JOBS ─────────────────────────────────────────────────────────

exports.getMatchedJobs = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);

        const { gapMin, gapMax, skillMatch, location, salaryMin } = req.query;

        let query = { isActive: true, acceptGap: true };
        if (location) query.location = { $regex: location, $options: 'i' };
        if (gapMax) query.maxGapAllowed = { $gte: student.gapDuration };

        const jobs = await Job.find(query).populate('company', 'companyName logo location');
        const matches = getMatchedJobs(student, jobs);

        // Apply filters
        let filtered = matches;
        if (skillMatch) filtered = filtered.filter(m => m.skillMatchPercentage >= parseInt(skillMatch));
        if (salaryMin) filtered = filtered.filter(m => m.job.salaryMax >= parseInt(salaryMin));

        res.json({
            success: true,
            count: filtered.length,
            matches: filtered.map(m => ({
                job: m.job,
                matchScore: m.matchScore,
                skillMatchPercentage: m.skillMatchPercentage,
                gapCompliant: m.gapCompliant,
                details: m.details
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── APPLY TO JOB ─────────────────────────────────────────────────────────────

exports.applyToJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { coverLetter } = req.body;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        if (!job.isActive) return res.status(400).json({ success: false, message: 'This job is no longer active' });

        // Check for duplicate application
        const existing = await Application.findOne({ student: req.user._id, job: jobId });
        if (existing) return res.status(400).json({ success: false, message: 'You have already applied to this job' });

        const student = await Student.findById(req.user._id);
        const { matchScore, skillMatchPercentage, gapCompliant } = require('../services/matchingEngine').calculateMatchScore(student, job);

        const application = await Application.create({
            student: req.user._id,
            job: jobId,
            company: job.company,
            matchScore,
            skillMatchPercentage,
            gapCompliant,
            coverLetter
        });

        // Add applicant to job
        await Job.findByIdAndUpdate(jobId, { $push: { applicants: application._id } });

        // Add notification to company
        await require('../models/Company').findByIdAndUpdate(job.company, {
            $push: { notifications: { message: `New application for ${job.jobRole} from ${student.name}` } }
        });

        res.status(201).json({ success: true, message: 'Application submitted successfully', application });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already applied to this job' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET MY APPLICATIONS ──────────────────────────────────────────────────────

exports.getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ student: req.user._id })
            .populate('job', 'jobRole location salaryMin salaryMax jobType acceptGap maxGapAllowed')
            .populate('company', 'companyName logo email phone website industry location description')
            .sort('-createdAt');

        // Only expose sensitive contact details if application is accepted
        const sanitized = applications.map(app => {
            const appObj = app.toObject();
            if (app.status !== 'accepted' && app.status !== 'shortlisted') {
                // Hide direct contact info until accepted/shortlisted
                if (appObj.company) {
                    delete appObj.company.email;
                    delete appObj.company.phone;
                }
            }
            return appObj;
        });

        res.json({ success: true, applications: sanitized });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ─── SAVE / UNSAVE JOB ────────────────────────────────────────────────────────

exports.toggleSaveJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const student = await Student.findById(req.user._id);

        const isSaved = student.savedJobs.includes(jobId);
        if (isSaved) {
            student.savedJobs = student.savedJobs.filter(id => id.toString() !== jobId);
        } else {
            student.savedJobs.push(jobId);
        }

        await student.save();
        res.json({ success: true, saved: !isSaved, savedJobs: student.savedJobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET SAVED JOBS ───────────────────────────────────────────────────────────

exports.getSavedJobs = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id).populate('savedJobs');
        res.json({ success: true, savedJobs: student.savedJobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GENERATE GAP JUSTIFICATION ───────────────────────────────────────────────

exports.generateGapJustification = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        const { text } = await generateGapJustification(student);

        await Student.findByIdAndUpdate(req.user._id, { gapJustification: text });
        res.json({ success: true, justification: text });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET DASHBOARD STATS ──────────────────────────────────────────────────────

exports.getDashboardStats = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        const applications = await Application.find({ student: req.user._id });

        const stats = {
            resumeScore: student.resumeScore,
            gapDuration: student.gapDuration,
            gapRiskLevel: student.gapRiskLevel,
            totalApplications: applications.length,
            pendingApplications: applications.filter(a => a.status === 'pending').length,
            shortlisted: applications.filter(a => a.status === 'shortlisted').length,
            accepted: applications.filter(a => a.status === 'accepted').length,
            rejected: applications.filter(a => a.status === 'rejected').length,
            savedJobsCount: student.savedJobs.length,
            skillsCount: student.skills.length,
            profileComplete: student.isProfileComplete,
        };

        res.json({ success: true, stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

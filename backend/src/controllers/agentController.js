/**
 * AI Career Agent Controller
 * Handles all agent-related API endpoints:
 * - POST /api/agent/search-jobs  — trigger live job search
 * - GET  /api/agent/results      — get cached job results
 * - POST /api/agent/skill-gap    — run skill gap analysis
 * - GET  /api/agent/roadmap      — get learning roadmap
 */

const Student = require('../models/Student');
const { runJobSearchAgent } = require('../services/jobSearchAgent');
const { analyzeSkillGap, generateLearningRoadmap } = require('../services/skillGapService');

// ─── POST /api/agent/search-jobs ──────────────────────────────────────────────
exports.searchJobs = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const studentProfile = {
            skills: student.skills || [],
            suggestedRoles: student.suggestedRoles || [],
            location: student.location || 'India',
            gapDuration: student.gapDuration || 0,
            degree: student.degree || '',
        };

        // Run the live job search agent
        const liveJobs = await runJobSearchAgent(studentProfile);

        // Cache results in student document
        await Student.findByIdAndUpdate(req.user._id, {
            liveJobResults: liveJobs.slice(0, 20), // cache top 20
            lastJobSearchAt: new Date(),
        });

        res.json({
            success: true,
            count: liveJobs.length,
            jobs: liveJobs,
            searchedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Agent searchJobs error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/agent/results ───────────────────────────────────────────────────
exports.getJobResults = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id).select('liveJobResults lastJobSearchAt skills suggestedRoles location gapDuration');

        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        let jobs = student.liveJobResults || [];
        const hasResults = jobs.length > 0;

        // Detect old cached mock data with homepage-only URLs (no query params)
        // and regenerate with proper deep-link URLs
        const hasStaleUrls = jobs.some(j =>
            j.sourcePlatform === 'mock' &&
            j.applyLink &&
            !j.applyLink.includes('?') &&
            !j.applyLink.includes('/jobs/')
        );

        // If no cached results OR stale homepage URLs, generate fresh ones
        if (!hasResults || hasStaleUrls) {
            const { generateMockJobs } = require('../services/jobSearchAgent');
            const mockJobs = generateMockJobs(student.skills, student.suggestedRoles, student.location);
            await Student.findByIdAndUpdate(req.user._id, {
                liveJobResults: mockJobs.slice(0, 20),
                lastJobSearchAt: new Date(),
            });
            return res.json({
                success: true,
                count: mockJobs.length,
                jobs: mockJobs,
                isStale: false,
                searchedAt: new Date().toISOString(),
                isMock: true,
            });
        }

        const isStale = student.lastJobSearchAt
            ? Date.now() - new Date(student.lastJobSearchAt).getTime() > 24 * 60 * 60 * 1000
            : true;

        res.json({
            success: true,
            count: jobs.length,
            jobs,
            isStale,
            searchedAt: student.lastJobSearchAt,
            isMock: jobs[0]?.sourcePlatform === 'mock',
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── POST /api/agent/skill-gap ────────────────────────────────────────────────
exports.getSkillGap = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const studentProfile = {
            skills: student.skills || [],
            suggestedRoles: student.suggestedRoles || [],
            gapDuration: student.gapDuration || 0,
            degree: student.degree || '',
        };

        const liveJobs = student.liveJobResults || [];

        const skillGapData = await analyzeSkillGap(studentProfile, liveJobs);

        res.json({
            success: true,
            data: skillGapData,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/agent/roadmap ───────────────────────────────────────────────────
exports.getLearningRoadmap = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const { findMissingSkills } = require('../services/skillGapService');
        const missingSkills = findMissingSkills(student.skills || [], student.liveJobResults || []);

        const studentProfile = {
            skills: student.skills || [],
            suggestedRoles: student.suggestedRoles || [],
            gapDuration: student.gapDuration || 0,
        };

        const { roadmap } = await generateLearningRoadmap(missingSkills, studentProfile);

        res.json({
            success: true,
            roadmap,
            missingSkills: missingSkills.slice(0, 10),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/agent/status ────────────────────────────────────────────────────
exports.getAgentStatus = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id).select('liveJobResults lastJobSearchAt resumeURL skills');
        const hasResume = !!student?.resumeURL;
        const hasJobs = (student?.liveJobResults?.length || 0) > 0;
        const lastRun = student?.lastJobSearchAt || null;

        res.json({
            success: true,
            status: {
                hasResume,
                hasJobs,
                jobCount: student?.liveJobResults?.length || 0,
                lastRun,
                isStale: lastRun
                    ? Date.now() - new Date(lastRun).getTime() > 24 * 60 * 60 * 1000
                    : true,
                skillsCount: student?.skills?.length || 0,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

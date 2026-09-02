/**
 * AI Career Agent Controller
 * Handles all agent-related API endpoints:
 * - POST /api/agent/search-jobs  — trigger live job search
 * - GET  /api/agent/results      — get job results (auto-searches if stale/empty)
 * - POST /api/agent/skill-gap    — run skill gap analysis
 * - GET  /api/agent/roadmap      — get learning roadmap
 */

const Student = require('../models/Student');
const { runJobSearchAgent, generatePlatformDeepLinkCards, computeMatchScore } = require('../services/jobSearchAgent');
const { analyzeSkillGap, generateLearningRoadmap } = require('../services/skillGapService');

// ─── Helper: build student profile object ─────────────────────────────────────
const buildStudentProfile = (student) => ({
    skills: student.skills || [],
    suggestedRoles: student.suggestedRoles || [],
    location: student.location || 'India',
    gapDuration: student.gapDuration || 0,
    degree: student.degree || '',
    resumeAnalysis: student.resumeAnalysis || null,
});

// ─── Helper: check if cached jobs are outdated (no deeplink platforms) ─────────
const cacheNeedsRefresh = (jobs) => {
    if (!jobs || jobs.length === 0) return true;

    // If cache is older than 6 hours, refresh
    // (this is checked via lastJobSearchAt in the controller)

    // If no deeplink platform cards exist, refresh to add them
    const hasDeepLinks = jobs.some(j => j.sourcePlatform === 'deeplink');
    if (!hasDeepLinks) return true;

    // If stale homepage mock URLs exist, refresh
    const hasStaleUrls = jobs.some(j =>
        j.sourcePlatform === 'mock' &&
        j.applyLink &&
        !j.applyLink.includes('?') &&
        !j.applyLink.includes('/jobs/') &&
        !j.applyLink.includes('/search/')
    );
    if (hasStaleUrls) return true;

    return false;
};

// ─── POST /api/agent/search-jobs ──────────────────────────────────────────────
exports.searchJobs = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        if (!student.resumeURL) {
            return res.status(400).json({ success: false, message: 'Please upload a resume first' });
        }

        const studentProfile = buildStudentProfile(student);

        console.log(`🔍 Triggering multi-platform job search for student ${req.user._id}`);

        // Run the multi-platform live job search agent
        const liveJobs = await runJobSearchAgent(studentProfile);

        // Cache results in student document (store up to 50)
        await Student.findByIdAndUpdate(req.user._id, {
            liveJobResults: liveJobs.slice(0, 50),
            lastJobSearchAt: new Date(),
        });

        const liveCount = liveJobs.filter(j => j.isLive).length;
        console.log(`✅ Cached ${liveJobs.length} jobs (${liveCount} live) for student ${req.user._id}`);

        res.json({
            success: true,
            count: liveJobs.length,
            jobs: liveJobs,
            searchedAt: new Date().toISOString(),
            isMock: liveCount === 0,
        });
    } catch (err) {
        console.error('Agent searchJobs error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/agent/results ───────────────────────────────────────────────────
// Auto-triggers fresh search if cache is stale or missing deeplink cards
exports.getJobResults = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id)
            .select('liveJobResults lastJobSearchAt resumeURL skills suggestedRoles location gapDuration resumeAnalysis');

        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        if (!student.resumeURL) {
            return res.json({
                success: true,
                count: 0,
                jobs: [],
                isStale: false,
                searchedAt: null,
                isMock: false
            });
        }

        let jobs = student.liveJobResults || [];

        const cacheAge = student.lastJobSearchAt
            ? Date.now() - new Date(student.lastJobSearchAt).getTime()
            : Infinity;
        const cacheAgeHours = cacheAge / (1000 * 60 * 60);
        const isStaleByTime = cacheAgeHours > 6;

        // Auto-trigger fresh search if:
        // 1. No cached results at all
        // 2. Cache has no deeplink platform cards (old format)
        // 3. Cache is older than 6 hours
        if (cacheNeedsRefresh(jobs) || isStaleByTime) {
            console.log(`🔄 Auto-refreshing job cache (age: ${cacheAgeHours.toFixed(1)}h, needsRefresh: ${cacheNeedsRefresh(jobs)})`);
            try {
                const studentProfile = buildStudentProfile(student);
                const freshJobs = await runJobSearchAgent(studentProfile);

                await Student.findByIdAndUpdate(req.user._id, {
                    liveJobResults: freshJobs.slice(0, 50),
                    lastJobSearchAt: new Date(),
                });

                const liveCount = freshJobs.filter(j => j.isLive).length;
                console.log(`✅ Auto-refresh complete: ${freshJobs.length} jobs (${liveCount} live)`);

                return res.json({
                    success: true,
                    count: freshJobs.length,
                    jobs: freshJobs,
                    isStale: false,
                    searchedAt: new Date().toISOString(),
                    isMock: liveCount === 0,
                });
            } catch (refreshErr) {
                console.error('Auto-refresh failed, falling back to cache:', refreshErr.message);
                // Fall through to serve whatever is in cache
            }
        }

        // ── Recompute matchScore for any job stuck at 0% ──────────────────────
        if (student.skills?.length > 0) {
            jobs = jobs.map(j => {
                if (j.matchScore === 0 || j.matchScore == null) {
                    try {
                        const { score, matchedSkills } = computeMatchScore(
                            student.skills,
                            j.requiredSkills || [],
                            j.title,
                            j.description,
                            student.suggestedRoles
                        );
                        return { ...j.toObject?.() ?? j, matchScore: score, matchedSkills };
                    } catch { return j; }
                }
                return j;
            });
        }

        // ── Always inject deeplink platform cards if not present ───────────────
        const hasDeepLinks = jobs.some(j => j.sourcePlatform === 'deeplink');
        if (!hasDeepLinks && student.skills?.length > 0) {
            const studentProfile = buildStudentProfile(student);
            const deepLinkCards = generatePlatformDeepLinkCards(studentProfile);
            jobs = [...jobs, ...deepLinkCards];
            console.log(`🔗 Injected ${deepLinkCards.length} platform deep-link cards into cached results`);
        }

        const liveCount = jobs.filter(j => j.isLive).length;

        res.json({
            success: true,
            count: jobs.length,
            jobs,
            isStale: isStaleByTime,
            searchedAt: student.lastJobSearchAt,
            isMock: liveCount === 0,
        });
    } catch (err) {
        console.error('getJobResults error:', err.message);
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

        res.json({ success: true, data: skillGapData });
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
        const student = await Student.findById(req.user._id)
            .select('liveJobResults lastJobSearchAt resumeURL skills');

        const hasResume = !!student?.resumeURL;
        const hasJobs = (student?.liveJobResults?.length || 0) > 0;
        const lastRun = student?.lastJobSearchAt || null;
        const liveJobs = (student?.liveJobResults || []).filter(j => j.isLive);

        res.json({
            success: true,
            status: {
                hasResume,
                hasJobs,
                jobCount: student?.liveJobResults?.length || 0,
                liveJobCount: liveJobs.length,
                lastRun,
                isStale: lastRun
                    ? Date.now() - new Date(lastRun).getTime() > 6 * 60 * 60 * 1000
                    : true,
                skillsCount: student?.skills?.length || 0,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

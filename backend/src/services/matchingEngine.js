/**
 * AI Matching Engine
 * Matches students with gap-friendly job postings using skill similarity scoring
 */

/**
 * Calculate skill match percentage using Jaccard similarity
 * @param {string[]} studentSkills - Student's skills array
 * @param {string[]} requiredSkills - Job's required skills
 * @returns {number} Match percentage 0-100
 */
const calculateSkillMatch = (studentSkills, requiredSkills) => {
    if (!requiredSkills.length) return 100;
    if (!studentSkills.length) return 0;

    const normalize = (arr) => arr.map(s => s.toLowerCase().trim());
    const sSet = new Set(normalize(studentSkills));
    const rArr = normalize(requiredSkills);

    let matched = 0;
    const partialThreshold = 0.7;

    for (const req of rArr) {
        // Exact match
        if (sSet.has(req)) {
            matched++;
            continue;
        }
        // Partial match (substring check)
        for (const skill of sSet) {
            if (skill.includes(req) || req.includes(skill)) {
                if (req.length / skill.length >= partialThreshold || skill.length / req.length >= partialThreshold) {
                    matched += 0.7;
                    break;
                }
            }
        }
    }

    return Math.min(Math.round((matched / rArr.length) * 100), 100);
};

/**
 * Calculate overall match score combining skill match, gap compliance
 * @param {object} student - Student document
 * @param {object} job - Job document
 * @returns {object} { isMatch, matchScore, skillMatchPercentage, gapCompliant }
 */
const calculateMatchScore = (student, job) => {
    const skillMatch = calculateSkillMatch(student.skills, job.requiredSkills);
    const gapCompliant = job.acceptGap && (student.gapDuration <= job.maxGapAllowed);

    // Weighted scoring:
    // - Skill match: 60%
    // - Gap compliance: 30%
    // - Resume score bonus: 10%
    const resumeBonus = Math.min((student.resumeScore || 0) / 10, 10);
    const gapScore = gapCompliant ? 30 : 0;
    const matchScore = Math.round(skillMatch * 0.6 + gapScore + resumeBonus);

    const isMatch = gapCompliant && skillMatch >= 30; // minimum 30% skill match

    return {
        isMatch,
        matchScore,
        skillMatchPercentage: skillMatch,
        gapCompliant,
        details: {
            skillMatchPercentage: skillMatch,
            gapDurationOk: student.gapDuration <= job.maxGapAllowed,
            companyAcceptsGap: job.acceptGap
        }
    };
};

/**
 * Get all matching jobs for a student
 * @param {object} student - Student document
 * @param {Array} jobs - All active jobs
 * @returns {Array} Sorted array of matched jobs with scores
 */
const getMatchedJobs = (student, jobs) => {
    const results = [];

    for (const job of jobs) {
        if (!job.isActive) continue;
        if (!job.acceptGap) continue; // Only show gap-friendly jobs

        const { isMatch, matchScore, skillMatchPercentage, gapCompliant, details } = calculateMatchScore(student, job);

        if (isMatch) {
            results.push({
                job,
                matchScore,
                skillMatchPercentage,
                gapCompliant,
                details
            });
        }
    }

    // Sort by match score descending
    return results.sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = { calculateSkillMatch, calculateMatchScore, getMatchedJobs };

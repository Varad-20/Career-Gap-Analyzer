/**
 * Skill Gap Analysis Service
 * Compares student skills against market job requirements
 * and generates a personalized learning roadmap.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
let genAI = null;
if (hasGeminiKey) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// ─── Curated learning resources database ─────────────────────────────────────
const LEARNING_RESOURCES = {
    'React': {
        courses: [
            { name: 'React - The Complete Guide', platform: 'Udemy', url: 'https://udemy.com/course/react-the-complete-guide-incl-redux/', free: false, duration: '48h' },
            { name: 'React Official Tutorial', platform: 'React.dev', url: 'https://react.dev/learn', free: true, duration: '10h' },
        ],
        certifications: [],
        projects: ['Build a Todo App with React Hooks', 'Create a Weather Dashboard using OpenWeather API'],
    },
    'TypeScript': {
        courses: [
            { name: 'TypeScript for Beginners', platform: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=BwuLxPH8IDs', free: true, duration: '5h' },
            { name: 'Understanding TypeScript', platform: 'Udemy', url: 'https://udemy.com/course/understanding-typescript/', free: false, duration: '22h' },
        ],
        certifications: [],
        projects: ['Convert a JS project to TypeScript', 'Build a typed REST API client'],
    },
    'Node.js': {
        courses: [
            { name: 'Node.js Full Course', platform: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=f2EqECiTBL8', free: true, duration: '8h' },
            { name: 'The Complete Node.js Developer', platform: 'Udemy', url: 'https://udemy.com/course/the-complete-nodejs-developer-course-2/', free: false, duration: '35h' },
        ],
        certifications: [],
        projects: ['Build a REST API with Express', 'Create a real-time chat app with Socket.io'],
    },
    'Python': {
        courses: [
            { name: 'Python for Everybody', platform: 'Coursera', url: 'https://coursera.org/specializations/python', free: true, duration: '16h' },
            { name: '100 Days of Code: Python', platform: 'Udemy', url: 'https://udemy.com/course/100-days-of-code/', free: false, duration: '60h' },
        ],
        certifications: [
            { name: 'PCEP – Certified Entry-Level Python Programmer', org: 'Python Institute', url: 'https://pythoninstitute.org/pcep' },
        ],
        projects: ['Build a web scraper', 'Create a data visualization dashboard with Matplotlib'],
    },
    'Machine Learning': {
        courses: [
            { name: 'Machine Learning Specialization', platform: 'Coursera', url: 'https://coursera.org/specializations/machine-learning-introduction', free: true, duration: '54h' },
            { name: 'fast.ai Practical Deep Learning', platform: 'fast.ai', url: 'https://course.fast.ai/', free: true, duration: '30h' },
        ],
        certifications: [
            { name: 'TensorFlow Developer Certificate', org: 'Google', url: 'https://tensorflow.org/certificate' },
            { name: 'AWS Certified ML – Specialty', org: 'AWS', url: 'https://aws.amazon.com/certification/certified-machine-learning-specialty/' },
        ],
        projects: ['Build a sentiment analysis model', 'Train an image classifier with transfer learning'],
    },
    'SQL': {
        courses: [
            { name: 'SQL for Data Analysis', platform: 'Udacity', url: 'https://udacity.com/course/sql-for-data-analysis--ud198', free: true, duration: '10h' },
            { name: 'MySQL Bootcamp', platform: 'Udemy', url: 'https://udemy.com/course/the-ultimate-mysql-bootcamp-go-from-sql-beginner-to-expert/', free: false, duration: '20h' },
        ],
        certifications: [
            { name: 'Oracle Database SQL Certified Associate', org: 'Oracle', url: 'https://education.oracle.com' },
        ],
        projects: ['Design a normalized database schema', 'Build analytics queries on a public dataset'],
    },
    'Docker': {
        courses: [
            { name: 'Docker for Beginners', platform: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', free: true, duration: '4h' },
            { name: 'Docker & Kubernetes: The Practical Guide', platform: 'Udemy', url: 'https://udemy.com/course/docker-kubernetes-the-practical-guide/', free: false, duration: '23h' },
        ],
        certifications: [
            { name: 'Docker Certified Associate', org: 'Docker', url: 'https://www.docker.com/certification/' },
        ],
        projects: ['Containerize a Node.js app', 'Set up a docker-compose multi-service app'],
    },
    'AWS': {
        courses: [
            { name: 'AWS Cloud Practitioner Essentials', platform: 'AWS', url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/', free: true, duration: '6h' },
            { name: 'Ultimate AWS Certified Developer', platform: 'Udemy', url: 'https://udemy.com/course/aws-certified-developer-associate-dva-c01/', free: false, duration: '32h' },
        ],
        certifications: [
            { name: 'AWS Certified Cloud Practitioner', org: 'AWS', url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/' },
            { name: 'AWS Certified Developer – Associate', org: 'AWS', url: 'https://aws.amazon.com/certification/certified-developer-associate/' },
        ],
        projects: ['Deploy a serverless app with Lambda + API Gateway', 'Set up a CI/CD pipeline with CodePipeline'],
    },
    'default': {
        courses: [
            { name: 'CS50: Introduction to Computer Science', platform: 'edX', url: 'https://edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science', free: true, duration: '12h' },
            { name: 'The Odin Project', platform: 'The Odin Project', url: 'https://theodinproject.com/', free: true, duration: 'Self-paced' },
        ],
        certifications: [],
        projects: ['Build a CRUD application', 'Create a personal portfolio website'],
    },
};

/**
 * Get learning resources for a skill
 */
const getResourcesForSkill = (skill) => {
    const normalizedSkill = skill.trim();
    // Try exact match first
    if (LEARNING_RESOURCES[normalizedSkill]) return LEARNING_RESOURCES[normalizedSkill];
    // Try case-insensitive match
    const key = Object.keys(LEARNING_RESOURCES).find(
        k => k.toLowerCase() === normalizedSkill.toLowerCase()
    );
    if (key) return LEARNING_RESOURCES[key];
    // Check partial matches
    const partialKey = Object.keys(LEARNING_RESOURCES).find(
        k => normalizedSkill.toLowerCase().includes(k.toLowerCase()) ||
            k.toLowerCase().includes(normalizedSkill.toLowerCase())
    );
    if (partialKey) return LEARNING_RESOURCES[partialKey];
    return LEARNING_RESOURCES['default'];
};

/**
 * Calculate which skills are missing compared to market jobs
 */
const findMissingSkills = (studentSkills, liveJobs) => {
    const studentSkillsLower = new Set(
        (studentSkills || []).map(s => s.toLowerCase().trim())
    );

    // Count how often each skill appears across all jobs
    const skillFrequency = {};
    for (const job of liveJobs) {
        for (const skill of (job.requiredSkills || [])) {
            const s = skill.toLowerCase().trim();
            skillFrequency[s] = (skillFrequency[s] || 0) + 1;
        }
    }

    // Also add skills from mock common job market
    const marketSkills = [
        'React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'AWS',
        'Docker', 'Git', 'REST APIs', 'MongoDB', 'PostgreSQL',
        'Machine Learning', 'Data Analysis', 'System Design',
        'Communication', 'Agile', 'CI/CD',
    ];

    marketSkills.forEach(s => {
        skillFrequency[s.toLowerCase()] = (skillFrequency[s.toLowerCase()] || 0) + 0.5;
    });

    // Find missing skills (in market but not in student's profile)
    const missing = [];
    for (const [skill, freq] of Object.entries(skillFrequency)) {
        const isPresent = [...studentSkillsLower].some(
            ss => ss.includes(skill) || skill.includes(ss)
        );
        if (!isPresent && freq >= 0.5) {
            missing.push({ skill, frequency: freq });
        }
    }

    // Sort by frequency (most common market skill first)
    return missing
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 12)
        .map(m => m.skill);
};

/**
 * Generate learning roadmap using Gemini AI or curated fallback
 */
const generateLearningRoadmap = async (missingSkills, studentProfile) => {
    const { skills: existingSkills = [], suggestedRoles = [], gapDuration = 0 } = studentProfile;

    // Try Gemini for personalized roadmap
    if (hasGeminiKey && genAI && missingSkills.length > 0) {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `
You are a career counselor helping a candidate with a ${gapDuration}-month career gap.
Their existing skills: ${existingSkills.slice(0, 8).join(', ')}
Their target roles: ${suggestedRoles.join(', ')}
Missing skills they need to learn: ${missingSkills.slice(0, 8).join(', ')}

Create a prioritized 3-phase learning roadmap. Return ONLY valid JSON (no markdown):
{
  "phase1": {
    "title": "Foundation (Weeks 1-4)",
    "skills": ["skill1", "skill2"],
    "description": "What to focus on first and why"
  },
  "phase2": {
    "title": "Core Skills (Weeks 5-10)",
    "skills": ["skill3", "skill4"],
    "description": "Building on foundations"
  },
  "phase3": {
    "title": "Advanced & Portfolio (Weeks 11-16)",
    "skills": ["skill5"],
    "description": "Projects and specialization"
  },
  "weeklyGoal": "How many hours per week to invest",
  "totalDuration": "Estimated total time",
  "motivation": "One sentence of encouragement"
}`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const roadmap = JSON.parse(text);
            return { success: true, roadmap, aiGenerated: true };
        } catch (e) {
            console.warn('Gemini roadmap generation error:', e.message);
        }
    }

    // Fallback: rule-based roadmap
    const phase1Skills = missingSkills.slice(0, 3);
    const phase2Skills = missingSkills.slice(3, 6);
    const phase3Skills = missingSkills.slice(6, 9);

    return {
        success: true,
        aiGenerated: false,
        roadmap: {
            phase1: {
                title: 'Foundation (Weeks 1-4)',
                skills: phase1Skills,
                description: `Start with the highest-demand skills: ${phase1Skills.join(', ')}. These appear most frequently in job listings for your target roles.`,
            },
            phase2: {
                title: 'Core Skills (Weeks 5-10)',
                skills: phase2Skills.length ? phase2Skills : ['Portfolio Projects', 'System Design'],
                description: 'Build on your foundation and apply skills in real projects. Start contributing to open-source or personal projects.',
            },
            phase3: {
                title: 'Advanced & Portfolio (Weeks 11-16)',
                skills: phase3Skills.length ? phase3Skills : ['Interview Preparation', 'Technical Communication'],
                description: 'Specialize in your chosen role, complete 2-3 portfolio projects, and prepare for technical interviews.',
            },
            weeklyGoal: '15-20 hours/week',
            totalDuration: '4 months',
            motivation: 'Your career gap is not a setback — it\'s a chapter in your story. Every expert was once a beginner.',
        },
    };
};

/**
 * Main: Full Skill Gap Analysis
 */
const analyzeSkillGap = async (studentProfile, liveJobs = []) => {
    const { skills: studentSkills = [] } = studentProfile;

    // Find missing skills
    const missingSkills = findMissingSkills(studentSkills, liveJobs);

    // Get resources for each missing skill
    const skillGapItems = missingSkills.slice(0, 10).map(skill => {
        const resources = getResourcesForSkill(skill);
        return {
            skill,
            resources,
            priority: 'high',
        };
    });

    // Generate learning roadmap
    const { roadmap } = await generateLearningRoadmap(missingSkills, studentProfile);

    // Market skill presence
    const topMarketSkills = [
        { skill: 'React', demand: 92 },
        { skill: 'Node.js', demand: 87 },
        { skill: 'Python', demand: 85 },
        { skill: 'TypeScript', demand: 80 },
        { skill: 'AWS', demand: 75 },
        { skill: 'Docker', demand: 72 },
        { skill: 'SQL', demand: 88 },
        { skill: 'Git', demand: 95 },
        { skill: 'REST APIs', demand: 90 },
        { skill: 'System Design', demand: 78 },
    ];

    const studentSkillsLower = new Set(studentSkills.map(s => s.toLowerCase().trim()));
    const marketSkillsWithStatus = topMarketSkills.map(ms => ({
        ...ms,
        have: [...studentSkillsLower].some(
            ss => ss.includes(ms.skill.toLowerCase()) || ms.skill.toLowerCase().includes(ss)
        ),
    }));

    return {
        studentSkills,
        missingSkills: missingSkills.slice(0, 10),
        skillGapItems,
        roadmap,
        marketSkillsWithStatus,
        summary: {
            total: topMarketSkills.length,
            have: marketSkillsWithStatus.filter(s => s.have).length,
            missing: marketSkillsWithStatus.filter(s => !s.have).length,
            readinessScore: Math.round(
                (marketSkillsWithStatus.filter(s => s.have).length / topMarketSkills.length) * 100
            ),
        },
    };
};

module.exports = { analyzeSkillGap, findMissingSkills, generateLearningRoadmap, getResourcesForSkill };

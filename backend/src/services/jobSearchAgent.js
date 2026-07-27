/**
 * AI Career Job Search Agent
 * Searches live jobs from internet using JSearch (RapidAPI) or Adzuna API.
 * Falls back to intelligent mock data if no API key is configured.
 */

const https = require('https');

const JSEARCH_KEY = process.env.JSEARCH_API_KEY;
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

// ─── JSearch via RapidAPI ─────────────────────────────────────────────────────
const searchJSearch = (query, location = 'India', page = 1) => {
    return new Promise((resolve) => {
        const params = new URLSearchParams({
            query: `${query} jobs`,
            page: String(page),
            num_pages: '1',
            date_posted: 'month',
            remote_jobs_only: location.toLowerCase() === 'remote' ? 'true' : 'false',
            employment_types: 'FULLTIME,PARTTIME,CONTRACTOR,INTERN',
            country: 'in',
        });

        const options = {
            method: 'GET',
            hostname: 'jsearch.p.rapidapi.com',
            path: `/search?${params.toString()}`,
            headers: {
                'x-rapidapi-key': JSEARCH_KEY,
                'x-rapidapi-host': 'jsearch.p.rapidapi.com',
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed.data || []);
                } catch {
                    resolve([]);
                }
            });
        });

        req.on('error', () => resolve([]));
        req.setTimeout(8000, () => { req.destroy(); resolve([]); });
        req.end();
    });
};

// ─── Adzuna API ───────────────────────────────────────────────────────────────
const searchAdzuna = (query, location = 'india', page = 1) => {
    return new Promise((resolve) => {
        const params = new URLSearchParams({
            app_id: ADZUNA_APP_ID,
            app_key: ADZUNA_APP_KEY,
            results_per_page: '10',
            what: query,
            where: location === 'remote' ? '' : location,
            sort_by: 'relevance',
            full_time: '1',
        });

        const options = {
            method: 'GET',
            hostname: 'api.adzuna.com',
            path: `/v1/api/jobs/in/search/${page}?${params.toString()}`,
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed.results || []);
                } catch {
                    resolve([]);
                }
            });
        });

        req.on('error', () => resolve([]));
        req.setTimeout(8000, () => { req.destroy(); resolve([]); });
        req.end();
    });
};

// ─── Normalize JSearch result ─────────────────────────────────────────────────
const normalizeJSearchJob = (job) => ({
    id: job.job_id || `jsearch_${Date.now()}_${Math.random()}`,
    title: job.job_title || 'Software Engineer',
    company: job.employer_name || 'Company',
    location: job.job_city
        ? `${job.job_city}, ${job.job_country}`
        : (job.job_country || 'India'),
    isRemote: job.job_is_remote || false,
    workType: job.job_is_remote ? 'Remote' : (job.job_employment_type === 'FULLTIME' ? 'Full-time' : job.job_employment_type || 'Full-time'),
    description: job.job_description
        ? job.job_description.substring(0, 400) + '...'
        : 'Exciting opportunity to join a growing team.',
    applyLink: job.job_apply_link || job.job_google_link || '#',
    source: 'LinkedIn / Indeed',
    sourcePlatform: 'jsearch',
    postedAt: job.job_posted_at_datetime_utc || new Date().toISOString(),
    requiredSkills: job.job_required_skills || [],
    experienceLevel: job.job_experience_in_place_of_education ? 'Mid-Senior' : (job.job_experience_required || 'Any'),
    salaryMin: job.job_min_salary || null,
    salaryMax: job.job_max_salary || null,
    salaryCurrency: job.job_salary_currency || 'INR',
    logo: job.employer_logo || null,
    gapFriendly: true,
    matchScore: 0,
});

// ─── Normalize Adzuna result ──────────────────────────────────────────────────
const normalizeAdzunaJob = (job) => ({
    id: job.id || `adzuna_${Date.now()}_${Math.random()}`,
    title: job.title || 'Software Engineer',
    company: job.company?.display_name || 'Company',
    location: job.location?.display_name || 'India',
    isRemote: job.title?.toLowerCase().includes('remote') || false,
    workType: 'Full-time',
    description: job.description
        ? job.description.substring(0, 400) + '...'
        : 'Join our growing team and make an impact.',
    applyLink: job.redirect_url || '#',
    source: 'Adzuna',
    sourcePlatform: 'adzuna',
    postedAt: job.created || new Date().toISOString(),
    requiredSkills: [],
    experienceLevel: 'Any',
    salaryMin: job.salary_min || null,
    salaryMax: job.salary_max || null,
    salaryCurrency: 'INR',
    logo: null,
    gapFriendly: true,
    matchScore: 0,
});

// ─── Deep-link URL builder per platform ───────────────────────────────────────
// Generates a direct search-results URL so users land on matching jobs,
// NOT just on the platform homepage.
const buildApplyLink = (platform, jobTitle, jobLocation) => {
    const titleEnc = encodeURIComponent(jobTitle);
    const locEnc = encodeURIComponent(jobLocation || 'India');
    // slug-friendly version for Naukri / Internshala path segments
    const titleSlug = jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const locSlug = (jobLocation || 'india').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    switch (platform) {
        case 'LinkedIn':
            // Opens LinkedIn Jobs filtered by keyword + location + last 30 days
            return `https://www.linkedin.com/jobs/search/?keywords=${titleEnc}&location=${locEnc}&f_TPR=r2592000&sortBy=R`;

        case 'Indeed':
            // Opens Indeed India filtered by role + city
            return `https://in.indeed.com/jobs?q=${titleEnc}&l=${locEnc}&fromage=30&sort=relevance`;

        case 'Naukri':
            // Naukri SEO-friendly job listing page for that role+city
            return `https://www.naukri.com/${titleSlug}-jobs-in-${locSlug}?src=jobsearchDesk&areaTypeID=1&noOfResults=20`;

        case 'Wellfound':
            // Wellfound (AngelList) startup jobs search
            return `https://wellfound.com/jobs?q=${titleEnc}&l=${locEnc}`;

        case 'Internshala':
            // Internshala jobs search results page
            return `https://internshala.com/jobs/${titleSlug}-jobs-in-${locSlug}/`;

        case 'Glassdoor':
            // Glassdoor India search
            return `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${titleEnc}&locT=N&locId=115&sortBy=relevance`;

        default:
            return `https://www.linkedin.com/jobs/search/?keywords=${titleEnc}&location=${locEnc}`;
    }
};

// ─── Mock Data Generator (fallback) ──────────────────────────────────────────
const generateMockJobs = (skills = [], suggestedRoles = [], location = 'India') => {
    const cities = ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Remote'];

    const jobTemplates = [
        {
            title: 'Frontend Developer',
            company: 'TechVision Solutions',
            skills: ['React', 'TypeScript', 'CSS', 'HTML'],
            desc: 'Build modern, responsive web interfaces. Career gaps welcome. We evaluate candidates on skills and portfolio.',
            salary: '₹6L – ₹14L/yr',
            logo: '🔵',
            source: 'LinkedIn',
        },
        {
            title: 'Backend Developer',
            company: 'CloudStack India',
            skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
            desc: 'Join our backend team to build scalable microservices. We actively hire returners and career changers.',
            salary: '₹8L – ₹18L/yr',
            logo: '🟢',
            source: 'Naukri',
        },
        {
            title: 'Full Stack Engineer',
            company: 'Startup Hub Ventures',
            skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
            desc: 'End-to-end product development. Flexible hours, remote-friendly. We value skill over continuous employment history.',
            salary: '₹10L – ₹22L/yr',
            logo: '🟡',
            source: 'Wellfound',
        },
        {
            title: 'Data Scientist',
            company: 'Analytics Prime',
            skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
            desc: 'Work on real ML projects with impact. Career gaps understood — tell us what you built during your break.',
            salary: '₹12L – ₹28L/yr',
            logo: '🔴',
            source: 'Indeed',
        },
        {
            title: 'React Native Developer',
            company: 'MobileFirst Technologies',
            skills: ['React Native', 'JavaScript', 'iOS', 'Android'],
            desc: 'Build cross-platform mobile apps. 100% remote. We love candidates who kept building things during gaps.',
            salary: '₹9L – ₹20L/yr',
            logo: '🟣',
            source: 'LinkedIn',
        },
        {
            title: 'Python Developer',
            company: 'DataSync Corp',
            skills: ['Python', 'Django', 'FastAPI', 'SQL'],
            desc: 'Develop data pipelines and APIs for enterprise clients. Gap-friendly hiring policy.',
            salary: '₹8L – ₹16L/yr',
            logo: '🔵',
            source: 'Naukri',
        },
        {
            title: 'DevOps Engineer',
            company: 'InfraCloud Solutions',
            skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
            desc: 'Manage cloud infrastructure and deployments. Return-to-work program available.',
            salary: '₹14L – ₹30L/yr',
            logo: '🟠',
            source: 'Indeed',
        },
        {
            title: 'Software Engineer',
            company: 'GrowthTech Startup',
            skills: ['Java', 'Spring Boot', 'MySQL', 'REST APIs'],
            desc: 'Join a fast-growing fintech startup. We care about what you can do, not when you last worked.',
            salary: '₹7L – ₹15L/yr',
            logo: '🟢',
            source: 'Internshala',
        },
        {
            title: 'UI UX Designer',
            company: 'DesignHub Co.',
            skills: ['Figma', 'React', 'CSS', 'User Research'],
            desc: 'Design and implement beautiful user experiences. Freelancers and career returners welcome.',
            salary: '₹6L – ₹14L/yr',
            logo: '🔴',
            source: 'Wellfound',
        },
        {
            title: 'Machine Learning Engineer',
            company: 'AI Frontier Labs',
            skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP'],
            desc: 'Research and deploy ML models. We actively recruit candidates returning after caregiving or health breaks.',
            salary: '₹15L – ₹35L/yr',
            logo: '🟡',
            source: 'LinkedIn',
        },
    ];

    const normSkills = (skills || []).map(s => s.toLowerCase().trim());
    const normRoles = (suggestedRoles || []).map(r => r.toLowerCase().trim());

    return jobTemplates.map((t, i) => {
        const jobCity = location === 'Remote' ? 'Remote' : cities[i % 7];
        const templateSkillsLower = t.skills.map(s => s.toLowerCase());

        const matchedSkills = normSkills.filter(s =>
            templateSkillsLower.some(ts => ts.includes(s) || s.includes(ts))
        );
        const roleMatch = normRoles.some(r =>
            t.title.toLowerCase().includes(r.split(' ')[0]) ||
            r.includes(t.title.toLowerCase().split(' ')[0])
        );

        const skillScore = templateSkillsLower.length
            ? Math.round((matchedSkills.length / templateSkillsLower.length) * 60)
            : 30;
        const roleScore = roleMatch ? 25 : 10;
        const matchScore = Math.min(skillScore + roleScore + 15, 98);

        // Build a deep-link search URL so "Apply Now" takes user directly
        // to the matching job listings for this title on the right platform
        const searchCity = jobCity === 'Remote' ? 'India' : jobCity;
        const applyLink = buildApplyLink(t.source, t.title, searchCity);

        return {
            id: `mock_${i}_${Date.now()}`,
            title: t.title,
            company: t.company,
            location: jobCity,
            isRemote: jobCity === 'Remote' || i % 4 === 0,
            workType: i % 5 === 0 ? 'Remote' : i % 3 === 0 ? 'Hybrid' : 'Full-time',
            description: t.desc,
            applyLink,
            source: t.source,
            sourcePlatform: 'mock',
            postedAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
            requiredSkills: t.skills,
            experienceLevel: i < 3 ? 'Entry Level' : i < 7 ? 'Mid Level' : 'Senior',
            salaryDisplay: t.salary,
            salaryMin: null,
            salaryMax: null,
            salaryCurrency: 'INR',
            logo: t.logo,
            gapFriendly: true,
            matchScore,
            matchedSkills,
        };
    }).sort((a, b) => b.matchScore - a.matchScore);
};

// ─── Build smart search queries from student profile ──────────────────────────
const buildSearchQueries = (studentProfile) => {
    const { skills = [], suggestedRoles = [] } = studentProfile;

    const queries = [];

    // Primary: suggested roles (most targeted)
    suggestedRoles.slice(0, 3).forEach(role => {
        queries.push(role);
    });

    // Secondary: top skills combo
    if (skills.length >= 2) {
        queries.push(skills.slice(0, 3).join(' ') + ' developer');
    }

    // Fallback
    if (queries.length === 0) {
        queries.push('software engineer', 'developer', 'analyst');
    }

    return [...new Set(queries)].slice(0, 4);
};

// ─── Main: Run AI Job Search Agent ───────────────────────────────────────────
const runJobSearchAgent = async (studentProfile) => {
    const { skills, suggestedRoles, location } = studentProfile;
    const searchLocation = location || 'India';
    const queries = buildSearchQueries(studentProfile);

    console.log(`🤖 AI Agent: Searching jobs for queries: [${queries.join(', ')}]`);

    let allJobs = [];

    // Try JSearch first (best coverage — LinkedIn, Indeed, Glassdoor)
    if (JSEARCH_KEY && JSEARCH_KEY !== 'your_jsearch_key_here' && JSEARCH_KEY !== 'your_jsearch_rapidapi_key_here') {
        for (const q of queries.slice(0, 2)) {
            try {
                const results = await searchJSearch(q, searchLocation);
                const normalized = results.map(normalizeJSearchJob);
                allJobs.push(...normalized);
            } catch (e) {
                console.warn('JSearch error:', e.message);
            }
        }
    }

    // Try Adzuna if JSearch didn't yield results
    if (allJobs.length < 5 && ADZUNA_APP_ID && ADZUNA_APP_ID !== 'your_adzuna_app_id' && ADZUNA_APP_ID !== 'your_adzuna_app_id_here') {
        for (const q of queries.slice(0, 2)) {
            try {
                const results = await searchAdzuna(q, searchLocation);
                const normalized = results.map(normalizeAdzunaJob);
                allJobs.push(...normalized);
            } catch (e) {
                console.warn('Adzuna error:', e.message);
            }
        }
    }

    // Always fall back to mock if no real results
    if (allJobs.length < 3) {
        console.log('🔄 Using intelligent mock job data (configure JSEARCH_API_KEY for live results)');
        allJobs = generateMockJobs(skills, suggestedRoles, searchLocation);
    }

    // Deduplicate by title+company
    const seen = new Set();
    const unique = allJobs.filter(j => {
        const key = `${j.title}__${j.company}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Sort by matchScore descending
    const sorted = unique.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`✅ AI Agent: Found ${sorted.length} jobs`);
    return sorted;
};

module.exports = { runJobSearchAgent, buildSearchQueries, generateMockJobs };

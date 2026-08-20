/**
 * AI Career Job Search Agent — Multi-Platform Edition
 * Sources: JSearch (LinkedIn/Indeed/Glassdoor), Adzuna, RemoteOK (free),
 *          + smart deep-link cards for Naukri, Internshala, Wellfound, LinkedIn, Indeed, Glassdoor
 * Falls back to intelligent mock data if no API keys are configured.
 */

const https = require('https');

const JSEARCH_KEY    = process.env.JSEARCH_API_KEY;
const ADZUNA_APP_ID  = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

// ─── Skill keywords to auto-extract from job descriptions ────────────────────
const KNOWN_SKILLS = [
    'react','angular','vue','javascript','typescript','html','css','node.js','nodejs',
    'express','python','django','flask','fastapi','java','spring','kotlin','swift',
    'php','laravel','ruby','rails','go','rust','c#','.net','sql','mysql','postgresql',
    'mongodb','redis','elasticsearch','docker','kubernetes','aws','azure','gcp','git',
    'figma','tailwind','graphql','rest','api','machine learning','tensorflow','pytorch',
    'pandas','numpy','data analysis','power bi','tableau','excel','hadoop','spark',
    'linux','bash','devops','ci/cd','jenkins','ansible','terraform',
];

// ─── JSearch via RapidAPI (aggregates LinkedIn, Indeed, Glassdoor, ZipRecruiter) ─
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

// ─── RemoteOK API (free, no key required) ────────────────────────────────────
// Fetches real remote tech jobs from remoteok.com
const searchRemoteOK = (tags = []) => {
    return new Promise((resolve) => {
        // RemoteOK accepts comma-separated tags as path segments
        const tagSlug = (tags.slice(0, 2).join('+') || 'dev').toLowerCase().replace(/\s+/g, '-');

        const options = {
            method: 'GET',
            hostname: 'remoteok.com',
            path: `/api?tag=${tagSlug}`,
            headers: {
                'User-Agent': 'CareerGapAnalyser/1.0',
                'Accept': 'application/json',
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    // First element is metadata object, skip it
                    const jobs = Array.isArray(parsed) ? parsed.filter(j => j.id && j.position) : [];
                    resolve(jobs.slice(0, 8));
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

// ─── Compute match score ──────────────────────────────────────────────────────
const computeMatchScore = (studentSkills, jobSkills, jobTitle, jobDescription, suggestedRoles = []) => {
    const normStudentSkills = (studentSkills || []).map(s => s.toLowerCase().trim());
    if (normStudentSkills.length === 0) return { score: 35, matchedSkills: [] };

    const allText = `${jobTitle} ${jobDescription || ''}`.toLowerCase();
    const extractedSkills = KNOWN_SKILLS.filter(sk => allText.includes(sk));
    const allJobSkills = [...new Set([...(jobSkills || []).map(s => s.toLowerCase()), ...extractedSkills])];

    const matchedSkills = normStudentSkills.filter(s =>
        allJobSkills.some(js => js.includes(s) || s.includes(js))
    );

    const normRoles = (suggestedRoles || []).map(r => r.toLowerCase());
    const roleMatch = normRoles.some(r =>
        jobTitle.toLowerCase().includes(r.split(' ')[0]) ||
        r.includes(jobTitle.toLowerCase().split(' ')[0])
    );

    const base = allJobSkills.length > 0
        ? Math.round((matchedSkills.length / Math.max(allJobSkills.length, normStudentSkills.length)) * 70)
        : 20;
    const roleBonus = roleMatch ? 20 : 5;
    const score = Math.min(base + roleBonus + 10, 98);

    return { score, matchedSkills };
};

// ─── Map JSearch publisher to actual platform name ────────────────────────────
const resolveJSearchPlatform = (job) => {
    const publisher = (job.job_publisher || '').toLowerCase();
    const applyLink = (job.job_apply_link || '').toLowerCase();

    if (publisher.includes('linkedin') || applyLink.includes('linkedin')) return 'LinkedIn';
    if (publisher.includes('glassdoor') || applyLink.includes('glassdoor')) return 'Glassdoor';
    if (publisher.includes('indeed') || applyLink.includes('indeed')) return 'Indeed';
    if (publisher.includes('ziprecruiter') || applyLink.includes('ziprecruiter')) return 'ZipRecruiter';
    if (publisher.includes('monster') || applyLink.includes('monster')) return 'Monster';
    if (publisher.includes('naukri') || applyLink.includes('naukri')) return 'Naukri';
    if (publisher.includes('wellfound') || applyLink.includes('wellfound')) return 'Wellfound';
    if (publisher.includes('internshala') || applyLink.includes('internshala')) return 'Internshala';
    // JSearch is the aggregator — show the actual publisher if available
    if (publisher) return publisher.charAt(0).toUpperCase() + publisher.slice(1);
    return 'LinkedIn';
};

// ─── Normalize JSearch result ─────────────────────────────────────────────────
const normalizeJSearchJob = (job, studentProfile = {}) => {
    const skills = job.job_required_skills || [];
    const title = job.job_title || 'Software Engineer';
    const desc = job.job_description || '';
    const platform = resolveJSearchPlatform(job);
    const { score, matchedSkills } = computeMatchScore(
        studentProfile.skills, skills, title, desc, studentProfile.suggestedRoles
    );
    return {
        id: job.job_id || `jsearch_${Date.now()}_${Math.random()}`,
        title,
        company: job.employer_name || 'Company',
        location: job.job_city
            ? `${job.job_city}, ${job.job_country}`
            : (job.job_country || 'India'),
        isRemote: job.job_is_remote || false,
        workType: job.job_is_remote ? 'Remote' : (job.job_employment_type === 'FULLTIME' ? 'Full-time' : job.job_employment_type || 'Full-time'),
        description: desc ? desc.substring(0, 400) + '...' : 'Exciting opportunity to join a growing team.',
        applyLink: job.job_apply_link || job.job_google_link || '#',
        source: platform,
        sourcePlatform: 'jsearch',
        postedAt: job.job_posted_at_datetime_utc || new Date().toISOString(),
        requiredSkills: skills,
        experienceLevel: job.job_experience_required || 'Any',
        salaryMin: job.job_min_salary || null,
        salaryMax: job.job_max_salary || null,
        salaryCurrency: job.job_salary_currency || 'INR',
        logo: job.employer_logo || null,
        gapFriendly: true,
        matchScore: score,
        matchedSkills,
        isLive: true,
    };
};

// ─── Normalize Adzuna result ──────────────────────────────────────────────────
const normalizeAdzunaJob = (job, studentProfile = {}) => {
    const title = job.title || 'Software Engineer';
    const desc = job.description || '';
    const extractedSkills = KNOWN_SKILLS.filter(sk =>
        `${title} ${desc}`.toLowerCase().includes(sk)
    ).map(s => s.charAt(0).toUpperCase() + s.slice(1));

    const { score, matchedSkills } = computeMatchScore(
        studentProfile.skills, extractedSkills, title, desc, studentProfile.suggestedRoles
    );
    return {
        id: job.id || `adzuna_${Date.now()}_${Math.random()}`,
        title,
        company: job.company?.display_name || 'Company',
        location: job.location?.display_name || 'India',
        isRemote: title.toLowerCase().includes('remote') || desc.toLowerCase().includes('remote'),
        workType: 'Full-time',
        description: desc ? desc.substring(0, 400) + '...' : 'Join our growing team and make an impact.',
        applyLink: job.redirect_url || '#',
        source: 'Adzuna',
        sourcePlatform: 'adzuna',
        postedAt: job.created || new Date().toISOString(),
        requiredSkills: extractedSkills,
        experienceLevel: 'Any',
        salaryMin: job.salary_min || null,
        salaryMax: job.salary_max || null,
        salaryCurrency: 'INR',
        logo: null,
        gapFriendly: true,
        matchScore: score,
        matchedSkills,
        isLive: true,
    };
};

// ─── Normalize RemoteOK result ────────────────────────────────────────────────
const normalizeRemoteOKJob = (job, studentProfile = {}) => {
    const title = job.position || 'Remote Developer';
    const desc = job.description || '';
    const tags = Array.isArray(job.tags) ? job.tags : [];
    const tagSkills = tags.map(t => t.charAt(0).toUpperCase() + t.slice(1));

    const { score, matchedSkills } = computeMatchScore(
        studentProfile.skills, tagSkills, title, desc, studentProfile.suggestedRoles
    );

    return {
        id: `remoteok_${job.id || Date.now()}_${Math.random()}`,
        title,
        company: job.company || 'Remote Company',
        location: job.location || 'Remote (Worldwide)',
        isRemote: true,
        workType: 'Remote',
        description: desc ? desc.replace(/<[^>]+>/g, '').substring(0, 400) + '...' : 'Remote-first opportunity for talented engineers.',
        applyLink: job.apply_url || job.url || `https://remoteok.com/remote-jobs/${job.slug || job.id}`,
        source: 'RemoteOK',
        sourcePlatform: 'remoteok',
        // date can be ISO string or epoch number
        postedAt: job.date ? (typeof job.date === 'string' ? new Date(job.date).toISOString() : new Date(job.date * 1000).toISOString()) : new Date().toISOString(),
        requiredSkills: tagSkills,
        experienceLevel: 'Any',
        salaryMin: job.salary_min || null,
        salaryMax: job.salary_max || null,
        salaryCurrency: 'USD',
        logo: job.company_logo || null,
        gapFriendly: true,
        matchScore: score,
        matchedSkills,
        isLive: true,
    };
};

// ─── Deep-link URL builder per platform ──────────────────────────────────────
const buildApplyLink = (platform, jobTitle, jobLocation) => {
    const titleEnc = encodeURIComponent(jobTitle);
    const locEnc = encodeURIComponent(jobLocation || 'India');
    const titleSlug = jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const locSlug = (jobLocation || 'india').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    switch (platform) {
        case 'LinkedIn':
            return `https://www.linkedin.com/jobs/search/?keywords=${titleEnc}&location=${locEnc}&f_TPR=r2592000&sortBy=R`;
        case 'Indeed':
            return `https://in.indeed.com/jobs?q=${titleEnc}&l=${locEnc}&fromage=30&sort=relevance`;
        case 'Naukri':
            return `https://www.naukri.com/${titleSlug}-jobs-in-${locSlug}?src=jobsearchDesk&areaTypeID=1&noOfResults=20`;
        case 'Wellfound':
            return `https://wellfound.com/jobs?q=${titleEnc}&l=${locEnc}`;
        case 'Internshala':
            return `https://internshala.com/jobs/${titleSlug}-jobs-in-${locSlug}/`;
        case 'Glassdoor':
            return `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${titleEnc}&locT=N&locId=115&sortBy=relevance`;
        case 'RemoteOK':
            return `https://remoteok.com/remote-${titleSlug}-jobs`;
        case 'Shine':
            return `https://www.shine.com/job-search/${titleSlug}-jobs/${locSlug}/`;
        case 'Foundit':
            return `https://www.foundit.in/search?query=${titleEnc}&locationName=${locEnc}`;
        default:
            return `https://www.linkedin.com/jobs/search/?keywords=${titleEnc}&location=${locEnc}`;
    }
};

// ─── Generate smart deep-link cards for platforms without APIs ────────────────
// Creates realistic platform-branded cards that link to filtered search results
const generatePlatformDeepLinkCards = (studentProfile) => {
    const { skills = [], suggestedRoles = [], location = 'India' } = studentProfile;
    const primaryRole = suggestedRoles[0] || (skills[0] ? `${skills[0]} Developer` : 'Software Engineer');
    const secondaryRole = suggestedRoles[1] || (skills[1] ? `${skills[1]} Engineer` : 'Full Stack Developer');
    const searchLoc = location === 'Remote' ? 'India' : location;

    const platforms = [
        {
            platform: 'LinkedIn',
            roles: [primaryRole, secondaryRole],
            companies: ['Top MNC', 'IT Company', 'Product Startup'],
            descriptions: [
                `LinkedIn's top companies are hiring ${primaryRole}s right now. 100s of verified listings updated daily. Career gaps welcome.`,
                `Connect with recruiters actively hiring ${secondaryRole}s. Many companies on LinkedIn run return-to-work programs.`,
            ],
            salaries: ['₹10L – ₹25L/yr', '₹8L – ₹20L/yr'],
            logo: '💼',
            bgColor: '#0A66C2',
        },
        {
            platform: 'Naukri',
            roles: [primaryRole, `Senior ${primaryRole}`],
            companies: ['Infosys', 'TCS', 'Wipro', 'HCL', 'Tech Mahindra'],
            descriptions: [
                `India's #1 job portal with thousands of ${primaryRole} openings. Many employers have "gap-friendly" filters on Naukri.`,
                `Top IT companies posting new ${primaryRole} jobs daily on Naukri. Freshers and returners both welcome.`,
            ],
            salaries: ['₹6L – ₹18L/yr', '₹12L – ₹30L/yr'],
            logo: '🔶',
            bgColor: '#FF7555',
        },
        {
            platform: 'Indeed',
            roles: [primaryRole, secondaryRole],
            companies: ['Accenture', 'Capgemini', 'Cognizant'],
            descriptions: [
                `Indeed India has ${primaryRole} jobs from hundreds of companies. Sort by "Date Posted" to see the freshest listings.`,
                `Thousands of ${secondaryRole} jobs on Indeed right now. Many include salary info upfront.`,
            ],
            salaries: ['₹7L – ₹22L/yr', '₹9L – ₹20L/yr'],
            logo: '🔵',
            bgColor: '#2164F3',
        },
        {
            platform: 'Internshala',
            roles: [primaryRole, 'Fresher / Junior ' + primaryRole],
            companies: ['Various Startups', 'SME Companies'],
            descriptions: [
                `Internshala has both jobs and internships for ${primaryRole} roles. Great for career returners starting fresh.`,
                `Find part-time, remote, and full-time ${primaryRole} gigs. No discrimination on career gaps.`,
            ],
            salaries: ['₹3L – ₹10L/yr', '₹15K – ₹50K/month'],
            logo: '🎓',
            bgColor: '#00B4D8',
        },
        {
            platform: 'Wellfound',
            roles: [primaryRole, 'Startup ' + primaryRole],
            companies: ['Y Combinator Startups', 'Series A/B Startups'],
            descriptions: [
                `Wellfound (AngelList) lists equity-backed startups hiring ${primaryRole}s. Startups are notorious for caring about skill over gaps.`,
                `Find seed-stage to Series B startups hiring ${primaryRole}. Equity + salary packages available.`,
            ],
            salaries: ['₹12L – ₹35L/yr + equity', '₹10L – ₹28L/yr + equity'],
            logo: '🚀',
            bgColor: '#F04E23',
        },
        {
            platform: 'Glassdoor',
            roles: [primaryRole, secondaryRole],
            companies: ['Top Rated Employers', 'Great Place to Work Companies'],
            descriptions: [
                `Find ${primaryRole} jobs at companies rated 4+ stars by employees. Read reviews before applying.`,
                `Glassdoor shows salary insights for ${secondaryRole} roles at thousands of companies in India.`,
            ],
            salaries: ['₹8L – ₹24L/yr', '₹6L – ₹18L/yr'],
            logo: '🟢',
            bgColor: '#0CAA41',
        },
        {
            platform: 'Shine',
            roles: [primaryRole, secondaryRole],
            companies: ['Mid-size IT Firms', 'BPO & Services'],
            descriptions: [
                `Shine.com has ${primaryRole} opportunities at established Indian companies. Good for career gap returners.`,
                `Hundreds of ${secondaryRole} jobs on Shine with easy apply options. Many gap-friendly employers listed.`,
            ],
            salaries: ['₹5L – ₹15L/yr', '₹7L – ₹18L/yr'],
            logo: '✨',
            bgColor: '#FF6B35',
        },
        {
            platform: 'Foundit',
            roles: [primaryRole, secondaryRole],
            companies: ['Fortune 500 Companies', 'Indian Conglomerates'],
            descriptions: [
                `Foundit (formerly Monster India) lists ${primaryRole} jobs at top MNCs and Indian companies.`,
                `AI-powered job matching for ${secondaryRole} roles. Upload your resume and get matched instantly.`,
            ],
            salaries: ['₹8L – ₹22L/yr', '₹6L – ₹16L/yr'],
            logo: '🔍',
            bgColor: '#7B2FF7',
        },
    ];

    const cards = [];
    const cities = ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'];

    platforms.forEach((p, pi) => {
        p.roles.slice(0, 2).forEach((role, ri) => {
            const city = location === 'Remote' ? 'Remote' : cities[(pi * 2 + ri) % 6];
            const applyLink = buildApplyLink(p.platform, role, city === 'Remote' ? 'India' : city);
            const { score, matchedSkills } = computeMatchScore(
                skills, skills, role, p.descriptions[ri] || '', suggestedRoles
            );

            cards.push({
                id: `deeplink_${p.platform}_${ri}_${Date.now() + pi * 100 + ri}`,
                title: role,
                company: p.companies[ri % p.companies.length],
                location: city,
                isRemote: city === 'Remote' || ri === 0 && pi % 3 === 0,
                workType: city === 'Remote' ? 'Remote' : ri % 3 === 0 ? 'Hybrid' : 'Full-time',
                description: p.descriptions[ri] || `${p.platform} has multiple openings for ${role}. Apply now to see all listings.`,
                applyLink,
                source: p.platform,
                sourcePlatform: 'deeplink',
                postedAt: new Date(Date.now() - (pi * 2 + ri) * 12 * 60 * 60 * 1000).toISOString(),
                requiredSkills: skills.slice(0, 4),
                experienceLevel: ri === 0 ? 'Mid Level' : 'Entry Level',
                salaryDisplay: p.salaries[ri] || '₹6L – ₹18L/yr',
                salaryMin: null,
                salaryMax: null,
                salaryCurrency: 'INR',
                logo: p.logo,
                gapFriendly: true,
                matchScore: Math.min(score + 5, 95),
                matchedSkills,
                isLive: false,
                platformColor: p.bgColor,
            });
        });
    });

    return cards;
};

// ─── Mock Data Generator (fallback when no API results) ──────────────────────
const generateMockJobs = (skills = [], suggestedRoles = [], location = 'India') => {
    const cities = ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Remote'];

    const jobTemplates = [
        { title: 'Frontend Developer', company: 'TechVision Solutions', skills: ['React', 'TypeScript', 'CSS', 'HTML'], desc: 'Build modern, responsive web interfaces. Career gaps welcome. We evaluate candidates on skills and portfolio.', salary: '₹6L – ₹14L/yr', logo: '🔵', source: 'LinkedIn' },
        { title: 'Backend Developer', company: 'CloudStack India', skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'], desc: 'Join our backend team to build scalable microservices. We actively hire returners and career changers.', salary: '₹8L – ₹18L/yr', logo: '🟢', source: 'Naukri' },
        { title: 'Full Stack Engineer', company: 'Startup Hub Ventures', skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'], desc: 'End-to-end product development. Flexible hours, remote-friendly. We value skill over continuous employment history.', salary: '₹10L – ₹22L/yr', logo: '🟡', source: 'Wellfound' },
        { title: 'Data Scientist', company: 'Analytics Prime', skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'], desc: 'Work on real ML projects with impact. Career gaps understood — tell us what you built during your break.', salary: '₹12L – ₹28L/yr', logo: '🔴', source: 'Indeed' },
        { title: 'React Native Developer', company: 'MobileFirst Technologies', skills: ['React Native', 'JavaScript', 'iOS', 'Android'], desc: 'Build cross-platform mobile apps. 100% remote. We love candidates who kept building things during gaps.', salary: '₹9L – ₹20L/yr', logo: '🟣', source: 'LinkedIn' },
        { title: 'Python Developer', company: 'DataSync Corp', skills: ['Python', 'Django', 'FastAPI', 'SQL'], desc: 'Develop data pipelines and APIs for enterprise clients. Gap-friendly hiring policy.', salary: '₹8L – ₹16L/yr', logo: '🔵', source: 'Naukri' },
        { title: 'DevOps Engineer', company: 'InfraCloud Solutions', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], desc: 'Manage cloud infrastructure and deployments. Return-to-work program available.', salary: '₹14L – ₹30L/yr', logo: '🟠', source: 'Indeed' },
        { title: 'Software Engineer', company: 'GrowthTech Startup', skills: ['Java', 'Spring Boot', 'MySQL', 'REST APIs'], desc: 'Join a fast-growing fintech startup. We care about what you can do, not when you last worked.', salary: '₹7L – ₹15L/yr', logo: '🟢', source: 'Internshala' },
        { title: 'UI UX Designer', company: 'DesignHub Co.', skills: ['Figma', 'React', 'CSS', 'User Research'], desc: 'Design and implement beautiful user experiences. Freelancers and career returners welcome.', salary: '₹6L – ₹14L/yr', logo: '🔴', source: 'Wellfound' },
        { title: 'Machine Learning Engineer', company: 'AI Frontier Labs', skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP'], desc: 'Research and deploy ML models. We actively recruit candidates returning after caregiving or health breaks.', salary: '₹15L – ₹35L/yr', logo: '🟡', source: 'LinkedIn' },
        { title: 'Cloud Architect', company: 'Cloudnine Systems', skills: ['AWS', 'Azure', 'GCP', 'Terraform'], desc: 'Design and maintain cloud infrastructure for Fortune 500 clients. Flexible work arrangements.', salary: '₹20L – ₹45L/yr', logo: '☁️', source: 'Glassdoor' },
        { title: 'Android Developer', company: 'AppVenture India', skills: ['Kotlin', 'Android', 'Java', 'Firebase'], desc: 'Build Android apps used by millions. Career gaps are never a barrier here — your code speaks.', salary: '₹8L – ₹18L/yr', logo: '📱', source: 'Shine' },
        { title: 'QA Engineer', company: 'TestPro Solutions', skills: ['Selenium', 'Python', 'TestNG', 'JIRA'], desc: 'Join our QA team to ensure product quality. Return-to-work pathways available for experienced testers.', salary: '₹5L – ₹12L/yr', logo: '✅', source: 'Foundit' },
        { title: 'Product Manager', company: 'ProductFirst Inc.', skills: ['Product Strategy', 'Agile', 'SQL', 'Analytics'], desc: 'Lead product development from ideation to launch. We value diverse backgrounds including career returners.', salary: '₹18L – ₹40L/yr', logo: '🎯', source: 'LinkedIn' },
        { title: 'Cybersecurity Analyst', company: 'SecureNet India', skills: ['Network Security', 'Python', 'Linux', 'SIEM'], desc: 'Protect critical infrastructure. Certifications valued over continuous experience. Gap-friendly team.', salary: '₹10L – ₹22L/yr', logo: '🔒', source: 'Indeed' },
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
            isLive: false,
        };
    }).sort((a, b) => b.matchScore - a.matchScore);
};

// ─── Build search queries from student profile ────────────────────────────────
const buildSearchQueries = (studentProfile) => {
    const { skills = [], suggestedRoles = [] } = studentProfile;
    const queries = [];
    suggestedRoles.slice(0, 3).forEach(role => queries.push(role));
    if (skills.length >= 2) queries.push(skills.slice(0, 3).join(' ') + ' developer');
    if (queries.length === 0) queries.push('software engineer', 'developer', 'analyst');
    return [...new Set(queries)].slice(0, 4);
};

// ─── Build laser-focused queries from resume AI analysis ─────────────────────
const buildResumeSearchQueries = (resumeAnalysis, studentProfile) => {
    const queries = [];
    if (resumeAnalysis?.searchKeywords?.length) queries.push(...resumeAnalysis.searchKeywords.slice(0, 3));
    if (resumeAnalysis?.primaryRole) queries.push(resumeAnalysis.primaryRole);
    if (resumeAnalysis?.suggestedRoles?.length) queries.push(...resumeAnalysis.suggestedRoles.slice(0, 2));
    if (resumeAnalysis?.topSkills?.length >= 2) queries.push(resumeAnalysis.topSkills.slice(0, 3).join(' '));
    if (queries.length === 0) return buildSearchQueries(studentProfile);
    const unique = [...new Set(queries)].slice(0, 5);
    console.log(`📄 Resume-driven queries [domain: ${resumeAnalysis?.domain}]: [${unique.join(', ')}]`);
    return unique;
};

// ─── Extract RemoteOK tags from student skills ────────────────────────────────
const getRemoteOKTags = (skills = [], suggestedRoles = []) => {
    // Map common skills to RemoteOK tag names
    const tagMap = {
        'react': 'react', 'node.js': 'node', 'nodejs': 'node', 'python': 'python',
        'javascript': 'javascript', 'typescript': 'typescript', 'java': 'java',
        'golang': 'golang', 'go': 'golang', 'ruby': 'ruby', 'php': 'php',
        'devops': 'devops', 'aws': 'aws', 'docker': 'docker', 'kubernetes': 'kubernetes',
        'machine learning': 'machine-learning', 'tensorflow': 'tensorflow',
        'vue': 'vue', 'angular': 'angular', 'django': 'django', 'flask': 'flask',
        'kotlin': 'kotlin', 'swift': 'swift', 'sql': 'sql', 'postgresql': 'postgresql',
        'rust': 'rust', 'c#': 'csharp', '.net': 'dotnet',
    };

    const tags = [];
    skills.forEach(s => {
        const lower = s.toLowerCase();
        if (tagMap[lower]) tags.push(tagMap[lower]);
    });

    // Fallback from role if no direct tag matches
    if (tags.length === 0) {
        const role = (suggestedRoles[0] || '').toLowerCase();
        if (role.includes('front')) tags.push('react', 'javascript');
        else if (role.includes('back')) tags.push('node', 'python');
        else if (role.includes('data')) tags.push('python', 'machine-learning');
        else if (role.includes('full')) tags.push('react', 'node');
        else tags.push('javascript');
    }

    return tags.slice(0, 2);
};

// ─── Main: Run AI Job Search Agent (Multi-Platform) ──────────────────────────
const runJobSearchAgent = async (studentProfile) => {
    const { skills, suggestedRoles, location } = studentProfile;
    const searchLocation = location || 'India';

    const queries = studentProfile.resumeAnalysis
        ? buildResumeSearchQueries(studentProfile.resumeAnalysis, studentProfile)
        : buildSearchQueries(studentProfile);

    console.log(`🤖 AI Agent (Multi-Platform): Searching for [${queries.join(', ')}]`);
    console.log(`👤 Skills: [${(skills || []).join(', ')}]`);

    let jsearchJobs = [];
    let adzunaJobs  = [];
    let remoteOKJobs = [];

    const hasJSearch = JSEARCH_KEY && !['your_jsearch_key_here', 'your_jsearch_rapidapi_key_here'].includes(JSEARCH_KEY);
    const hasAdzuna  = ADZUNA_APP_ID && !['your_adzuna_app_id', 'your_adzuna_app_id_here'].includes(ADZUNA_APP_ID);

    const apiCalls = [];

    // ── JSearch (LinkedIn / Indeed / Glassdoor / ZipRecruiter) ────────────────
    if (hasJSearch) {
        queries.slice(0, 2).forEach(q => {
            apiCalls.push(
                searchJSearch(q, searchLocation)
                    .then(results => { jsearchJobs.push(...results.map(j => normalizeJSearchJob(j, studentProfile))); })
                    .catch(e => console.warn('JSearch error:', e.message))
            );
        });
    }

    // ── Adzuna ─────────────────────────────────────────────────────────────────
    if (hasAdzuna) {
        queries.slice(0, 2).forEach(q => {
            apiCalls.push(
                searchAdzuna(q, searchLocation)
                    .then(results => { adzunaJobs.push(...results.map(j => normalizeAdzunaJob(j, studentProfile))); })
                    .catch(e => console.warn('Adzuna error:', e.message))
            );
        });
    }

    // ── RemoteOK (free, no key needed) ────────────────────────────────────────
    const remoteOKTags = getRemoteOKTags(skills, suggestedRoles);
    apiCalls.push(
        searchRemoteOK(remoteOKTags)
            .then(results => { remoteOKJobs.push(...results.map(j => normalizeRemoteOKJob(j, studentProfile))); })
            .catch(e => console.warn('RemoteOK error:', e.message))
    );

    // Wait for all API calls simultaneously
    if (apiCalls.length > 0) await Promise.allSettled(apiCalls);

    let allJobs = [...jsearchJobs, ...adzunaJobs, ...remoteOKJobs];
    console.log(`📊 JSearch: ${jsearchJobs.length} | Adzuna: ${adzunaJobs.length} | RemoteOK: ${remoteOKJobs.length}`);

    // ── Always add platform deep-link cards (Naukri, Internshala, Wellfound, etc.) ──
    const deepLinkCards = generatePlatformDeepLinkCards(studentProfile);
    allJobs.push(...deepLinkCards);
    console.log(`🔗 Added ${deepLinkCards.length} platform deep-link cards (LinkedIn/Naukri/Indeed/Glassdoor/Internshala/Wellfound/Shine/Foundit)`);

    // ── Supplement with mock data if API results are too few ──────────────────
    const liveCount = jsearchJobs.length + adzunaJobs.length + remoteOKJobs.length;
    if (liveCount < 5) {
        const mockJobs = generateMockJobs(skills, suggestedRoles, searchLocation);
        const existingTitles = new Set(allJobs.map(j => j.title.toLowerCase()));
        const freshMocks = mockJobs.filter(m => !existingTitles.has(m.title.toLowerCase()));
        allJobs.push(...freshMocks);
        console.log(`🔄 Supplemented with ${freshMocks.length} mock jobs`);
    }

    // ── Deduplicate by title+company ───────────────────────────────────────────
    const seen = new Set();
    const unique = allJobs.filter(j => {
        const key = `${j.title}__${j.company}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // ── Sort: highest match score first (descending), tie-break by isLive ────────
    const sorted = unique.sort((a, b) => {
        // Primary: match score descending
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        // Secondary tie-break: live jobs before deep-link cards at same score
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return 0;
    });

    const platformSummary = [...new Set(sorted.map(j => j.source))].join(', ');
    console.log(`✅ AI Agent: ${sorted.length} jobs from platforms: ${platformSummary}`);
    return sorted;
};

module.exports = {
    runJobSearchAgent,
    buildSearchQueries,
    buildResumeSearchQueries,
    generateMockJobs,
    computeMatchScore,
    generatePlatformDeepLinkCards,
};

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check for either OpenAI or Gemini API key
const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';

// Initialize Gemini if key exists
let genAI = null;
if (hasGeminiKey) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Analyzes resume text using Gemini AI and extracts structured data
 * @param {string} resumeText - Raw text extracted from PDF
 * @returns {object} Structured resume data including domain + job-search keywords
 */
const analyzeResume = async (resumeText) => {

    // 1. Try to use Google Gemini AI Free Tier (If key exists)
    if (hasGeminiKey && genAI) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
You are an expert resume analyzer for a Career Gap Job Finder platform.
Analyze the following resume text and extract structured data in JSON format.

Resume Text:
"""
${resumeText}
"""

Extract and return ONLY a valid JSON object with this exact structure (No markdown code blocks, just raw JSON):
{
  "domain": "Web Development",
  "primaryRole": "Frontend Developer",
  "topSkills": ["React", "JavaScript", "CSS"],
  "searchKeywords": ["React Frontend Developer", "JavaScript Engineer", "UI Developer React"],
  "skills": ["skill1", "skill2"],
  "graduationYear": 2020,
  "gapDuration": 6,
  "gapRiskLevel": "Low",
  "experienceTimeline": [
    {"role": "Job Role", "company": "Company Name", "startDate": "2020-01", "endDate": "2021-03", "isCurrent": false}
  ],
  "suggestedRoles": ["role1", "role2", "role3"],
  "education": [{"degree": "B.Tech", "institution": "University Name", "year": 2020}],
  "gapJustification": "Professional explanation of the career gap",
  "resumeSuggestions": ["Add quantified achievements"],
  "resumeScore": 72,
  "totalExperience": 2.5
}

Rules:
- domain: One of: "Web Development", "AI/ML", "Data Science", "Mobile Development", "DevOps/Cloud", "Backend Development", "Full Stack", "Data Engineering", "Cybersecurity", "UI/UX Design", "Business Analysis", "Other"
- primaryRole: Single best-fit job title that exactly matches what this resume is for
- topSkills: Top 3-5 most important/prominent skills from this resume
- searchKeywords: 3-4 focused job search query strings to find matching jobs (combine role + key skills)
- gapDuration: Calculate total career gap in months (0 if no gap)
- gapRiskLevel: "Low" (0-6 months), "Medium" (7-12 months), "High" (>12 months)
- resumeScore: Calculate 0-100 based on skills diversity, experience relevance, and completeness
- gapJustification: Write a professional, compassionate 2-3 sentence explanation for the gap
- resumeSuggestions: 3-5 actionable improvement suggestions
`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

            const parsedResult = JSON.parse(responseText);
            return { success: true, data: parsedResult };
        } catch (error) {
            console.error('Gemini Resume Analysis Error:', error.message);
        }
    }

    // 2. ── FALLBACK: SMART EXTRACTION IF APIs FAIL OR ARE MISSING ──

    const textLower = resumeText.toLowerCase();

    // Domain detection keyword map
    const domainKeywords = {
        'AI/ML': ['machine learning', 'deep learning', 'neural network', 'tensorflow', 'pytorch', 'nlp', 'computer vision', 'scikit', 'keras', 'llm', 'generative ai', 'huggingface', 'artificial intelligence', 'model', 'python', 'ai'],
        'Data Science': ['data science', 'data analysis', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'statistics', 'tableau', 'power bi', 'r language', 'jupyter', 'data analyst', 'sql', 'data'],
        'Web Development': ['react', 'angular', 'vue', 'html', 'css', 'javascript', 'typescript', 'next.js', 'tailwind', 'frontend', 'web developer', 'web development'],
        'Full Stack': ['full stack', 'fullstack', 'node.js', 'express', 'mongodb', 'rest api', 'graphql', 'mern', 'mean'],
        'Backend Development': ['spring boot', 'django', 'flask', 'fastapi', 'microservices', 'postgresql', 'mysql', 'redis', 'backend', 'api'],
        'Mobile Development': ['android', 'ios', 'react native', 'flutter', 'kotlin', 'swift', 'xamarin', 'mobile app'],
        'DevOps/Cloud': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'terraform', 'ansible', 'devops', 'cloud'],
        'Data Engineering': ['spark', 'hadoop', 'kafka', 'airflow', 'etl', 'data pipeline', 'bigquery', 'snowflake', 'data engineering'],
        'UI/UX Design': ['figma', 'ux design', 'ui design', 'wireframe', 'prototyping', 'user research', 'adobe xd', 'ui/ux'],
        'Cybersecurity': ['cybersecurity', 'penetration testing', 'ethical hacking', 'network security', 'siem', 'firewalls', 'security'],
    };

    // Detect domain by counting keyword matches
    let bestDomain = 'Other';
    let bestScore = 0;
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
        // Use word boundaries for precise matching where possible, but allow partial for others
        const score = keywords.filter(k => {
             const regex = new RegExp('\\b' + k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
             return regex.test(textLower);
        }).length;
        if (score > bestScore) { bestScore = score; bestDomain = domain; }
    }

    // All tech skills
    const commonSkills = [
        'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php',
        'react', 'angular', 'vue', 'next.js', 'html', 'css', 'tailwind',
        'node.js', 'express', 'django', 'flask', 'fastapi', 'spring boot',
        'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
        'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git',
        'machine learning', 'deep learning', 'nlp', 'computer vision',
        'react native', 'flutter', 'kotlin', 'swift',
        'figma', 'sql', 'graphql', 'rest api', 'microservices',
        'keras', 'tableau', 'power bi', 'ansible', 'terraform', 'jenkins'
    ];

    const extractedSkills = commonSkills.filter(skill => {
        const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        return new RegExp('\\b' + escapedSkill + '\\b', 'i').test(textLower);
    }).map(s => s.charAt(0).toUpperCase() + s.slice(1));

    // Build domain-specific suggested roles + search keywords
    const domainRoleMap = {
        'AI/ML': {
            roles: ['Machine Learning Engineer', 'AI Engineer', 'Data Scientist', 'NLP Engineer'],
            keywords: ['Machine Learning Engineer Python', 'AI Engineer deep learning', 'ML Engineer TensorFlow'],
            primaryRole: 'Machine Learning Engineer',
        },
        'Data Science': {
            roles: ['Data Scientist', 'Data Analyst', 'Business Intelligence Analyst'],
            keywords: ['Data Scientist Python SQL', 'Data Analyst Power BI', 'Business Intelligence Engineer'],
            primaryRole: 'Data Scientist',
        },
        'Web Development': {
            roles: ['Frontend Developer', 'UI Engineer', 'React Developer', 'Web Developer'],
            keywords: ['React Frontend Developer', 'JavaScript Engineer', 'UI Developer React TypeScript'],
            primaryRole: 'Frontend Developer',
        },
        'Full Stack': {
            roles: ['Full Stack Developer', 'Full Stack Engineer', 'Software Engineer'],
            keywords: ['Full Stack Developer React Node.js', 'Software Engineer JavaScript', 'MERN Stack Developer'],
            primaryRole: 'Full Stack Developer',
        },
        'Backend Development': {
            roles: ['Backend Developer', 'Software Engineer', 'API Developer'],
            keywords: ['Backend Developer Node.js Python', 'Software Engineer Java Spring', 'API Developer REST microservices'],
            primaryRole: 'Backend Development',
        },
        'Mobile Development': {
            roles: ['Android Developer', 'iOS Developer', 'React Native Developer', 'Flutter Developer'],
            keywords: ['Android Developer Kotlin', 'React Native Developer', 'Flutter Mobile Engineer'],
            primaryRole: 'Mobile Developer',
        },
        'DevOps/Cloud': {
            roles: ['DevOps Engineer', 'Cloud Engineer', 'SRE', 'Platform Engineer'],
            keywords: ['DevOps Engineer AWS Docker', 'Cloud Engineer Kubernetes', 'SRE Platform Engineer'],
            primaryRole: 'DevOps Engineer',
        },
        'Data Engineering': {
            roles: ['Data Engineer', 'ETL Developer', 'Big Data Engineer'],
            keywords: ['Data Engineer Spark Kafka', 'ETL Developer Python', 'Big Data Engineer AWS'],
            primaryRole: 'Data Engineer',
        },
        'UI/UX Design': {
            roles: ['UI/UX Designer', 'Product Designer', 'UX Researcher'],
            keywords: ['UI UX Designer Figma', 'Product Designer user research', 'Frontend Designer React'],
            primaryRole: 'UI/UX Designer',
        },
    };

    const domainMeta = domainRoleMap[bestDomain] || {
        roles: ['Software Engineer', 'Business Analyst', 'Product Manager'],
        keywords: ['Software Engineer', 'Developer', 'Analyst'],
        primaryRole: 'Software Engineer',
    };

    let gapDuration = 0;
    if (textLower.includes('career gap') || textLower.includes('employment gap') || textLower.includes('career break')) {
        // Try to extract a number near "gap" or "break"
        const gapMatch = textLower.match(/(\d+)\s*(?:month|year|mo|yr)s?\s*(?:career gap|employment gap|career break|gap|break)/i) || 
                         textLower.match(/(?:career gap|employment gap|career break|gap|break)\s*(?:of|for)?\s*(\d+)\s*(?:month|year|mo|yr)s?/i);
        
        if (gapMatch && gapMatch[1]) {
            gapDuration = parseInt(gapMatch[1], 10);
            // If the matched number is a year (e.g. 1 year), convert to months, but for simplicity let's assume it matches exactly.
            if (gapMatch[0].includes('year') || gapMatch[0].includes('yr')) {
                gapDuration *= 12;
            }
        } else if (textLower.includes('0 month') || textLower.includes('no career gap') || textLower.includes('0 gap')) {
            gapDuration = 0;
        } else {
            gapDuration = 6; // Default fallback if mentioned but no number found
        }
    }
    
    const gapRiskLevel = gapDuration > 12 ? 'High' : gapDuration > 6 ? 'Medium' : 'Low';
    let resumeScore = 40;
    if (resumeText.length > 500) resumeScore += 10;
    if (resumeText.length > 1500) resumeScore += 10;
    resumeScore += Math.min(extractedSkills.length * 4, 40);

    return {
        success: true,
        data: {
            domain: bestDomain,
            primaryRole: domainMeta.primaryRole,
            topSkills: extractedSkills.slice(0, 5),
            searchKeywords: domainMeta.keywords,
            skills: extractedSkills.length ? extractedSkills : ['Communication', 'Teamwork', 'Problem Solving'],
            graduationYear: new Date().getFullYear() - 1,
            gapDuration,
            gapRiskLevel,
            experienceTimeline: [],
            suggestedRoles: domainMeta.roles,
            education: [],
            gapJustification: 'I took some dedicated time away from formal employment to focus on advancing my technical skillsets and working on independent self-driven projects. This gap has made me a more adaptable, focused, and resilient professional ready to contribute immediately to a collaborative team.',
            resumeSuggestions: [
                'Quantify your accomplishments with specific numbers and metrics.',
                'Add a dedicated "Projects" section to highlight recent technical work.',
                'Ensure your spacing and formatting are consistent across the entire document.'
            ],
            resumeScore,
            totalExperience: 1
        }
    };
};

/**
 * Generate a professional gap justification letter
 * @param {object} studentData - Student profile data
 */
const generateGapJustification = async (studentData) => {
    const { name, gapDuration, skills, degree } = studentData;

    if (hasGeminiKey && genAI) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Write a professional, empathetic cover letter paragraph (3-4 sentences) that a ${degree || 'recent'} graduate with a ${gapDuration}-month career gap can use to explain their gap to employers. The candidate has the following skills: ${skills.join(', ')}. Make it positive, forward-looking, and highlight how the gap was used productively. Return only the paragraph text.`;

            const result = await model.generateContent(prompt);
            return { success: true, text: result.response.text().trim() };
        } catch (error) {
            console.error('Gemini Justification Error:', error.message);
        }
    }

    // Fallback text
    return {
        success: true,
        text: `During my ${gapDuration}-month career gap after my ${degree || 'studies'}, I actively focused on upskilling and deepening my knowledge in areas like ${skills.slice(0, 3).join(', ')}. I dedicated myself to building practical projects that challenged me to solve complex real-world problems. I am now fully energized and prepared to bring this renewed expertise to a forward-thinking employer.`
    };
};

/**
 * Generate resume improvement suggestions
 * @param {string} resumeText - Resume text
 * @param {string[]} targetSkills - Skills required by matched jobs
 */
const getResumeSuggestions = async (resumeText, targetSkills = []) => {
    if (hasGeminiKey && genAI) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Review this resume and provide 5 specific, actionable improvement suggestions. Target skills the candidate should consider: ${targetSkills.join(', ')}. Resume: """${resumeText}""" Return a JSON array: { "suggestions": ["suggestion1", "suggestion2"] }`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(responseText);

            return { success: true, suggestions: json.suggestions || [] };
        } catch (error) {
            console.error('Gemini Suggestions Error:', error.message);
        }
    }

    return {
        success: true,
        suggestions: [
            `Consider adding any side projects related to ${targetSkills[0] || 'your target field'} to demonstrate recent activity.`,
            'Use high-impact action verbs (e.g., "Led", "Developed", "Optimized") to begin each bullet point.',
            'Ensure that your career gap is framed positively, matching the justification letter provided.',
            'Keep the formatting clean and ensure it is easily readable by automated applicant parsing systems.'
        ]
    };
};

module.exports = { analyzeResume, generateGapJustification, getResumeSuggestions };

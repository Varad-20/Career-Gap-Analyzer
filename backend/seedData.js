const mongoose = require('mongoose');
const Company = require('./src/models/Company');
const Job = require('./src/models/Job');
const connectDB = require('./src/config/db');
require('dotenv').config();

const seedData = async () => {
    try {
        await connectDB();

        console.log('🌱 Seeding database with gap-friendly companies and jobs...');

        // Create 3 Companies
        const companies = [
            {
                companyName: 'TechVision Solutions',
                email: 'hr@techvision.com',
                password: 'password123',
                industry: 'Information Technology',
                location: 'Remote',
                isApproved: true, // Must be true so they can post jobs
                isVerified: true,
                description: 'We believe in skill over pedigree and actively welcome career returners.'
            },
            {
                companyName: 'OpenSource Innovators',
                email: 'jobs@opensourceinnovators.com',
                password: 'password123',
                industry: 'Software Engineering',
                location: 'New York, NY',
                isApproved: true,
                isVerified: true,
                description: 'Building the future of open source. We look at GitHub repos, not gap years.'
            },
            {
                companyName: 'Apex Data Labs',
                email: 'careers@apexdata.com',
                password: 'password123',
                industry: 'Data Science',
                location: 'San Francisco, CA',
                isApproved: true,
                isVerified: true,
                description: 'Data-driven insights company. We value diverse backgrounds.'
            }
        ];

        // Wipe old seeds to avoid duplicates
        await Company.deleteMany({ email: { $in: companies.map(c => c.email) } });

        const createdCompanies = await Company.create(companies);

        // Create 5 Jobs mapping to these companies
        const jobs = [
            {
                company: createdCompanies[0]._id,
                companyName: createdCompanies[0].companyName,
                jobRole: 'Frontend Developer',
                description: 'Looking for a React developer to build modern user interfaces. Career gaps are completely fine if you have the skills.',
                requiredSkills: ['React', 'Javascript', 'Html', 'Css'],
                location: 'Remote',
                salaryMin: 70000,
                salaryMax: 110000,
                jobType: 'Full-time',
                acceptGap: true,
                maxGapAllowed: 24, // 24 months
                isActive: true
            },
            {
                company: createdCompanies[0]._id,
                companyName: createdCompanies[0].companyName,
                jobRole: 'UI Engineer',
                description: 'Design and implement UI components.',
                requiredSkills: ['React', 'Typescript', 'Tailwind', 'Css'],
                location: 'Remote',
                salaryMin: 80000,
                salaryMax: 120000,
                jobType: 'Full-time',
                acceptGap: true,
                maxGapAllowed: 12, // 12 months
                isActive: true
            },
            {
                company: createdCompanies[1]._id,
                companyName: createdCompanies[1].companyName,
                jobRole: 'Backend Developer',
                description: 'Node.js developer needed for microservices. We actively hire candidates returning to the workforce.',
                requiredSkills: ['Node.js', 'Express', 'Mongodb', 'Javascript'],
                location: 'New York, NY',
                salaryMin: 90000,
                salaryMax: 130000,
                jobType: 'Full-time',
                acceptGap: true,
                maxGapAllowed: 36, // 36 months!
                isActive: true
            },
            {
                company: createdCompanies[2]._id,
                companyName: createdCompanies[2].companyName,
                jobRole: 'Data Scientist',
                description: 'Analyze large datasets to find actionable insights.',
                requiredSkills: ['Python', 'Machine Learning', 'Data Analysis', 'Sql'],
                location: 'San Francisco, CA',
                salaryMin: 110000,
                salaryMax: 160000,
                jobType: 'Full-time',
                acceptGap: true,
                maxGapAllowed: 24,
                isActive: true
            },
            {
                company: createdCompanies[1]._id,
                companyName: createdCompanies[1].companyName,
                jobRole: 'Full Stack Engineer',
                description: 'Help us build end to end applications.',
                requiredSkills: ['Javascript', 'React', 'Node.js', 'Python'],
                location: 'Remote',
                salaryMin: 95000,
                salaryMax: 145000,
                jobType: 'Remote',
                acceptGap: true,
                maxGapAllowed: 18,
                isActive: true
            }
        ];

        // Clean out old seeded jobs
        await Job.deleteMany({ companyName: { $in: companies.map(c => c.companyName) } });

        await Job.create(jobs);

        console.log('✅ Successfully seeded 3 gap-friendly companies and 5 job postings!');
        console.log('Log into the platform and check your Job Matches page.');

        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();

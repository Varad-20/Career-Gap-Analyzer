const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const College = require('./src/models/College');
const Coordinator = require('./src/models/Coordinator');
const Company = require('./src/models/Company');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Create a dummy company for the drive
        let company = await Company.findOne({ email: 'hr@techcorp.com' });
        if (!company) {
            company = await Company.create({
                companyName: 'TechCorp Solutions',
                email: 'hr@techcorp.com',
                password: 'password123',
                location: 'Pune',
                industry: 'IT'
            });
        }
        console.log('Company ID:', company._id);

        // 2. Create and verify a college
        let college = await College.findOne({ code: 'DEMO' });
        if (!college) {
            college = await College.create({
                name: 'Demo Institute of Technology',
                code: 'DEMO',
                email: 'admin@demo.edu',
                city: 'Pune',
                isVerified: true
            });
        } else {
            college.isVerified = true;
            await college.save();
        }

        // 3. Create a coordinator
        let coordinator = await Coordinator.findOne({ email: 'tpo@demo.edu' });
        if (!coordinator) {
            coordinator = await Coordinator.create({
                name: 'Prof. Sharma',
                email: 'tpo@demo.edu',
                password: 'password123', // Will be hashed by pre-save hook
                designation: 'Head TPO',
                college: college._id
            });
            college.coordinator = coordinator._id;
            await college.save();
        }

        console.log('Seed successful!');
        console.log('Coordinator Login -> tpo@demo.edu / password123');
        console.log('Company ID for Drive ->', company._id.toString());
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();

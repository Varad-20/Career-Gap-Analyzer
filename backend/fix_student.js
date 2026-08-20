const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Student = require('./src/models/Student');
const College = require('./src/models/College');
const PlacementDrive = require('./src/models/PlacementDrive');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const college = await College.findOne({ code: 'DEMO' });
        if (!college) throw new Error('DEMO college not found');

        // Update the student
        const student = await Student.findOneAndUpdate(
            { email: 'igharevrd@gmail.com' },
            { 
                college: college._id,
                cgpa: 9.0,
                branch: 'CS',
                activeBacklogs: 0,
                batch: 2025
            },
            { new: true }
        );
        console.log('Student updated and linked to DEMO college:', student.email);

        // Make sure there is an upcoming drive
        const drive = await PlacementDrive.findOne({ college: college._id });
        if (drive) {
            drive.status = 'upcoming';
            // Set drive date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            drive.driveDate = tomorrow;
            
            // Set deadline to tonight
            const tonight = new Date();
            tonight.setHours(23, 59, 59, 999);
            drive.registrationDeadline = tonight;

            await drive.save();
            console.log('Drive dates fixed so it is visible as upcoming:', drive.title);
        } else {
            console.log('No drive found to fix.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();

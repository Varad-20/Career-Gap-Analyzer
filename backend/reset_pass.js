const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const Student = require('./src/models/Student');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);
        await Student.updateOne({ email: 'igharevrd@gmail.com' }, { password: hash });
        console.log('Password reset to password123');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fix();

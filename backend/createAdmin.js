const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
const connectDB = require('./src/config/db');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await Admin.findOne({ email: 'admin@careergap.com' });
        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit();
        }

        const admin = await Admin.create({
            name: 'Admin',
            email: 'admin@careergap.com',
            password: 'Admin@123'
        });

        console.log('Admin created successfully');
        process.exit();
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
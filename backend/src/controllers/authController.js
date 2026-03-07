const Student = require('../models/Student');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const Instructor = require('../models/Instructor');
const { generateToken } = require('../middleware/auth');

// ─── STUDENT AUTH ─────────────────────────────────────────────────────────────

exports.registerStudent = async (req, res) => {
    try {
        const { name, email, password, degree, graduationYear } = req.body;

        const existing = await Student.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const student = await Student.create({ name, email, password, degree, graduationYear });
        const token = generateToken(student._id);

        res.status(201).json({
            success: true,
            token,
            user: { id: student._id, name, email, role: 'student' }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student.findOne({ email });

        if (!student || !(await student.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(student._id);
        res.json({
            success: true,
            token,
            user: { id: student._id, name: student.name, email, role: 'student' }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── COMPANY AUTH ─────────────────────────────────────────────────────────────

exports.registerCompany = async (req, res) => {
    try {
        const { companyName, email, password, industry, location, website } = req.body;

        const existing = await Company.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const company = await Company.create({ companyName, email, password, industry, location, website });
        const token = generateToken(company._id);

        res.status(201).json({
            success: true,
            token,
            user: { id: company._id, name: companyName, email, role: 'company', isApproved: false }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.loginCompany = async (req, res) => {
    try {
        const { email, password } = req.body;
        const company = await Company.findOne({ email });

        if (!company || !(await company.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(company._id);
        res.json({
            success: true,
            token,
            user: { id: company._id, name: company.companyName, email, role: 'company', isApproved: company.isApproved }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── INSTRUCTOR AUTH ────────────────────────────────────────────────────────────

exports.registerInstructor = async (req, res) => {
    try {
        const { name, email, password, specialization } = req.body;

        const existing = await Instructor.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const instructor = await Instructor.create({ name, email, password, specialization });
        const token = generateToken(instructor._id);

        res.status(201).json({
            success: true,
            token,
            user: { id: instructor._id, name, email, role: 'instructor' }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.loginInstructor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const instructor = await Instructor.findOne({ email });

        if (!instructor || !(await instructor.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(instructor._id);
        res.json({
            success: true,
            token,
            user: { id: instructor._id, name: instructor.name, email, role: 'instructor' }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN AUTH ───────────────────────────────────────────────────────────────

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(admin._id);
        res.json({
            success: true,
            token,
            user: { id: admin._id, name: admin.name, email, role: 'admin' }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────

exports.getMe = async (req, res) => {
    res.json({ success: true, user: req.user });
};

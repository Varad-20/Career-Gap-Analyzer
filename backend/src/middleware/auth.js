const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const Instructor = require('../models/Instructor');

// Protect any route — verifies JWT and attaches user
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user across all collections
        let user = await Student.findById(decoded.id).select('-password');
        if (!user) user = await Company.findById(decoded.id).select('-password');
        if (!user) user = await Admin.findById(decoded.id).select('-password');
        if (!user) user = await Instructor.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Token user not found' });
        }

        req.user = user;
        req.userRole = user.role;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

// Role-based access control
const authorize = (...roles) => {
    return (req, res, next) => {
        // Admin has super-access to everything
        if (req.userRole === 'admin') {
            return next();
        }

        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.userRole}' is not authorized to access this route`
            });
        }
        next();
    };
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

module.exports = { protect, authorize, generateToken };

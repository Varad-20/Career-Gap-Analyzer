const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const {
    registerStudent, loginStudent,
    registerCompany, loginCompany,
    loginAdmin, getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Student auth
router.post('/student/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, registerStudent);

router.post('/student/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], validate, loginStudent);

// Company auth
router.post('/company/register', [
    body('companyName').notEmpty().withMessage('Company name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, registerCompany);

router.post('/company/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], validate, loginCompany);

// Admin auth
router.post('/admin/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], validate, loginAdmin);

// Get current user
router.get('/me', protect, getMe);

module.exports = router;

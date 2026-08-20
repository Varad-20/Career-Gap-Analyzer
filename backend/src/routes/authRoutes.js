const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const {
    registerStudent, loginStudent,
    loginAdmin, getMe,
    registerInstructor, loginInstructor,
    registerCoordinator, loginCoordinator, registerCollege
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



// Admin auth
router.post('/admin/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], validate, loginAdmin);

// Instructor auth
router.post('/instructor/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, registerInstructor);

router.post('/instructor/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], validate, loginInstructor);

// Get current user
router.get('/me', protect, getMe);

// Coordinator auth
router.post('/coordinator/register', [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('collegeCode').notEmpty().withMessage('College code is required')
], validate, registerCoordinator);

router.post('/coordinator/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], validate, loginCoordinator);

// College registration
router.post('/college/register', [
    body('name').notEmpty(),
    body('code').notEmpty().withMessage('College code required (e.g. MIT, VIT)'),
    body('email').isEmail(),
], validate, registerCollege);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAnalytics, getAllStudents, deleteStudent,
    getAllCompanies, approveCompany, deleteCompany,
    getAllJobs, getAllApplications, seedAdmin
} = require('../controllers/adminController');

// Seed route (no auth needed — run once)
router.post('/seed', seedAdmin);

// All below require admin auth
router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/students', getAllStudents);
router.delete('/students/:id', deleteStudent);
router.get('/companies', getAllCompanies);
router.put('/companies/:id/approve', approveCompany);
router.delete('/companies/:id', deleteCompany);
router.get('/jobs', getAllJobs);
router.get('/applications', getAllApplications);

module.exports = router;

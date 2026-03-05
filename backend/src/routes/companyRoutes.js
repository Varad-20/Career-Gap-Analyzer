const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getProfile, updateProfile, createJob, getMyJobs, updateJob, deleteJob,
    getJobApplications, updateApplicationStatus, getDashboardStats
} = require('../controllers/companyController');

// Protect all routes — companies AND admin can access (admin can view company data)
router.use(protect, authorize('company', 'admin'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/jobs', createJob);
router.get('/jobs', getMyJobs);
router.put('/jobs/:jobId', updateJob);
router.delete('/jobs/:jobId', deleteJob);
router.get('/jobs/:jobId/applications', getJobApplications);
router.put('/applications/:applicationId/status', updateApplicationStatus);
router.get('/dashboard', getDashboardStats);

module.exports = router;

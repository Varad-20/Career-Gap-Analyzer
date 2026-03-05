const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    getProfile, updateProfile, uploadResume, getMatchedJobs,
    applyToJob, getMyApplications, toggleSaveJob, getSavedJobs,
    generateGapJustification, getDashboardStats
} = require('../controllers/studentController');

// All routes protected for students (admin can also access for management)
router.use(protect, authorize('student', 'admin'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/resume/upload', upload.single('resume'), uploadResume);
router.get('/matches', getMatchedJobs);
router.post('/apply/:jobId', applyToJob);
router.get('/applications', getMyApplications);
router.post('/save/:jobId', toggleSaveJob);
router.get('/saved-jobs', getSavedJobs);
router.post('/gap-justification', generateGapJustification);
router.get('/dashboard', getDashboardStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getProfile, updateProfile, getDashboard, getDrives, createDrive, updateDrive, deleteDrive,
    getDriveApplicants, updateRoundResult, issueOffer, getCollegeStudents, getPlacementStats
} = require('../controllers/coordinatorController');

router.use(protect, authorize('coordinator', 'admin'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/dashboard', getDashboard);
router.get('/students', getCollegeStudents);
router.get('/placement-stats', getPlacementStats);

// Drive management
router.get('/drives', getDrives);
router.post('/drives', createDrive);
router.put('/drives/:id', updateDrive);
router.delete('/drives/:id', deleteDrive);

// Student pipeline per drive
router.get('/drives/:id/applicants', getDriveApplicants);
router.put('/drives/:driveId/applicants/:appId/round', updateRoundResult);
router.post('/drives/:driveId/offer/:appId', issueOffer);

module.exports = router;

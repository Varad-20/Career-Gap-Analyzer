const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    listDrives, getDrive, registerForDrive, getMyApplications, getMyStatus, withdrawApplication
} = require('../controllers/driveController');

// All routes require student auth
router.use(protect, authorize('student'));

router.get('/', listDrives);                          // browse drives for my college
router.get('/my-applications', getMyApplications);    // all my drive applications
router.get('/:id', getDrive);                         // drive detail + eligibility
router.post('/:id/register', registerForDrive);       // register for a drive
router.get('/:id/my-status', getMyStatus);            // my status in a specific drive
router.delete('/:id/withdraw', withdrawApplication);  // withdraw from a drive

module.exports = router;

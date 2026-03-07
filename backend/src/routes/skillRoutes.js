const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { searchCourses, getCourseDetails, upgradeSubscription, toggleWishlist, updateProgress, seedCourses, enrollCourse, getStudentQueries, createStudentQuery, replyToQueryStudent } = require('../controllers/skillController');

// Allow fetching basic list without deep auth for previewing
router.get('/courses', protect, authorize('student'), searchCourses);
router.post('/courses/seed', seedCourses);

// Enforce student auth for deeper actions
router.use(protect, authorize('student'));
router.get('/courses/:id', getCourseDetails);
router.post('/courses/:id/enroll', enrollCourse);
router.post('/subscription/upgrade', upgradeSubscription);
router.post('/courses/wishlist', toggleWishlist);
router.post('/courses/progress', updateProgress);

// Queries
router.get('/queries', getStudentQueries);
router.post('/queries', createStudentQuery);
router.post('/queries/:id/reply', replyToQueryStudent);

module.exports = router;

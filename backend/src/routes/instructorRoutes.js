const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    submitCourse, getMyCourses, updateCurriculum, deleteCourse, getProfile, updateProfile,
    getEnrolledStudents, getQueries, replyToQuery,
    adminGetPendingCourses, adminReviewCourse, adminGetInstructors, adminVerifyInstructor
} = require('../controllers/instructorController');

// ─── INSTRUCTOR ROUTES (auth = instructor role) ───────────────────────────────
router.use('/instructor', protect, authorize('instructor'));
router.get('/instructor/profile', getProfile);
router.put('/instructor/profile', updateProfile);
router.get('/instructor/courses', getMyCourses);
router.post('/instructor/courses', submitCourse);
router.put('/instructor/courses/:id', updateCurriculum);
router.delete('/instructor/courses/:id', deleteCourse);
router.get('/instructor/students', getEnrolledStudents);
router.get('/instructor/queries', getQueries);
router.put('/instructor/queries/:id/reply', replyToQuery);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────
router.use('/admin', protect, authorize('admin'));
router.get('/admin/pending-courses', adminGetPendingCourses);
router.put('/admin/review-course/:id', adminReviewCourse);
router.get('/admin/instructors', adminGetInstructors);
router.put('/admin/instructors/:id/verify', adminVerifyInstructor);

module.exports = router;

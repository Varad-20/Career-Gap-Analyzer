const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    searchJobs,
    getJobResults,
    getSkillGap,
    getLearningRoadmap,
    getAgentStatus,
} = require('../controllers/agentController');

// All routes are protected (require valid JWT)
router.use(protect);

// AI Career Agent routes
router.post('/search-jobs', searchJobs);
router.get('/results', getJobResults);
router.post('/skill-gap', getSkillGap);
router.get('/roadmap', getLearningRoadmap);
router.get('/status', getAgentStatus);

module.exports = router;

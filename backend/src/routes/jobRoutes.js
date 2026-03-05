const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Public job listings (for browse page)
router.get('/', async (req, res) => {
    try {
        const { location, role, acceptGap, page = 1, limit = 20 } = req.query;
        const query = { isActive: true };

        if (location) query.location = { $regex: location, $options: 'i' };
        if (role) query.jobRole = { $regex: role, $options: 'i' };
        if (acceptGap === 'true') query.acceptGap = true;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [jobs, total] = await Promise.all([
            Job.find(query)
                .populate('company', 'companyName logo location')
                .sort('-createdAt')
                .skip(skip)
                .limit(parseInt(limit)),
            Job.countDocuments(query)
        ]);

        res.json({ success: true, jobs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get single job
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('company', 'companyName logo location description website');

        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        res.json({ success: true, job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

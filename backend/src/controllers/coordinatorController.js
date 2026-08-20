/**
 * Coordinator Controller
 * Handles all placement coordinator operations:
 * - Profile management
 * - Placement drive CRUD
 * - Student pipeline management (round results, offer letters)
 * - Placement analytics for their college
 */

const Coordinator = require('../models/Coordinator');
const College = require('../models/College');
const PlacementDrive = require('../models/PlacementDrive');
const DriveApplication = require('../models/DriveApplication');
const Student = require('../models/Student');

// ─── GET /api/coordinator/profile ────────────────────────────────────────────
exports.getProfile = async (req, res) => {
    try {
        const coordinator = await Coordinator.findById(req.user._id).populate('college');
        res.json({ success: true, coordinator });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PUT /api/coordinator/profile ────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
    try {
        const allowed = ['name', 'phone', 'designation', 'department', 'bio', 'profilePhoto'];
        const updates = {};
        allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

        const coordinator = await Coordinator.findByIdAndUpdate(req.user._id, updates, { new: true }).populate('college');
        res.json({ success: true, coordinator });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/coordinator/dashboard ──────────────────────────────────────────
exports.getDashboard = async (req, res) => {
    try {
        const collegeId = req.user.college?._id || req.user.college;
        if (!collegeId) return res.status(400).json({ success: false, message: 'No college linked to this coordinator' });

        const [
            totalStudents,
            placedStudents,
            activeDrives,
            completedDrives,
            totalDrives,
            recentApplications,
        ] = await Promise.all([
            Student.countDocuments({ college: collegeId }),
            Student.countDocuments({ college: collegeId, placementStatus: 'placed' }),
            PlacementDrive.countDocuments({ college: collegeId, status: { $in: ['upcoming', 'ongoing'] }, isActive: true }),
            PlacementDrive.countDocuments({ college: collegeId, status: 'completed' }),
            PlacementDrive.countDocuments({ college: collegeId }),
            DriveApplication.find({ college: collegeId, status: 'selected' })
                .sort('-placedAt')
                .limit(5)
                .populate('student', 'name email branch cgpa')
                .populate('drive', 'title jobRole packageDisplay'),
        ]);

        // Package stats
        const packageStats = await DriveApplication.aggregate([
            { $match: { college: collegeId, status: 'selected', offeredPackage: { $gt: 0 } } },
            { $group: { _id: null, avg: { $avg: '$offeredPackage' }, max: { $max: '$offeredPackage' } } }
        ]);

        // Branch-wise placement
        const branchStats = await Student.aggregate([
            { $match: { college: collegeId } },
            { $group: { _id: '$branch', total: { $sum: 1 }, placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } } } },
            { $sort: { total: -1 } }
        ]);

        // Upcoming drives
        const upcomingDrives = await PlacementDrive.find({
            college: collegeId,
            status: 'upcoming',
            isActive: true,
            driveDate: { $gte: new Date() }
        })
            .populate('company', 'companyName logo')
            .sort('driveDate')
            .limit(5);

        res.json({
            success: true,
            stats: {
                totalStudents,
                placedStudents,
                placementRate: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0,
                activeDrives,
                completedDrives,
                totalDrives,
                avgPackage: packageStats[0]?.avg?.toFixed(2) || 0,
                maxPackage: packageStats[0]?.max || 0,
            },
            branchStats,
            recentPlacements: recentApplications,
            upcomingDrives,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/coordinator/drives ─────────────────────────────────────────────
exports.getDrives = async (req, res) => {
    try {
        const collegeId = req.user.college?._id || req.user.college;
        const { status, page = 1, limit = 20 } = req.query;

        const query = { college: collegeId };
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [drives, total] = await Promise.all([
            PlacementDrive.find(query)
                .populate('company', 'companyName logo location website')
                .sort('-createdAt')
                .skip(skip)
                .limit(parseInt(limit)),
            PlacementDrive.countDocuments(query)
        ]);

        res.json({ success: true, drives, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── POST /api/coordinator/drives ────────────────────────────────────────────
exports.createDrive = async (req, res) => {
    try {
        const collegeId = req.user.college?._id || req.user.college;
        if (!collegeId) return res.status(400).json({ success: false, message: 'No college linked to your account' });

        const drive = await PlacementDrive.create({
            ...req.body,
            college: collegeId,
            postedBy: req.user._id,
        });

        const populated = await PlacementDrive.findById(drive._id).populate('company', 'companyName logo');

        // Notify eligible students
        notifyEligibleStudents(drive._id, collegeId).catch(console.warn);

        res.status(201).json({ success: true, drive: populated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PUT /api/coordinator/drives/:id ─────────────────────────────────────────
exports.updateDrive = async (req, res) => {
    try {
        const collegeId = req.user.college?._id || req.user.college;
        const drive = await PlacementDrive.findOneAndUpdate(
            { _id: req.params.id, college: collegeId },
            req.body,
            { new: true, runValidators: true }
        ).populate('company', 'companyName logo');

        if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });
        res.json({ success: true, drive });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── DELETE /api/coordinator/drives/:id ──────────────────────────────────────
exports.deleteDrive = async (req, res) => {
    try {
        const collegeId = req.user.college?._id || req.user.college;
        const drive = await PlacementDrive.findOneAndUpdate(
            { _id: req.params.id, college: collegeId },
            { isActive: false, status: 'cancelled' },
            { new: true }
        );
        if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });
        res.json({ success: true, message: 'Drive cancelled' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/coordinator/drives/:id/applicants ───────────────────────────────
exports.getDriveApplicants = async (req, res) => {
    try {
        const { status, round } = req.query;
        const query = { drive: req.params.id };
        if (status) query.status = status;

        const applicants = await DriveApplication.find(query)
            .populate('student', 'name email phone branch cgpa activeBacklogs enrollmentNo resumeURL batch percentage10th percentage12th')
            .sort('-registeredAt');

        res.json({ success: true, applicants, total: applicants.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PUT /api/coordinator/drives/:driveId/applicants/:appId/round ─────────────
// Update a student's result in a specific round
exports.updateRoundResult = async (req, res) => {
    try {
        const { roundIndex, status, score, remarks } = req.body;

        const app = await DriveApplication.findById(req.params.appId).populate('student', 'name email');
        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

        // Update or add round result
        const existingIdx = app.roundResults.findIndex(r => r.roundIndex === roundIndex);
        const roundResult = {
            roundIndex,
            roundName: req.body.roundName || `Round ${roundIndex + 1}`,
            status,
            score,
            remarks,
            evaluatedAt: new Date(),
            evaluatedBy: req.user.name,
        };

        if (existingIdx >= 0) {
            app.roundResults[existingIdx] = roundResult;
        } else {
            app.roundResults.push(roundResult);
        }

        // Update application status
        if (status === 'fail') {
            app.status = 'rejected';
        } else if (status === 'pass') {
            app.status = 'in_process';
            app.currentRound = roundIndex + 1;
        }

        await app.save();

        // Notify student
        await Student.findByIdAndUpdate(app.student._id, {
            $push: {
                notifications: {
                    message: `Round ${roundIndex + 1} result: ${status === 'pass' ? '✅ Passed' : '❌ Not selected'}`,
                    read: false,
                }
            }
        });

        res.json({ success: true, application: app });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── POST /api/coordinator/drives/:driveId/offer/:appId ──────────────────────
// Mark student as selected, upload offer details
exports.issueOffer = async (req, res) => {
    try {
        const { offeredPackage, offeredRole, offerDeadline, offerLetter } = req.body;

        const app = await DriveApplication.findByIdAndUpdate(
            req.params.appId,
            {
                status: 'selected',
                offeredPackage,
                offeredRole,
                offerDeadline,
                offerLetter,
                placedAt: new Date(),
            },
            { new: true }
        ).populate('drive', 'title company college').populate('student', 'name email');

        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

        // Update student placement status
        await Student.findByIdAndUpdate(app.student._id, {
            placementStatus: 'placed',
            placedAt: {
                company: app.drive.title,
                role: offeredRole,
                package: offeredPackage,
                date: new Date(),
                driveId: app.drive._id,
            },
            $push: {
                notifications: {
                    message: `🎉 Congratulations! You have been selected for ${offeredRole}. Package: ${offeredPackage} LPA`,
                    read: false,
                }
            }
        });

        // Update drive stats
        await PlacementDrive.findByIdAndUpdate(req.params.driveId, { $inc: { totalSelected: 1 } });

        // Update college placement stats
        await recalculateCollegeStats(app.drive.college);

        res.json({ success: true, application: app, message: 'Offer issued successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/coordinator/students ───────────────────────────────────────────
exports.getCollegeStudents = async (req, res) => {
    try {
        const collegeId = req.user.college?._id || req.user.college;
        const { branch, placementStatus, batch, search, page = 1, limit = 30 } = req.query;

        const query = { college: collegeId };
        if (branch) query.branch = branch;
        if (placementStatus) query.placementStatus = placementStatus;
        if (batch) query.batch = parseInt(batch);
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { enrollmentNo: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [students, total] = await Promise.all([
            Student.find(query)
                .select('name email phone branch cgpa activeBacklogs enrollmentNo batch placementStatus placedAt resumeURL createdAt')
                .sort('-cgpa')
                .skip(skip)
                .limit(parseInt(limit)),
            Student.countDocuments(query)
        ]);

        res.json({ success: true, students, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/coordinator/placement-stats ────────────────────────────────────
exports.getPlacementStats = async (req, res) => {
    try {
        const collegeId = req.user.college?._id || req.user.college;
        const { batch } = req.query;

        const studentQuery = { college: collegeId };
        if (batch) studentQuery.batch = parseInt(batch);

        const [
            totalStudents,
            placedStudents,
            optedOut,
            packageAgg,
            branchStats,
            companyStats,
            monthlyPlacements,
        ] = await Promise.all([
            Student.countDocuments(studentQuery),
            Student.countDocuments({ ...studentQuery, placementStatus: 'placed' }),
            Student.countDocuments({ ...studentQuery, placementStatus: 'opted_out' }),
            DriveApplication.aggregate([
                { $match: { college: collegeId, status: 'selected', offeredPackage: { $gt: 0 } } },
                { $group: { _id: null, avg: { $avg: '$offeredPackage' }, max: { $max: '$offeredPackage' }, min: { $min: '$offeredPackage' } } }
            ]),
            Student.aggregate([
                { $match: studentQuery },
                { $group: { _id: '$branch', total: { $sum: 1 }, placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } } } },
                { $addFields: { rate: { $cond: [{ $gt: ['$total', 0] }, { $multiply: [{ $divide: ['$placed', '$total'] }, 100] }, 0] } } },
                { $sort: { placed: -1 } }
            ]),
            DriveApplication.aggregate([
                { $match: { college: collegeId, status: 'selected' } },
                { $lookup: { from: 'placementdrives', localField: 'drive', foreignField: '_id', as: 'driveInfo' } },
                { $unwind: '$driveInfo' },
                { $group: { _id: '$driveInfo.company', companyName: { $first: '$driveInfo.title' }, count: { $sum: 1 }, avgPackage: { $avg: '$offeredPackage' } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            DriveApplication.aggregate([
                { $match: { college: collegeId, status: 'selected', placedAt: { $exists: true } } },
                { $group: { _id: { month: { $month: '$placedAt' }, year: { $year: '$placedAt' } }, count: { $sum: 1 } } },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
        ]);

        res.json({
            success: true,
            stats: {
                totalStudents,
                placedStudents,
                optedOut,
                notPlaced: totalStudents - placedStudents - optedOut,
                placementRate: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0,
                avgPackage: packageAgg[0]?.avg?.toFixed(2) || 0,
                maxPackage: packageAgg[0]?.max || 0,
                minPackage: packageAgg[0]?.min || 0,
            },
            branchStats,
            companyStats,
            monthlyPlacements,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const notifyEligibleStudents = async (driveId, collegeId) => {
    const drive = await PlacementDrive.findById(driveId);
    if (!drive) return;

    const query = {
        college: collegeId,
        batch: drive.eligibility.batchYear,
        cgpa: { $gte: drive.eligibility.minCGPA },
        activeBacklogs: { $lte: drive.eligibility.maxActiveBacklogs },
        placementStatus: { $ne: 'placed' },
    };
    if (drive.eligibility.branches?.length > 0) {
        query.branch = { $in: drive.eligibility.branches };
    }

    await Student.updateMany(query, {
        $push: {
            notifications: {
                message: `📢 New drive: ${drive.title} | ${drive.jobRole} | ${drive.packageDisplay || drive.packageMin + ' LPA'}. Register before ${new Date(drive.registrationDeadline).toLocaleDateString()}`,
                read: false,
            }
        }
    });
};

const recalculateCollegeStats = async (collegeId) => {
    const total = await Student.countDocuments({ college: collegeId });
    const placed = await Student.countDocuments({ college: collegeId, placementStatus: 'placed' });
    const pkgAgg = await DriveApplication.aggregate([
        { $match: { college: collegeId, status: 'selected', offeredPackage: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$offeredPackage' }, max: { $max: '$offeredPackage' } } }
    ]);

    await College.findByIdAndUpdate(collegeId, {
        'placementStats.totalStudents': total,
        'placementStats.placed': placed,
        'placementStats.avgPackage': pkgAgg[0]?.avg || 0,
        'placementStats.maxPackage': pkgAgg[0]?.max || 0,
        'placementStats.placementRate': total > 0 ? Math.round((placed / total) * 100) : 0,
        'placementStats.lastUpdated': new Date(),
    });
};

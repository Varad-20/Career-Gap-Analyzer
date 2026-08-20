/**
 * Drive Controller
 * Student-facing endpoints for browsing and registering for placement drives
 */

const PlacementDrive = require('../models/PlacementDrive');
const DriveApplication = require('../models/DriveApplication');
const Student = require('../models/Student');

// ─── Helper: check student eligibility for a drive ────────────────────────────
const checkEligibility = (student, drive) => {
    const reasons = [];
    const e = drive.eligibility;

    if (e.minCGPA > 0 && (student.cgpa || 0) < e.minCGPA) {
        reasons.push(`CGPA ${student.cgpa || 0} < required ${e.minCGPA}`);
    }
    if (e.branches?.length > 0 && student.branch && !e.branches.includes(student.branch)) {
        reasons.push(`Branch ${student.branch} not in ${e.branches.join(', ')}`);
    }
    if (e.maxActiveBacklogs !== undefined && (student.activeBacklogs || 0) > e.maxActiveBacklogs) {
        reasons.push(`Active backlogs ${student.activeBacklogs} > allowed ${e.maxActiveBacklogs}`);
    }
    if (e.minPercentage10th > 0 && (student.percentage10th || 0) < e.minPercentage10th) {
        reasons.push(`10th ${student.percentage10th}% < required ${e.minPercentage10th}%`);
    }
    if (e.minPercentage12th > 0 && (student.percentage12th || 0) < e.minPercentage12th) {
        reasons.push(`12th ${student.percentage12th}% < required ${e.minPercentage12th}%`);
    }
    if (e.batchYear && student.batch && student.batch !== e.batchYear) {
        reasons.push(`Batch ${student.batch} ≠ required ${e.batchYear}`);
    }

    return { eligible: reasons.length === 0, reasons };
};

// ─── GET /api/drives ─────────────────────────────────────────────────────────
// Student: list all drives for their college
exports.listDrives = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student?.college) {
            return res.json({ success: true, drives: [], message: 'No college linked to your profile' });
        }

        const { status = 'upcoming', driveType } = req.query;
        const query = {
            college: student.college,
            isActive: true,
        };
        if (status !== 'all') query.status = status;
        if (driveType) query.driveType = driveType;

        const drives = await PlacementDrive.find(query)
            .populate('company', 'companyName logo location website industry')
            .sort('driveDate');

        // Check eligibility for each drive
        const drivesWithEligibility = drives.map(d => {
            const { eligible, reasons } = checkEligibility(student, d);
            const obj = d.toObject();
            obj.isEligible = eligible;
            obj.ineligibilityReasons = reasons;
            return obj;
        });

        // Check registration status
        const driveIds = drives.map(d => d._id);
        const myApplications = await DriveApplication.find({
            student: req.user._id,
            drive: { $in: driveIds }
        }).select('drive status');

        const myAppMap = {};
        myApplications.forEach(a => { myAppMap[a.drive.toString()] = a.status; });

        drivesWithEligibility.forEach(d => {
            d.myStatus = myAppMap[d._id.toString()] || null;
        });

        res.json({ success: true, drives: drivesWithEligibility });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/drives/:id ─────────────────────────────────────────────────────
exports.getDrive = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        const drive = await PlacementDrive.findById(req.params.id)
            .populate('company', 'companyName logo location website description industry phone')
            .populate('college', 'name code city');

        if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });

        const { eligible, reasons } = checkEligibility(student, drive);

        // Check if already registered
        const myApp = await DriveApplication.findOne({
            drive: drive._id,
            student: req.user._id
        });

        res.json({
            success: true,
            drive: {
                ...drive.toObject(),
                isEligible: eligible,
                ineligibilityReasons: reasons,
                myApplication: myApp || null,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── POST /api/drives/:id/register ───────────────────────────────────────────
exports.registerForDrive = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        const drive = await PlacementDrive.findById(req.params.id);

        if (!drive || !drive.isActive) {
            return res.status(404).json({ success: false, message: 'Drive not found or inactive' });
        }

        // Check deadline
        if (new Date() > new Date(drive.registrationDeadline)) {
            return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
        }

        // Check eligibility
        const { eligible, reasons } = checkEligibility(student, drive);
        if (!eligible) {
            return res.status(400).json({
                success: false,
                message: 'You do not meet eligibility criteria',
                reasons
            });
        }

        // Check already placed
        if (student.placementStatus === 'placed') {
            return res.status(400).json({ success: false, message: 'You are already placed' });
        }

        // Create application
        const application = await DriveApplication.create({
            drive: drive._id,
            student: student._id,
            college: student.college,
            isEligible: true,
            studentSnapshot: {
                cgpa: student.cgpa,
                branch: student.branch,
                activeBacklogs: student.activeBacklogs,
                resumeURL: student.resumeURL,
            }
        });

        // Update drive counter
        await PlacementDrive.findByIdAndUpdate(drive._id, { $inc: { totalRegistered: 1 } });

        // Notify student
        await Student.findByIdAndUpdate(req.user._id, {
            $push: {
                notifications: {
                    message: `✅ Successfully registered for ${drive.title}. Drive date: ${new Date(drive.driveDate).toLocaleDateString()}`,
                    read: false,
                }
            }
        });

        res.status(201).json({ success: true, application, message: 'Successfully registered for the drive!' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already registered for this drive' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/drives/my-applications ─────────────────────────────────────────
exports.getMyApplications = async (req, res) => {
    try {
        const applications = await DriveApplication.find({ student: req.user._id })
            .populate({
                path: 'drive',
                populate: { path: 'company', select: 'companyName logo' }
            })
            .sort('-registeredAt');

        res.json({ success: true, applications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/drives/:id/my-status ───────────────────────────────────────────
exports.getMyStatus = async (req, res) => {
    try {
        const application = await DriveApplication.findOne({
            drive: req.params.id,
            student: req.user._id
        }).populate({
            path: 'drive',
            populate: [
                { path: 'company', select: 'companyName logo' },
                { path: 'college', select: 'name' }
            ]
        });

        if (!application) {
            return res.status(404).json({ success: false, message: 'No application found for this drive' });
        }

        res.json({ success: true, application });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── DELETE /api/drives/:id/withdraw ─────────────────────────────────────────
exports.withdrawApplication = async (req, res) => {
    try {
        const drive = await PlacementDrive.findById(req.params.id);
        if (drive && new Date() > new Date(drive.driveDate)) {
            return res.status(400).json({ success: false, message: 'Cannot withdraw after drive date' });
        }

        const app = await DriveApplication.findOneAndUpdate(
            { drive: req.params.id, student: req.user._id, status: 'registered' },
            { status: 'withdrawn' },
            { new: true }
        );

        if (!app) return res.status(404).json({ success: false, message: 'Application not found or cannot be withdrawn' });

        await PlacementDrive.findByIdAndUpdate(req.params.id, { $inc: { totalRegistered: -1 } });

        res.json({ success: true, message: 'Application withdrawn successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

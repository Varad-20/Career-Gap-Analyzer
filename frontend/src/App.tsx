import { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import ResumeUpload from './pages/student/ResumeUpload';
import JobMatches from './pages/student/JobMatches';
import MyApplications from './pages/student/MyApplications';
import SavedJobs from './pages/student/SavedJobs';
import SkillUp from './pages/student/SkillUp';
import CourseDashboard from './pages/student/CourseDashboard';
import StudentQueries from './pages/student/StudentQueries';
import PremiumSession from './pages/student/PremiumSession';
import AgentDashboard from './pages/student/AgentDashboard';
import SkillGapReport from './pages/student/SkillGapReport';
import PlacementDrives from './pages/student/PlacementDrives';
import MyDriveApplications from './pages/student/MyDriveApplications';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageCompanies from './pages/admin/ManageCompanies';
import ManageJobs from './pages/admin/ManageJobs';
import ManageApplications from './pages/admin/ManageApplications';
import AdminCourseReview from './pages/admin/AdminCourseReview';

// Instructor Portal
import InstructorAuth from './pages/instructor/InstructorAuth';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCurriculum from './pages/instructor/InstructorCurriculum';
import InstructorProfile from './pages/instructor/InstructorProfile';
import InstructorStudents from './pages/instructor/InstructorStudents';
import InstructorQueries from './pages/instructor/InstructorQueries';

// Coordinator Portal
import CoordinatorAuth from './pages/coordinator/CoordinatorAuth';
import CoordinatorLayout from './pages/coordinator/CoordinatorLayout';
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import ManageDrives from './pages/coordinator/ManageDrives';
import DriveApplicants from './pages/coordinator/DriveApplicants';
import CollegeStudents from './pages/coordinator/CollegeStudents';
import PlacementStats from './pages/coordinator/PlacementStats';

// Layouts
import StudentLayout from './components/layout/StudentLayout';
import AdminLayout from './components/layout/AdminLayout';

// Protected route wrapper
const ProtectedRoute = ({ children, role }: { children: ReactNode; role?: string }) => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                    <p className="text-white/60">Loading session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (role && user?.role !== role) return <Navigate to="/" replace />;
    return <>{children}</>;
};

// Coordinator protected route (uses localStorage, not AuthContext)
const CoordinatorRoute = ({ children }: { children: ReactNode }) => {
    const token = localStorage.getItem('coordinatorToken');
    if (!token) return <Navigate to="/coordinator" replace />;
    return <>{children}</>;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Entry Points */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Portal (Protected) */}
            <Route path="/student" element={
                <ProtectedRoute role="student">
                    <StudentLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="resume" element={<ResumeUpload />} />
                <Route path="agent" element={<AgentDashboard />} />
                <Route path="skill-gap" element={<SkillGapReport />} />
                <Route path="matches" element={<JobMatches />} />
                <Route path="applications" element={<MyApplications />} />
                <Route path="saved" element={<SavedJobs />} />
                {/* ── Placement Drives ── */}
                <Route path="drives" element={<PlacementDrives />} />
                <Route path="my-drives" element={<MyDriveApplications />} />
                {/* Skill Up Paths */}
                <Route path="skill-up" element={<SkillUp />} />
                <Route path="skill-up/:courseId" element={<CourseDashboard />} />
                <Route path="queries" element={<StudentQueries />} />
                <Route path="premium" element={<PremiumSession />} />
            </Route>

            {/* Instructor Portal */}
            <Route path="/instructor" element={<InstructorAuth />} />
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/profile" element={<InstructorProfile />} />
            <Route path="/instructor/students" element={<InstructorStudents />} />
            <Route path="/instructor/queries" element={<InstructorQueries />} />
            <Route path="/instructor/courses/:courseId/curriculum" element={<InstructorCurriculum />} />

            {/* Coordinator Portal */}
            <Route path="/coordinator" element={<CoordinatorAuth />} />
            <Route path="/coordinator" element={
                <CoordinatorRoute>
                    <CoordinatorLayout />
                </CoordinatorRoute>
            }>
                <Route path="dashboard" element={<CoordinatorDashboard />} />
                <Route path="drives" element={<ManageDrives />} />
                <Route path="drives/:driveId" element={<DriveApplicants />} />
                <Route path="students" element={<CollegeStudents />} />
                <Route path="stats" element={<PlacementStats />} />
            </Route>

            {/* Admin Management (Protected) */}
            <Route path="/admin" element={
                <ProtectedRoute role="admin">
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="companies" element={<ManageCompanies />} />
                <Route path="jobs" element={<ManageJobs />} />
                <Route path="applications" element={<ManageApplications />} />
                <Route path="course-review" element={<AdminCourseReview />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;

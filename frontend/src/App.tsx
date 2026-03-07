import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing.tsx';
import Login from './pages/auth/Login.tsx';
import Register from './pages/auth/Register.tsx';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard.tsx';
import StudentProfile from './pages/student/StudentProfile.tsx';
import ResumeUpload from './pages/student/ResumeUpload.tsx';
import JobMatches from './pages/student/JobMatches.tsx';
import MyApplications from './pages/student/MyApplications.tsx';
import SavedJobs from './pages/student/SavedJobs.tsx';

// Company pages
import CompanyDashboard from './pages/company/CompanyDashboard.tsx';
import PostJob from './pages/company/PostJob.tsx';
import JobApplications from './pages/company/JobApplications.tsx';
import CompanyProfile from './pages/company/CompanyProfile.tsx';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import ManageStudents from './pages/admin/ManageStudents.tsx';
import ManageCompanies from './pages/admin/ManageCompanies.tsx';
import ManageJobs from './pages/admin/ManageJobs.tsx';
import ManageApplications from './pages/admin/ManageApplications.tsx';

// Layout
import StudentLayout from './components/layout/StudentLayout.tsx';
import CompanyLayout from './components/layout/CompanyLayout.tsx';
import AdminLayout from './components/layout/AdminLayout.tsx';

// Protected route wrapper
const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                    <p className="text-white/60">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (role && user?.role !== role) return <Navigate to="/" replace />;
    return <>{children}</>;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Routes */}
            <Route path="/student" element={
                <ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>
            }>
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="resume" element={<ResumeUpload />} />
                <Route path="matches" element={<JobMatches />} />
                <Route path="applications" element={<MyApplications />} />
                <Route path="saved" element={<SavedJobs />} />
            </Route>

            {/* Company Routes */}
            <Route path="/company" element={
                <ProtectedRoute role="company"><CompanyLayout /></ProtectedRoute>
            }>
                <Route index element={<Navigate to="/company/dashboard" replace />} />
                <Route path="dashboard" element={<CompanyDashboard />} />
                <Route path="profile" element={<CompanyProfile />} />
                <Route path="post-job" element={<PostJob />} />
                <Route path="jobs/:jobId/applications" element={<JobApplications />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
            }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="companies" element={<ManageCompanies />} />
                <Route path="jobs" element={<ManageJobs />} />
                <Route path="applications" element={<ManageApplications />} />
            </Route>

            {/* Fallback */}
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

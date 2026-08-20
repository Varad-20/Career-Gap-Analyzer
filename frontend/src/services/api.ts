import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    let token = null;

    // Determine which token to use based on the API route
    if (config.url?.startsWith('/coordinator') || config.url?.startsWith('/auth/coordinator') || config.url?.startsWith('/auth/college')) {
        token = localStorage.getItem('coordinatorToken');
    } else if (config.url?.startsWith('/instructor') || config.url?.startsWith('/auth/instructor')) {
        token = localStorage.getItem('instructorToken');
    } else if (config.url?.startsWith('/company') || config.url?.startsWith('/auth/company')) {
        token = localStorage.getItem('companyToken');
    } else {
        token = localStorage.getItem('token'); // default student token
    }

    // Fallback just in case
    if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('coordinatorToken') || localStorage.getItem('instructorToken');
    }

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally — but NOT during login/auth requests themselves
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl = error.config?.url || '';
        const isAuthRequest = requestUrl.includes('/auth/');
        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
    studentRegister: (data: object) => api.post('/auth/student/register', data),
    studentLogin: (data: object) => api.post('/auth/student/login', data),
    companyRegister: (data: object) => api.post('/auth/company/register', data),
    companyLogin: (data: object) => api.post('/auth/company/login', data),
    adminLogin: (data: object) => api.post('/auth/admin/login', data),
    getMe: () => api.get('/auth/me'),
};

// ─── STUDENT ──────────────────────────────────────────────────────────────────
export const studentAPI = {
    getProfile: () => api.get('/student/profile'),
    updateProfile: (data: object) => api.put('/student/profile', data),
    uploadResume: (formData: FormData) =>
        api.post('/student/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getMatches: (params?: object) => api.get('/student/matches', { params }),
    applyToJob: (jobId: string, data: object) => api.post(`/student/apply/${jobId}`, data),
    getApplications: () => api.get('/student/applications'),
    toggleSaveJob: (jobId: string) => api.post(`/student/save/${jobId}`),
    getSavedJobs: () => api.get('/student/saved-jobs'),
    generateGapJustification: () => api.post('/student/gap-justification'),
    getDashboard: () => api.get('/student/dashboard'),
};

// ─── COMPANY ──────────────────────────────────────────────────────────────────
export const companyAPI = {
    getProfile: () => api.get('/company/profile'),
    updateProfile: (data: object) => api.put('/company/profile', data),
    createJob: (data: object) => api.post('/company/jobs', data),
    getJobs: () => api.get('/company/jobs'),
    updateJob: (jobId: string, data: object) => api.put(`/company/jobs/${jobId}`, data),
    deleteJob: (jobId: string) => api.delete(`/company/jobs/${jobId}`),
    getJobApplications: (jobId: string) => api.get(`/company/jobs/${jobId}/applications`),
    updateApplicationStatus: (appId: string, data: object) =>
        api.put(`/company/applications/${appId}/status`, data),
    getDashboard: () => api.get('/company/dashboard'),
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const adminAPI = {
    getAnalytics: () => api.get('/admin/analytics'),
    getStudents: () => api.get('/admin/students'),
    deleteStudent: (id: string) => api.delete(`/admin/students/${id}`),
    getCompanies: () => api.get('/admin/companies'),
    approveCompany: (id: string) => api.put(`/admin/companies/${id}/approve`),
    deleteCompany: (id: string) => api.delete(`/admin/companies/${id}`),
    getAllJobs: () => api.get('/admin/jobs'),
    getAllApplications: () => api.get('/admin/applications'),
    seedAdmin: () => api.post('/admin/seed'),
};

// ─── SKILL UP ─────────────────────────────────────────────────────────────────
export const skillAPI = {
    searchCourses: (params?: object) => api.get('/skills/courses', { params }),
    getCourseDetails: (id: string) => api.get(`/skills/courses/${id}`),
    enrollCourse: (id: string) => api.post(`/skills/courses/${id}/enroll`),
    upgradeSubscription: (data: object) => api.post('/skills/subscription/upgrade', data),
    toggleWishlist: (courseId: string) => api.post('/skills/courses/wishlist', { courseId }),
    updateProgress: (data: { courseId: string; progress: number; completed: boolean }) => api.post('/skills/courses/progress', data),
    seedCourses: () => api.post('/skills/courses/seed'),
    // Queries
    getQueries: () => api.get('/skills/queries'),
    createQuery: (data: { courseId: string; subject: string; text: string }) => api.post('/skills/queries', data),
    replyToQuery: (id: string, text: string) => api.post(`/skills/queries/${id}/reply`, { text }),
};

// ─── INSTRUCTOR PORTAL ────────────────────────────────────────────────────────
export const instructorAPI = {
    register: (data: object) => api.post('/auth/instructor/register', data),
    login: (data: object) => api.post('/auth/instructor/login', data),
    getProfile: () => api.get('/instructor/profile'),
    getMyCourses: () => api.get('/instructor/courses'),
    submitCourse: (data: object) => api.post('/instructor/courses', data),
    updateCourse: (id: string, data: object) => api.put(`/instructor/courses/${id}`, data),
    updateCurriculum: (id: string, data: { modules?: any[], resources?: any[], mockTests?: any[] }) =>
        api.put(`/instructor/courses/${id}`, data),
    deleteCourse: (id: string) => api.delete(`/instructor/courses/${id}`),
    updateProfile: (data: any) => api.put('/instructor/profile', data),
    getEnrolledStudents: () => api.get('/instructor/students'),
    getQueries: () => api.get('/instructor/queries'),
    replyToQuery: (id: string, data: { text?: string; status?: string }) => api.put(`/instructor/queries/${id}/reply`, data),
};

// ─── ADMIN COURSE REVIEW ──────────────────────────────────────────────────────
export const adminCourseAPI = {
    getPendingCourses: (status?: string) => api.get('/admin/pending-courses', { params: { status } }),
    reviewCourse: (id: string, status: string) => api.put(`/admin/review-course/${id}`, { status }),
    getInstructors: () => api.get('/admin/instructors'),
    verifyInstructor: (id: string, isVerified: boolean) => api.put(`/admin/instructors/${id}/verify`, { isVerified }),
};

// ─── PUBLIC JOBS ──────────────────────────────────────────────────────────────
export const jobsAPI = {
    getAll: (params?: object) => api.get('/jobs', { params }),
    getOne: (id: string) => api.get(`/jobs/${id}`),
};

// ─── AI CAREER AGENT ──────────────────────────────────────────────────────────
export const agentAPI = {
    searchJobs: () => api.post('/agent/search-jobs'),
    getJobResults: () => api.get('/agent/results'),
    getSkillGap: () => api.post('/agent/skill-gap'),
    getLearningRoadmap: () => api.get('/agent/roadmap'),
    getStatus: () => api.get('/agent/status'),
};

// ─── PLACEMENT DRIVES (student-facing) ────────────────────────────────────────
export const drivesAPI = {
    listDrives: (params?: object) => api.get('/drives', { params }),
    getDrive: (id: string) => api.get(`/drives/${id}`),
    register: (id: string) => api.post(`/drives/${id}/register`),
    getMyApplications: () => api.get('/drives/my-applications'),
    getMyStatus: (id: string) => api.get(`/drives/${id}/my-status`),
    withdraw: (id: string) => api.delete(`/drives/${id}/withdraw`),
};

// ─── COORDINATOR PORTAL ───────────────────────────────────────────────────────
export const coordinatorAPI = {
    login: (data: object) => api.post('/auth/coordinator/login', data),
    register: (data: object) => api.post('/auth/coordinator/register', data),
    getProfile: () => api.get('/coordinator/profile'),
    updateProfile: (data: object) => api.put('/coordinator/profile', data),
    getDashboard: () => api.get('/coordinator/dashboard'),
    getStudents: (params?: object) => api.get('/coordinator/students', { params }),
    getPlacementStats: (params?: object) => api.get('/coordinator/placement-stats', { params }),
    // Drives
    getDrives: (params?: object) => api.get('/coordinator/drives', { params }),
    createDrive: (data: object) => api.post('/coordinator/drives', data),
    updateDrive: (id: string, data: object) => api.put(`/coordinator/drives/${id}`, data),
    deleteDrive: (id: string) => api.delete(`/coordinator/drives/${id}`),
    // Applicant pipeline
    getApplicants: (driveId: string, params?: object) => api.get(`/coordinator/drives/${driveId}/applicants`, { params }),
    updateRoundResult: (driveId: string, appId: string, data: object) =>
        api.put(`/coordinator/drives/${driveId}/applicants/${appId}/round`, data),
    issueOffer: (driveId: string, appId: string, data: object) =>
        api.post(`/coordinator/drives/${driveId}/offer/${appId}`, data),
};

// ─── COLLEGE ──────────────────────────────────────────────────────────────────
export const collegeAPI = {
    register: (data: object) => api.post('/auth/college/register', data),
};

export default api;

import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
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

// ─── PUBLIC JOBS ──────────────────────────────────────────────────────────────
export const jobsAPI = {
    getAll: (params?: object) => api.get('/jobs', { params }),
    getOne: (id: string) => api.get(`/jobs/${id}`),
};

export default api;

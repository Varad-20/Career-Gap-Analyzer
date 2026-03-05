// Type definitions for the entire application

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'company' | 'admin';
}

export interface Student extends User {
    role: 'student';
    degree: string;
    skills: string[];
    graduationYear: number;
    gapDuration: number;
    gapRiskLevel: 'Low' | 'Medium' | 'High';
    resumeURL: string;
    resumeScore: number;
    suggestedRoles: string[];
    gapJustification: string;
    resumeSuggestions: string[];
    location: string;
    phone: string;
    bio: string;
    isProfileComplete: boolean;
    savedJobs: string[];
    notifications: Notification[];
    createdAt: string;
}

export interface Company extends User {
    role: 'company';
    companyName: string;
    industry: string;
    website: string;
    description: string;
    location: string;
    logo: string;
    isApproved: boolean;
    notifications: Notification[];
}

export interface Job {
    _id: string;
    company: Company | string;
    companyName: string;
    jobRole: string;
    description: string;
    requiredSkills: string[];
    experienceRequired: number;
    location: string;
    salaryMin: number;
    salaryMax: number;
    salaryDisplay: string;
    jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
    acceptGap: boolean;
    maxGapAllowed: number;
    isActive: boolean;
    views: number;
    deadline?: string;
    createdAt: string;
}

export interface Application {
    _id: string;
    student: Student | string;
    job: Job | string;
    company: Company | string;
    matchScore: number;
    skillMatchPercentage: number;
    gapCompliant: boolean;
    coverLetter: string;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected';
    appliedAt: string;
    reviewedAt?: string;
    companyNotes: string;
    createdAt: string;
}

export interface Notification {
    _id: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export interface MatchResult {
    job: Job;
    matchScore: number;
    skillMatchPercentage: number;
    gapCompliant: boolean;
    details: {
        skillMatchPercentage: number;
        gapDurationOk: boolean;
        companyAcceptsGap: boolean;
    };
}

export interface Analytics {
    totalStudents: number;
    totalCompanies: number;
    approvedCompanies: number;
    pendingCompanies: number;
    totalJobs: number;
    totalApplications: number;
    gapCandidates: number;
    topSkills: { skill: string; count: number }[];
    applicationStats: Record<string, number>;
}

export interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
}

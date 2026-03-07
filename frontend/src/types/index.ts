// Type definitions for the entire application

export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'company' | 'admin' | 'instructor';
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
    wishlistCourses?: string[];
    courseProgress?: CourseProgress[];
    subscription?: Subscription;
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

export interface Instructor extends User {
    role: 'instructor';
    totalEarnings?: number;
    isVerified?: boolean;
    createdAt?: string;

    // Profile
    bio?: string;
    specialization?: string;
    website?: string;
    contactNumber?: string;
    profilePicture?: string;
    location?: string;

    // Payment Details
    paymentDetails?: {
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        upiId?: string;
        accountHolderName?: string;
    };
}

export interface Query {
    _id: string;
    student: { _id: string; name: string; email: string };
    instructor: { _id: string; name: string; specialization: string } | string;
    course: { _id: string; title: string };
    subject: string;
    messages: {
        senderModel: 'Student' | 'Instructor';
        sender: string;
        text: string;
        sentAt: string;
    }[];
    status: 'open' | 'resolved';
    updatedAt: string;
    createdAt: string;
}

export interface EnrolledStudent {
    _id: string;
    name: string;
    email: string;
    degree?: string;
    enrolledIn: {
        courseId: string;
        courseTitle: string;
        progress: number;
        completed: boolean;
        enrolledAt: string;
    }[];
}

export type GetEnrolledStudents = EnrolledStudent[];
export type GetQueries = Query[];

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
    isSaved?: boolean;
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

export interface Lesson {
    _id?: string;
    title: string;
    videoUrl?: string; // Support for videos
    content?: string;
    duration: string;
    isCompleted: boolean;
}

export interface CourseModule {
    _id: string;
    title: string;
    lessons: Lesson[];
}

export interface ResourceItem {
    title: string;
    url: string;
    type: 'PDF' | 'Video' | 'Code' | 'Other';
}

export interface MockTest {
    _id?: string;
    title: string;
    description: string;
    duration: number; // in minutes
    questions: any[]; // Structure as needed
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    skillTags: string[];
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedTime: string;
    instructor: string;
    rating: number;
    category: string;
    isPremium: boolean;
    modules: CourseModule[];
    resources: ResourceItem[]; // Added
    mockTests: MockTest[]; // Added
    studyNotesUrl?: string;
    roadmapUrl?: string;
    practiceExercisesUrl?: string;
    interviewPrepUrl?: string;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export interface CourseProgress {
    course: string;
    progress: number;
    completed: boolean;
    lastAccessed: string;
}

export interface Subscription {
    plan: 'free' | 'premium';
    expiresAt?: string;
}

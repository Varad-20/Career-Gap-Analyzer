import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCourseAPI } from '../../services/api';
import { motion } from 'framer-motion';
import {
    BookOpen, CheckCircle, XCircle, Clock, User, Tag, Star, Eye,
    Users, ShieldCheck, ShieldX, Mail, Lightbulb, Calendar, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

type MainTab = 'instructors' | 'courses';
type CourseTab = 'pending' | 'approved' | 'rejected';

export default function AdminCourseReview() {
    const queryClient = useQueryClient();
    const [mainTab, setMainTab] = useState<MainTab>('instructors');
    const [courseTab, setCourseTab] = useState<CourseTab>('pending');
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

    // ── Instructors query ──────────────────────────────────────────────────────
    const { data: instructors = [], isLoading: loadingInstructors } = useQuery({
        queryKey: ['adminInstructors'],
        queryFn: () => adminCourseAPI.getInstructors().then(r => r.data.instructors)
    });

    // ── Courses query ──────────────────────────────────────────────────────────
    const { data: courses = [], isLoading: loadingCourses } = useQuery({
        queryKey: ['adminCourses', courseTab],
        queryFn: () => adminCourseAPI.getPendingCourses(courseTab).then(r => r.data.courses),
        enabled: mainTab === 'courses'
    });

    // ── Verify / revoke instructor ─────────────────────────────────────────────
    const verifyMutation = useMutation({
        mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) =>
            adminCourseAPI.verifyInstructor(id, isVerified),
        onSuccess: (_, vars) => {
            toast.success(vars.isVerified ? '✅ Instructor verified & granted permission!' : '🚫 Instructor permission revoked.');
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Action failed')
    });

    // ── Approve / reject course ────────────────────────────────────────────────
    const reviewMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            adminCourseAPI.reviewCourse(id, status),
        onSuccess: (_, vars) => {
            toast.success(`Course ${vars.status}!`);
            queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
            setSelectedCourse(null);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Action failed')
    });

    const verifiedCount = instructors.filter((i: any) => i.isVerified).length;
    const pendingInstructors = instructors.filter((i: any) => !i.isVerified).length;

    const statusColors: Record<string, string> = {
        pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        rejected: 'text-red-400 bg-red-500/10 border-red-500/20',
    };

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BookOpen className="w-7 h-7 text-primary-400" /> Course & Instructor Management
                </h1>
                <p className="text-white/50 mt-1">Grant instructors permission and approve their course submissions.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Instructors', value: instructors.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Awaiting Permission', value: pendingInstructors, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                    { label: 'Verified Instructors', value: verifiedCount, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-primary-400', bg: 'bg-primary-500/10' },
                ].map(c => (
                    <div key={c.label} className="glass-card p-4 flex items-center gap-4">
                        <div className={`p-3 ${c.bg} rounded-xl ${c.color}`}>
                            <c.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{c.value}</p>
                            <p className="text-white/50 text-xs">{c.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                {([
                    { key: 'instructors', label: '👤 Instructors', badge: pendingInstructors },
                    { key: 'courses', label: '📚 Course Submissions' }
                ] as const).map(t => (
                    <button
                        key={t.key}
                        onClick={() => setMainTab(t.key as MainTab)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${mainTab === t.key ? 'bg-primary-600 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        {t.label}
                        {'badge' in t && t.badge > 0 && (
                            <span className="bg-yellow-500 text-dark-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                                {t.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── INSTRUCTORS TAB ─────────────────────────────────────────────── */}
            {mainTab === 'instructors' && (
                <div className="space-y-4">
                    {loadingInstructors ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />)}
                        </div>
                    ) : instructors.length === 0 ? (
                        <div className="glass-card p-16 text-center">
                            <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className="text-white/50 text-lg">No instructors registered yet.</p>
                            <p className="text-white/30 text-sm mt-1">Instructors sign up at <span className="text-primary-400">/instructor</span></p>
                        </div>
                    ) : (
                        instructors.map((instructor: any, i: number) => (
                            <motion.div
                                key={instructor._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`glass-card p-5 border-l-4 ${instructor.isVerified ? 'border-l-emerald-500' : 'border-l-yellow-500'}`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${instructor.isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {instructor.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-white font-semibold text-lg">{instructor.name}</h3>
                                                {instructor.isVerified ? (
                                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <ShieldCheck className="w-3 h-3" /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                                        <Clock className="w-3 h-3" /> Awaiting Permission
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-white/50">
                                                <span className="flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5 text-primary-400" /> {instructor.email}
                                                </span>
                                                {instructor.specialization && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Lightbulb className="w-3.5 h-3.5 text-yellow-400" /> {instructor.specialization}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Joined {new Date(instructor.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-2 flex-shrink-0">
                                        {!instructor.isVerified ? (
                                            <button
                                                onClick={() => verifyMutation.mutate({ id: instructor._id, isVerified: true })}
                                                disabled={verifyMutation.isPending}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 font-semibold text-sm transition-colors"
                                            >
                                                <ShieldCheck className="w-4 h-4" />
                                                Grant Permission
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => verifyMutation.mutate({ id: instructor._id, isVerified: false })}
                                                disabled={verifyMutation.isPending}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-semibold text-sm transition-colors"
                                            >
                                                <ShieldX className="w-4 h-4" />
                                                Revoke
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { setMainTab('courses'); }}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 hover:bg-white/5 text-sm transition-colors"
                                        >
                                            <BookOpen className="w-4 h-4" /> View Courses
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* ── COURSES TAB ─────────────────────────────────────────────────── */}
            {mainTab === 'courses' && (
                <div className="space-y-4">
                    {/* Sub-tabs */}
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                        {(['pending', 'approved', 'rejected'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setCourseTab(tab)}
                                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${courseTab === tab ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {loadingCourses ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />)}
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="glass-card p-16 text-center">
                            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className="text-white/50">No {courseTab} courses found.</p>
                            <p className="text-white/30 text-sm mt-1">Courses appear here after instructors submit them from the portal.</p>
                        </div>
                    ) : (
                        courses.map((course: any, i: number) => (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-5"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-1">
                                            <div>
                                                <h3 className="text-white font-semibold text-lg">{course.title}</h3>
                                                <p className="text-white/50 text-sm line-clamp-1">{course.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-sm text-white/50">
                                            <span className="flex items-center gap-1.5">
                                                <User className="w-4 h-4 text-primary-400" />
                                                {course.instructorId?.name || course.instructor || 'Unknown'}
                                            </span>
                                            <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" /> {course.difficulty}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {course.estimatedTime}</span>
                                            {course.isPremium && <span className="flex items-center gap-1.5 text-yellow-400"><Star className="w-4 h-4" /> Premium</span>}
                                            <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColors[course.approvalStatus]}`}>
                                                {course.approvalStatus}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {course.skillTags?.map((tag: string) => (
                                                <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 text-white/50 rounded-lg">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 min-w-[150px]">
                                        <button onClick={() => setSelectedCourse(course)}
                                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 text-sm">
                                            <Eye className="w-4 h-4" /> Preview
                                        </button>
                                        {courseTab === 'pending' && (
                                            <>
                                                <button onClick={() => reviewMutation.mutate({ id: course._id, status: 'approved' })}
                                                    disabled={reviewMutation.isPending}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-sm font-medium">
                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                </button>
                                                <button onClick={() => reviewMutation.mutate({ id: course._id, status: 'rejected' })}
                                                    disabled={reviewMutation.isPending}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium">
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </button>
                                            </>
                                        )}
                                        {courseTab === 'approved' && (
                                            <button onClick={() => reviewMutation.mutate({ id: course._id, status: 'rejected' })}
                                                disabled={reviewMutation.isPending}
                                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm">
                                                <XCircle className="w-4 h-4" /> Revoke
                                            </button>
                                        )}
                                        {courseTab === 'rejected' && (
                                            <button onClick={() => reviewMutation.mutate({ id: course._id, status: 'approved' })}
                                                disabled={reviewMutation.isPending}
                                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-sm">
                                                <CheckCircle className="w-4 h-4" /> Reconsider
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Preview Modal */}
            {selectedCourse && (
                <div className="fixed inset-0 z-50 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                        className="bg-dark-800 border border-white/10 rounded-3xl p-8 max-w-xl w-full">
                        <h3 className="text-xl font-bold text-white mb-1">{selectedCourse.title}</h3>
                        <p className="text-white/60 text-sm mb-6">{selectedCourse.description}</p>
                        <div className="space-y-2 mb-6 text-sm text-white/60">
                            <p><span className="text-white/30">Instructor:</span> {selectedCourse.instructorId?.name || selectedCourse.instructor}</p>
                            <p><span className="text-white/30">Level:</span> {selectedCourse.difficulty}</p>
                            <p><span className="text-white/30">Duration:</span> {selectedCourse.estimatedTime}</p>
                            <p><span className="text-white/30">Category:</span> {selectedCourse.category}</p>
                            <p><span className="text-white/30">Premium:</span> {selectedCourse.isPremium ? 'Yes' : 'No'}</p>
                            <p><span className="text-white/30">Tags:</span> {selectedCourse.skillTags?.join(', ')}</p>
                        </div>
                        <button onClick={() => setSelectedCourse(null)} className="btn-primary w-full">Close</button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

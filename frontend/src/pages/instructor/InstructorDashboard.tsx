import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Plus, Clock, Tag, Star, Trash2, Edit3, CheckCircle, AlertCircle,
    DollarSign, LogOut, Eye, X, Layout, User, Users, MessageSquare, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const EMPTY_FORM = {
    title: '', description: '', skillTags: '', difficulty: 'Beginner',
    estimatedTime: '', category: '', isPremium: false
};

export default function InstructorDashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [paymentDone, setPaymentDone] = useState(false);

    const user = JSON.parse(localStorage.getItem('instructorUser') || '{}');

    // Redirect if not logged in
    if (!localStorage.getItem('instructorToken')) {
        navigate('/instructor');
        return null;
    }

    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['instructorCourses'],
        queryFn: () => instructorAPI.getMyCourses().then(r => r.data.courses)
    });

    const submitMutation = useMutation({
        mutationFn: (data: object) => editId
            ? instructorAPI.updateCourse(editId, data)
            : instructorAPI.submitCourse(data),
        onSuccess: () => {
            toast.success(editId ? 'Course updated & resubmitted!' : 'Course submitted for admin review!');
            queryClient.invalidateQueries({ queryKey: ['instructorCourses'] });
            setShowForm(false);
            setEditId(null);
            setForm({ ...EMPTY_FORM });
            setPaymentDone(false);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Error submitting course')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => instructorAPI.deleteCourse(id),
        onSuccess: () => {
            toast.success('Course deleted');
            queryClient.invalidateQueries({ queryKey: ['instructorCourses'] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentDone && !editId) {
            toast.error('Please confirm the upload fee payment before submitting.');
            return;
        }
        submitMutation.mutate({
            ...form,
            skillTags: form.skillTags.split(',').map(s => s.trim()).filter(Boolean)
        });
    };

    const openEdit = (course: any) => {
        setEditId(course._id);
        setForm({
            title: course.title, description: course.description,
            skillTags: course.skillTags.join(', '), difficulty: course.difficulty,
            estimatedTime: course.estimatedTime, category: course.category,
            isPremium: course.isPremium
        });
        setPaymentDone(true);
        setShowForm(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('instructorToken');
        localStorage.removeItem('instructorUser');
        navigate('/instructor');
    };

    const statusColor = (s: string) =>
        s === 'approved' ? 'text-emerald-400 bg-emerald-500/10' :
            s === 'rejected' ? 'text-red-400 bg-red-500/10' :
                'text-yellow-400 bg-yellow-500/10';

    return (
        <div className="min-h-screen bg-dark-900">
            {/* Top Nav */}
            <header className="border-b border-white/5 bg-dark-800/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-primary-400" />
                        </div>
                        <span className="text-white font-bold">Instructor Portal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/instructor/profile')} className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 hover:bg-primary-500/20 transition-colors">
                            <User className="w-5 h-5" />
                        </button>
                        <div className="text-right ml-2 pr-2 border-r border-white/10 mr-2">
                            <p className="text-white text-sm font-medium">{user.name}</p>
                            <p className="text-white/40 text-xs">Verified Instructor</p>
                        </div>
                        <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-red-400 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-blue-400' },
                        { label: 'Approved', value: courses.filter((c: any) => c.approvalStatus === 'approved').length, icon: CheckCircle, color: 'text-emerald-400' },
                        { label: 'Pending Review', value: courses.filter((c: any) => c.approvalStatus === 'pending').length, icon: AlertCircle, color: 'text-yellow-400' },
                        { label: 'Total Earnings', value: `₹${(courses.filter((c: any) => c.approvalStatus === 'approved').length * 1500).toLocaleString()}`, icon: DollarSign, color: 'text-purple-400' },
                    ].map(stat => (
                        <div key={stat.label} className="glass-card p-5 flex items-center gap-4 hover:border-white/10 transition-colors">
                            <div className={`p-3 bg-white/5 rounded-xl ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                                <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mt-0.5">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sub-Navigation Dashboard Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            label: 'Course Queries',
                            desc: 'Respond to student questions',
                            icon: MessageSquare,
                            to: '/instructor/queries',
                            color: 'bg-accent-500',
                            badge: '2 New'
                        },
                        {
                            label: 'Enrolled Students',
                            desc: 'Track student progress',
                            icon: Users,
                            to: '/instructor/students',
                            color: 'bg-primary-500'
                        },
                        {
                            label: 'Payment Profile',
                            desc: 'Update bank & bio details',
                            icon: Briefcase,
                            to: '/instructor/profile',
                            color: 'bg-orange-500'
                        },
                    ].map(item => (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.to)}
                            className="group glass-card p-6 flex items-start gap-4 hover:border-white/20 transition-all active:scale-95 text-left bg-gradient-to-br from-white/[0.03] to-transparent"
                        >
                            <div className={`w-12 h-12 ${item.color}/20 rounded-2xl flex items-center justify-center ${item.color.replace('bg-', 'text-')} mb-4 group-hover:scale-110 transition-transform`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-white font-bold">{item.label}</h3>
                                    {item.badge && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{item.badge}</span>}
                                </div>
                                <p className="text-white/40 text-xs">{item.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Header + Upload Btn */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">My Courses</h2>
                        <p className="text-white/50 text-sm mt-1">Submit courses for admin review. Each upload is ₹499.</p>
                    </div>
                    <button
                        onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY_FORM }); setPaymentDone(false); }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Upload New Course
                    </button>
                </div>

                {/* Courses List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="glass-card p-16 text-center">
                        <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h3 className="text-white text-lg font-semibold">No courses yet</h3>
                        <p className="text-white/50 mt-2">Click "Upload New Course" to submit your first course for review.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {courses.map((course: any) => (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-white font-semibold">{course.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(course.approvalStatus)}`}>
                                            {course.approvalStatus.charAt(0).toUpperCase() + course.approvalStatus.slice(1)}
                                        </span>
                                    </div>
                                    <p className="text-white/50 text-sm line-clamp-1">{course.description}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {course.difficulty}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.estimatedTime}</span>
                                        <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {course.isPremium ? 'Premium' : 'Free'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/instructor/courses/${course._id}/curriculum`)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 hover:bg-primary-500/20 font-semibold text-sm transition-colors"
                                    >
                                        <Layout className="w-4 h-4" /> Manage Content
                                    </button>
                                    <button onClick={() => openEdit(course)} className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white/50 hover:text-blue-400 transition-colors">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteMutation.mutate(course._id)} className="p-2.5 rounded-xl border border-white/10 hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Course Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95 }}
                            className="bg-dark-800 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">{editId ? 'Edit Course' : 'Upload New Course'}</h3>
                                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-full text-white/50">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input type="text" placeholder="Course title *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field w-full" />
                                <textarea placeholder="Course description *" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field w-full min-h-[100px]" />
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="input-field bg-dark-900">
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                    <input type="text" placeholder="Estimated time (e.g. 10 hours)" value={form.estimatedTime} onChange={e => setForm({ ...form, estimatedTime: e.target.value })} className="input-field" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Category (e.g. Web Dev, AI)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field" />
                                    <input type="text" placeholder="Skill tags (comma separated)" value={form.skillTags} onChange={e => setForm({ ...form, skillTags: e.target.value })} className="input-field" />
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={form.isPremium} onChange={e => setForm({ ...form, isPremium: e.target.checked })} className="w-5 h-5 rounded accent-primary-500" />
                                    <span className="text-white/70">Mark as Premium Course (students need subscription)</span>
                                </label>

                                {!editId && (
                                    <div className={`p-4 rounded-xl border ${paymentDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-semibold flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-yellow-400" /> Upload Fee: ₹499
                                                </p>
                                                <p className="text-white/50 text-xs mt-1">One-time listing fee. Admin review within 24 hrs.</p>
                                            </div>
                                            {!paymentDone ? (
                                                <button type="button" onClick={() => { toast.success('Payment successful! (Simulated)'); setPaymentDone(true); }}
                                                    className="px-4 py-2 bg-yellow-500 text-dark-900 rounded-xl font-bold text-sm hover:bg-yellow-400 transition-colors">
                                                    Pay Now
                                                </button>
                                            ) : (
                                                <span className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                                                    <CheckCircle className="w-4 h-4" /> Paid
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button type="submit" disabled={submitMutation.isPending} className="btn-primary w-full">
                                    {submitMutation.isPending ? 'Submitting...' : editId ? 'Update & Resubmit' : 'Submit for Admin Review'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

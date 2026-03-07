import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { skillAPI } from '../../services/api';
import { Course } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Star, Clock, User, ChevronRight, Lock, CheckCircle, Target, Bookmark, Download, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SkillUp() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const navigate = useNavigate();

    // Fetch courses
    const { data: courses, isLoading } = useQuery({
        queryKey: ['courses', { keyword: searchQuery, difficulty }],
        queryFn: () => skillAPI.searchCourses({ keyword: searchQuery, difficulty }).then(r => r.data.courses)
    });

    const upgradeMutation = useMutation({
        mutationFn: () => skillAPI.upgradeSubscription({ planId: 'premium_1_month' }),
        onSuccess: () => {
            toast.success('Successfully upgraded to Premium!');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Upgrade failed');
        }
    });

    const toggleWishlistMutation = useMutation({
        mutationFn: (courseId: string) => skillAPI.toggleWishlist(courseId),
        onSuccess: () => {
            toast.success('Wishlist updated');
            queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
        }
    });

    const enrollMutation = useMutation({
        mutationFn: (courseId: string) => skillAPI.enrollCourse(courseId),
        onSuccess: (_, courseId) => {
            toast.success('Successfully enrolled! Welcome to the course.');
            setSelectedCourse(null);
            navigate(`/student/skill-up/${courseId}`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to enroll');
        }
    });

    return (
        <div className="p-8 space-y-8 pb-24 relative max-w-7xl mx-auto">
            {/* Header / Hero */}
            <div className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <Target className="w-8 h-8 text-primary-400" /> Skill Up Platform
                        </h1>
                        <p className="text-white/70 max-w-xl">
                            Discover learning packages to close your skill gap. From crash courses to complete roadmaps—build the exact skills top employers are looking for.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/student/premium')}
                        className="btn-primary whitespace-nowrap bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 border-none shadow-[0_0_20px_rgba(234,179,8,0.3)] text-dark-900 group"
                    >
                        <Sparkles className="w-4 h-4 mr-2 inline group-hover:rotate-12 transition-transform" />
                        Explore Premium
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search skills (e.g., Python, UI/UX, Data Science)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-12 w-full bg-dark-900/50 border-white/10 backdrop-blur-md focus:bg-dark-800"
                        />
                    </div>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="input-field sm:w-48 bg-dark-900/50 border-white/10 backdrop-blur-md"
                    >
                        <option value="" className="bg-dark-800">All Levels</option>
                        <option value="Beginner" className="bg-dark-800">Beginner</option>
                        <option value="Intermediate" className="bg-dark-800">Intermediate</option>
                        <option value="Advanced" className="bg-dark-800">Advanced</option>
                    </select>
                </div>
            </div>

            {/* Courses Grid */}
            <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary-400" /> Recommended Learning Packages
                </h2>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-72 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : courses?.length === 0 ? (
                    <div className="glass-card p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-white/40" />
                        </div>
                        <h3 className="text-white font-semibold text-lg">No courses found</h3>
                        <p className="text-white/50 max-w-sm mt-2">Try adjusting your search terms or selecting a different difficulty level.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses?.map((course: Course, i: number) => (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card flex flex-col overflow-hidden group hover:border-primary-500/50 transition-all duration-300"
                            >
                                {/* Course Status Header */}
                                <div className="p-5 border-b border-white/5 relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide ${course.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                                            course.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-purple-500/20 text-purple-400'
                                            }`}>
                                            {course.difficulty}
                                        </span>
                                        {course.isPremium && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md">
                                                <Lock className="w-3 h-3" /> Premium
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-white/50 text-sm mt-2 line-clamp-2">
                                        {course.description}
                                    </p>
                                </div>

                                {/* Meta Info */}
                                <div className="p-5 flex-1 flex flex-col justify-end text-sm text-white/60 space-y-3">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {course.instructor}</span>
                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {course.estimatedTime}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-yellow-400">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="font-semibold">{course.rating}</span>
                                        </div>
                                        <span className="text-white/40">{course.skillTags.length} Skills covered</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {course.skillTags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-xs px-2 py-1 bg-white/5 rounded text-white/70">
                                                {tag}
                                            </span>
                                        ))}
                                        {course.skillTags.length > 3 && (
                                            <span className="text-xs px-2 py-1 bg-white/5 rounded text-white/50">
                                                +{course.skillTags.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action bar */}
                                <div className="p-4 border-t border-white/5 flex gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => toggleWishlistMutation.mutate(course._id)}
                                        className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 transition-colors"
                                    >
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedCourse(course)}
                                        className="flex-1 btn-primary flex items-center justify-center gap-2 group/btn"
                                    >
                                        Start Learning <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Course Modal */}
            <AnimatePresence>
                {selectedCourse && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-dark-800 border border-white/10 p-8 rounded-3xl max-w-3xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    {selectedCourse.isPremium && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-md uppercase tracking-wider mb-3">
                                            <Lock className="w-3.5 h-3.5" /> Premium Content
                                        </span>
                                    )}
                                    <h2 className="text-2xl font-bold text-white mb-2">{selectedCourse.title}</h2>
                                    <p className="text-white/60">{selectedCourse.description}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedCourse(null)}
                                    className="p-2 hover:bg-white/10 rounded-full text-white/50 transition-colors"
                                >
                                    <Search className="w-5 h-5 rotate-45" /> {/* Use search as X to avoid adding new icons */}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white/5 p-3 rounded-xl">
                                    <p className="text-xs text-white/40 mb-1">Time</p>
                                    <p className="font-semibold text-white flex items-center gap-2"><Clock className="w-4 h-4 text-primary-400" /> {selectedCourse.estimatedTime}</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl">
                                    <p className="text-xs text-white/40 mb-1">Level</p>
                                    <p className="font-semibold text-white">{selectedCourse.difficulty}</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl">
                                    <p className="text-xs text-white/40 mb-1">Rating</p>
                                    <p className="font-semibold text-white flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> {selectedCourse.rating}/5</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl">
                                    <p className="text-xs text-white/40 mb-1">Instructor</p>
                                    <p className="font-semibold text-white truncate">{selectedCourse.instructor}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Learning Package Includes:</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-white/80">
                                            <div className="w-8 h-8 rounded bg-primary-500/20 flex items-center justify-center text-primary-400"><BookOpen className="w-4 h-4" /></div>
                                            Full Video Course Modules
                                        </li>
                                        <li className="flex items-center gap-3 text-white/80">
                                            <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400"><CheckCircle className="w-4 h-4" /></div>
                                            Practice Exercises & Quizzes
                                        </li>
                                        <li className="flex items-center gap-3 text-white/80 opacity-50">
                                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center"><Download className="w-4 h-4" /></div>
                                            Downloadable Study Notes (Premium only)
                                        </li>
                                        <li className="flex items-center gap-3 text-white/80 opacity-50">
                                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center"><Target className="w-4 h-4" /></div>
                                            Interview Prep Guide (Premium only)
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-5 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <h4 className="text-white font-semibold">Ready to master {selectedCourse.skillTags[0] || 'this skill'}?</h4>
                                        <p className="text-white/60 text-sm mt-1">Enroll now and access your learning dashboard.</p>
                                    </div>
                                    <button
                                        disabled={enrollMutation.isPending}
                                        className="btn-primary"
                                        onClick={() => enrollMutation.mutate(selectedCourse._id)}
                                    >
                                        {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

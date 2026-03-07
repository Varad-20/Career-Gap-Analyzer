import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { skillAPI } from '../../services/api';
import { Course, Lesson } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, PlayCircle, FileText, CheckCircle, Video, Download,
    ChevronRight, ChevronDown, Lock, Play, Layout, MessageSquare, X, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseDashboard() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [expandedModule, setExpandedModule] = useState<number | null>(0);
    const [showQueryModal, setShowQueryModal] = useState(false);
    const [queryForm, setQueryForm] = useState({ subject: '', text: '' });
    const [isSending, setIsSending] = useState(false);

    const { data: course, isLoading, isError } = useQuery({
        queryKey: ['courseDetails', courseId],
        queryFn: () => skillAPI.getCourseDetails(courseId as string).then(res => res.data.course as Course),
        enabled: !!courseId,
    });

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (isError || !course) {
        return (
            <div className="p-8 text-center text-white/50 min-h-screen">
                Failed to load course details. Ensure you have the required subscription.
                <br />
                <button onClick={() => navigate('/student/skill-up')} className="text-primary-400 mt-4 hover:underline">
                    &larr; Return to Library
                </button>
            </div>
        );
    }

    const handleSendQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        try {
            await skillAPI.createQuery({
                courseId: courseId as string,
                subject: queryForm.subject,
                text: queryForm.text
            });
            toast.success('Your query has been sent to the instructor!');
            setShowQueryModal(false);
            setQueryForm({ subject: '', text: '' });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send query');
        } finally {
            setIsSending(false);
        }
    };

    const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto pb-24">
            <button
                onClick={() => navigate('/student/skill-up')}
                className="flex items-center text-white/50 hover:text-white transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
            </button>

            {/* Video Player Section */}
            <AnimatePresence>
                {selectedLesson && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-8 rounded-3xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-white/5 shadow-2xl"
                    >
                        {selectedLesson.videoUrl ? (
                            <iframe
                                className="w-full h-full"
                                src={selectedLesson.videoUrl.replace('watch?v=', 'embed/')}
                                title={selectedLesson.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="text-center p-12">
                                <Video className="w-16 h-16 text-white/20 mx-auto mb-4" />
                                <p className="text-white font-bold text-xl mb-2">{selectedLesson.title}</p>
                                <p className="text-white/50 max-w-md mx-auto">{selectedLesson.content || 'This lesson has reading material but no video lecture.'}</p>
                            </div>
                        )}
                        <button
                            onClick={() => setSelectedLesson(null)}
                            className="absolute top-6 right-6 bg-dark-900/80 backdrop-blur-md text-white/80 hover:text-white px-4 py-2 rounded-xl border border-white/10"
                        >
                            &times; Close Player
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-gradient-to-r from-dark-800 to-dark-900 border border-white/5 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full uppercase tracking-wider">{course.category}</span>
                        <h1 className="text-3xl font-bold text-white mt-3 mb-2">{course.title}</h1>
                        <p className="text-white/60 max-w-2xl">{course.description}</p>
                    </div>
                    <button
                        onClick={() => setShowQueryModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-semibold transition-all hover:scale-105 active:scale-95 group"
                    >
                        <MessageSquare className="w-5 h-5 text-primary-400 group-hover:rotate-12 transition-transform" />
                        Ask Instructor
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 pt-4">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                        <Layout className="w-5 h-5 text-primary-400" /> Curriculum ( {totalLessons} Lessons )
                    </h2>

                    <div className="space-y-3">
                        {course.modules?.map((module, mIdx) => (
                            <div key={mIdx} className="glass-card overflow-hidden">
                                <button
                                    onClick={() => setExpandedModule(expandedModule === mIdx ? null : mIdx)}
                                    className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                                >
                                    <h3 className="text-white font-semibold flex items-center gap-3">
                                        <div className="text-xs font-bold text-white/30 w-5">{(mIdx + 1).toString().padStart(2, '0')}</div>
                                        {module.title}
                                    </h3>
                                    {expandedModule === mIdx ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
                                </button>

                                <AnimatePresence>
                                    {expandedModule === mIdx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-white/5 bg-dark-800/20"
                                        >
                                            <div className="p-2 space-y-1">
                                                {module.lessons?.map((lesson, lIdx) => (
                                                    <button
                                                        key={lIdx}
                                                        onClick={() => setSelectedLesson(lesson)}
                                                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group ${selectedLesson?.title === lesson.title ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
                                                    >
                                                        <div className="flex items-center gap-4 text-left">
                                                            <div className={`p-1.5 rounded-lg ${selectedLesson?.title === lesson.title ? 'bg-primary-500 text-dark-900' : 'bg-white/5 text-white/30 group-hover:text-primary-400 group-hover:bg-primary-500/10'}`}>
                                                                <Play className="w-3 h-3 fill-current" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{lesson.title}</p>
                                                                <p className="text-[10px] opacity-50">{lesson.duration}</p>
                                                            </div>
                                                        </div>
                                                        {lesson.isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-3.5 h-3.5 opacity-20" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white mb-2">Learning Assets</h3>

                        {course.resources?.length > 0 ? course.resources.map((res, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 text-left">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-white/5 ${res.type === 'PDF' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-white text-sm font-medium">{res.title}</p>
                                        <p className="text-white/40 text-[10px] font-bold uppercase">{res.type}</p>
                                    </div>
                                </div>
                                <Download className="w-4 h-4 text-white/40" />
                            </button>
                        )) : (
                            <p className="text-white/30 text-xs py-4 text-center">No additional materials for this course yet.</p>
                        )}

                        {course.mockTests?.length > 0 && (
                            <div className="pt-4 border-t border-white/5">
                                <h4 className="text-sm font-bold text-white mb-3">Mock Assessments</h4>
                                {course.mockTests.map((test, i) => (
                                    <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl bg-primary-500/5 hover:bg-primary-500/10 transition-colors border border-primary-500/20 text-left group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{test.title}</p>
                                                <p className="text-primary-400 text-[10px] font-bold uppercase">{test.duration} MINS</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Query Modal */}
            <AnimatePresence>
                {showQueryModal && (
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
                            className="bg-dark-800 border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <MessageSquare className="w-6 h-6 text-primary-400" />
                                    Ask the Instructor
                                </h3>
                                <button onClick={() => setShowQueryModal(false)} className="p-2 hover:bg-white/5 rounded-full text-white/50">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSendQuery} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Subject</label>
                                    <input
                                        type="text"
                                        placeholder="Brief topic of your doubt..."
                                        required
                                        value={queryForm.subject}
                                        onChange={e => setQueryForm({ ...queryForm, subject: e.target.value })}
                                        className="input-field w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Message</label>
                                    <textarea
                                        placeholder="Details of what you'd like to ask..."
                                        required
                                        value={queryForm.text}
                                        onChange={e => setQueryForm({ ...queryForm, text: e.target.value })}
                                        className="input-field w-full min-h-[150px] py-4"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-lg"
                                >
                                    {isSending ? 'Sending...' : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Send Query</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-white/30 text-center uppercase tracking-widest mt-4">
                                    Instructor will be notified and will reply shortly.
                                </p>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

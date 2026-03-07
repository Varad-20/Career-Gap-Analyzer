import { useQuery } from '@tanstack/react-query';
import { instructorAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { Users, Mail, GraduationCap, Calendar, BarChart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InstructorStudents() {
    const navigate = useNavigate();

    const { data: students = [], isLoading } = useQuery({
        queryKey: ['instructorEnrolledStudents'],
        queryFn: () => instructorAPI.getEnrolledStudents().then(r => r.data.students)
    });

    if (isLoading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">Loading students...</div>;

    return (
        <div className="min-h-screen bg-dark-900 pb-20">
            {/* Header */}
            <header className="border-b border-white/5 bg-dark-800/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/instructor/dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Dashboard</span>
                    </button>
                    <h1 className="text-white font-bold">Enrolled Students</h1>
                    <div className="flex items-center gap-2 bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/20">
                        <Users className="w-3 h-3 text-primary-400" />
                        <span className="text-primary-400 font-bold text-xs">{students.length} Total</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-10">
                {students.length === 0 ? (
                    <div className="glass-card p-16 text-center">
                        <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h3 className="text-white text-lg font-semibold">No students enrolled yet</h3>
                        <p className="text-white/50 mt-2">Promote your courses to reach more learners!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {students.map((student: any) => (
                            <motion.div
                                key={student._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card p-6 border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row gap-8"
                            >
                                {/* Left: Student Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 font-bold text-xl">
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg leading-tight">{student.name}</h3>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-white/40">
                                                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {student.email}</span>
                                                    {student.degree && <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> {student.degree}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mid: Enrolled in... */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Enrolled Courses & Progress</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {student.enrolledIn.map((en: any, i: number) => (
                                                <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 transition-colors hover:bg-white/[0.07]">
                                                    <p className="text-white text-sm font-medium mb-2">{en.courseTitle}</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full bg-primary-500 transition-all duration-1000 ${en.completed ? 'bg-emerald-500' : ''}`}
                                                                style={{ width: `${en.progress}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-[10px] font-bold ${en.completed ? 'text-emerald-400' : 'text-primary-400'}`}>
                                                            {en.progress}%
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="flex items-center gap-1 text-[10px] text-white/30 truncate">
                                                            <Calendar className="w-3 h-3" /> Enrolled: {new Date(en.enrolledAt).toLocaleDateString()}
                                                        </span>
                                                        {en.completed && (
                                                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                                                                <BarChart className="w-3 h-3" /> Completed
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

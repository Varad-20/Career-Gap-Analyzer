import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    FileText, Target, Briefcase, TrendingUp, AlertTriangle,
    CheckCircle, Clock, Star, Upload, ArrowRight, Sparkles, Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { studentAPI, agentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Student } from '../../types';

const getRiskColor = (level: string) => {
    if (level === 'Low') return 'badge-green';
    if (level === 'Medium') return 'badge-yellow';
    return 'badge-red';
};

const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-shade-red-600';
};

export default function StudentDashboard() {
    const { user } = useAuth();
    const student = user as Student;

    const { data: statsData, isLoading } = useQuery({
        queryKey: ['studentDashboard'],
        queryFn: () => studentAPI.getDashboard().then(r => r.data.stats),
    });

    const { data: jobData } = useQuery({
        queryKey: ['agent-jobs'],
        queryFn: () => agentAPI.getJobResults().then(r => r.data),
        enabled: !!student.resumeURL,
    });

    const stats = statsData || {};
    const aiJobsCount = jobData?.jobs?.length || 0;

    const statCards = [
        { label: 'Resume Score', value: `${stats.resumeScore || 0}%`, icon: FileText, color: 'text-shade-blue-600', bg: 'bg-shade-blue-500/10' },
        { label: 'AI Jobs Found', value: student.resumeURL ? `${aiJobsCount}` : '0', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
        { label: 'Skills Found', value: stats.skillsCount || 0, icon: Star, color: 'text-shade-blue-700', bg: 'bg-shade-blue-500/10' },
        { label: 'Gap Duration', value: `${stats.gapDuration || 0} mo`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    ];

    if (isLoading) {
        return (
            <div className="p-8 space-y-6">
                <div className="h-8 w-64 bg-slate-200/60 rounded-xl animate-pulse" />
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-200/60 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Welcome back, {user?.name?.split(' ')[0]} <Sparkles className="w-5 h-5 text-shade-blue-600" />
                    </h1>
                    <p className="text-slate-600 mt-1 text-sm font-medium">Here's what's happening with your job search</p>
                </div>
                {!student.resumeURL && (
                    <Link to="/student/resume" className="btn-primary flex items-center gap-2 text-sm">
                        <Upload className="w-4 h-4" /> Upload Resume
                    </Link>
                )}
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="stat-card"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">{label}</p>
                                <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center border border-slate-200/60 shadow-sm`}>
                                <Icon className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* AI Agent Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 border-shade-blue-500/25 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-shade-blue-500/10 border border-shade-blue-500/25 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Bot className="w-7 h-7 text-shade-blue-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900">AI Job Agent Active</h2>
                            <span className="badge-blue text-[10px]">Auto-Scraping</span>
                        </div>
                        <p className="text-slate-600 text-sm mt-0.5 max-w-xl font-medium">
                            Our AI agent scans LinkedIn, Indeed, Naukri & Wellfound for career-gap friendly roles matching your profile.
                        </p>
                    </div>
                </div>
                <Link to="/student/agent" className="btn-primary text-sm flex items-center gap-2 flex-shrink-0">
                    Open Job Agent <ArrowRight className="w-4 h-4" />
                </Link>
            </motion.div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Career Gap Analysis */}
                <div className="glass-card p-6 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">Career Gap Analysis</h2>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100/80 border border-slate-200/60">
                        <div>
                            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Gap Duration</p>
                            <p className="text-xl font-bold text-slate-900">{stats.gapDuration || 0} Months</p>
                        </div>
                        <div>
                            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Risk Assessment</p>
                            <span className={`badge ${getRiskColor(stats.gapRisk || 'Low')}`}>
                                {stats.gapRisk || 'Low'} Risk
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-2 font-semibold">
                            <span className="text-slate-700">Overall Match Potential</span>
                            <span className={getScoreColor(stats.resumeScore || 0)}>{stats.resumeScore || 0}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${stats.resumeScore || 0}%` }} />
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                        <Link to="/student/resume" className="btn-secondary text-center text-sm">
                            Detailed Gap Report
                        </Link>
                        <Link to="/student/skill-gap" className="btn-ghost text-center text-sm">
                            View Missing Skills
                        </Link>
                    </div>
                </div>

                {/* Recommended Jobs */}
                <div className="lg:col-span-2 glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Recommended Gap-Friendly Jobs</h2>
                        <Link to="/student/agent" className="text-shade-blue-600 hover:text-shade-blue-700 text-sm font-semibold flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {jobData?.jobs?.length > 0 ? (
                        <div className="space-y-3">
                            {jobData.jobs.slice(0, 3).map((job: any) => (
                                <div key={job.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-shade-blue-500/30 transition-all flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                                        <p className="text-slate-600 text-xs font-medium">{job.company} • {job.location}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="badge-blue text-[10px]">{job.sourcePlatform || job.source}</span>
                                            <span className="badge-green text-[10px]">{job.matchScore}% Match</span>
                                        </div>
                                    </div>
                                    <a href={job.applyLink} target="_blank" rel="noreferrer" className="btn-primary py-1.5 px-3 text-xs flex-shrink-0">
                                        Apply Now
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 space-y-2">
                            <Briefcase className="w-10 h-10 mx-auto text-slate-400" />
                            <p className="text-sm font-medium">No job matches yet. Run the AI Job Agent to discover open roles.</p>
                            <Link to="/student/agent" className="btn-primary inline-flex text-xs py-2 px-4 mt-2">
                                Run Job Agent
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
                {[
                    { to: student.resumeURL ? '/student/agent' : '/student/resume', label: 'Launch AI Agent', icon: Bot, desc: student.resumeURL ? `${aiJobsCount} live jobs found` : 'Upload resume first' },
                    { to: '/student/resume', label: 'Improve Resume', icon: TrendingUp, desc: 'Get AI suggestions' },
                    { to: '/student/profile', label: 'Complete Profile', icon: CheckCircle, desc: 'Higher match rates' },
                ].map(({ to, label, icon: Icon, desc }) => (
                    <Link key={to} to={to}
                        className="glass-card-hover p-5 flex items-center gap-4 group shadow-sm"
                    >
                        <div className="w-12 h-12 rounded-xl bg-shade-blue-500/10 border border-shade-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                            <Icon className="w-6 h-6 text-shade-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-900 font-bold text-sm">{label}</p>
                            <p className="text-slate-600 text-xs font-medium">{desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-slate-900 transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
}

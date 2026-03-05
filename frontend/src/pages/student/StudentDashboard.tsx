import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    FileText, Target, Briefcase, TrendingUp, AlertTriangle,
    CheckCircle, Clock, Star, Upload, ArrowRight, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Student } from '../../types';

const getRiskColor = (level: string) => {
    if (level === 'Low') return 'badge-green';
    if (level === 'Medium') return 'badge-yellow';
    return 'badge-red';
};

const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
};

export default function StudentDashboard() {
    const { user } = useAuth();
    const student = user as Student;

    const { data: statsData, isLoading } = useQuery({
        queryKey: ['studentDashboard'],
        queryFn: () => studentAPI.getDashboard().then(r => r.data.stats),
    });

    const { data: matchesData } = useQuery({
        queryKey: ['studentMatches'],
        queryFn: () => studentAPI.getMatches().then(r => r.data),
    });

    const stats = statsData || {};
    const matchCount = matchesData?.count || 0;

    const statCards = [
        { label: 'Resume Score', value: `${stats.resumeScore || 0}%`, icon: FileText, color: 'text-primary-400', bg: 'bg-primary-500/10' },
        { label: 'Job Matches', value: matchCount, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Applications', value: stats.totalApplications || 0, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Gap Duration', value: `${stats.gapDuration || 0} mo`, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    ];

    if (isLoading) {
        return (
            <div className="p-8 space-y-6">
                <div className="h-8 w-64 bg-white/5 rounded-xl animate-pulse" />
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                    <p className="text-white/50 mt-1">Here's what's happening with your job search</p>
                </div>
                <Link to="/student/resume" className="btn-primary flex items-center gap-2 text-sm">
                    <Upload className="w-4 h-4" />
                    Upload Resume
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="stat-card"
                    >
                        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        <p className="text-white/50 text-sm mt-1">{label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Resume Analysis Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-white font-semibold flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary-400" />
                            AI Resume Analysis
                        </h2>
                        {stats.gapRiskLevel && (
                            <span className={getRiskColor(stats.gapRiskLevel)}>
                                {stats.gapRiskLevel} Gap Risk
                            </span>
                        )}
                    </div>

                    {stats.resumeScore ? (
                        <div className="space-y-4">
                            {[
                                { label: 'Resume Score', value: stats.resumeScore, color: 'from-primary-500 to-accent-500' },
                                { label: 'Profile Complete', value: stats.profileComplete ? 100 : 40, color: 'from-emerald-500 to-teal-500' },
                                { label: 'Gap Impact Score', value: Math.max(0, 100 - (stats.gapDuration || 0) * 5), color: 'from-yellow-500 to-orange-500' },
                            ].map(({ label, value, color }) => (
                                <div key={label}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-white/60">{label}</span>
                                        <span className="text-white font-medium">{value}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <motion.div
                                            className={`h-full rounded-full bg-gradient-to-r ${color}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${value}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                            <p className="text-white/50 mb-4">Upload your resume to get AI analysis</p>
                            <Link to="/student/resume" className="btn-primary text-sm py-2 px-6 inline-flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Upload PDF Resume
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* Application Status */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-400" />
                        Applications
                    </h2>

                    <div className="space-y-3">
                        {[
                            { label: 'Pending', count: stats.pendingApplications || 0, color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Clock },
                            { label: 'Shortlisted', count: stats.shortlisted || 0, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Star },
                            { label: 'Accepted', count: stats.accepted || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
                            { label: 'Rejected', count: stats.rejected || 0, color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
                        ].map(({ label, count, color, bg, icon: Icon }) => (
                            <div key={label} className={`flex items-center justify-between p-3 ${bg} rounded-xl`}>
                                <div className="flex items-center gap-2">
                                    <Icon className={`w-4 h-4 ${color}`} />
                                    <span className="text-white/70 text-sm">{label}</span>
                                </div>
                                <span className={`font-bold ${color}`}>{count}</span>
                            </div>
                        ))}
                    </div>

                    <Link to="/student/applications"
                        className="mt-4 btn-ghost text-sm w-full flex items-center justify-center gap-2"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
                {[
                    { to: '/student/matches', label: 'View Matched Jobs', icon: Target, desc: `${matchCount} available matches`, color: 'from-primary-500 to-accent-600' },
                    { to: '/student/resume', label: 'Improve Resume', icon: TrendingUp, desc: 'Get AI suggestions', color: 'from-emerald-600 to-teal-600' },
                    { to: '/student/profile', label: 'Complete Profile', icon: CheckCircle, desc: 'Higher match rates', color: 'from-blue-600 to-indigo-600' },
                ].map(({ to, label, icon: Icon, desc, color }) => (
                    <Link key={to} to={to}
                        className="glass-card-hover p-5 flex items-center gap-4 group"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-medium">{label}</p>
                            <p className="text-white/50 text-sm">{desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/30 ml-auto group-hover:text-white/70 transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
}

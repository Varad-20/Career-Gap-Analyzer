import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, Users, Building2, Briefcase, TrendingUp, Star, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { adminAPI } from '../../services/api.ts';
import { Analytics } from '../../types/index.ts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e'];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({
        queryKey: ['adminAnalytics'],
        queryFn: () => adminAPI.getAnalytics().then(r => r.data.analytics),
    });

    const analytics: Analytics | undefined = data;

    const statCards = [
        { label: 'Total Students', value: analytics?.totalStudents || 0, icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10', link: '/admin/students' },
        { label: 'Companies', value: analytics?.totalCompanies || 0, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10', link: '/admin/companies' },
        { label: 'Active Jobs', value: analytics?.totalJobs || 0, icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10', link: '/admin/jobs' },
        { label: 'Applications', value: analytics?.totalApplications || 0, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10', link: '/admin/applications' },
        { label: 'Gap Candidates', value: analytics?.gapCandidates || 0, icon: Star, color: 'text-accent-400', bg: 'bg-accent-600/10', link: '/admin/students' },
        { label: 'Pending Approval', value: analytics?.pendingCompanies || 0, icon: Building2, color: 'text-orange-400', bg: 'bg-orange-500/10', link: '/admin/companies' },
    ];

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BarChart3 className="w-7 h-7 text-red-400" /> Analytics Dashboard
                </h1>
                <p className="text-white/50 mt-1">Platform overview and statistics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map(({ label, value, icon: Icon, color, bg, link }, i) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => navigate(link)}
                        className="stat-card cursor-pointer hover:border-white/20 transition-all active:scale-[0.98]"
                    >
                        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <p className={`text-3xl font-black ${color}`}>
                            {isLoading ? <span className="block w-12 h-8 bg-white/10 rounded animate-pulse" /> : value}
                        </p>
                        <p className="text-white/50 text-sm mt-1">{label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Pending Approvals Quick Action */}
            {(analytics?.pendingCompanies || 0) > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-yellow-300 font-semibold">{analytics?.pendingCompanies} {analytics?.pendingCompanies === 1 ? 'company' : 'companies'} awaiting approval</p>
                            <p className="text-yellow-400/60 text-xs">These companies cannot post jobs until you approve them</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/admin/companies')}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-dark-900 font-semibold rounded-xl text-sm transition-colors">
                        Review Now <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Skills Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-white font-semibold mb-4">Most In-Demand Skills</h2>
                    {analytics?.topSkills?.length ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={analytics.topSkills.slice(0, 8)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                                <YAxis type="category" dataKey="skill" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} width={80} />
                                <Tooltip
                                    contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', color: '#e2e8f0' }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {analytics.topSkills.slice(0, 8).map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-white/30">No data yet</div>
                    )}
                </motion.div>

                {/* Application Status */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-white font-semibold mb-4">Application Status Breakdown</h2>
                    <div className="space-y-3">
                        {Object.entries(analytics?.applicationStats || {}).map(([status, count]) => {
                            const total = analytics?.totalApplications || 1;
                            const pct = Math.round((count / total) * 100);
                            const colors: Record<string, string> = {
                                pending: 'from-yellow-500 to-orange-500',
                                reviewed: 'from-blue-500 to-indigo-500',
                                shortlisted: 'from-purple-500 to-violet-500',
                                accepted: 'from-emerald-500 to-teal-500',
                                rejected: 'from-red-500 to-rose-500',
                            };
                            return (
                                <div key={status}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white/60 capitalize">{status}</span>
                                        <span className="text-white font-medium">{count} ({pct}%)</span>
                                    </div>
                                    <div className="progress-bar">
                                        <motion.div
                                            className={`h-full rounded-full bg-gradient-to-r ${colors[status] || 'from-white/20 to-white/40'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {!Object.keys(analytics?.applicationStats || {}).length && (
                            <p className="text-white/30 text-sm text-center py-8">No applications yet</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

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
        { label: 'Total Registered Students', value: analytics?.totalStudents || 0, icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10', link: '/admin/students' },
        { label: 'Students with Career Gaps', value: analytics?.gapCandidates || 0, icon: Star, color: 'text-accent-400', bg: 'bg-accent-600/10', link: '/admin/students' },
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {statCards.map(({ label, value, icon: Icon, color, bg, link }, i) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => navigate(link)}
                        className="stat-card cursor-pointer hover:border-white/20 transition-all active:scale-[0.98] p-6 flex items-center gap-5"
                    >
                        <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-7 h-7 ${color}`} />
                        </div>
                        <div>
                            <p className={`text-4xl font-black ${color}`}>
                                {isLoading ? <span className="block w-12 h-10 bg-white/10 rounded animate-pulse" /> : value}
                            </p>
                            <p className="text-white/50 text-sm mt-1">{label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Welcome banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div className="space-y-2">
                    <h2 className="text-white font-bold text-xl">Manage Students & Review Courses</h2>
                    <p className="text-white/50 text-sm max-w-lg">
                        Use the sidebar to view detailed student profiles, check their career gap durations, list their extracted skills, or review courses submitted by instructors.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/admin/students')} className="btn-primary flex items-center gap-2 text-sm">
                        View Students <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

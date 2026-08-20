import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Award, Users, DollarSign, Building2 } from 'lucide-react';
import { coordinatorAPI } from '../../services/api';

const BAR_COLORS = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-yellow-500', 'bg-red-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500'];

export default function PlacementStats() {
    const { data, isLoading } = useQuery({
        queryKey: ['coord-stats'],
        queryFn: () => coordinatorAPI.getPlacementStats().then(r => r.data),
    });

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
    );

    const { stats, branchStats = [], companyStats = [], monthlyPlacements = [] } = data || {};

    const maxBranchPlaced = Math.max(...branchStats.map((b: any) => b.total || 1), 1);
    const maxCompanyCount = Math.max(...companyStats.map((c: any) => c.count || 1), 1);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Placement Analytics</h1>
                <p className="text-white/40 text-sm mt-1">Comprehensive placement statistics for your college</p>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Students', value: stats?.totalStudents || 0, sub: 'registered', color: 'text-blue-400', icon: Users },
                    { label: 'Students Placed', value: stats?.placedStudents || 0, sub: `${stats?.placementRate || 0}% rate`, color: 'text-emerald-400', icon: Award },
                    { label: 'Avg Package', value: `${stats?.avgPackage || 0} LPA`, sub: `Max: ${stats?.maxPackage || 0} LPA`, color: 'text-yellow-400', icon: DollarSign },
                    { label: 'Min Package', value: `${stats?.minPackage || 0} LPA`, sub: 'lowest offer', color: 'text-white/60', icon: TrendingUp },
                ].map(m => (
                    <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-white/40 text-sm">{m.label}</p>
                                <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
                                <p className="text-white/30 text-xs mt-1">{m.sub}</p>
                            </div>
                            <m.icon className={`w-5 h-5 ${m.color}`} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Branch-wise placement */}
                <div className="glass-card p-5">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-violet-400" /> Branch-wise Placement
                    </h2>
                    {branchStats.length === 0 ? (
                        <p className="text-white/30 text-sm text-center py-8">No data</p>
                    ) : (
                        <div className="space-y-4">
                            {branchStats.map((b: any, i: number) => {
                                const rate = b.total > 0 ? Math.round((b.placed / b.total) * 100) : 0;
                                return (
                                    <div key={b._id || i}>
                                        <div className="flex items-center justify-between text-sm mb-1.5">
                                            <span className="text-white/80 font-medium">{b._id || 'Unknown'}</span>
                                            <span className="text-white/50">{b.placed} / {b.total} placed ({rate}%)</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }} animate={{ width: `${rate}%` }}
                                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                                className={`h-full ${BAR_COLORS[i % BAR_COLORS.length]} rounded-full`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Company-wise hires */}
                <div className="glass-card p-5">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-violet-400" /> Top Hiring Companies
                    </h2>
                    {companyStats.length === 0 ? (
                        <p className="text-white/30 text-sm text-center py-8">No placements yet</p>
                    ) : (
                        <div className="space-y-3">
                            {companyStats.slice(0, 8).map((c: any, i: number) => (
                                <div key={c._id} className="flex items-center gap-3">
                                    <span className="text-white/30 text-sm w-4">{i + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-white/70 text-sm">{c.companyName || c._id}</span>
                                            <span className="text-white/50 text-xs">{c.count} hires · {c.avgPackage?.toFixed(1)} LPA avg</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }} animate={{ width: `${(c.count / maxCompanyCount) * 100}%` }}
                                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                                className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Placement funnel */}
                <div className="glass-card p-5">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-violet-400" /> Placement Funnel
                    </h2>
                    {[
                        { label: 'Total Students', value: stats?.totalStudents || 0, color: 'bg-blue-500' },
                        { label: 'Placed', value: stats?.placedStudents || 0, color: 'bg-emerald-500' },
                        { label: 'Opted Out', value: stats?.optedOut || 0, color: 'bg-yellow-500' },
                        { label: 'Still Seeking', value: stats?.notPlaced || 0, color: 'bg-red-500' },
                    ].map((f, i) => (
                        <div key={f.label} className="flex items-center gap-4 mb-3">
                            <div className="w-28 text-sm text-white/60 flex-shrink-0">{f.label}</div>
                            <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }} animate={{ width: `${stats?.totalStudents > 0 ? (f.value / stats.totalStudents) * 100 : 0}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.15 }}
                                    className={`h-full ${f.color} rounded-lg flex items-center justify-end pr-2`}>
                                    {f.value > 0 && <span className="text-white text-xs font-bold">{f.value}</span>}
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Monthly placements */}
                <div className="glass-card p-5">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Award className="w-4 h-4 text-violet-400" /> Monthly Placement Trend
                    </h2>
                    {monthlyPlacements.length === 0 ? (
                        <p className="text-white/30 text-sm text-center py-8">No placement data</p>
                    ) : (
                        <div className="space-y-3">
                            {monthlyPlacements.map((m: any, i: number) => {
                                const maxCount = Math.max(...monthlyPlacements.map((x: any) => x.count), 1);
                                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-white/50 text-sm w-20 flex-shrink-0">
                                            {months[m._id.month - 1]} {m._id.year}
                                        </span>
                                        <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }} animate={{ width: `${(m.count / maxCount) * 100}%` }}
                                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full flex items-center justify-end pr-2">
                                                <span className="text-white text-xs font-bold">{m.count}</span>
                                            </motion.div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

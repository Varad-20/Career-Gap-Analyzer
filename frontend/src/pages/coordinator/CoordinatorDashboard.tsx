import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Users, Briefcase, TrendingUp, Award, Building2, Calendar,
    ChevronRight, CheckCircle, Clock, Zap, BarChart3, ArrowRight
} from 'lucide-react';
import { coordinatorAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-white/50 text-sm">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
            </div>
            <div className={`p-2.5 rounded-xl ${color.replace('text-', 'bg-').replace('400', '500/15')}`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
        </div>
    </motion.div>
);

export default function CoordinatorDashboard() {
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['coordinator-dashboard'],
        queryFn: () => coordinatorAPI.getDashboard().then(r => r.data),
    });

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
    );

    const { stats, branchStats = [], recentPlacements = [], upcomingDrives = [] } = data || {};

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Placement Dashboard</h1>
                <p className="text-white/40 text-sm mt-1">Overview of your college placement activity</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Students" value={stats?.totalStudents || 0} color="text-blue-400" />
                <StatCard icon={CheckCircle} label="Students Placed" value={stats?.placedStudents || 0}
                    sub={`${stats?.placementRate || 0}% placement rate`} color="text-emerald-400" />
                <StatCard icon={TrendingUp} label="Avg Package" value={`${stats?.avgPackage || 0} LPA`}
                    sub={`Max: ${stats?.maxPackage || 0} LPA`} color="text-yellow-400" />
                <StatCard icon={Briefcase} label="Active Drives" value={stats?.activeDrives || 0}
                    sub={`${stats?.completedDrives || 0} completed`} color="text-violet-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Upcoming drives */}
                <div className="glass-card p-5 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-violet-400" /> Upcoming Drives
                        </h2>
                        <button onClick={() => navigate('/coordinator/drives')}
                            className="text-white/40 hover:text-white/70 text-sm flex items-center gap-1">
                            View all <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    {upcomingDrives.length === 0 ? (
                        <div className="text-center py-8">
                            <Briefcase className="w-8 h-8 text-white/20 mx-auto mb-2" />
                            <p className="text-white/40 text-sm">No upcoming drives</p>
                            <button onClick={() => navigate('/coordinator/drives')} className="btn-primary mt-3 text-sm">
                                Create Drive
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingDrives.map((d: any) => (
                                <div key={d._id} onClick={() => navigate(`/coordinator/drives/${d._id}`)}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-white/3 hover:bg-white/5 cursor-pointer transition-all border border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                                        {d.company?.logo
                                            ? <img src={d.company.logo} alt="" className="w-full h-full object-cover" />
                                            : <Building2 className="w-4 h-4 text-white/40" />
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium">{d.title}</p>
                                        <p className="text-white/40 text-xs">{d.company?.companyName} · {new Date(d.driveDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white text-sm font-semibold">{d.totalRegistered}</p>
                                        <p className="text-white/30 text-xs">registered</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/20" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Branch-wise stats */}
                <div className="glass-card p-5">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-violet-400" /> Branch Performance
                    </h2>
                    {branchStats.length === 0 ? (
                        <p className="text-white/30 text-sm text-center py-8">No data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {branchStats.map((b: any) => (
                                <div key={b._id}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-white/70">{b._id || 'Unknown'}</span>
                                        <span className="text-white/50">{b.placed}/{b.total}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all"
                                            style={{ width: `${b.total > 0 ? (b.placed / b.total) * 100 : 0}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <button onClick={() => navigate('/coordinator/stats')}
                        className="w-full mt-4 btn-secondary text-sm flex items-center justify-center gap-2">
                        Full Analytics <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Recent placements */}
            {recentPlacements.length > 0 && (
                <div className="glass-card p-5">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-400" /> Recent Placements
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {recentPlacements.map((p: any) => (
                            <div key={p._id} className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                                    {p.student?.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{p.student?.name}</p>
                                    <p className="text-emerald-400/70 text-xs truncate">{p.drive?.jobRole} · {p.offeredPackage} LPA</p>
                                </div>
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

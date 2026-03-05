import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Briefcase, Users, CheckCircle, Clock, PlusCircle, ArrowRight, Building2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { companyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Company } from '../../types';

export default function CompanyDashboard() {
    const { user } = useAuth();
    const company = user as Company;

    const { data: statsData } = useQuery({
        queryKey: ['companyDashboard'],
        queryFn: () => companyAPI.getDashboard().then(r => r.data.stats),
    });

    const { data: jobsData } = useQuery({
        queryKey: ['companyJobs'],
        queryFn: () => companyAPI.getJobs().then(r => r.data.jobs),
    });

    const stats = statsData || {};
    const jobs = jobsData || [];

    const statCards = [
        { label: 'Active Jobs', value: stats.activeJobs || 0, icon: Briefcase, color: 'text-primary-400', bg: 'bg-primary-500/10' },
        { label: 'Total Applications', value: stats.totalApplications || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Pending Review', value: stats.pendingReview || 0, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { label: 'Accepted', value: stats.accepted || 0, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    ];

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Welcome, {user?.name} 👋</h1>
                    <p className="text-white/50 mt-1">Manage your job postings and applications</p>
                </div>
                <div className="flex items-center gap-3">
                    {!company?.isApproved && (
                        <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
                            ⏳ Awaiting admin approval
                        </div>
                    )}
                    <Link to="/company/post-job" className="btn-primary flex items-center gap-2 text-sm">
                        <PlusCircle className="w-4 h-4" /> Post New Job
                    </Link>
                </div>
            </div>

            {/* Stats */}
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

            {/* Job Listings */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white font-semibold">Your Job Postings</h2>
                    <Link to="/company/post-job" className="btn-ghost text-sm flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" /> Add New
                    </Link>
                </div>

                {jobs.length === 0 ? (
                    <div className="text-center py-10">
                        <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/50 mb-4">No job postings yet</p>
                        <Link to="/company/post-job" className="btn-primary text-sm inline-flex items-center gap-2">
                            <PlusCircle className="w-4 h-4" /> Post First Job
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {jobs.map((job: any, i: number) => (
                            <motion.div
                                key={job._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${job.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    <div>
                                        <p className="text-white font-medium">{job.jobRole}</p>
                                        <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                                            <span>{job.location || 'Remote'}</span>
                                            <span>{job.jobType}</span>
                                            {job.acceptGap && <span className="text-emerald-400">Gap Friendly ✓</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-white/50 text-xs">Applications</p>
                                        <p className="text-white font-semibold">{job.applicants?.length || 0}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/50 text-xs">Views</p>
                                        <p className="text-white font-semibold">{job.views || 0}</p>
                                    </div>
                                    <Link
                                        to={`/company/jobs/${job._id}/applications`}
                                        className="btn-ghost text-xs flex items-center gap-1"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> View
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

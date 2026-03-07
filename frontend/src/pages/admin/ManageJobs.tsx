import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { Briefcase, MapPin, Building2, CheckCircle, XCircle } from 'lucide-react';
import { Job } from '../../types';
import { motion } from 'framer-motion';

export default function ManageJobs() {
    const { data: jobs, isLoading } = useQuery({
        queryKey: ['adminJobs'],
        queryFn: () => adminAPI.getAllJobs().then(r => r.data.jobs),
    });

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Briefcase className="w-7 h-7 text-emerald-400" /> Active Jobs
                </h1>
                <p className="text-white/50 mt-1">View all job postings on the platform</p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : !jobs || jobs.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <li className="text-white/50">No jobs found on the platform.</li>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs?.map((job: Job, i: number) => {
                        const companyName = (job.company && typeof job.company === 'object' && 'companyName' in job.company) ? job.company.companyName : job.companyName;

                        return (
                            <motion.div
                                key={job._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-white font-semibold">{job.jobRole}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${job.isActive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                            {job.isActive ? 'Active' : 'Closed'}
                                        </span>
                                    </div>
                                    <p className="text-white/60 text-sm mb-3 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" /> {companyName}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-xs text-white/40">
                                        {job.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>}
                                        <span className="flex items-center gap-1.5">{job.acceptGap ? <CheckCircle className="w-3.5 h-3.5 text-accent-400" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />} Gap Allowed</span>
                                        <span className="flex items-center gap-1.5">{job.requiredSkills.length} Required Skills</span>
                                    </div>
                                </div>

                                <div className="flex flex-col md:items-end gap-1">
                                    <p className="text-xs text-white/40">Posted On</p>
                                    <p className="text-sm text-white/80">{new Date(job.createdAt).toLocaleDateString()}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

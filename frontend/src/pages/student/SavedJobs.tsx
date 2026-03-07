import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '../../services/api';
import { Bookmark, MapPin, DollarSign, Clock } from 'lucide-react';
import { Job } from '../../types';
import { motion } from 'framer-motion';

export default function SavedJobs() {
    const { data, isLoading } = useQuery({
        queryKey: ['savedJobs'],
        queryFn: () => studentAPI.getSavedJobs().then(r => r.data.savedJobs),
    });

    const savedJobs: Job[] = data || [];

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Bookmark className="w-7 h-7 text-yellow-400" /> Saved Jobs
                </h1>
                <p className="text-white/50 mt-1">{savedJobs.length} saved jobs</p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}
                </div>
            ) : savedJobs.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Bookmark className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">No Saved Jobs</h3>
                    <p className="text-white/50">Bookmark jobs from the Matches page to see them here.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {savedJobs.map((job, i) => (
                        <motion.div
                            key={job._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card-hover p-5"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold flex-shrink-0">
                                    {(typeof job.company === 'object' ? (job.company as any).companyName : job.companyName)?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">{job.jobRole}</h3>
                                    <p className="text-white/50 text-sm">{typeof job.company === 'object' ? (job.company as any).companyName : job.companyName}</p>
                                </div>
                                <Bookmark className="w-4 h-4 text-yellow-400 ml-auto flex-shrink-0" />
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-white/40">
                                {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                                {job.salaryDisplay && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salaryDisplay}</span>}
                                {job.maxGapAllowed > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Gap: {job.maxGapAllowed}mo</span>}
                                {job.acceptGap && <span className="badge-green">Gap Friendly</span>}
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {job.requiredSkills?.slice(0, 4).map(s => (
                                    <span key={s} className="badge-blue">{s}</span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

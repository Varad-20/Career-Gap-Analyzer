import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Target, MapPin, DollarSign, Clock, Star, Filter,
    CheckCircle, Send, BookmarkPlus, X
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import { MatchResult } from '../../types';
import toast from 'react-hot-toast';

export default function JobMatches() {
    const [filters, setFilters] = useState({ skillMatch: 0, location: '', salaryMin: 0, gapMax: '' });
    const [applyModal, setApplyModal] = useState<MatchResult | null>(null);
    const [coverLetter, setCoverLetter] = useState('');

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['matches', filters],
        queryFn: () => studentAPI.getMatches({
            skillMatch: filters.skillMatch || undefined,
            location: filters.location || undefined,
        }).then(r => r.data),
    });

    const applyMutation = useMutation({
        mutationFn: ({ jobId, letter }: { jobId: string; letter: string }) =>
            studentAPI.applyToJob(jobId, { coverLetter: letter }),
        onSuccess: () => {
            toast.success('Application submitted! ✅');
            setApplyModal(null);
            setCoverLetter('');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Application failed'),
    });

    const saveMutation = useMutation({
        mutationFn: (jobId: string) => studentAPI.toggleSaveJob(jobId),
        onSuccess: () => toast.success('Job bookmark toggled!'),
    });

    const matches: MatchResult[] = data?.matches || [];

    const getMatchColor = (score: number) => {
        if (score >= 70) return 'text-emerald-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Target className="w-7 h-7 text-primary-400" />
                    Matched Jobs
                </h1>
                <p className="text-white/50 mt-1">
                    {matches.length} gap-friendly jobs matching your profile
                </p>
            </div>

            {/* Filters */}
            <div className="glass-card p-5 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="label text-xs">Min Skill Match %</label>
                    <select
                        className="input-field py-2 text-sm w-40"
                        value={filters.skillMatch}
                        onChange={e => setFilters(f => ({ ...f, skillMatch: parseInt(e.target.value) }))}
                    >
                        <option value={0}>Any</option>
                        <option value={30}>30%+</option>
                        <option value={50}>50%+</option>
                        <option value={70}>70%+</option>
                    </select>
                </div>
                <div>
                    <label className="label text-xs">Location</label>
                    <input
                        type="text"
                        className="input-field py-2 text-sm w-40"
                        placeholder="e.g. Mumbai"
                        value={filters.location}
                        onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                    />
                </div>
                <button onClick={() => refetch()} className="btn-secondary text-sm flex items-center gap-2 py-2">
                    <Filter className="w-4 h-4" /> Apply Filters
                </button>
            </div>

            {/* Matches */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : matches.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">No Matches Yet</h3>
                    <p className="text-white/50">Upload your resume and complete your profile to get matched with gap-friendly jobs.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {matches.map(({ job, matchScore, skillMatchPercentage, gapCompliant }, i) => (
                        <motion.div
                            key={job._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card-hover p-6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm flex-shrink-0">
                                            {(typeof job.company === 'object' ? job.company.companyName : job.companyName)?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">{job.jobRole}</h3>
                                            <p className="text-white/50 text-sm">{job.companyName}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {job.requiredSkills?.slice(0, 5).map(skill => (
                                            <span key={skill} className="badge-blue">{skill}</span>
                                        ))}
                                        {(job.requiredSkills?.length || 0) > 5 && (
                                            <span className="badge text-white/40 bg-white/5">+{job.requiredSkills.length - 5}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/50">
                                        {job.location && (
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                                        )}
                                        {job.salaryDisplay && (
                                            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{job.salaryDisplay}</span>
                                        )}
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Max Gap: {job.maxGapAllowed} months</span>
                                        <span className="badge-purple">{job.jobType}</span>
                                    </div>
                                </div>

                                {/* Right side - scores */}
                                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                    <div className="text-right">
                                        <p className="text-xs text-white/40 mb-1">Match Score</p>
                                        <p className={`text-2xl font-black ${getMatchColor(matchScore)}`}>{matchScore}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-white/40 mb-1">Skill Match</p>
                                        <p className={`text-lg font-bold ${getMatchColor(skillMatchPercentage)}`}>{skillMatchPercentage}%</p>
                                    </div>
                                    {gapCompliant && (
                                        <span className="badge-green flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Gap Friendly
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => setApplyModal({ job, matchScore, skillMatchPercentage, gapCompliant, details: {} as any })}
                                    className="btn-primary text-sm py-2 flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" /> Apply Now
                                </button>
                                <button
                                    onClick={() => saveMutation.mutate(job._id)}
                                    className="btn-secondary text-sm py-2 flex items-center gap-2"
                                >
                                    <BookmarkPlus className="w-4 h-4" /> Save
                                </button>
                            </div>

                            {/* Skill match bar */}
                            <div className="mt-4">
                                <div className="progress-bar">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skillMatchPercentage}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Apply Modal */}
            {applyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card p-6 w-full max-w-lg"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold">Apply to {applyModal.job.jobRole}</h3>
                            <button onClick={() => setApplyModal(null)} className="text-white/40 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-white/50 text-sm mb-4">{applyModal.job.companyName}</p>

                        <label className="label">Cover Letter (Optional)</label>
                        <textarea
                            className="input-field h-32 resize-none"
                            placeholder="Tell them why you'd be a great fit..."
                            value={coverLetter}
                            onChange={e => setCoverLetter(e.target.value)}
                        />

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => applyMutation.mutate({ jobId: applyModal.job._id, letter: coverLetter })}
                                disabled={applyMutation.isPending}
                                className="btn-primary flex items-center gap-2 flex-1 justify-center"
                            >
                                {applyMutation.isPending
                                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><Send className="w-4 h-4" /> Submit Application</>
                                }
                            </button>
                            <button onClick={() => setApplyModal(null)} className="btn-secondary">Cancel</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

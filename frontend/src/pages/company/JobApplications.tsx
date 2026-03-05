import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Star, CheckCircle, XCircle, Clock, GraduationCap, MapPin, Mail, Phone, FileText, ChevronDown, ChevronUp, User } from 'lucide-react';
import { useState } from 'react';
import { companyAPI } from '../../services/api';
import { Application, Student } from '../../types';
import toast from 'react-hot-toast';

const statusOptions = ['reviewed', 'shortlisted', 'accepted', 'rejected'] as const;

export default function JobApplications() {
    const { jobId } = useParams<{ jobId: string }>();
    const qc = useQueryClient();
    const [expandedContact, setExpandedContact] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['jobApplications', jobId],
        queryFn: () => companyAPI.getJobApplications(jobId!).then(r => r.data.applications),
        enabled: !!jobId,
    });

    const statusMutation = useMutation({
        mutationFn: ({ appId, status, notes }: { appId: string; status: string; notes?: string }) =>
            companyAPI.updateApplicationStatus(appId, { status, notes }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['jobApplications', jobId] });
            toast.success('Application status updated');
        },
        onError: () => toast.error('Failed to update status'),
    });

    const applications: Application[] = data || [];

    const getRiskBadge = (level: string) => {
        if (level === 'Low') return 'badge-green';
        if (level === 'Medium') return 'badge-yellow';
        return 'badge-red';
    };

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Users className="w-7 h-7 text-blue-400" /> Job Applications
                </h1>
                <p className="text-white/50 mt-1">{applications.length} candidates applied — sorted by AI match score</p>
            </div>

            {isLoading ? (
                <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)}</div>
            ) : applications.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">No applications yet for this job.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app, i) => {
                        const student = app.student as Student;
                        return (
                            <motion.div
                                key={app._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-6"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold flex-shrink-0">
                                            {student?.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-semibold">{student?.name}</p>
                                            <p className="text-white/50 text-sm">{student?.email}</p>

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {student?.degree && (
                                                    <span className="flex items-center gap-1 text-xs text-white/50">
                                                        <GraduationCap className="w-3 h-3" /> {student.degree}
                                                    </span>
                                                )}
                                                {student?.location && (
                                                    <span className="flex items-center gap-1 text-xs text-white/50">
                                                        <MapPin className="w-3 h-3" /> {student.location}
                                                    </span>
                                                )}
                                                {student?.gapRiskLevel && (
                                                    <span className={getRiskBadge(student.gapRiskLevel)}>
                                                        {student.gapRiskLevel} Gap Risk
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {student?.skills?.slice(0, 5).map(s => (
                                                    <span key={s} className="badge-blue text-xs">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-xs text-white/40">Match Score</p>
                                            <p className="text-2xl font-black text-primary-400">{app.matchScore}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-white/40">Skills</p>
                                            <p className="text-lg font-bold text-emerald-400">{app.skillMatchPercentage}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-white/40">Gap (months)</p>
                                            <p className="text-sm font-semibold text-yellow-400">{student?.gapDuration || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                {app.coverLetter && (
                                    <div className="mt-4 p-3 bg-white/5 rounded-xl">
                                        <p className="text-white/40 text-xs mb-1">Cover Letter</p>
                                        <p className="text-white/60 text-sm">{app.coverLetter}</p>
                                    </div>
                                )}

                                <div className="mt-4 flex flex-wrap gap-2 items-center">
                                    <span className="text-white/40 text-sm">Update Status:</span>
                                    {statusOptions.map(status => (
                                        <button
                                            key={status}
                                            onClick={() => statusMutation.mutate({ appId: app._id, status })}
                                            disabled={app.status === status}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${app.status === status
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                                                }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                    {student?.resumeURL && (
                                        <a
                                            href={student.resumeURL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-auto btn-ghost text-xs"
                                        >
                                            View Resume ↗
                                        </a>
                                    )}
                                </div>

                                {/* Contact Toggle */}
                                <button
                                    onClick={() => setExpandedContact(expandedContact === app._id ? null : app._id)}
                                    className="mt-4 w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                                >
                                    <span className="flex items-center gap-2 text-white/70">
                                        <User className="w-4 h-4" />
                                        {expandedContact === app._id ? 'Hide Contact Details' : 'View Contact Details'}
                                    </span>
                                    {expandedContact === app._id ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
                                </button>

                                <AnimatePresence>
                                    {expandedContact === app._id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-3 p-5 bg-black/20 border border-white/5 rounded-2xl space-y-4">
                                                <div className="grid md:grid-cols-2 gap-3">
                                                    {/* Email */}
                                                    <a href={`mailto:${student?.email}`}
                                                        className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                                                    >
                                                        <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                            <Mail className="w-4 h-4 text-blue-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-white/40 text-xs">Email</p>
                                                            <p className="text-white text-sm font-medium truncate group-hover:text-blue-400 transition-colors">
                                                                {student?.email}
                                                            </p>
                                                        </div>
                                                    </a>

                                                    {/* Phone */}
                                                    {student?.phone ? (
                                                        <a href={`tel:${student.phone}`}
                                                            className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                                                        >
                                                            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                                <Phone className="w-4 h-4 text-emerald-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-white/40 text-xs">Phone</p>
                                                                <p className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">
                                                                    {student.phone}
                                                                </p>
                                                            </div>
                                                        </a>
                                                    ) : (
                                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl opacity-50">
                                                            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                                                <Phone className="w-4 h-4 text-white/40" />
                                                            </div>
                                                            <div>
                                                                <p className="text-white/40 text-xs">Phone</p>
                                                                <p className="text-white/40 text-sm">Not provided</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Bio */}
                                                {student?.bio && (
                                                    <div className="p-3 bg-white/5 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FileText className="w-4 h-4 text-primary-400" />
                                                            <p className="text-white/40 text-xs">Bio / Summary</p>
                                                        </div>
                                                        <p className="text-white/70 text-sm leading-relaxed">{student.bio}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

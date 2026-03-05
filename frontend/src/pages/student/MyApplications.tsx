import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, Clock, CheckCircle, Star, XCircle, Building2,
    MapPin, Mail, Phone, Globe, PartyPopper, ArrowRight, BadgeCheck, Eye
} from 'lucide-react';
import { studentAPI } from '../../services/api.ts';
import { useState } from 'react';

interface ApplicationCompany {
    _id: string;
    companyName: string;
    industry?: string;
    location?: string;
    description?: string;
    website?: string;
    email?: string;  // Only present when accepted/shortlisted
    phone?: string;  // Only present when accepted/shortlisted
}

interface ApplicationJob {
    _id: string;
    jobRole: string;
    location?: string;
    jobType?: string;
    salaryMin?: number;
    salaryMax?: number;
    acceptGap?: boolean;
    maxGapAllowed?: number;
}

interface Application {
    _id: string;
    job: ApplicationJob;
    company: ApplicationCompany;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected';
    matchScore: number;
    skillMatchPercentage: number;
    appliedAt: string;
    companyNotes?: string;
    gapCompliant?: boolean;
}

const statusConfig = {
    pending: { label: 'Pending', badge: 'bg-yellow-500/15 text-yellow-400', icon: Clock, border: 'border-yellow-500/10' },
    reviewed: { label: 'Reviewed', badge: 'bg-blue-500/15 text-blue-400', icon: Eye, border: 'border-blue-500/10' },
    shortlisted: { label: 'Shortlisted', badge: 'bg-violet-500/15 text-violet-400', icon: Star, border: 'border-violet-500/10' },
    accepted: { label: 'Accepted! 🎉', badge: 'bg-emerald-500/15 text-emerald-400', icon: CheckCircle, border: 'border-emerald-500/30' },
    rejected: { label: 'Rejected', badge: 'bg-red-500/15 text-red-400', icon: XCircle, border: 'border-red-500/10' },
};

export default function MyApplications() {
    const [expandedContact, setExpandedContact] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['myApplications'],
        queryFn: () => studentAPI.getApplications().then(r => r.data.applications as Application[]),
    });

    const applications: Application[] = data || [];
    const acceptedCount = applications.filter(a => a.status === 'accepted').length;

    return (
        <div className="p-8 space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Briefcase className="w-7 h-7 text-blue-400" /> My Applications
                    </h1>
                    <p className="text-white/50 mt-1">{applications.length} total applications</p>
                </div>
                {acceptedCount > 0 && (
                    <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                        <PartyPopper className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300 text-sm font-medium">{acceptedCount} application{acceptedCount > 1 ? 's' : ''} accepted!</span>
                    </motion.div>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />)}
                </div>
            ) : applications.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">No Applications Yet</h3>
                    <p className="text-white/50">Go to Job Matches to find and apply for jobs.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app, i) => {
                        const status = statusConfig[app.status] || statusConfig.pending;
                        const StatusIcon = status.icon;
                        const isAccepted = app.status === 'accepted';
                        const isShortlisted = app.status === 'shortlisted';
                        const showContactToggle = isAccepted || isShortlisted;
                        const showContact = expandedContact === app._id;

                        return (
                            <motion.div key={app._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`glass-card overflow-hidden border transition-all ${isAccepted ? 'border-emerald-500/30' : status.border}`}>

                                {/* Accepted top banner */}
                                {isAccepted && (
                                    <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-emerald-500/20 px-6 py-3 flex items-center gap-2">
                                        <PartyPopper className="w-4 h-4 text-emerald-400" />
                                        <p className="text-emerald-300 text-sm font-semibold">
                                            Congratulations! Your application was accepted. Contact the company to proceed.
                                        </p>
                                    </div>
                                )}
                                {isShortlisted && (
                                    <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-b border-violet-500/20 px-6 py-3 flex items-center gap-2">
                                        <Star className="w-4 h-4 text-violet-400" />
                                        <p className="text-violet-300 text-sm font-semibold">
                                            You've been shortlisted! Reach out to the company below.
                                        </p>
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Main row */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            {/* Company avatar */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${isAccepted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {app.company?.companyName?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-white font-semibold">{app.job?.jobRole || 'Unknown Role'}</h3>
                                                <p className="text-white/50 text-sm flex items-center gap-1 mt-0.5">
                                                    <Building2 className="w-3.5 h-3.5" /> {app.company?.companyName}
                                                    {app.company?.industry && <span className="text-white/30 ml-1">· {app.company.industry}</span>}
                                                </p>
                                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/40">
                                                    {app.job?.location && (
                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.job.location}</span>
                                                    )}
                                                    {app.job?.jobType && (
                                                        <span className="bg-white/5 px-2 py-0.5 rounded-lg">{app.job.jobType}</span>
                                                    )}
                                                    {app.job?.acceptGap && (
                                                        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                                                            <BadgeCheck className="w-3 h-3" /> Gap OK
                                                        </span>
                                                    )}
                                                    <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right col — status + scores */}
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 ${status.badge}`}>
                                                <StatusIcon className="w-3 h-3" /> {status.label}
                                            </span>
                                            <div className="text-right">
                                                <p className="text-xs text-white/40">Match Score</p>
                                                <p className="text-lg font-bold text-primary-400">{app.matchScore}%</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-white/40">Skill Match</p>
                                                <p className="text-sm font-bold text-emerald-400">{app.skillMatchPercentage}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recruiter note */}
                                    {app.companyNotes && (
                                        <div className="mt-4 p-3 bg-white/5 rounded-xl border-l-2 border-primary-500">
                                            <p className="text-white/50 text-xs mb-1">Recruiter Note:</p>
                                            <p className="text-white/70 text-sm">{app.companyNotes}</p>
                                        </div>
                                    )}

                                    {/* Contact Toggle Button */}
                                    {showContactToggle && (
                                        <button onClick={() => setExpandedContact(showContact ? null : app._id)}
                                            className={`mt-4 w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${isAccepted
                                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20'}`}>
                                            <span className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                {showContact ? 'Hide Contact Details' : 'View Company Contact Details'}
                                            </span>
                                            <ArrowRight className={`w-4 h-4 transition-transform ${showContact ? 'rotate-90' : ''}`} />
                                        </button>
                                    )}

                                    {/* ── CONTACT DETAILS PANEL ────────────────── */}
                                    <AnimatePresence>
                                        {showContact && showContactToggle && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden">
                                                <div className="mt-3 p-5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Building2 className="w-4 h-4 text-emerald-400" />
                                                        <h4 className="text-white font-semibold">{app.company.companyName} — Contact Information</h4>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-3">
                                                        {/* Email */}
                                                        {app.company.email && (
                                                            <a href={`mailto:${app.company.email}`}
                                                                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                                                                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                                    <Mail className="w-4 h-4 text-blue-400" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-white/40 text-xs">Email</p>
                                                                    <p className="text-white text-sm font-medium truncate group-hover:text-blue-400 transition-colors">{app.company.email}</p>
                                                                </div>
                                                            </a>
                                                        )}

                                                        {/* Phone */}
                                                        {app.company.phone ? (
                                                            <a href={`tel:${app.company.phone}`}
                                                                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                                                                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                                    <Phone className="w-4 h-4 text-emerald-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-white/40 text-xs">Phone</p>
                                                                    <p className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{app.company.phone}</p>
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

                                                        {/* Website */}
                                                        {app.company.website && (
                                                            <a href={app.company.website} target="_blank" rel="noreferrer"
                                                                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                                                                <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                                                                    <Globe className="w-4 h-4 text-violet-400" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-white/40 text-xs">Website</p>
                                                                    <p className="text-primary-400 text-sm font-medium truncate">{app.company.website}</p>
                                                                </div>
                                                            </a>
                                                        )}

                                                        {/* Location */}
                                                        {app.company.location && (
                                                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                                                <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                                                    <MapPin className="w-4 h-4 text-orange-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-white/40 text-xs">Office Location</p>
                                                                    <p className="text-white text-sm font-medium">{app.company.location}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Company description if available */}
                                                    {app.company.description && (
                                                        <div className="mt-2 p-3 bg-white/5 rounded-xl">
                                                            <p className="text-white/40 text-xs mb-1">About {app.company.companyName}</p>
                                                            <p className="text-white/70 text-sm leading-relaxed">{app.company.description}</p>
                                                        </div>
                                                    )}

                                                    <p className="text-white/30 text-xs text-center pt-1">
                                                        📧 Mention your application ID <span className="font-mono text-white/50">{app._id.slice(-8)}</span> when contacting the recruiter
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

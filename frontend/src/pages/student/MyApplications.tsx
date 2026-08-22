import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, Clock, CheckCircle, Star, XCircle, Building2,
    MapPin, Mail, Phone, Globe, BadgeCheck, Eye, ArrowRight
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import { useState } from 'react';

interface ApplicationCompany {
    _id: string;
    companyName: string;
    industry?: string;
    location?: string;
    description?: string;
    website?: string;
    email?: string;
    phone?: string;
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
    pending: { label: 'Pending', badge: 'bg-shade-blue-500/10 text-shade-blue-700', icon: Clock, border: 'border-shade-blue-500/25' },
    reviewed: { label: 'Reviewed', badge: 'bg-purple-500/10 text-purple-700', icon: Eye, border: 'border-purple-500/25' },
    shortlisted: { label: 'Shortlisted', badge: 'bg-amber-500/10 text-amber-700', icon: Star, border: 'border-amber-500/25' },
    accepted: { label: 'Accepted!', badge: 'bg-emerald-500/15 text-emerald-700', icon: CheckCircle, border: 'border-emerald-500/25' },
    rejected: { label: 'Rejected', badge: 'bg-shade-red-500/10 text-shade-red-700', icon: XCircle, border: 'border-shade-red-500/25' },
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
        <div className="p-8 space-y-6 max-w-4xl text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Briefcase className="w-7 h-7 text-shade-blue-600" /> My Applications
                    </h1>
                    <p className="text-slate-600 mt-1 text-sm font-medium">{applications.length} total applications</p>
                </div>
                {acceptedCount > 0 && (
                    <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl shadow-sm">
                        <BadgeCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 text-sm font-bold">{acceptedCount} application{acceptedCount > 1 ? 's' : ''} accepted!</span>
                    </motion.div>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-slate-200/60 rounded-2xl animate-pulse" />)}
                </div>
            ) : applications.length === 0 ? (
                <div className="glass-card p-16 text-center border-slate-200/80 shadow-sm">
                    <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-slate-900 font-bold mb-2 text-lg">No Applications Yet</h3>
                    <p className="text-slate-600 text-sm font-medium">Go to AI Career Agent to find and apply for gap-friendly jobs.</p>
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
                            <motion.div
                                key={app._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`glass-card overflow-hidden border-slate-200/80 shadow-sm relative transition-all ${
                                    isAccepted ? 'border-emerald-500/40 bg-emerald-500/5' : ''
                                }`}
                            >
                                {/* Accepted top banner */}
                                {isAccepted && (
                                    <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-3 flex items-center gap-2">
                                        <BadgeCheck className="w-4 h-4 text-emerald-600" />
                                        <p className="text-emerald-700 text-sm font-bold">
                                            Congratulations! Your application was accepted. Contact the company to proceed.
                                        </p>
                                    </div>
                                )}
                                {isShortlisted && (
                                    <div className="bg-shade-blue-500/10 border-b border-shade-blue-500/20 px-6 py-3 flex items-center gap-2">
                                        <Star className="w-4 h-4 text-shade-blue-600" />
                                        <p className="text-shade-blue-700 text-sm font-bold">
                                            You've been shortlisted! Reach out to the company below.
                                        </p>
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Main row */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            {/* Company avatar */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 shadow-sm ${isAccepted ? 'bg-emerald-500/15 text-emerald-700' : 'bg-shade-blue-500/15 text-shade-blue-700'}`}>
                                                {app.company?.companyName?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-slate-900 font-bold text-lg">{app.job?.jobRole || 'Unknown Role'}</h3>
                                                <p className="text-slate-600 text-sm flex items-center gap-1 mt-0.5 font-semibold">
                                                    <Building2 className="w-3.5 h-3.5 text-shade-blue-600" /> {app.company?.companyName}
                                                    {app.company?.industry && <span className="text-slate-400 font-normal ml-1">· {app.company.industry}</span>}
                                                </p>
                                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600 font-medium">
                                                    {app.job?.location && (
                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-shade-blue-600" />{app.job.location}</span>
                                                    )}
                                                    {app.job?.jobType && (
                                                        <span className="bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md font-semibold">{app.job.jobType}</span>
                                                    )}
                                                    {app.job?.acceptGap && (
                                                        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold">
                                                            <BadgeCheck className="w-3 h-3 text-emerald-600" /> Gap OK
                                                        </span>
                                                    )}
                                                    <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right col — status + scores */}
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 border ${status.badge}`}>
                                                <StatusIcon className="w-3 h-3" /> {status.label}
                                            </span>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 font-medium">Match Score</p>
                                                <p className="text-lg font-black text-shade-blue-600">{app.matchScore}%</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 font-medium">Skill Match</p>
                                                <p className="text-sm font-black text-emerald-600">{app.skillMatchPercentage}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recruiter note */}
                                    {app.companyNotes && (
                                        <div className="mt-4 p-3 bg-slate-100 rounded-xl border-l-4 border-shade-blue-600">
                                            <p className="text-slate-500 text-xs mb-1 font-bold">Recruiter Note:</p>
                                            <p className="text-slate-800 text-sm font-medium">{app.companyNotes}</p>
                                        </div>
                                    )}

                                    {/* Contact Toggle Button */}
                                    {showContactToggle && (
                                        <button onClick={() => setExpandedContact(showContact ? null : app._id)}
                                            className={`mt-4 w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${isAccepted
                                                ? 'bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 border border-emerald-500/20'
                                                : 'bg-shade-blue-500/10 hover:bg-shade-blue-500/15 text-shade-blue-700 border border-shade-blue-500/20'}`}>
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
                                                <div className="mt-3 p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Building2 className="w-4 h-4 text-shade-blue-600" />
                                                        <h4 className="text-slate-900 font-bold text-sm">{app.company.companyName} — Contact Information</h4>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-3">
                                                        {/* Email */}
                                                        {app.company.email && (
                                                            <a href={`mailto:${app.company.email}`}
                                                                className="flex items-center gap-3 p-3 bg-white hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors group">
                                                                <div className="w-9 h-9 rounded-lg bg-shade-blue-500/15 flex items-center justify-center flex-shrink-0">
                                                                    <Mail className="w-4 h-4 text-shade-blue-600" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-slate-500 text-xs font-semibold">Email</p>
                                                                    <p className="text-slate-900 text-sm font-bold truncate group-hover:text-shade-blue-600 transition-colors">{app.company.email}</p>
                                                                </div>
                                                            </a>
                                                        )}

                                                        {/* Phone */}
                                                        {app.company.phone ? (
                                                            <a href={`tel:${app.company.phone}`}
                                                                className="flex items-center gap-3 p-3 bg-white hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors group">
                                                                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                                                    <Phone className="w-4 h-4 text-emerald-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-slate-500 text-xs font-semibold">Phone</p>
                                                                    <p className="text-slate-900 text-sm font-bold group-hover:text-emerald-600 transition-colors">{app.company.phone}</p>
                                                                </div>
                                                            </a>
                                                        ) : (
                                                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80 opacity-60">
                                                                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-slate-500 text-xs font-semibold">Phone</p>
                                                                    <p className="text-slate-500 text-sm font-medium">Not provided</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Website */}
                                                        {app.company.website && (
                                                            <a href={app.company.website} target="_blank" rel="noreferrer"
                                                                className="flex items-center gap-3 p-3 bg-white hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors group">
                                                                <div className="w-9 h-9 rounded-lg bg-shade-blue-500/15 flex items-center justify-center flex-shrink-0">
                                                                    <Globe className="w-4 h-4 text-shade-blue-600" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-slate-500 text-xs font-semibold">Website</p>
                                                                    <p className="text-shade-blue-600 text-sm font-bold truncate">{app.company.website}</p>
                                                                </div>
                                                            </a>
                                                        )}

                                                        {/* Location */}
                                                        {app.company.location && (
                                                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80">
                                                                <div className="w-9 h-9 rounded-lg bg-shade-red-500/15 flex items-center justify-center flex-shrink-0">
                                                                    <MapPin className="w-4 h-4 text-shade-red-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-slate-500 text-xs font-semibold">Office Location</p>
                                                                    <p className="text-slate-900 text-sm font-bold">{app.company.location}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Company description if available */}
                                                    {app.company.description && (
                                                        <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200/80">
                                                            <p className="text-slate-500 text-xs mb-1 font-bold">About {app.company.companyName}</p>
                                                            <p className="text-slate-700 text-sm leading-relaxed font-medium">{app.company.description}</p>
                                                        </div>
                                                    )}

                                                    <p className="text-slate-500 text-xs text-center pt-1 flex items-center justify-center gap-1.5 font-medium">
                                                        <Mail className="w-3.5 h-3.5 text-shade-blue-600" /> Mention your application ID <span className="font-mono text-slate-900 font-bold">{app._id.slice(-8)}</span> when contacting the recruiter
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

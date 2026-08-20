import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Briefcase, Building2, MapPin, Calendar, Clock, CheckCircle, XCircle,
    AlertTriangle, ChevronRight, Filter, Search, Zap, Award, Users,
    DollarSign, BookOpen, Shield, RefreshCw, ExternalLink, TrendingUp
} from 'lucide-react';
import { drivesAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Drive {
    _id: string;
    title: string;
    jobRole: string;
    jobDescription: string;
    driveType: 'placement' | 'internship';
    packageMin: number;
    packageMax: number;
    packageDisplay: string;
    stipend: number;
    driveDate: string;
    registrationDeadline: string;
    status: string;
    totalRegistered: number;
    requiredSkills: string[];
    eligibility: {
        minCGPA: number;
        branches: string[];
        maxActiveBacklogs: number;
        minPercentage10th: number;
        minPercentage12th: number;
        batchYear: number;
        gapAllowed: boolean;
    };
    bond: { hasBond: boolean; durationMonths: number; details: string };
    rounds: { name: string; type: string; scheduledAt?: string }[];
    company: { companyName: string; logo: string; location: string; website: string; industry: string };
    isEligible: boolean;
    ineligibilityReasons: string[];
    myStatus: string | null;
}

const statusColors: Record<string, string> = {
    registered: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    shortlisted: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    in_process: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    selected: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    rejected: 'text-red-400 bg-red-500/10 border-red-500/20',
    on_hold: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    withdrawn: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

const roundTypeIcon: Record<string, string> = {
    aptitude: '🧮', coding: '💻', gd: '🗣️', technical: '⚙️', hr: '👔', assignment: '📝', other: '📋'
};

export default function PlacementDrives() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [filterType, setFilterType] = useState<'all' | 'placement' | 'internship'>('all');
    const [filterEligible, setFilterEligible] = useState(false);
    const [search, setSearch] = useState('');
    const [expandedDrive, setExpandedDrive] = useState<string | null>(null);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['placement-drives'],
        queryFn: () => drivesAPI.listDrives({ status: 'all' }).then(r => r.data.drives as Drive[]),
    });

    const registerMutation = useMutation({
        mutationFn: (driveId: string) => drivesAPI.register(driveId),
        onSuccess: (_, driveId) => {
            toast.success('🎉 Successfully registered for the drive!');
            queryClient.invalidateQueries({ queryKey: ['placement-drives'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    });

    const drives = data || [];
    const filtered = drives.filter(d => {
        const matchType = filterType === 'all' || d.driveType === filterType;
        const matchEligible = !filterEligible || d.isEligible;
        const matchSearch = !search ||
            d.title.toLowerCase().includes(search.toLowerCase()) ||
            d.company?.companyName.toLowerCase().includes(search.toLowerCase()) ||
            d.jobRole.toLowerCase().includes(search.toLowerCase());
        return matchType && matchEligible && matchSearch;
    });

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const daysLeft = (deadline: string) => {
        const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
        return diff;
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Placement Drives</h1>
                    <p className="text-white/50 text-sm mt-1">Campus recruitment drives for your college</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/student/my-drives')}
                        className="btn-secondary text-sm flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> My Applications
                    </button>
                    <button onClick={() => refetch()} className="btn-ghost p-2 rounded-lg">
                        <RefreshCw className="w-4 h-4 text-white/50" />
                    </button>
                </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Total Drives', value: drives.length, icon: Briefcase, color: 'text-blue-400' },
                    { label: 'Eligible', value: drives.filter(d => d.isEligible).length, icon: CheckCircle, color: 'text-emerald-400' },
                    { label: 'Registered', value: drives.filter(d => d.myStatus).length, icon: Users, color: 'text-purple-400' },
                    { label: 'Selected', value: drives.filter(d => d.myStatus === 'selected').length, icon: Award, color: 'text-yellow-400' },
                ].map(stat => (
                    <div key={stat.label} className="glass-card p-3 flex items-center gap-3">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        <div>
                            <p className="text-xl font-bold text-white">{stat.value}</p>
                            <p className="text-white/40 text-xs">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="text" placeholder="Search by company or role..."
                        className="input-field pl-9 py-2 text-sm w-full"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    {(['all', 'placement', 'internship'] as const).map(t => (
                        <button key={t} onClick={() => setFilterType(t)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType === t ? 'bg-primary-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setFilterEligible(v => !v)}
                        className={`w-10 h-5 rounded-full transition-all ${filterEligible ? 'bg-emerald-500' : 'bg-white/20'} relative`}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${filterEligible ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-white/60 text-sm">Eligible only</span>
                </label>
            </div>

            {/* Drive Cards */}
            {filtered.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/40 text-lg">No drives found</p>
                    <p className="text-white/30 text-sm mt-1">Complete your academic profile (CGPA, branch) to see eligible drives</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(drive => {
                        const deadline = daysLeft(drive.registrationDeadline);
                        const isExpanded = expandedDrive === drive._id;

                        return (
                            <motion.div key={drive._id}
                                layout
                                className={`glass-card overflow-hidden border transition-all ${drive.isEligible
                                    ? 'border-white/10 hover:border-primary-500/30'
                                    : 'border-white/5 opacity-70'
                                    }`}>
                                {/* Main row */}
                                <div className="p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Company logo */}
                                        <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-2xl overflow-hidden">
                                            {drive.company?.logo
                                                ? <img src={drive.company.logo} alt="" className="w-full h-full object-cover" />
                                                : <Building2 className="w-6 h-6 text-white/40" />
                                            }
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-white font-semibold text-lg leading-tight">{drive.title}</h3>
                                                    <p className="text-white/50 text-sm">{drive.company?.companyName} · {drive.jobRole}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                    {/* Eligibility badge */}
                                                    {drive.isEligible ? (
                                                        <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg font-medium">
                                                            <CheckCircle className="w-3 h-3" /> Eligible
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-medium">
                                                            <XCircle className="w-3 h-3" /> Not Eligible
                                                        </span>
                                                    )}
                                                    {/* My status */}
                                                    {drive.myStatus && (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[drive.myStatus]}`}>
                                                            {drive.myStatus.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Meta row */}
                                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-white/50">
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    {drive.driveType === 'internship'
                                                        ? `₹${drive.stipend?.toLocaleString()}/month`
                                                        : drive.packageDisplay || `${drive.packageMin}–${drive.packageMax} LPA`
                                                    }
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(drive.driveDate)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" /> {drive.company?.location || 'TBD'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5" /> {drive.totalRegistered} registered
                                                </span>
                                                <span className={`flex items-center gap-1 ${deadline <= 2 ? 'text-red-400' : deadline <= 5 ? 'text-yellow-400' : ''}`}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {deadline <= 0 ? 'Deadline passed' : `${deadline}d left`}
                                                </span>
                                            </div>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {drive.requiredSkills?.slice(0, 6).map(s => (
                                                    <span key={s} className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/50 text-xs rounded-md">{s}</span>
                                                ))}
                                                {(drive.requiredSkills?.length || 0) > 6 && (
                                                    <span className="px-2 py-0.5 text-white/30 text-xs">+{drive.requiredSkills.length - 6} more</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ineligibility reasons */}
                                    {!drive.isEligible && drive.ineligibilityReasons?.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {drive.ineligibilityReasons.map(r => (
                                                <span key={r} className="flex items-center gap-1 px-2 py-1 bg-red-500/5 border border-red-500/15 text-red-400/70 text-xs rounded-lg">
                                                    <AlertTriangle className="w-3 h-3" /> {r}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                        <button onClick={() => setExpandedDrive(isExpanded ? null : drive._id)}
                                            className="flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors">
                                            {isExpanded ? 'Hide details' : 'View details'}
                                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </button>

                                        <div className="flex gap-2">
                                            {drive.myStatus ? (
                                                <button onClick={() => navigate(`/student/my-drives`)}
                                                    className="btn-secondary text-sm flex items-center gap-1.5">
                                                    <TrendingUp className="w-3.5 h-3.5" /> Track Progress
                                                </button>
                                            ) : (
                                                <button
                                                    disabled={!drive.isEligible || deadline <= 0 || registerMutation.isPending}
                                                    onClick={() => registerMutation.mutate(drive._id)}
                                                    className={`btn-primary text-sm ${!drive.isEligible || deadline <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    {registerMutation.isPending ? 'Registering...' : 'Register'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                            className="overflow-hidden border-t border-white/5">
                                            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                                                {/* Eligibility criteria */}
                                                <div>
                                                    <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                                                        <Shield className="w-4 h-4" /> Eligibility
                                                    </h4>
                                                    <ul className="space-y-1.5 text-sm">
                                                        <li className="text-white/50">Min CGPA: <span className="text-white">{drive.eligibility.minCGPA}</span></li>
                                                        <li className="text-white/50">Branches: <span className="text-white">
                                                            {drive.eligibility.branches?.length ? drive.eligibility.branches.join(', ') : 'All'}
                                                        </span></li>
                                                        <li className="text-white/50">Max Backlogs: <span className="text-white">{drive.eligibility.maxActiveBacklogs}</span></li>
                                                        {drive.eligibility.minPercentage10th > 0 && <li className="text-white/50">10th: <span className="text-white">≥ {drive.eligibility.minPercentage10th}%</span></li>}
                                                        {drive.eligibility.minPercentage12th > 0 && <li className="text-white/50">12th: <span className="text-white">≥ {drive.eligibility.minPercentage12th}%</span></li>}
                                                        {drive.eligibility.batchYear && <li className="text-white/50">Batch: <span className="text-white">{drive.eligibility.batchYear}</span></li>}
                                                    </ul>
                                                    {drive.bond.hasBond && (
                                                        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400">
                                                            ⚠️ Bond: {drive.bond.durationMonths} months
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Interview rounds */}
                                                <div>
                                                    <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                                                        <Zap className="w-4 h-4" /> Interview Rounds
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {drive.rounds?.map((r, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                                <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                                                <span>{roundTypeIcon[r.type]} {r.name}</span>
                                                                {r.scheduledAt && <span className="text-white/30 text-xs">({formatDate(r.scheduledAt)})</span>}
                                                            </div>
                                                        ))}
                                                        {(!drive.rounds || drive.rounds.length === 0) && <p className="text-white/30 text-sm">Rounds TBD</p>}
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4" /> About the Role
                                                    </h4>
                                                    <p className="text-white/50 text-sm leading-relaxed line-clamp-5">{drive.jobDescription}</p>
                                                    {drive.company?.website && (
                                                        <a href={drive.company.website} target="_blank" rel="noreferrer"
                                                            className="flex items-center gap-1 text-primary-400 text-xs mt-2 hover:underline">
                                                            <ExternalLink className="w-3 h-3" /> Visit company
                                                        </a>
                                                    )}
                                                </div>
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

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Briefcase, Building2, MapPin, Calendar, Clock, CheckCircle, XCircle,
    AlertTriangle, ChevronRight, Search, Zap, Award, Users,
    DollarSign, BookOpen, Shield, RefreshCw, ExternalLink
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
    registered: 'text-shade-blue-700 bg-shade-blue-500/10 border-shade-blue-500/25',
    shortlisted: 'text-amber-700 bg-amber-500/10 border-amber-500/25',
    in_process: 'text-purple-700 bg-purple-500/10 border-purple-500/25',
    selected: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/25',
    rejected: 'text-shade-red-700 bg-shade-red-500/10 border-shade-red-500/25',
    on_hold: 'text-orange-700 bg-orange-500/10 border-orange-500/25',
    withdrawn: 'text-slate-600 bg-slate-100 border-slate-200/80',
};

const roundTypeIcon: Record<string, any> = {
    aptitude: BookOpen, coding: Zap, gd: Users, technical: Briefcase, hr: Award, assignment: Shield, other: CheckCircle
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
        onSuccess: () => {
            toast.success('Successfully registered for the drive!');
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
            <div className="w-10 h-10 border-4 border-shade-blue-500/30 border-t-shade-blue-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Drives</h1>
                    <p className="text-slate-600 text-sm mt-1 font-medium">Campus recruitment drives for your college</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/student/my-drives')}
                        className="btn-secondary text-sm flex items-center gap-2 font-semibold">
                        <Briefcase className="w-4 h-4 text-shade-blue-600" /> My Applications
                    </button>
                    <button onClick={() => refetch()} className="btn-ghost p-2 rounded-xl">
                        <RefreshCw className="w-4 h-4 text-slate-600 hover:text-slate-900" />
                    </button>
                </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Drives', value: drives.length, icon: Briefcase, color: 'text-shade-blue-600' },
                    { label: 'Eligible', value: drives.filter(d => d.isEligible).length, icon: CheckCircle, color: 'text-emerald-600' },
                    { label: 'Registered', value: drives.filter(d => d.myStatus).length, icon: Users, color: 'text-shade-blue-700' },
                    { label: 'Selected', value: drives.filter(d => d.myStatus === 'selected').length, icon: Award, color: 'text-amber-600' },
                ].map(stat => (
                    <div key={stat.label} className="glass-card p-4 flex items-center gap-3 border-slate-200/80 shadow-sm">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        <div>
                            <p className="text-xl font-black text-slate-900">{stat.value}</p>
                            <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-card p-4 flex flex-wrap gap-3 items-center border-slate-200/80 shadow-sm">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search by company or role..."
                        className="input-field pl-9 py-2 text-sm w-full font-medium"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    {(['all', 'placement', 'internship'] as const).map(t => (
                        <button key={t} onClick={() => setFilterType(t)}
                            className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${filterType === t ? 'btn-primary shadow-md shadow-shade-blue-500/20' : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80'}`}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div onClick={() => setFilterEligible(v => !v)}
                        className={`w-10 h-5 rounded-full transition-all ${filterEligible ? 'bg-shade-blue-600' : 'bg-slate-300'} relative`}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${filterEligible ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-slate-700 text-sm font-bold">Eligible only</span>
                </label>
            </div>

            {/* Drive Cards */}
            {filtered.length === 0 ? (
                <div className="glass-card p-12 text-center border-slate-200/80 shadow-sm">
                    <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-900 text-lg font-bold">No drives found</p>
                    <p className="text-slate-600 text-sm mt-1 font-medium">Complete your academic profile (CGPA, branch) to see eligible drives</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(drive => {
                        const deadline = daysLeft(drive.registrationDeadline);
                        const isExpanded = expandedDrive === drive._id;
                        const isApplied = drive.myStatus !== null;
                        const isExpired = deadline < 0;

                        return (
                            <motion.div key={drive._id}
                                layout
                                className={`glass-card overflow-hidden border border-slate-200/80 shadow-sm transition-all ${drive.isEligible
                                    ? 'hover:border-shade-blue-500/30'
                                    : 'opacity-70'
                                    }`}>
                                {/* Main row */}
                                <div className="p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Company logo */}
                                        <div className="w-14 h-14 rounded-xl bg-shade-blue-500/10 border border-shade-blue-500/25 flex items-center justify-center flex-shrink-0 text-2xl overflow-hidden shadow-sm">
                                            {drive.company?.logo
                                                ? <img src={drive.company.logo} alt="" className="w-full h-full object-cover" />
                                                : <Building2 className="w-6 h-6 text-shade-blue-600" />
                                            }
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-slate-900 font-bold text-lg leading-tight">{drive.title}</h3>
                                                    <p className="text-slate-600 text-sm font-bold">{drive.company?.companyName} · {drive.jobRole}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                    {/* Eligibility badge */}
                                                    {drive.isEligible ? (
                                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 text-xs rounded-full font-bold">
                                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Eligible
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-shade-red-500/15 border border-shade-red-500/25 text-shade-red-700 text-xs rounded-full font-bold">
                                                            <XCircle className="w-3.5 h-3.5 text-shade-red-600" /> Not Eligible
                                                        </span>
                                                    )}
                                                    {/* My status */}
                                                    {drive.myStatus && (
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[drive.myStatus]}`}>
                                                            {drive.myStatus.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Meta row */}
                                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600 font-medium">
                                                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    {drive.driveType === 'internship' && drive.stipend
                                                        ? `₹${drive.stipend?.toLocaleString()}/month`
                                                        : drive.packageDisplay || `${drive.packageMin}–${drive.packageMax} LPA`
                                                    }
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-shade-blue-600" />
                                                    {formatDate(drive.driveDate)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-shade-blue-600" /> {drive.company?.location || 'Pan India'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5 text-slate-400" /> {drive.totalRegistered || 0} registered
                                                </span>
                                                <span className={`flex items-center gap-1 ${deadline <= 2 ? 'text-shade-red-600 font-bold' : 'text-slate-600'}`}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {deadline <= 0 ? 'Deadline passed' : `${deadline}d left`}
                                                </span>
                                            </div>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {drive.requiredSkills?.slice(0, 6).map(s => (
                                                    <span key={s} className="badge-blue text-xs font-semibold rounded-full px-3 py-1">{s}</span>
                                                ))}
                                                {(drive.requiredSkills?.length || 0) > 6 && (
                                                    <span className="px-2 py-0.5 text-slate-500 text-xs font-medium">+{drive.requiredSkills.length - 6} more</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/80">
                                        <button onClick={() => setExpandedDrive(isExpanded ? null : drive._id)}
                                            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors">
                                            {isExpanded ? 'Hide details' : 'View details'}
                                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </button>

                                        {isApplied ? (
                                            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/25 flex items-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Registered
                                            </span>
                                        ) : isExpired ? (
                                            <button disabled className="btn-secondary text-xs opacity-50 cursor-not-allowed py-1.5 px-3">
                                                Closed
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => registerMutation.mutate(drive._id)}
                                                disabled={!drive.isEligible || registerMutation.isPending}
                                                className={`text-xs py-1.5 px-4 rounded-full font-bold flex items-center gap-1.5 transition-all shadow-md ${
                                                    drive.isEligible
                                                        ? 'btn-primary shadow-shade-blue-500/20'
                                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                                }`}
                                            >
                                                <Zap className="w-3.5 h-3.5" />
                                                {registerMutation.isPending ? 'Registering...' : 'Register'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                            className="overflow-hidden border-t border-slate-200/80">
                                            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                                                {/* Eligibility criteria */}
                                                <div>
                                                    <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2">
                                                        <Shield className="w-4 h-4 text-shade-blue-600" /> Eligibility
                                                    </h4>
                                                    <ul className="space-y-1.5 text-sm">
                                                        <li className="text-slate-600">Min CGPA: <span className="text-slate-900 font-bold">{drive.eligibility.minCGPA}</span></li>
                                                        <li className="text-slate-600">Branches: <span className="text-slate-900 font-bold">
                                                            {drive.eligibility.branches?.length ? drive.eligibility.branches.join(', ') : 'All'}
                                                        </span></li>
                                                        <li className="text-slate-600">Max Backlogs: <span className="text-slate-900 font-bold">{drive.eligibility.maxActiveBacklogs}</span></li>
                                                        {drive.eligibility.minPercentage10th > 0 && <li className="text-slate-600">10th: <span className="text-slate-900 font-bold">≥ {drive.eligibility.minPercentage10th}%</span></li>}
                                                        {drive.eligibility.minPercentage12th > 0 && <li className="text-slate-600">12th: <span className="text-slate-900 font-bold">≥ {drive.eligibility.minPercentage12th}%</span></li>}
                                                        {drive.eligibility.batchYear && <li className="text-slate-600">Batch: <span className="text-slate-900 font-bold">{drive.eligibility.batchYear}</span></li>}
                                                    </ul>
                                                    {drive.bond.hasBond && (
                                                        <div className="mt-3 p-2 bg-shade-red-500/10 border border-shade-red-500/20 rounded-lg text-xs text-shade-red-700 font-bold flex items-center gap-1.5">
                                                            <AlertTriangle className="w-3.5 h-3.5 text-shade-red-600" /> Bond: {drive.bond.durationMonths} months
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Interview rounds */}
                                                <div>
                                                    <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2">
                                                        <Zap className="w-4 h-4 text-shade-blue-600" /> Interview Rounds
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {drive.rounds?.map((r, i) => {
                                                            const IconComp = roundTypeIcon[r.type] || CheckCircle;
                                                            return (
                                                                <div key={i} className="flex items-center gap-2 text-sm">
                                                                    <span className="w-5 h-5 rounded-full bg-shade-blue-500/15 text-shade-blue-700 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                                                    <span className="flex items-center gap-1.5 text-slate-800 font-medium"><IconComp className="w-3.5 h-3.5 text-shade-blue-600" /> {r.name}</span>
                                                                    {r.scheduledAt && <span className="text-slate-500 text-xs font-medium">({formatDate(r.scheduledAt)})</span>}
                                                                </div>
                                                            );
                                                        })}
                                                        {(!drive.rounds || drive.rounds.length === 0) && <p className="text-slate-500 text-sm font-medium">Rounds TBD</p>}
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-shade-blue-600" /> About the Role
                                                    </h4>
                                                    <p className="text-slate-700 text-sm leading-relaxed line-clamp-5 font-medium">{drive.jobDescription}</p>
                                                    {drive.company?.website && (
                                                        <a href={drive.company.website} target="_blank" rel="noreferrer"
                                                            className="flex items-center gap-1 text-shade-blue-600 text-xs mt-2 hover:underline font-bold">
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

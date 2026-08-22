import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Bot, Sparkles, RefreshCw, MapPin, Briefcase,
    Clock, Globe, ChevronRight, Search,
    Zap, Target, TrendingUp, CheckCircle,
    Star, ArrowUpRight, Upload, Layers, GraduationCap,
    Building2, Radio
} from 'lucide-react';
import { agentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface LiveJob {
    id: string;
    title: string;
    company: string;
    location: string;
    isRemote: boolean;
    workType: string;
    description: string;
    applyLink: string;
    source: string;
    sourcePlatform: string;
    postedAt: string;
    requiredSkills: string[];
    experienceLevel: string;
    salaryDisplay?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    logo?: string;
    gapFriendly: boolean;
    matchScore: number;
    matchedSkills?: string[];
    isLive?: boolean;
    platformColor?: string;
}

// ─── Platform configuration: high contrast brand colors ────────────────────────
const PLATFORMS: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
    'LinkedIn':    { color: 'text-shade-blue-700', bg: 'bg-shade-blue-500/10', border: 'border-shade-blue-500/25', icon: Briefcase, label: 'LinkedIn' },
    'Indeed':      { color: 'text-shade-blue-700', bg: 'bg-shade-blue-500/10', border: 'border-shade-blue-500/25', icon: Globe, label: 'Indeed' },
    'Naukri':      { color: 'text-slate-800',      bg: 'bg-slate-100',          border: 'border-slate-200/80',     icon: Layers, label: 'Naukri' },
    'Glassdoor':   { color: 'text-emerald-700',   bg: 'bg-emerald-500/10',    border: 'border-emerald-500/25',   icon: Star, label: 'Glassdoor' },
    'Wellfound':   { color: 'text-shade-red-700',  bg: 'bg-shade-red-500/10',  border: 'border-shade-red-500/25', icon: Zap, label: 'Wellfound' },
    'Internshala': { color: 'text-shade-blue-700', bg: 'bg-shade-blue-500/10', border: 'border-shade-blue-500/25', icon: GraduationCap, label: 'Internshala' },
    'RemoteOK':    { color: 'text-emerald-700',   bg: 'bg-emerald-500/10',    border: 'border-emerald-500/25',   icon: Globe, label: 'RemoteOK' },
    'Adzuna':      { color: 'text-shade-blue-700', bg: 'bg-shade-blue-500/10', border: 'border-shade-blue-500/25', icon: Search, label: 'Adzuna' },
    'ZipRecruiter':{ color: 'text-emerald-700',   bg: 'bg-emerald-500/10',    border: 'border-emerald-500/25',   icon: Zap, label: 'ZipRecruiter' },
    'Shine':       { color: 'text-slate-800',      bg: 'bg-slate-100',          border: 'border-slate-200/80',     icon: Sparkles, label: 'Shine' },
    'Foundit':     { color: 'text-shade-blue-700', bg: 'bg-shade-blue-500/10', border: 'border-shade-blue-500/25', icon: Target, label: 'Foundit' },
    'Monster':     { color: 'text-shade-red-700',  bg: 'bg-shade-red-500/10',  border: 'border-shade-red-500/25', icon: Bot, label: 'Monster' },
};

const getPlatformStyle = (source: string) => {
    for (const [key, style] of Object.entries(PLATFORMS)) {
        if (source?.includes(key)) return style;
    }
    return { color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200/80', icon: Building2, label: source };
};

const getMatchColor = (score: number) => {
    if (score >= 75) return 'text-emerald-700';
    if (score >= 50) return 'text-amber-700';
    return 'text-shade-red-700';
};

const getMatchBg = (score: number) => {
    if (score >= 75) return 'from-emerald-50 to-teal-100/70 border-emerald-500/30';
    if (score >= 50) return 'from-amber-50 to-orange-100/70 border-amber-500/30';
    return 'from-red-50 to-rose-100/70 border-shade-red-500/30';
};

// ─── Platform overview banner ─────────────────────────────────────────────────
const PlatformBanner = ({ sources }: { sources: string[] }) => {
    const uniquePlatforms = [...new Set(sources)].filter(Boolean);
    return (
        <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 shadow-sm border-slate-200/80"
        >
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold mr-2">
                    <Layers className="w-3.5 h-3.5 text-shade-blue-600" />
                    <span>Sources searched:</span>
                </div>
                {uniquePlatforms.map(src => {
                    const style = getPlatformStyle(src);
                    const PlatformIcon = style.icon;
                    return (
                        <span
                            key={src}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${style.bg} ${style.color} ${style.border}`}
                        >
                            <PlatformIcon className="w-3.5 h-3.5" /> {style.label}
                        </span>
                    );
                })}
            </div>
        </motion.div>
    );
};

// ─── Animated AI Thinking Indicator ─────────────────────────────────────────
const AgentThinkingState = ({ queries }: { queries: string[] }) => (
    <div className="glass-card p-12 text-center space-y-6 max-w-xl mx-auto shadow-md border-slate-200/80">
        <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-shade-blue-500/20 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-shade-blue-600 to-shade-blue-700 flex items-center justify-center shadow-lg shadow-shade-blue-500/25">
                <Bot className="w-10 h-10 text-white animate-bounce" />
            </div>
        </div>

        <div>
            <h2 className="text-xl font-bold text-slate-900">AI Job Agent is Scraping Live Roles</h2>
            <p className="text-slate-600 text-sm mt-1 font-medium">Scanning LinkedIn, Naukri, Indeed, Glassdoor & Wellfound...</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
            {queries.map(q => (
                <span key={q} className="badge-blue text-xs animate-pulse">
                    🔍 {q}
                </span>
            ))}
        </div>
    </div>
);

// ─── Empty state ─────────────────────────────────────────────────────────────
const EmptyState = ({ hasResume, onSearch, isSearching }: { hasResume: boolean; onSearch: () => void; isSearching: boolean }) => {
    const navigate = useNavigate();
    return (
        <div className="glass-card p-12 text-center space-y-5 max-w-lg mx-auto shadow-md border-slate-200/80">
            <div className="w-16 h-16 rounded-2xl bg-shade-blue-500/10 border border-shade-blue-500/25 flex items-center justify-center mx-auto shadow-sm">
                <Bot className="w-8 h-8 text-shade-blue-600" />
            </div>

            <div>
                <h2 className="text-xl font-bold text-slate-900">
                    {hasResume ? 'Launch Your AI Job Search' : 'Upload Resume First'}
                </h2>
                <p className="text-slate-600 text-sm mt-1 font-medium">
                    {hasResume
                        ? 'Our AI agent will scan major job portals and extract roles that explicitly accept career-gap candidates.'
                        : 'Upload your PDF resume so our AI can extract your skills and search matching gap-friendly jobs.'
                    }
                </p>
            </div>

            {hasResume ? (
                <button
                    onClick={onSearch}
                    disabled={isSearching}
                    className="btn-primary inline-flex items-center gap-2 py-3 px-8 text-sm font-bold shadow-lg shadow-shade-blue-500/25"
                >
                    <Sparkles className="w-4 h-4" /> Start Searching Now
                </button>
            ) : (
                <button
                    onClick={() => navigate('/student/resume')}
                    className="btn-primary inline-flex items-center gap-2 py-3 px-8 text-sm font-bold shadow-lg shadow-shade-blue-500/25"
                >
                    <Upload className="w-4 h-4" /> Upload Resume PDF
                </button>
            )}
        </div>
    );
};

const ALL_SOURCE_OPTIONS = [
    { value: 'all',          label: 'All Platforms' },
    { value: 'LinkedIn',     label: 'LinkedIn' },
    { value: 'Indeed',       label: 'Indeed' },
    { value: 'Naukri',       label: 'Naukri' },
    { value: 'Glassdoor',    label: 'Glassdoor' },
    { value: 'Wellfound',    label: 'Wellfound' },
    { value: 'Internshala',  label: 'Internshala' },
    { value: 'RemoteOK',     label: 'RemoteOK' },
    { value: 'Adzuna',       label: 'Adzuna' },
    { value: 'Shine',        label: 'Shine' },
    { value: 'Foundit',      label: 'Foundit' },
    { value: 'ZipRecruiter', label: 'ZipRecruiter' },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function AgentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSearching, setIsSearching] = useState(false);
    const [filters, setFilters] = useState({ search: '', workType: 'all', minMatch: 0, source: 'all' });
    const [expandedJob, setExpandedJob] = useState<string | null>(null);
    const [showLiveOnly, setShowLiveOnly] = useState(false);

    // Fetch agent status
    const { data: statusData } = useQuery({
        queryKey: ['agent-status'],
        queryFn: () => agentAPI.getStatus().then(r => r.data.status),
        refetchInterval: isSearching ? 3000 : false,
    });

    // Fetch job results
    const { data: jobData, isLoading, refetch } = useQuery({
        queryKey: ['agent-jobs'],
        queryFn: () => agentAPI.getJobResults().then(r => r.data),
        enabled: true,
        staleTime: 5 * 60 * 1000,
    });

    // Search mutation
    const searchMutation = useMutation({
        mutationFn: () => agentAPI.searchJobs(),
        onMutate: () => setIsSearching(true),
        onSuccess: (res) => {
            toast.success(`Found ${res.data.count} jobs across multiple platforms!`);
            queryClient.invalidateQueries({ queryKey: ['agent-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['agent-status'] });
            setIsSearching(false);
        },
        onError: () => {
            toast.error('Agent search failed. Retrying with cached results.');
            setIsSearching(false);
            refetch();
        },
    });

    const jobs: LiveJob[] = jobData?.jobs || [];
    const hasResume = statusData?.hasResume ?? (user as any)?.resumeURL;
    const lastSearched = jobData?.searchedAt;
    const uniqueSources = [...new Set(jobs.map(j => j.source))].filter(Boolean);
    const liveJobs = jobs.filter(j => j.isLive);

    const filtered = jobs
        .filter(j => {
            const matchSearch = !filters.search ||
                j.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                j.company.toLowerCase().includes(filters.search.toLowerCase());
            const matchType = filters.workType === 'all' || j.workType?.toLowerCase() === filters.workType.toLowerCase() || (filters.workType === 'remote' && j.isRemote);
            const matchScore = j.matchScore >= filters.minMatch;
            const matchSource = filters.source === 'all' || j.source.toLowerCase().includes(filters.source.toLowerCase());
            const matchLive = !showLiveOnly || j.isLive;
            return matchSearch && matchType && matchScore && matchSource && matchLive;
        })
        .sort((a, b) => b.matchScore - a.matchScore);

    const handleSearch = () => {
        searchMutation.mutate();
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            const diff = Date.now() - d.getTime();
            const days = Math.floor(diff / 86400000);
            if (days === 0) return 'Today';
            if (days === 1) return 'Yesterday';
            if (days < 7) return `${days} days ago`;
            return d.toLocaleDateString();
        } catch {
            return '';
        }
    };

    const availableSources = ALL_SOURCE_OPTIONS.filter(opt =>
        opt.value === 'all' || uniqueSources.some(s => s.toLowerCase().includes(opt.value.toLowerCase()))
    );

    return (
        <div className="p-6 lg:p-8 space-y-6 text-slate-900">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-shade-blue-600 to-shade-blue-700 flex items-center justify-center shadow-md shadow-shade-blue-500/20">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        AI Career Agent
                    </h1>
                    <p className="text-slate-600 mt-1 font-medium">
                        Searches LinkedIn, Naukri, Indeed, Glassdoor, RemoteOK, Wellfound, Internshala & more
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {jobs.length > 0 && (
                        <>
                            <button
                                onClick={() => navigate('/student/resume')}
                                className="btn-secondary flex items-center gap-2 text-sm"
                            >
                                <Upload className="w-4 h-4" /> Upload New Resume
                            </button>
                            <button
                                onClick={() => navigate('/student/skill-gap')}
                                className="btn-secondary flex items-center gap-2 text-sm"
                            >
                                <Target className="w-4 h-4" /> Skill Gap Report
                            </button>
                            <button
                                onClick={handleSearch}
                                disabled={searchMutation.isPending}
                                id="agent-rerun-btn"
                                className="btn-primary flex items-center gap-2 text-sm shadow-md shadow-shade-blue-500/25"
                            >
                                <RefreshCw className={`w-4 h-4 ${searchMutation.isPending ? 'animate-spin' : ''}`} />
                                Re-run Agent
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            {jobs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {[
                        { label: 'Jobs Found', value: jobs.length, icon: Briefcase, color: 'text-shade-blue-600' },
                        { label: 'High Match (75%+)', value: jobs.filter(j => j.matchScore >= 75).length, icon: Star, color: 'text-emerald-600' },
                        { label: 'Remote Jobs', value: jobs.filter(j => j.isRemote).length, icon: Globe, color: 'text-shade-blue-700' },
                        { label: 'Platforms Searched', value: uniqueSources.length, icon: Layers, color: 'text-purple-600' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="glass-card p-4 flex items-center gap-3 shadow-sm border-slate-200/80">
                            <div className="w-10 h-10 rounded-xl bg-shade-blue-500/10 border border-shade-blue-500/20 flex items-center justify-center">
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-black ${color}`}>{value}</p>
                                <p className="text-slate-600 text-xs font-semibold">{label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Platform Sources Banner */}
            {jobs.length > 0 && uniqueSources.length > 0 && (
                <PlatformBanner sources={uniqueSources} />
            )}

            {/* Filters */}
            {jobs.length > 0 && (
                <div className="glass-card p-4 flex flex-wrap gap-3 items-end shadow-sm border-slate-200/80">
                    <div className="flex-1 min-w-48">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                className="input-field pl-9 py-2 text-sm font-medium"
                                placeholder="Search by job title or company..."
                                value={filters.search}
                                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Platform / Source Filter */}
                    <div>
                        <select
                            className="input-field py-2 text-sm font-medium bg-white"
                            value={filters.source}
                            onChange={e => setFilters(f => ({ ...f, source: e.target.value }))}
                        >
                            {availableSources.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-white text-slate-900">{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <select
                            className="input-field py-2 text-sm font-medium bg-white"
                            value={filters.workType}
                            onChange={e => setFilters(f => ({ ...f, workType: e.target.value }))}
                        >
                            <option value="all" className="bg-white text-slate-900">All Types</option>
                            <option value="remote" className="bg-white text-slate-900">Remote</option>
                            <option value="hybrid" className="bg-white text-slate-900">Hybrid</option>
                            <option value="full-time" className="bg-white text-slate-900">Full-time</option>
                        </select>
                    </div>

                    <div>
                        <select
                            className="input-field py-2 text-sm font-medium bg-white"
                            value={filters.minMatch}
                            onChange={e => setFilters(f => ({ ...f, minMatch: Number(e.target.value) }))}
                        >
                            <option value={0} className="bg-white text-slate-900">Any Match</option>
                            <option value={50} className="bg-white text-slate-900">50%+ Match</option>
                            <option value={70} className="bg-white text-slate-900">70%+ Match</option>
                            <option value={85} className="bg-white text-slate-900">85%+ Match</option>
                        </select>
                    </div>

                    {/* Live-only toggle */}
                    {liveJobs.length > 0 && (
                        <button
                            onClick={() => setShowLiveOnly(!showLiveOnly)}
                            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border font-bold transition-all ${
                                showLiveOnly
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700'
                                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Radio className="w-3.5 h-3.5" />
                            Live Only
                        </button>
                    )}

                    <p className="text-slate-600 text-sm font-semibold ml-auto">{filtered.length} results</p>
                </div>
            )}

            {/* Main Content */}
            {isSearching ? (
                <AgentThinkingState queries={(user as any)?.skills?.slice(0, 4) || []} />
            ) : isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-36 bg-slate-200/60 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <EmptyState
                    hasResume={!!hasResume}
                    onSearch={handleSearch}
                    isSearching={searchMutation.isPending}
                />
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {filtered.map((job, i) => {
                            const platformStyle = getPlatformStyle(job.source);
                            return (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(i * 0.04, 0.5) }}
                                    className="glass-card border border-slate-200/80 hover:border-shade-blue-500/30 transition-all duration-200 overflow-hidden shadow-sm"
                                >
                                    {/* Live indicator stripe */}
                                    {job.isLive && (
                                        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/60 via-teal-500/60 to-transparent" />
                                    )}

                                    <div className="flex gap-4 p-5">
                                        {/* Company Logo / Platform Icon */}
                                        <div className="w-12 h-12 rounded-xl border border-slate-200/80 flex items-center justify-center text-xl flex-shrink-0 bg-slate-100 shadow-sm">
                                            {typeof platformStyle.icon === 'string' ? (
                                                platformStyle.icon
                                            ) : (
                                                <platformStyle.icon className={`w-6 h-6 ${platformStyle.color}`} />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-slate-900 font-bold text-lg leading-tight">{job.title}</h3>
                                                        {job.isLive && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 border border-emerald-500/25 font-black tracking-wide">
                                                                LIVE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-600 text-sm mt-0.5 font-bold">{job.company}</p>
                                                </div>

                                                {/* Match Score */}
                                                <div className={`flex flex-col items-end flex-shrink-0 bg-gradient-to-br ${getMatchBg(job.matchScore)} border rounded-xl px-3 py-2 min-w-16 shadow-sm`}>
                                                    <p className={`text-xl font-black ${getMatchColor(job.matchScore)}`}>
                                                        {job.matchScore}%
                                                    </p>
                                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-wider">match</p>
                                                </div>
                                            </div>

                                            {/* Metadata row */}
                                            <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-600 font-medium">
                                                {job.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5 text-shade-blue-600" /> {job.location}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="w-3.5 h-3.5 text-shade-blue-600" />
                                                    {job.isRemote ? 'Remote' : job.workType}
                                                </span>
                                                {job.experienceLevel && (
                                                    <span className="flex items-center gap-1">
                                                        <TrendingUp className="w-3.5 h-3.5 text-shade-blue-600" /> {job.experienceLevel}
                                                    </span>
                                                )}
                                                {(job.salaryDisplay || (job.salaryMin && job.salaryMax)) && (
                                                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                                                        <Zap className="w-3.5 h-3.5" /> {job.salaryDisplay || `${job.salaryCurrency} ${job.salaryMin?.toLocaleString()} – ${job.salaryMax?.toLocaleString()}`}
                                                    </span>
                                                )}
                                                {job.postedAt && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {formatDate(job.postedAt)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Tags row */}
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {/* Platform source badge */}
                                                <span className={`text-xs px-2.5 py-1 rounded-full border font-bold flex items-center gap-1.5 ${platformStyle.bg} ${platformStyle.color} ${platformStyle.border}`}>
                                                    {typeof platformStyle.icon === 'string' ? platformStyle.icon : <platformStyle.icon className="w-3 h-3" />} {job.source}
                                                </span>
                                                {/* Gap friendly badge */}
                                                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 flex items-center gap-1 font-bold">
                                                    <CheckCircle className="w-3 h-3" /> Gap Friendly
                                                </span>
                                                {/* Required skills */}
                                                {job.requiredSkills?.slice(0, 4).map(s => (
                                                    <span key={s} className="badge-blue text-xs font-semibold rounded-full px-3 py-1">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Description (expandable) */}
                                            <AnimatePresence>
                                                {expandedJob === job.id && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="text-slate-700 text-sm mt-3 leading-relaxed font-medium"
                                                    >
                                                        {job.description}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 mt-4">
                                                <a
                                                    href={job.applyLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-primary text-sm py-2 flex items-center gap-2 no-underline shadow-md shadow-shade-blue-500/20"
                                                    id={`apply-btn-${job.id}`}
                                                >
                                                    {job.isLive ? 'Apply Now' : `Search on ${job.source}`} <ArrowUpRight className="w-3.5 h-3.5" />
                                                </a>
                                                <button
                                                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                                                    className="btn-ghost text-sm flex items-center gap-1 font-bold"
                                                >
                                                    {expandedJob === job.id ? 'Less' : 'View Details'}
                                                    <ChevronRight className={`w-4 h-4 transition-transform ${expandedJob === job.id ? 'rotate-90' : ''}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {filtered.length === 0 && (
                        <div className="glass-card p-12 text-center shadow-sm border-slate-200/80">
                            <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 font-semibold">No jobs match your filters. Try adjusting the criteria.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Last searched footer */}
            {lastSearched && jobs.length > 0 && (
                <p className="text-slate-500 text-xs text-center font-medium">
                    Last updated: {formatDate(lastSearched)} · {jobs.length} jobs from {uniqueSources.length} platforms
                    {liveJobs.length > 0 && ` · ${liveJobs.length} live results`}
                </p>
            )}
        </div>
    );
}

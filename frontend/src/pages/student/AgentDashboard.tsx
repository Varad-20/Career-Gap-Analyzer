import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Bot, Sparkles, RefreshCw, MapPin, Briefcase,
    Clock, Globe, ChevronRight, Search,
    Zap, Target, TrendingUp, CheckCircle,
    Star, ArrowUpRight, Upload, Layers
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

// ─── Platform configuration: brand colors, icons, labels ─────────────────────
const PLATFORMS: Record<string, { color: string; bg: string; border: string; icon: string; label: string }> = {
    'LinkedIn':    { color: 'text-[#0A66C2]',   bg: 'bg-[#0A66C2]/15',  border: 'border-[#0A66C2]/30', icon: '💼', label: 'LinkedIn' },
    'Indeed':      { color: 'text-[#2164F3]',   bg: 'bg-[#2164F3]/15',  border: 'border-[#2164F3]/30', icon: '🔵', label: 'Indeed' },
    'Naukri':      { color: 'text-[#FF7555]',   bg: 'bg-[#FF7555]/15',  border: 'border-[#FF7555]/30', icon: '🔶', label: 'Naukri' },
    'Glassdoor':   { color: 'text-[#0CAA41]',   bg: 'bg-[#0CAA41]/15',  border: 'border-[#0CAA41]/30', icon: '🟢', label: 'Glassdoor' },
    'Wellfound':   { color: 'text-[#F04E23]',   bg: 'bg-[#F04E23]/15',  border: 'border-[#F04E23]/30', icon: '🚀', label: 'Wellfound' },
    'Internshala': { color: 'text-[#00B4D8]',   bg: 'bg-[#00B4D8]/15',  border: 'border-[#00B4D8]/30', icon: '🎓', label: 'Internshala' },
    'RemoteOK':    { color: 'text-[#00D4AA]',   bg: 'bg-[#00D4AA]/15',  border: 'border-[#00D4AA]/30', icon: '🌍', label: 'RemoteOK' },
    'Adzuna':      { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: '🔍', label: 'Adzuna' },
    'ZipRecruiter':{ color: 'text-green-400',   bg: 'bg-green-500/15',   border: 'border-green-500/30',  icon: '⚡', label: 'ZipRecruiter' },
    'Shine':       { color: 'text-[#FF6B35]',   bg: 'bg-[#FF6B35]/15',  border: 'border-[#FF6B35]/30', icon: '✨', label: 'Shine' },
    'Foundit':     { color: 'text-[#7B2FF7]',   bg: 'bg-[#7B2FF7]/15',  border: 'border-[#7B2FF7]/30', icon: '🔮', label: 'Foundit' },
    'Monster':     { color: 'text-purple-400',  bg: 'bg-purple-500/15',  border: 'border-purple-500/30', icon: '👾', label: 'Monster' },
};

const getPlatformStyle = (source: string) => {
    for (const [key, style] of Object.entries(PLATFORMS)) {
        if (source?.includes(key)) return style;
    }
    return { color: 'text-white/60', bg: 'bg-white/10', border: 'border-white/20', icon: '🏢', label: source };
};

const getMatchColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-orange-400';
};

const getMatchBg = (score: number) => {
    if (score >= 75) return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30';
    if (score >= 50) return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
    return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
};

// ─── Platform overview banner ─────────────────────────────────────────────────
const PlatformBanner = ({ sources }: { sources: string[] }) => {
    const uniquePlatforms = [...new Set(sources)].filter(Boolean);
    return (
        <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
        >
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-white/50 text-xs mr-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Sources searched:</span>
                </div>
                {uniquePlatforms.map(src => {
                    const style = getPlatformStyle(src);
                    return (
                        <span
                            key={src}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${style.bg} ${style.color} ${style.border}`}
                        >
                            {style.icon} {style.label}
                        </span>
                    );
                })}
            </div>
        </motion.div>
    );
};

// ─── Agent thinking state ─────────────────────────────────────────────────────
const AgentThinkingState = ({ queries }: { queries: string[] }) => (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary-500/10 flex items-center justify-center">
                <Bot className="w-12 h-12 text-primary-400" />
            </div>
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-primary-500/30"
                    animate={{ scale: [1, 1.5 + i * 0.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                />
            ))}
        </div>
        <div className="text-center space-y-2">
            <h3 className="text-white font-bold text-xl">AI Career Agent is Working</h3>
            <p className="text-white/50 text-sm">Searching across LinkedIn, Naukri, Indeed, Glassdoor, RemoteOK & more...</p>
        </div>
        <div className="glass-card p-4 w-full max-w-sm space-y-3">
            {[
                '🔍 Building search queries from your profile...',
                '🌐 Fetching live jobs from JSearch, Adzuna, RemoteOK...',
                '🔗 Building platform cards for Naukri, LinkedIn, Glassdoor...',
                '🧠 Ranking by skill match & relevance...',
                '✅ Preparing your personalized results...',
            ].map((step, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.6 }}
                    className="flex items-center gap-2 text-sm text-white/60"
                >
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, delay: i * 0.6, repeat: Infinity }}
                    >
                        {step}
                    </motion.div>
                </motion.div>
            ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
            {['LinkedIn', 'Naukri', 'Indeed', 'RemoteOK', 'Glassdoor', 'Wellfound', 'Internshala'].map((p, i) => {
                const style = getPlatformStyle(p);
                return (
                    <motion.span
                        key={p}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.12 }}
                        className={`px-3 py-1 rounded-full border text-xs font-semibold ${style.bg} ${style.color} ${style.border}`}
                    >
                        {style.icon} {p}
                    </motion.span>
                );
            })}
        </div>
    </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ hasResume, onSearch, isSearching }: { hasResume: boolean; onSearch: () => void; isSearching: boolean }) => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
            <div className="w-24 h-24 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                <Bot className="w-12 h-12 text-primary-400/60" />
            </div>
            <div>
                <h3 className="text-white font-bold text-xl mb-2">AI Career Agent Ready</h3>
                <p className="text-white/50 max-w-md">
                    {hasResume
                        ? 'Your agent will search LinkedIn, Naukri, Indeed, Glassdoor, RemoteOK, Wellfound, Internshala & more to find gap-friendly jobs tailored to your profile.'
                        : 'Upload your resume first so the AI can analyze your skills and find the best matching jobs across all major job platforms.'}
                </p>
            </div>

            {/* Platform grid */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {Object.entries(PLATFORMS).slice(0, 8).map(([name, style]) => (
                    <span key={name} className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${style.bg} ${style.color} ${style.border}`}>
                        {style.icon} {style.label}
                    </span>
                ))}
            </div>

            {hasResume ? (
                <button
                    onClick={onSearch}
                    disabled={isSearching}
                    id="agent-search-btn"
                    className="btn-primary flex items-center gap-2 text-base py-3 px-8"
                >
                    {isSearching ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Zap className="w-5 h-5" />
                    )}
                    {isSearching ? 'Agent is Searching...' : 'Launch AI Career Agent'}
                </button>
            ) : (
                <button
                    onClick={() => navigate('/student/resume')}
                    className="btn-primary flex items-center gap-2"
                >
                    <Sparkles className="w-4 h-4" /> Upload Resume First
                </button>
            )}
        </div>
    );
};

// ─── Source filter dropdown options ──────────────────────────────────────────
const ALL_SOURCE_OPTIONS = [
    { value: 'all', label: '🌐 All Platforms' },
    { value: 'LinkedIn',    label: '💼 LinkedIn' },
    { value: 'Naukri',      label: '🔶 Naukri' },
    { value: 'Indeed',      label: '🔵 Indeed' },
    { value: 'Glassdoor',   label: '🟢 Glassdoor' },
    { value: 'RemoteOK',    label: '🌍 RemoteOK' },
    { value: 'Wellfound',   label: '🚀 Wellfound' },
    { value: 'Internshala', label: '🎓 Internshala' },
    { value: 'Adzuna',      label: '🔍 Adzuna' },
    { value: 'Shine',       label: '✨ Shine' },
    { value: 'Foundit',     label: '🔮 Foundit' },
    { value: 'ZipRecruiter',label: '⚡ ZipRecruiter' },
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
            toast.success(`🤖 Found ${res.data.count} jobs across multiple platforms!`);
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
    const isMock = jobData?.isMock;
    const lastSearched = jobData?.searchedAt;
    const uniqueSources = [...new Set(jobs.map(j => j.source))].filter(Boolean);
    const liveJobs = jobs.filter(j => j.isLive);

    // Filter jobs and always sort by matchScore descending (highest match first)
    const filtered = jobs
        .filter(j => {
            const matchSearch = !filters.search ||
                j.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                j.company.toLowerCase().includes(filters.search.toLowerCase());
            const matchType = filters.workType === 'all' || j.workType?.toLowerCase() === filters.workType.toLowerCase() || (filters.workType === 'remote' && j.isRemote);
            const matchScore = j.matchScore >= filters.minMatch;
            const matchSource = filters.source === 'all' || j.source?.toLowerCase().includes(filters.source.toLowerCase());
            const matchLive = !showLiveOnly || j.isLive;
            return matchSearch && matchType && matchScore && matchSource && matchLive;
        })
        .sort((a, b) => b.matchScore - a.matchScore);

    const handleSearch = () => {
        if (!hasResume) {
            toast.error('Please upload your resume first!');
            navigate('/student/resume');
            return;
        }
        searchMutation.mutate();
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
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

    // Determine which source filter options are actually present in results
    const availableSources = ALL_SOURCE_OPTIONS.filter(opt =>
        opt.value === 'all' || uniqueSources.some(s => s.toLowerCase().includes(opt.value.toLowerCase()))
    );

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        AI Career Agent
                    </h1>
                    <p className="text-white/50 mt-1 ml-13">
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
                                className="btn-primary flex items-center gap-2 text-sm"
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
                        { label: 'Jobs Found', value: jobs.length, icon: Briefcase, color: 'text-primary-400' },
                        { label: 'High Match (75%+)', value: jobs.filter(j => j.matchScore >= 75).length, icon: Star, color: 'text-emerald-400' },
                        { label: 'Remote Jobs', value: jobs.filter(j => j.isRemote).length, icon: Globe, color: 'text-blue-400' },
                        { label: 'Platforms Searched', value: uniqueSources.length, icon: Layers, color: 'text-violet-400' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="glass-card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-black ${color}`}>{value}</p>
                                <p className="text-white/40 text-xs">{label}</p>
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
                <div className="glass-card p-4 flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-48">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                type="text"
                                className="input-field pl-9 py-2 text-sm"
                                placeholder="Search by job title or company..."
                                value={filters.search}
                                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Platform / Source Filter */}
                    <div>
                        <select
                            className="input-field py-2 text-sm"
                            value={filters.source}
                            onChange={e => setFilters(f => ({ ...f, source: e.target.value }))}
                        >
                            {availableSources.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <select
                            className="input-field py-2 text-sm"
                            value={filters.workType}
                            onChange={e => setFilters(f => ({ ...f, workType: e.target.value }))}
                        >
                            <option value="all" className="bg-gray-900">All Types</option>
                            <option value="remote" className="bg-gray-900">Remote</option>
                            <option value="hybrid" className="bg-gray-900">Hybrid</option>
                            <option value="full-time" className="bg-gray-900">Full-time</option>
                        </select>
                    </div>

                    <div>
                        <select
                            className="input-field py-2 text-sm"
                            value={filters.minMatch}
                            onChange={e => setFilters(f => ({ ...f, minMatch: Number(e.target.value) }))}
                        >
                            <option value={0} className="bg-gray-900">Any Match</option>
                            <option value={50} className="bg-gray-900">50%+ Match</option>
                            <option value={70} className="bg-gray-900">70%+ Match</option>
                            <option value={85} className="bg-gray-900">85%+ Match</option>
                        </select>
                    </div>

                    {/* Live-only toggle */}
                    {liveJobs.length > 0 && (
                        <button
                            onClick={() => setShowLiveOnly(!showLiveOnly)}
                            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-all ${
                                showLiveOnly
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                            }`}
                        >
                            <Radio className="w-3.5 h-3.5" />
                            Live Only
                        </button>
                    )}

                    <p className="text-white/40 text-sm ml-auto">{filtered.length} results</p>
                </div>
            )}

            {/* Main Content */}
            {isSearching ? (
                <AgentThinkingState queries={(user as any)?.skills?.slice(0, 4) || []} />
            ) : isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-36 bg-white/5 rounded-2xl animate-pulse" />
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
                                    className="glass-card border border-white/5 hover:border-primary-500/30 transition-all duration-200 overflow-hidden"
                                >
                                    {/* Live indicator stripe */}
                                    {job.isLive && (
                                        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/60 via-teal-500/60 to-transparent" />
                                    )}

                                    <div className="p-5 lg:p-6">
                                        <div className="flex items-start gap-4">
                                            {/* Company Logo / Platform Icon */}
                                            <div
                                                className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-2xl flex-shrink-0"
                                                style={{ background: job.platformColor ? `${job.platformColor}20` : undefined }}
                                            >
                                                {job.logo || platformStyle.icon}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="text-white font-bold text-lg leading-tight">{job.title}</h3>
                                                            {job.isLive && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold tracking-wide">
                                                                    LIVE
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-white/60 text-sm mt-0.5">{job.company}</p>
                                                    </div>

                                                    {/* Match Score */}
                                                    <div className={`flex flex-col items-end flex-shrink-0 bg-gradient-to-br ${getMatchBg(job.matchScore)} border rounded-xl px-3 py-2 min-w-16`}>
                                                        <p className={`text-xl font-black ${getMatchColor(job.matchScore)}`}>
                                                            {job.matchScore}%
                                                        </p>
                                                        <p className="text-white/40 text-xs">match</p>
                                                    </div>
                                                </div>

                                                {/* Metadata row */}
                                                <div className="flex flex-wrap gap-3 mt-3 text-sm text-white/50">
                                                    {job.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5" /> {job.location}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase className="w-3.5 h-3.5" />
                                                        {job.isRemote ? '🌐 Remote' : job.workType}
                                                    </span>
                                                    {job.experienceLevel && (
                                                        <span className="flex items-center gap-1">
                                                            <TrendingUp className="w-3.5 h-3.5" /> {job.experienceLevel}
                                                        </span>
                                                    )}
                                                    {(job.salaryDisplay || (job.salaryMin && job.salaryMax)) && (
                                                        <span className="flex items-center gap-1 text-emerald-400">
                                                            💰 {job.salaryDisplay || `${job.salaryCurrency} ${job.salaryMin?.toLocaleString()} – ${job.salaryMax?.toLocaleString()}`}
                                                        </span>
                                                    )}
                                                    {job.postedAt && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" /> {formatDate(job.postedAt)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Tags row */}
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {/* Platform source badge */}
                                                    <span className={`text-xs px-2 py-1 rounded-lg border font-semibold ${platformStyle.bg} ${platformStyle.color} ${platformStyle.border}`}>
                                                        {platformStyle.icon} {job.source}
                                                    </span>
                                                    {/* Gap friendly badge */}
                                                    <span className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Gap Friendly
                                                    </span>
                                                    {/* Required skills */}
                                                    {job.requiredSkills?.slice(0, 4).map(s => (
                                                        <span key={s} className={`text-xs px-2 py-1 rounded-lg ${(job.matchedSkills || []).some(ms => ms.toLowerCase().includes(s.toLowerCase())) ? 'bg-primary-500/20 text-primary-300 border border-primary-500/20' : 'bg-white/5 text-white/40'}`}>
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
                                                            className="text-white/50 text-sm mt-3 leading-relaxed"
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
                                                        className="btn-primary text-sm py-2 flex items-center gap-2 no-underline"
                                                        id={`apply-btn-${job.id}`}
                                                    >
                                                        {job.isLive ? 'Apply Now' : `Search on ${job.source}`} <ArrowUpRight className="w-3.5 h-3.5" />
                                                    </a>
                                                    <button
                                                        onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                                                        className="btn-ghost text-sm flex items-center gap-1"
                                                    >
                                                        {expandedJob === job.id ? 'Less' : 'View Details'}
                                                        <ChevronRight className={`w-4 h-4 transition-transform ${expandedJob === job.id ? 'rotate-90' : ''}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {filtered.length === 0 && (
                        <div className="glass-card p-12 text-center">
                            <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className="text-white/50">No jobs match your filters. Try adjusting the criteria.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Last searched footer */}
            {lastSearched && jobs.length > 0 && (
                <p className="text-white/30 text-xs text-center">
                    Last updated: {formatDate(lastSearched)} · {jobs.length} jobs from {uniqueSources.length} platforms
                    {liveJobs.length > 0 && ` · ${liveJobs.length} live results`}
                </p>
            )}
        </div>
    );
}

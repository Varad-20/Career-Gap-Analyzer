import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Bot, Sparkles, RefreshCw, MapPin, ExternalLink, Briefcase,
    Clock, Globe, Building2, ChevronRight, Search, Filter,
    Zap, Target, TrendingUp, AlertCircle, CheckCircle,
    Wifi, WifiOff, Star, ArrowUpRight, Upload
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
}

const SOURCE_COLORS: Record<string, string> = {
    'LinkedIn': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Indeed': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Naukri': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Wellfound': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Internshala': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    'Adzuna': 'bg-green-500/20 text-green-400 border-green-500/30',
};

const getSourceStyle = (source: string) => {
    for (const [key, cls] of Object.entries(SOURCE_COLORS)) {
        if (source?.includes(key)) return cls;
    }
    return 'bg-white/10 text-white/60 border-white/20';
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
            <p className="text-white/50 text-sm">Searching across LinkedIn, Indeed, Naukri & more...</p>
        </div>
        <div className="glass-card p-4 w-full max-w-sm space-y-3">
            {[
                '🔍 Building search queries from your skills...',
                '🌐 Searching live job boards...',
                '🧠 Ranking jobs by relevance...',
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
        {queries.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
                {queries.map((q, i) => (
                    <motion.span
                        key={q}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.15 }}
                        className="px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs"
                    >
                        {q}
                    </motion.span>
                ))}
            </div>
        )}
    </div>
);

const EmptyState = ({ hasResume, onSearch, isSearching }: { hasResume: boolean; onSearch: () => void; isSearching: boolean }) => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
            <div className="w-24 h-24 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                <Bot className="w-12 h-12 text-primary-400/60" />
            </div>
            <div>
                <h3 className="text-white font-bold text-xl mb-2">AI Career Agent Ready</h3>
                <p className="text-white/50 max-w-sm">
                    {hasResume
                        ? 'Your agent will search LinkedIn, Indeed, Naukri, and more to find gap-friendly jobs tailored to your profile.'
                        : 'Upload your resume first so the AI can analyze your skills and find the best matching jobs for you.'}
                </p>
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

export default function AgentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSearching, setIsSearching] = useState(false);
    const [filters, setFilters] = useState({ search: '', workType: 'all', minMatch: 0, source: 'all' });
    const [expandedJob, setExpandedJob] = useState<string | null>(null);

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
            toast.success(`🤖 Found ${res.data.count} jobs for you!`);
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

    // Filter jobs
    const filtered = jobs.filter(j => {
        const matchSearch = !filters.search ||
            j.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            j.company.toLowerCase().includes(filters.search.toLowerCase());
        const matchType = filters.workType === 'all' || j.workType?.toLowerCase() === filters.workType.toLowerCase() || (filters.workType === 'remote' && j.isRemote);
        const matchScore = j.matchScore >= filters.minMatch;
        const matchSource = filters.source === 'all' || j.source?.toLowerCase().includes(filters.source.toLowerCase());
        return matchSearch && matchType && matchScore && matchSource;
    });

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
                        Automatically finds gap-friendly jobs from LinkedIn, Indeed, Naukri & more
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
                        { label: 'Sources Searched', value: new Set(jobs.map(j => j.source)).size, icon: Search, color: 'text-violet-400' },
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

            {/* Mock data notice */}
            {isMock && jobs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
                >
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <p className="text-amber-400/80 text-sm">
                        <strong>Demo Mode:</strong> Showing intelligent sample jobs. Add a JSearch or Adzuna API key to <code className="bg-white/10 px-1 rounded text-xs">backend/.env</code> for live results from LinkedIn, Indeed & more.
                    </p>
                </motion.div>
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
                        {filtered.map((job, i) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.04, 0.5) }}
                                className="glass-card border border-white/5 hover:border-primary-500/30 transition-all duration-200 overflow-hidden"
                            >
                                <div className="p-5 lg:p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Company Logo / Letter */}
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                                            {job.logo || '🏢'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                                <div>
                                                    <h3 className="text-white font-bold text-lg leading-tight">{job.title}</h3>
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
                                                {/* Source badge */}
                                                <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${getSourceStyle(job.source)}`}>
                                                    {job.source}
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
                                                    Apply Now <ArrowUpRight className="w-3.5 h-3.5" />
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
                        ))}
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
                    Last updated: {formatDate(lastSearched)} · {jobs.length} jobs from {new Set(jobs.map(j => j.source)).size} sources
                </p>
            )}
        </div>
    );
}

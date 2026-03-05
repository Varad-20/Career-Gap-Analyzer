import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, Sparkles, CheckCircle, AlertTriangle,
    TrendingUp, Brain, RefreshCw, X, Star, Lightbulb,
    Building2, MapPin, ArrowRight, Briefcase, Globe, BadgeCheck
} from 'lucide-react';
import { studentAPI } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AnalysisResult {
    skills: string[];
    gapDuration: number;
    gapRiskLevel: string;
    resumeScore: number;
    suggestedRoles: string[];
    gapJustification: string;
    resumeSuggestions: string[];
    aiPowered: boolean;
}

interface JobMatch {
    job: {
        _id: string;
        jobRole: string;
        location: string;
        jobType: string;
        salaryMin: number;
        salaryMax: number;
        acceptGap: boolean;
        maxGapAllowed: number;
        requiredSkills: string[];
        company: {
            _id: string;
            companyName: string;
            industry?: string;
        };
    };
    matchScore: number;
    skillMatchPercentage: number;
    gapCompliant: boolean;
}

export default function ResumeUpload() {
    const { updateUser, user } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [generatingJustification, setGeneratingJustification] = useState(false);
    const [justification, setJustification] = useState('');

    // Fetch job matches after analysis
    const { data: matchData, refetch: refetchMatches } = useQuery({
        queryKey: ['resumePageMatches'],
        queryFn: () => studentAPI.getMatches().then(r => r.data.matches as JobMatch[]),
        enabled: !!analysis, // only fetch after analysis done
    });
    const matches = matchData || [];

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const f = acceptedFiles[0];
        if (f && f.type === 'application/pdf') {
            setFile(f);
        } else {
            toast.error('Only PDF files are accepted');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024,
    });

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await studentAPI.uploadResume(formData);
            setAnalysis(res.data.analysis);
            updateUser({ ...user!, ...(res.data.student) });
            toast.success('Resume analyzed successfully! 🎉');
            // Trigger job match fetch
            setTimeout(() => refetchMatches(), 500);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleGenerateJustification = async () => {
        setGeneratingJustification(true);
        try {
            const res = await studentAPI.generateGapJustification();
            setJustification(res.data.justification);
            toast.success('Justification generated!');
        } catch {
            toast.error('Failed to generate justification');
        } finally {
            setGeneratingJustification(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-emerald-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="p-8 space-y-8 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Resume Upload & AI Analysis</h1>
                <p className="text-white/50 mt-1">Upload your PDF resume and let our AI extract and analyze it</p>
            </div>

            {/* Upload Zone */}
            <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary-400" /> Upload Resume
                </h2>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${isDragActive
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-white/20 hover:border-primary-500/50 hover:bg-white/5'
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${file ? 'bg-emerald-500/20' : 'bg-primary-500/10'}`}>
                            {file
                                ? <CheckCircle className="w-8 h-8 text-emerald-400" />
                                : <FileText className="w-8 h-8 text-primary-400" />
                            }
                        </div>

                        {file ? (
                            <div>
                                <p className="text-white font-medium">{file.name}</p>
                                <p className="text-white/40 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-white font-medium">
                                    {isDragActive ? 'Drop your PDF here...' : 'Drag & drop your resume PDF'}
                                </p>
                                <p className="text-white/40 text-sm mt-1">or click to browse files • Max 5MB</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mt-4">
                    {file && (
                        <>
                            <button onClick={handleUpload} disabled={uploading}
                                className="btn-primary flex items-center gap-2">
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Analyzing with AI...
                                    </>
                                ) : (
                                    <><Sparkles className="w-4 h-4" /> Analyze Resume</>
                                )}
                            </button>
                            <button onClick={() => setFile(null)}
                                className="btn-secondary flex items-center gap-2 text-sm">
                                <X className="w-4 h-4" /> Remove
                            </button>
                        </>
                    )}
                </div>

                {uploading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="mt-4 p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-4 h-4 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
                            <p className="text-primary-400 text-sm font-medium">AI is analyzing your resume...</p>
                        </div>
                        <div className="space-y-2 text-xs text-white/40">
                            <p>✅ Extracting text from PDF</p>
                            <p>⏳ Running smart analysis</p>
                            <p>⏳ Computing skill gaps & resume score</p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Analysis Results */}
            <AnimatePresence>
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Score Overview */}
                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                                { label: 'Resume Score', value: analysis.resumeScore, suffix: '%', color: 'text-primary-400' },
                                { label: 'Gap Duration', value: analysis.gapDuration, suffix: ' mo', color: 'text-yellow-400' },
                                { label: 'Skills Found', value: analysis.skills.length, suffix: '', color: 'text-emerald-400' },
                            ].map(({ label, value, suffix, color }) => (
                                <div key={label} className="stat-card text-center">
                                    <p className={`text-4xl font-black ${color} mb-1`}>{value}{suffix}</p>
                                    <p className="text-white/50 text-sm">{label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Extracted Skills */}
                            <div className="glass-card p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-400" /> Extracted Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.skills.map(skill => (
                                        <span key={skill} className="badge-blue">{skill}</span>
                                    ))}
                                    {!analysis.skills.length && <p className="text-white/40 text-sm">No skills extracted</p>}
                                </div>
                            </div>

                            {/* Suggested Roles */}
                            <div className="glass-card p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-primary-400" /> Suggested Job Roles
                                </h3>
                                <div className="space-y-2">
                                    {analysis.suggestedRoles.map(role => (
                                        <div key={role} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <span className="text-white/70">{role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resume Improvements */}
                            <div className="glass-card p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-400" /> AI Improvement Suggestions
                                </h3>
                                <div className="space-y-2">
                                    {analysis.resumeSuggestions.map((s, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm">
                                            <span className="text-primary-400 font-bold flex-shrink-0">{i + 1}.</span>
                                            <span className="text-white/70">{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Gap Justification */}
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-accent-400" /> Gap Justification
                                    </h3>
                                    <button onClick={handleGenerateJustification} disabled={generatingJustification}
                                        className="btn-ghost text-xs flex items-center gap-1">
                                        <RefreshCw className={`w-3.5 h-3.5 ${generatingJustification ? 'animate-spin' : ''}`} />
                                        Regenerate
                                    </button>
                                </div>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    {justification || analysis.gapJustification || 'Click "Regenerate" to create a personalized gap explanation.'}
                                </p>
                            </div>
                        </div>

                        {/* ── GAP-FRIENDLY COMPANIES PORTAL ─────────────────── */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-blue-400" />
                                        Gap-Friendly Companies For You
                                    </h2>
                                    <p className="text-white/40 text-sm mt-0.5">
                                        {matches.length > 0
                                            ? `${matches.length} companies accepting candidates with career gaps`
                                            : 'Companies that actively welcome career returners'}
                                    </p>
                                </div>
                                <button onClick={() => navigate('/student/matches')}
                                    className="flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                                    View All Matches <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            {matches.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {matches.slice(0, 6).map((m, i) => (
                                        <motion.div key={m.job._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.07 }}
                                            className="glass-card p-4 border border-white/5 hover:border-primary-500/30 transition-all group cursor-pointer"
                                            onClick={() => navigate('/student/matches')}>
                                            {/* Company + Match Score */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                                                        {m.job.company?.companyName?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-semibold text-sm leading-tight">{m.job.company?.companyName}</p>
                                                        <p className="text-white/40 text-xs">{m.job.company?.industry || 'Technology'}</p>
                                                    </div>
                                                </div>
                                                <div className={`text-xs font-bold px-2 py-1 rounded-lg ${m.matchScore >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                    {m.matchScore}%
                                                </div>
                                            </div>

                                            {/* Job Role */}
                                            <p className="text-white/80 font-medium text-sm mb-2">{m.job.jobRole}</p>

                                            {/* Info Pills */}
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {m.job.location && (
                                                    <span className="flex items-center gap-1 text-xs text-white/40 bg-white/5 px-2 py-1 rounded-lg">
                                                        <MapPin className="w-3 h-3" /> {m.job.location}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 text-xs text-white/40 bg-white/5 px-2 py-1 rounded-lg">
                                                    <Briefcase className="w-3 h-3" /> {m.job.jobType}
                                                </span>
                                            </div>

                                            {/* Gap Accepted Badge */}
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                                    <BadgeCheck className="w-3 h-3" /> Gap accepted up to {m.job.maxGapAllowed}mo
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                /* Static fallback cards when no DB data yet */
                                <div className="grid md:grid-cols-3 gap-4">
                                    {[
                                        { name: 'TechVision Solutions', role: 'Frontend Developer', location: 'Remote', gap: 24, score: 85, type: 'Full-time', color: 'from-blue-500/30 to-indigo-500/30' },
                                        { name: 'OpenSource Innovators', role: 'Backend Developer', location: 'New York, NY', gap: 36, score: 78, type: 'Full-time', color: 'from-violet-500/30 to-purple-500/30' },
                                        { name: 'Apex Data Labs', role: 'Data Scientist', location: 'San Francisco', gap: 24, score: 72, type: 'Full-time', color: 'from-emerald-500/30 to-teal-500/30' },
                                    ].map((c, i) => (
                                        <motion.div key={c.name}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            onClick={() => navigate('/student/matches')}
                                            className="glass-card p-4 border border-white/5 hover:border-primary-500/30 transition-all group cursor-pointer">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} border border-white/10 flex items-center justify-center text-white font-bold text-sm`}>
                                                        {c.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-semibold text-sm">{c.name}</p>
                                                        <p className="text-white/40 text-xs">Technology</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400">{c.score}%</span>
                                            </div>
                                            <p className="text-white/80 font-medium text-sm mb-2">{c.role}</p>
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                <span className="flex items-center gap-1 text-xs text-white/40 bg-white/5 px-2 py-1 rounded-lg">
                                                    <MapPin className="w-3 h-3" /> {c.location}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-white/40 bg-white/5 px-2 py-1 rounded-lg">
                                                    <Briefcase className="w-3 h-3" /> {c.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                                    <BadgeCheck className="w-3 h-3" /> Gap OK up to {c.gap}mo
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Quick Action Buttons */}
                            <div className="grid md:grid-cols-3 gap-4 pt-2">
                                {[
                                    { icon: '🎯', title: 'View Matched Jobs', sub: `${matches.length} available matches`, path: '/student/matches', color: 'from-primary-500/20 to-violet-500/20 border-primary-500/20' },
                                    { icon: '📄', title: 'Improve Resume', sub: 'Get AI suggestions', path: '/student/resume', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20' },
                                    { icon: '👤', title: 'Complete Profile', sub: 'Higher match rates', path: '/student/profile', color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/20' },
                                ].map(({ icon, title, sub, path, color }) => (
                                    <button key={title} onClick={() => navigate(path)}
                                        className={`flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${color} border hover:scale-[1.02] transition-all group text-left`}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{icon}</span>
                                            <div>
                                                <p className="text-white font-semibold text-sm">{title}</p>
                                                <p className="text-white/50 text-xs">{sub}</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

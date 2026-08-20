import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, Sparkles, CheckCircle,
    TrendingUp, Brain, RefreshCw, X, Star, Lightbulb,
    ArrowRight, Bot
} from 'lucide-react';
import { studentAPI } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Student } from '../../types';

interface AnalysisResult {
    domain?: string;
    primaryRole?: string;
    topSkills?: string[];
    searchKeywords?: string[];
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
    const student = user as Student;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(() => {
        if (student?.resumeScore) {
            return {
                skills: student.skills || [],
                gapDuration: student.gapDuration || 0,
                gapRiskLevel: student.gapRiskLevel || 'Low',
                resumeScore: student.resumeScore || 0,
                suggestedRoles: student.suggestedRoles || [],
                gapJustification: student.gapJustification || '',
                resumeSuggestions: student.resumeSuggestions || [],
                aiPowered: true,
            };
        }
        return null;
    });
    const [generatingJustification, setGeneratingJustification] = useState(false);
    const [justification, setJustification] = useState('');

    // Fetch job matches after analysis
    const { data: matchData, refetch: refetchMatches } = useQuery({
        queryKey: ['resumePageMatches'],
        queryFn: () => studentAPI.getMatches().then(r => r.data.matches as JobMatch[]),
        enabled: !!analysis,
    });
    const _matches = matchData || [];

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
            const analysisData = res.data.analysis;
            setAnalysis(analysisData);
            updateUser({ ...user!, ...(res.data.student) });

            // Invalidate caches so agent & skill gap update
            queryClient.invalidateQueries({ queryKey: ['agent-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['agent-status'] });
            queryClient.invalidateQueries({ queryKey: ['skill-gap'] });
            queryClient.invalidateQueries({ queryKey: ['studentProfile'] });

            const domainMsg = analysisData.domain ? `🎯 ${analysisData.domain} resume detected` : 'Resume analyzed';
            const roleMsg = analysisData.primaryRole ? ` → Searching ${analysisData.primaryRole} jobs!` : ' successfully!';
            toast.success(domainMsg + roleMsg, { duration: 4000 });
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

    return (
        <div className="p-8 space-y-8 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Resume Upload &amp; AI Analysis</h1>
                <p className="text-white/50 mt-1">Upload your PDF resume and let our AI extract and analyze it</p>
            </div>

            {/* Upload Zone */}
            <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary-400" /> {analysis ? 'Upload a new Resume' : 'Upload Resume'}
                </h2>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                        isDragActive
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
                            <p>⏳ Detecting career domain...</p>
                            <p>⏳ Computing skill gaps &amp; resume score</p>
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
                        {/* ✨ Domain Detection Banner */}
                        {(analysis.domain || analysis.primaryRole) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card p-5 border border-primary-500/30 bg-gradient-to-r from-primary-500/10 to-violet-500/10"
                            >
                                <div className="flex items-start justify-between flex-wrap gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Bot className="w-5 h-5 text-primary-400" />
                                            <span className="text-primary-400 font-semibold text-sm">AI Resume Classification</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3 items-center">
                                            {analysis.domain && (
                                                <span className="px-3 py-1.5 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 font-bold text-sm">
                                                    🎯 {analysis.domain}
                                                </span>
                                            )}
                                            {analysis.primaryRole && (
                                                <span className="text-white font-medium">
                                                    → Best-fit role: <span className="text-emerald-400">{analysis.primaryRole}</span>
                                                </span>
                                            )}
                                        </div>
                                        {analysis.searchKeywords?.length ? (
                                            <p className="text-white/40 text-xs mt-2">
                                                🔍 Searching: {analysis.searchKeywords.slice(0, 2).join(' · ')}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        Jobs being fetched...
                                    </div>
                                </div>
                            </motion.div>
                        )}

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
                                        <span
                                            key={skill}
                                            className={`badge-blue ${analysis.topSkills?.includes(skill) ? 'ring-1 ring-primary-400' : ''}`}
                                        >
                                            {analysis.topSkills?.includes(skill) ? '⭐ ' : ''}{skill}
                                        </span>
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
                                    <button
                                        onClick={handleGenerateJustification}
                                        disabled={generatingJustification}
                                        className="btn-ghost text-xs flex items-center gap-1"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${generatingJustification ? 'animate-spin' : ''}`} />
                                        Regenerate
                                    </button>
                                </div>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    {justification || analysis.gapJustification || 'Click "Regenerate" to create a personalized gap explanation.'}
                                </p>
                            </div>
                        </div>

                        {/* Launch AI Agent CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col items-center justify-center p-8 glass-card border border-primary-500/20 bg-gradient-to-r from-primary-500/10 to-violet-500/10 text-center rounded-2xl"
                        >
                            <Bot className="w-12 h-12 text-primary-400 mb-3" />
                            <h3 className="text-white font-bold text-lg">
                                {analysis.domain ? `${analysis.domain} Jobs Ready!` : 'Your Resume Analysis is Ready!'}
                            </h3>
                            <p className="text-white/50 text-sm max-w-md mt-1 mb-5">
                                {analysis.primaryRole
                                    ? `AI is searching live ${analysis.primaryRole} jobs tailored to your resume. Click below to view results.`
                                    : 'Now let our AI Career Agent search live, gap-friendly jobs tailored specifically to your skills.'}
                            </p>
                            <button onClick={() => navigate('/student/agent')} className="btn-primary flex items-center gap-2 py-3 px-8">
                                <Sparkles className="w-4 h-4" /> View Matched Jobs <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, Sparkles, CheckCircle,
    TrendingUp, Brain, RefreshCw, X, Star, Lightbulb,
    ArrowRight, Bot, Target
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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
        return (student as any)?.lastAnalysis || null;
    });
    const [justification, setJustification] = useState<string>('');
    const [generatingJustification, setGeneratingJustification] = useState(false);

    const { refetch: refetchMatches, data: matchData } = useQuery({
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

            queryClient.invalidateQueries({ queryKey: ['agent-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['agent-status'] });
            queryClient.invalidateQueries({ queryKey: ['skill-gap'] });
            queryClient.invalidateQueries({ queryKey: ['studentProfile'] });

            const domainMsg = analysisData.domain ? `Domain detected: ${analysisData.domain}` : 'Resume analyzed';
            const roleMsg = analysisData.primaryRole ? ` — Searching ${analysisData.primaryRole} jobs!` : ' successfully!';
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
        <div className="p-8 space-y-8 max-w-4xl text-slate-900">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Resume Upload &amp; AI Analysis</h1>
                <p className="text-slate-600 mt-1 text-sm font-medium">Upload your PDF resume and let our AI extract and analyze it</p>
            </div>

            {/* Upload Zone */}
            <div className="glass-card p-6 shadow-md border-slate-200/80">
                <h2 className="text-slate-900 font-bold mb-4 flex items-center gap-2 text-lg">
                    <Upload className="w-5 h-5 text-shade-blue-600" /> {analysis ? 'Upload a new Resume' : 'Upload Resume'}
                </h2>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                        isDragActive
                            ? 'border-shade-blue-600 bg-shade-blue-500/10'
                            : 'border-slate-300 hover:border-shade-blue-600/50 hover:bg-slate-50'
                    }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${file ? 'bg-emerald-500/15' : 'bg-shade-blue-500/10 border border-shade-blue-500/25'}`}>
                            {file
                                ? <CheckCircle className="w-8 h-8 text-emerald-600" />
                                : <FileText className="w-8 h-8 text-shade-blue-600" />
                            }
                        </div>

                        {file ? (
                            <div>
                                <p className="text-slate-900 font-bold">{file.name}</p>
                                <p className="text-slate-600 text-sm font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-slate-900 font-bold">
                                    {isDragActive ? 'Drop your PDF here...' : 'Drag & drop your resume PDF'}
                                </p>
                                <p className="text-slate-600 text-sm mt-1 font-medium">or click to browse files • Max 5MB</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mt-4">
                    {file && (
                        <>
                            <button onClick={handleUpload} disabled={uploading}
                                className="btn-primary flex items-center gap-2 shadow-lg shadow-shade-blue-500/25">
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
                                <X className="w-4 h-4 text-slate-600" /> Remove
                            </button>
                        </>
                    )}
                </div>

                {uploading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="mt-4 p-4 bg-shade-blue-500/10 rounded-xl border border-shade-blue-500/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-4 h-4 border-2 border-shade-blue-600/30 border-t-shade-blue-600 rounded-full animate-spin" />
                            <p className="text-shade-blue-700 text-sm font-semibold">AI is analyzing your resume...</p>
                        </div>
                        <div className="space-y-2 text-xs text-slate-600 font-medium">
                            <p className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Extracting text from PDF</p>
                            <p className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-shade-blue-600" /> Detecting career domain...</p>
                            <p className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-shade-blue-600" /> Computing skill gaps &amp; resume score</p>
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
                        {/* Domain Detection Banner */}
                        {(analysis.domain || analysis.primaryRole) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card p-5 border border-shade-blue-500/25 bg-shade-blue-500/10 shadow-md"
                            >
                                <div className="flex items-start justify-between flex-wrap gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Bot className="w-5 h-5 text-shade-blue-600" />
                                            <span className="text-shade-blue-700 font-bold text-sm">AI Resume Classification</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3 items-center">
                                            {analysis.domain && (
                                                <span className="px-3 py-1.5 rounded-xl bg-shade-blue-500/15 border border-shade-blue-500/25 text-shade-blue-700 font-bold text-sm flex items-center gap-1.5">
                                                    <Target className="w-4 h-4 text-shade-blue-600" /> {analysis.domain}
                                                </span>
                                            )}
                                            {analysis.primaryRole && (
                                                <span className="text-slate-900 font-bold text-sm">
                                                    Best-fit role: <span className="text-emerald-700 font-bold">{analysis.primaryRole}</span>
                                                </span>
                                            )}
                                        </div>
                                        {analysis.searchKeywords?.length ? (
                                            <p className="text-slate-600 text-xs mt-2 font-medium">
                                                Searching: {analysis.searchKeywords.slice(0, 2).join(' · ')}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                        Jobs being fetched...
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Score Overview */}
                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                                { label: 'Resume Score', value: analysis.resumeScore, suffix: '%', color: 'text-shade-blue-600' },
                                { label: 'Gap Duration', value: analysis.gapDuration, suffix: ' mo', color: 'text-shade-red-600' },
                                { label: 'Skills Found', value: analysis.skills.length, suffix: '', color: 'text-emerald-600' },
                            ].map(({ label, value, suffix, color }) => (
                                <div key={label} className="stat-card text-center border-slate-200/80 shadow-md">
                                    <p className={`text-4xl font-black ${color} mb-1 tracking-tight`}>{value}{suffix}</p>
                                    <p className="text-slate-600 text-sm font-semibold">{label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Extracted Skills */}
                            <div className="glass-card p-6 border-slate-200/80 shadow-md">
                                <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-shade-blue-600" /> Extracted Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.skills.map(skill => (
                                        <span
                                            key={skill}
                                            className={`badge-blue font-semibold rounded-full px-3.5 py-1.5 ${analysis.topSkills?.includes(skill) ? 'ring-1 ring-shade-blue-600' : ''}`}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {!analysis.skills.length && <p className="text-slate-500 text-sm font-medium">No skills extracted</p>}
                                </div>
                            </div>

                            {/* Suggested Roles */}
                            <div className="glass-card p-6 border-slate-200/80 shadow-md">
                                <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-shade-blue-600" /> Suggested Job Roles
                                </h3>
                                <div className="space-y-2">
                                    {analysis.suggestedRoles.map(role => (
                                        <div key={role} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                            <span className="text-slate-700 font-semibold">{role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resume Improvements */}
                            <div className="glass-card p-6 border-slate-200/80 shadow-md">
                                <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-shade-blue-600" /> AI Improvement Suggestions
                                </h3>
                                <div className="space-y-2">
                                    {analysis.resumeSuggestions.map((s, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm">
                                            <span className="text-shade-blue-600 font-bold flex-shrink-0">{i + 1}.</span>
                                            <span className="text-slate-700 font-medium">{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Gap Justification */}
                            <div className="glass-card p-6 border-slate-200/80 shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-slate-900 font-bold flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-shade-red-600" /> Gap Justification
                                    </h3>
                                    <button
                                        onClick={handleGenerateJustification}
                                        disabled={generatingJustification}
                                        className="btn-ghost text-xs flex items-center gap-1 font-semibold"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${generatingJustification ? 'animate-spin' : ''}`} />
                                        Regenerate
                                    </button>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed font-medium">
                                    {justification || analysis.gapJustification || 'Click "Regenerate" to create a personalized gap explanation.'}
                                </p>
                            </div>
                        </div>

                        {/* Launch AI Agent CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col items-center justify-center p-8 glass-card border border-shade-blue-500/25 bg-shade-blue-500/10 text-center rounded-2xl shadow-md"
                        >
                            <Bot className="w-12 h-12 text-shade-blue-600 mb-3" />
                            <h3 className="text-slate-900 font-bold text-lg">
                                {analysis.domain ? `${analysis.domain} Jobs Ready!` : 'Your Resume Analysis is Ready!'}
                            </h3>
                            <p className="text-slate-600 text-sm max-w-md mt-1 mb-5 font-medium">
                                {analysis.primaryRole
                                    ? `AI is searching live ${analysis.primaryRole} jobs tailored to your resume. Click below to view results.`
                                    : 'Now let our AI Career Agent search live, gap-friendly jobs tailored specifically to your skills.'}
                            </p>
                            <button onClick={() => navigate('/student/agent')} className="btn-primary flex items-center gap-2 py-3 px-8 shadow-lg shadow-shade-blue-500/25">
                                <Sparkles className="w-4 h-4" /> View Matched Jobs <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

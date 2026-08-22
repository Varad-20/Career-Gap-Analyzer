import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
    Target, BookOpen, Award, Zap, CheckCircle, XCircle,
    ChevronDown, ChevronUp, ExternalLink, TrendingUp,
    BarChart2, Lightbulb, ArrowRight, Sparkles, RefreshCw, Clock
} from 'lucide-react';
import { agentAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Course {
    name: string;
    platform: string;
    url: string;
    free: boolean;
    duration: string;
}
interface Certification {
    name: string;
    org: string;
    url: string;
}
interface SkillGapItem {
    skill: string;
    priority: string;
    resources: {
        courses: Course[];
        certifications: Certification[];
        projects: string[];
    };
}
interface MarketSkill {
    skill: string;
    demand: number;
    have: boolean;
}
interface RoadmapPhase {
    title: string;
    skills: string[];
    description: string;
}
interface SkillGapData {
    studentSkills: string[];
    missingSkills: string[];
    skillGapItems: SkillGapItem[];
    roadmap: {
        phase1: RoadmapPhase;
        phase2: RoadmapPhase;
        phase3: RoadmapPhase;
        weeklyGoal: string;
        totalDuration: string;
        motivation: string;
    };
    marketSkillsWithStatus: MarketSkill[];
    summary: {
        total: number;
        have: number;
        missing: number;
        readinessScore: number;
    };
}

const SkillGapCard = ({ item, index }: { item: SkillGapItem; index: number }) => {
    const [open, setOpen] = useState(index === 0);

    const priorityStyles: Record<string, string> = {
        High: 'bg-shade-red-500/15 text-shade-red-700 border-shade-red-500/30',
        Medium: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
        Low: 'bg-shade-blue-500/15 text-shade-blue-700 border-shade-blue-500/30',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="glass-card border border-slate-200/80 shadow-sm overflow-hidden"
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${priorityStyles[item.priority] || priorityStyles.Medium}`}>
                        {item.priority} Priority
                    </span>
                    <h4 className="text-slate-900 font-bold text-base">{item.skill}</h4>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">
                        {item.resources.courses.length + item.resources.certifications.length + item.resources.projects.length} resources
                    </span>
                    {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-200/80 p-4 space-y-4"
                    >
                        {/* Courses */}
                        {item.resources.courses.length > 0 && (
                            <div>
                                <h5 className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <BookOpen className="w-3.5 h-3.5 text-shade-blue-600" /> Courses
                                </h5>
                                <div className="space-y-2">
                                    {item.resources.courses.map(c => (
                                        <a
                                            key={c.name}
                                            href={c.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors group"
                                        >
                                            <div>
                                                <p className="text-slate-900 text-sm font-bold group-hover:text-shade-blue-600">{c.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-slate-600 text-xs font-medium">{c.platform}</span>
                                                    <span className="text-xs text-slate-400">·</span>
                                                    <span className="text-slate-600 text-xs font-medium">{c.duration}</span>
                                                    {c.free && <span className="text-emerald-700 text-xs bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">FREE</span>}
                                                </div>
                                            </div>
                                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-shade-blue-600" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {item.resources.certifications.length > 0 && (
                            <div>
                                <h5 className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Award className="w-3.5 h-3.5 text-shade-blue-600" /> Certifications
                                </h5>
                                <div className="space-y-2">
                                    {item.resources.certifications.map(cert => (
                                        <a
                                            key={cert.name}
                                            href={cert.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 rounded-xl bg-shade-blue-500/10 hover:bg-shade-blue-500/15 border border-shade-blue-500/20 transition-colors group"
                                        >
                                            <div>
                                                <p className="text-shade-blue-700 text-sm font-bold">{cert.name}</p>
                                                <p className="text-shade-blue-600 text-xs mt-0.5 font-medium">{cert.org}</p>
                                            </div>
                                            <ExternalLink className="w-3.5 h-3.5 text-shade-blue-600 group-hover:text-shade-blue-700" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {item.resources.projects.length > 0 && (
                            <div>
                                <h5 className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5 text-shade-blue-600" /> Practice Projects
                                </h5>
                                <div className="space-y-1.5">
                                    {item.resources.projects.map(p => (
                                        <div key={p} className="flex items-start gap-2 text-sm text-slate-700 font-medium p-2 rounded-lg hover:bg-slate-50">
                                            <ArrowRight className="w-4 h-4 text-shade-blue-600 flex-shrink-0 mt-0.5" />
                                            {p}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const PhaseCard = ({ phase, index }: { phase: RoadmapPhase; index: number }) => (
    <div className="glass-card p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
            <span className="w-7 h-7 rounded-xl bg-shade-blue-500/15 text-shade-blue-700 border border-shade-blue-500/25 flex items-center justify-center font-bold text-sm">
                {index + 1}
            </span>
            <h4 className="text-slate-900 font-bold text-base">{phase.title}</h4>
        </div>
        <p className="text-slate-600 text-sm mb-3 font-medium ml-10">{phase.description}</p>
        <div className="flex flex-wrap gap-2 ml-10">
            {phase.skills.map(s => (
                <span key={s} className="badge-blue text-xs font-semibold rounded-full px-3 py-1">
                    {s}
                </span>
            ))}
        </div>
    </div>
);

export default function SkillGapReport() {
    const navigate = useNavigate();

    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['skill-gap'],
        queryFn: () => agentAPI.getSkillGap().then(r => r.data.data as SkillGapData),
        staleTime: 10 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-6 max-w-4xl">
                <div className="h-10 bg-slate-200/60 rounded-xl animate-pulse w-1/3" />
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200/60 rounded-2xl animate-pulse" />)}
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center space-y-4 max-w-md mx-auto">
                <p className="text-slate-700 font-semibold">Upload your resume first to view your Skill Gap Report.</p>
                <button onClick={() => navigate('/student/resume')} className="btn-primary">
                    Upload Resume
                </button>
            </div>
        );
    }

    const { studentSkills, missingSkills, skillGapItems, roadmap, marketSkillsWithStatus, summary } = data;

    return (
        <div className="p-6 lg:p-8 space-y-8 text-slate-900">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-shade-red-500 to-shade-red-600 flex items-center justify-center shadow-md shadow-shade-red-500/20">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        Skill Gap Report
                    </h1>
                    <p className="text-slate-600 mt-1 text-sm font-medium">Compare your skills against market requirements and get a learning roadmap</p>
                </div>
                <button 
                    onClick={() => {
                        refetch();
                        toast.success('Refreshing analysis...');
                    }} 
                    disabled={isFetching}
                    className="btn-secondary text-sm flex items-center gap-2 font-semibold"
                >
                    {isFetching ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-shade-blue-600" />
                    ) : (
                        <Sparkles className="w-4 h-4 text-shade-blue-600" />
                    )}
                    {isFetching ? 'Refreshing...' : 'Refresh Analysis'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center border-slate-200/80 shadow-sm">
                    <p className="text-3xl font-black text-shade-blue-600 tracking-tight">{summary.readinessScore}%</p>
                    <p className="text-slate-600 text-sm mt-1 font-semibold">Market Readiness</p>
                </div>
                <div className="glass-card p-4 text-center border-slate-200/80 shadow-sm">
                    <p className="text-3xl font-black text-emerald-600 tracking-tight">{summary.have}</p>
                    <p className="text-slate-600 text-sm mt-1 font-semibold">Skills You Have</p>
                </div>
                <div className="glass-card p-4 text-center border-slate-200/80 shadow-sm">
                    <p className="text-3xl font-black text-shade-red-600 tracking-tight">{summary.missing}</p>
                    <p className="text-slate-600 text-sm mt-1 font-semibold">Skills to Learn</p>
                </div>
                <div className="glass-card p-4 text-center border-slate-200/80 shadow-sm">
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{studentSkills.length}</p>
                    <p className="text-slate-600 text-sm mt-1 font-semibold">Your Total Skills</p>
                </div>
            </div>

            {/* Market Skills Grid */}
            <div className="glass-card p-6 border-slate-200/80 shadow-sm">
                <h2 className="text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-shade-blue-600" />
                    Market Demand vs Your Skills
                </h2>
                <div className="space-y-3">
                    {marketSkillsWithStatus.map((ms, i) => (
                        <motion.div
                            key={ms.skill}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-32 text-sm text-slate-800 font-semibold flex-shrink-0 flex items-center gap-1.5">
                                {ms.have
                                    ? <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    : <XCircle className="w-4 h-4 text-shade-red-600 flex-shrink-0" />
                                }
                                <span className="truncate">{ms.skill}</span>
                            </div>
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${ms.demand}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                    className={`h-full rounded-full ${ms.have ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-shade-red-500 to-shade-red-600'}`}
                                />
                            </div>
                            <span className="text-slate-600 text-xs w-10 text-right font-bold">{ms.demand}%</span>
                            {!ms.have && (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-shade-red-500/10 text-shade-red-700 border border-shade-red-500/25 flex-shrink-0 font-bold">Gap</span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Your Skills */}
            <div className="glass-card p-6 border-slate-200/80 shadow-sm">
                <h2 className="text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Your Current Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                    {studentSkills.length ? studentSkills.map(s => (
                        <span key={s} className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 text-sm font-bold flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> {s}
                        </span>
                    )) : <p className="text-slate-500 text-sm font-medium">No skills extracted yet. Upload your resume.</p>}
                </div>
            </div>

            {/* Skill Gap Items */}
            {skillGapItems.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-slate-900 font-bold text-xl flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-shade-blue-600" />
                        Skills to Learn with Resources
                    </h2>
                    {skillGapItems.map((item, i) => (
                        <SkillGapCard key={item.skill} item={item} index={i} />
                    ))}
                </div>
            )}

            {/* Learning Roadmap */}
            {roadmap && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h2 className="text-slate-900 font-bold text-xl flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-shade-blue-600" />
                            Your Personalized Learning Roadmap
                        </h2>
                        <div className="flex items-center gap-3 text-sm text-slate-600 font-semibold">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-shade-blue-600" /> {roadmap.totalDuration}</span>
                            <span>·</span>
                            <span>{roadmap.weeklyGoal}</span>
                        </div>
                    </div>

                    {/* Motivation quote */}
                    {roadmap.motivation && (
                        <div className="p-4 rounded-2xl bg-shade-blue-500/10 border border-shade-blue-500/20">
                            <p className="text-shade-blue-700 text-sm italic font-semibold">"{roadmap.motivation}"</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {[roadmap.phase1, roadmap.phase2, roadmap.phase3].map((phase, i) => (
                            phase && <PhaseCard key={i} phase={phase} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* CTA */}
            <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-slate-200/80 shadow-md">
                <div>
                    <h3 className="text-slate-900 font-bold text-lg">Ready to apply?</h3>
                    <p className="text-slate-600 text-sm mt-0.5 font-medium">Check the AI Career Agent for jobs matching your current skills.</p>
                </div>
                <button
                    onClick={() => navigate('/student/agent')}
                    className="btn-primary flex items-center gap-2 flex-shrink-0 shadow-lg shadow-shade-blue-500/25"
                >
                    View Job Matches <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

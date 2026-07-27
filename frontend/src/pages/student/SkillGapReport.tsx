import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
    Target, BookOpen, Award, Zap, CheckCircle, XCircle,
    ChevronDown, ChevronUp, ExternalLink, TrendingUp,
    BarChart2, Lightbulb, ArrowRight, Sparkles, RefreshCw
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

const PhaseCard = ({ phase, index }: { phase: RoadmapPhase; index: number }) => {
    const colors = [
        { bg: 'from-primary-500/20 to-violet-500/20', border: 'border-primary-500/30', dot: 'bg-primary-500', num: 'text-primary-400' },
        { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', dot: 'bg-blue-500', num: 'text-blue-400' },
        { bg: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', dot: 'bg-emerald-500', num: 'text-emerald-400' },
    ];
    const c = colors[index] || colors[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className={`relative p-5 rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border}`}
        >
            <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full ${c.dot} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {index + 1}
                </div>
                <div className="flex-1">
                    <h4 className={`font-bold ${c.num} mb-1`}>{phase.title}</h4>
                    <p className="text-white/60 text-sm mb-3">{phase.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {phase.skills.map(s => (
                            <span key={s} className="text-xs px-2 py-1 rounded-lg bg-white/10 text-white/70">{s}</span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const SkillGapCard = ({ item, index }: { item: SkillGapItem; index: number }) => {
    const [open, setOpen] = useState(index === 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            className="glass-card border border-white/5 overflow-hidden"
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-white font-medium">{item.skill}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">Missing</span>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 p-4 space-y-4"
                    >
                        {/* Courses */}
                        {item.resources.courses.length > 0 && (
                            <div>
                                <h5 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <BookOpen className="w-3.5 h-3.5" /> Courses
                                </h5>
                                <div className="space-y-2">
                                    {item.resources.courses.map(c => (
                                        <a
                                            key={c.name}
                                            href={c.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                                        >
                                            <div>
                                                <p className="text-white/80 text-sm font-medium group-hover:text-white">{c.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-white/40 text-xs">{c.platform}</span>
                                                    <span className="text-xs">·</span>
                                                    <span className="text-white/40 text-xs">{c.duration}</span>
                                                    {c.free && <span className="text-emerald-400 text-xs bg-emerald-500/10 px-1.5 rounded-full">FREE</span>}
                                                </div>
                                            </div>
                                            <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-primary-400" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {item.resources.certifications.length > 0 && (
                            <div>
                                <h5 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Award className="w-3.5 h-3.5" /> Certifications
                                </h5>
                                <div className="space-y-2">
                                    {item.resources.certifications.map(cert => (
                                        <a
                                            key={cert.name}
                                            href={cert.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 transition-colors group"
                                        >
                                            <div>
                                                <p className="text-amber-300 text-sm font-medium">{cert.name}</p>
                                                <p className="text-amber-400/60 text-xs mt-0.5">{cert.org}</p>
                                            </div>
                                            <ExternalLink className="w-3.5 h-3.5 text-amber-400/40 group-hover:text-amber-400" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {item.resources.projects.length > 0 && (
                            <div>
                                <h5 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5" /> Practice Projects
                                </h5>
                                <div className="space-y-1.5">
                                    {item.resources.projects.map(p => (
                                        <div key={p} className="flex items-start gap-2 text-sm text-white/60 p-2 rounded-lg hover:bg-white/5">
                                            <ArrowRight className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
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

export default function SkillGapReport() {
    const navigate = useNavigate();

    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['skill-gap'],
        queryFn: () => agentAPI.getSkillGap().then(r => r.data.data as SkillGapData),
        staleTime: 10 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                <div className="h-8 w-64 bg-white/5 rounded-xl animate-pulse" />
                <div className="grid md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />)}
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8">
                <div className="glass-card p-12 text-center">
                    <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">Upload Your Resume First</h3>
                    <p className="text-white/50 mb-6">The skill gap report is generated after resume analysis.</p>
                    <button onClick={() => navigate('/student/resume')} className="btn-primary">
                        Upload Resume
                    </button>
                </div>
            </div>
        );
    }

    const { studentSkills, missingSkills, skillGapItems, roadmap, marketSkillsWithStatus, summary } = data;

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        Skill Gap Report
                    </h1>
                    <p className="text-white/50 mt-1">Compare your skills against market requirements and get a learning roadmap</p>
                </div>
                <button 
                    onClick={() => {
                        refetch();
                        toast.success('Refreshing analysis...');
                    }} 
                    disabled={isFetching}
                    className="btn-secondary text-sm flex items-center gap-2"
                >
                    {isFetching ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4" />
                    )}
                    {isFetching ? 'Refreshing...' : 'Refresh Analysis'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-black text-primary-400">{summary.readinessScore}%</p>
                    <p className="text-white/50 text-sm mt-1">Market Readiness</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-black text-emerald-400">{summary.have}</p>
                    <p className="text-white/50 text-sm mt-1">Skills You Have</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-black text-red-400">{summary.missing}</p>
                    <p className="text-white/50 text-sm mt-1">Skills to Learn</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-black text-violet-400">{studentSkills.length}</p>
                    <p className="text-white/50 text-sm mt-1">Your Total Skills</p>
                </div>
            </div>

            {/* Market Skills Grid */}
            <div className="glass-card p-6">
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-400" />
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
                            <div className="w-24 text-sm text-white/70 flex-shrink-0 flex items-center gap-1.5">
                                {ms.have
                                    ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                }
                                <span className="truncate">{ms.skill}</span>
                            </div>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${ms.demand}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                    className={`h-full rounded-full ${ms.have ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500/50 to-orange-500/50'}`}
                                />
                            </div>
                            <span className="text-white/40 text-xs w-10 text-right">{ms.demand}%</span>
                            {!ms.have && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">Gap</span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Your Skills */}
            <div className="glass-card p-6">
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    Your Current Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                    {studentSkills.length ? studentSkills.map(s => (
                        <span key={s} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium">
                            ✓ {s}
                        </span>
                    )) : <p className="text-white/40 text-sm">No skills extracted yet. Upload your resume.</p>}
                </div>
            </div>

            {/* Skill Gap Items */}
            {skillGapItems.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-white font-bold text-xl flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-yellow-400" />
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
                        <h2 className="text-white font-bold text-xl flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-primary-400" />
                            Your Personalized Learning Roadmap
                        </h2>
                        <div className="flex gap-3 text-sm text-white/50">
                            <span>⏱ {roadmap.totalDuration}</span>
                            <span>·</span>
                            <span>📅 {roadmap.weeklyGoal}</span>
                        </div>
                    </div>

                    {/* Motivation quote */}
                    {roadmap.motivation && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-500/10 to-violet-500/10 border border-primary-500/20">
                            <p className="text-primary-300 text-sm italic">"{roadmap.motivation}"</p>
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
            <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-white font-bold">Ready to apply?</h3>
                    <p className="text-white/50 text-sm">Check the AI Career Agent for jobs matching your current skills.</p>
                </div>
                <button
                    onClick={() => navigate('/student/agent')}
                    className="btn-primary flex items-center gap-2 flex-shrink-0"
                >
                    View Job Matches <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

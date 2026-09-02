import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sparkles, Target, Shield, TrendingUp, Users, Building2,
    ArrowRight, CheckCircle, Brain, FileSearch, BarChart3, BookOpen, ChevronRight, DollarSign
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const features = [
    { icon: Brain, title: 'AI Resume Analysis', desc: 'GPT-4 powered analysis extracts skills, detects gaps, and calculates your resume score automatically.' },
    { icon: Target, title: 'Smart Job Matching', desc: 'Our matching engine only shows you companies that explicitly welcome career-gap candidates.' },
    { icon: Shield, title: 'Gap-Friendly Companies', desc: 'Every listed company has confirmed they accept candidates with career gaps — no more rejections.' },
    { icon: TrendingUp, title: 'Gap Justification AI', desc: 'AI generates a professional explanation for your gap to use in cover letters and interviews.' },
    { icon: FileSearch, title: 'Resume Improvement', desc: 'Get actionable suggestions to improve your resume and increase your match score.' },
    { icon: BarChart3, title: 'Track Applications', desc: 'Monitor all your applications in real-time with status updates and notifications.' },
];

const stats = [
    { label: 'Gap-Friendly Companies', value: '500+' },
    { label: 'Students Placed', value: '12K+' },
    { label: 'Avg. Match Score', value: '87%' },
    { label: 'Success Rate', value: '94%' },
];

export default function Landing() {
    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            {/* Ambient liquid backdrop orbs */}
            <div className="liquid-orb-blue top-10 left-1/4" />
            <div className="liquid-orb-red top-60 right-1/4" />
            <div className="liquid-orb-ivory bottom-40 left-1/3" />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-2xl shadow-sm"
                style={{ backgroundColor: 'var(--bg-nav)', borderBottom: '1px solid var(--border-sidebar)' }}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-shade-blue-600 to-shade-blue-700 flex items-center justify-center shadow-md shadow-shade-blue-500/20 border border-white/40">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-wide" style={{ color: 'var(--text-primary)' }}>Career Gap Finder</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/instructor" className="btn-ghost text-sm flex items-center gap-1.5 text-shade-blue-600 hover:text-shade-blue-700 font-semibold">
                            <BookOpen className="w-4 h-4" /> Teach on Platform
                        </Link>
                        <Link to="/login" className="btn-ghost text-sm font-medium" style={{ color: 'var(--text-body)' }}>Sign In</Link>
                        <ThemeToggle variant="icon" />
                        <Link to="/register" className="btn-primary text-sm py-2 px-5 shadow-lg shadow-shade-blue-500/25">Get Started Free</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-36 pb-20 px-6 relative z-10">
                <div className="max-w-5xl mx-auto text-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-shade-blue-500/10 border border-shade-blue-500/25 text-shade-blue-700 text-sm mb-8 backdrop-blur-xl shadow-sm font-semibold">
                            <Sparkles className="w-4 h-4 text-shade-blue-600" />
                            <span>AI-Powered Career Gap Solution</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            Your Career Gap{' '}
                            <span className="gradient-text">Is Not a Deal-Breaker</span>
                        </h1>

                        <p className="text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-normal" style={{ color: 'var(--text-body)' }}>
                            We connect students and gap professionals with companies that actively welcome them.
                            Upload your resume, get AI analysis, and find your perfect match in minutes.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4 shadow-xl shadow-shade-blue-500/25">
                                Start Your Job Search
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Preview card */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-16 glass-card p-6 max-w-2xl mx-auto text-left shadow-lg relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Brain className="w-4 h-4 text-shade-blue-600" /> AI Resume Analysis
                            </p>
                            <span className="badge-blue">Analyzing...</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Resume Score', value: 82, color: 'from-shade-blue-600 to-shade-blue-500' },
                                { label: 'Skill Match', value: 76, color: 'from-emerald-600 to-teal-500' },
                                { label: 'Gap Impact', value: 35, color: 'from-shade-red-600 to-shade-red-500' },
                            ].map(({ label, value, color }) => (
                                <div key={label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium" style={{ color: 'var(--text-body)' }}>{label}</span>
                                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{value}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <motion.div
                                            className={`h-full rounded-full bg-gradient-to-r ${color}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${value}%` }}
                                            transition={{ duration: 1.5, delay: 0.8 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 pt-4 flex gap-2 flex-wrap" style={{ borderTop: '1px solid var(--border-color)' }}>
                            {['React', 'Python', 'Machine Learning', 'Node.js', 'SQL'].map(s => (
                                <span key={s} className="badge-blue">{s}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6 relative z-10" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map(({ label, value }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center"
                        >
                            <p className="text-4xl font-black gradient-text mb-2 tracking-tight">{value}</p>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-body)' }}>{label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Everything You Need to <span className="gradient-text">Get Hired</span></h2>
                        <p className="text-lg font-medium" style={{ color: 'var(--text-body)' }}>A complete platform built specifically for career gap candidates</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(({ icon: Icon, title, desc }, i) => (
                            <motion.div
                                key={title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card-hover p-6 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-shade-blue-500/10 border border-shade-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-shade-blue-500/20 transition-colors shadow-sm">
                                    <Icon className="w-6 h-6 text-shade-blue-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Instructor CTA Section */}
            <section className="py-20 px-6 relative z-10" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="glass-card p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-shade-blue-500/25 shadow-lg relative overflow-hidden"
                    >
                        <div className="flex items-start gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-shade-blue-500/10 border border-shade-blue-500/25 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <BookOpen className="w-8 h-8 text-shade-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Are You an Expert? <span className="text-shade-blue-600">Teach on Our Platform</span></h2>
                                <p className="max-w-lg leading-relaxed text-sm" style={{ color: 'var(--text-body)' }}>
                                    Share your knowledge with thousands of career-seekers. Upload courses, earn revenue, and help people land their dream jobs.
                                </p>
                                <div className="flex flex-wrap gap-4 mt-4">
                                    {[{ icon: DollarSign, text: 'Earn per enrollment' }, { icon: Users, text: 'Reach 12K+ learners' }, { icon: CheckCircle, text: 'Admin quality seal' }].map(({ icon: Icon, text }) => (
                                        <span key={text} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-body)' }}>
                                            <Icon className="w-4 h-4 text-shade-blue-600" /> {text}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Link
                            to="/instructor"
                            className="flex-shrink-0 flex items-center gap-2 px-8 py-4 rounded-2xl btn-primary text-white font-bold transition-all text-base shadow-xl shadow-shade-blue-500/25"
                        >
                            Start Teaching <ChevronRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 text-center relative z-10">
                <div className="max-w-3xl mx-auto glass-card p-12 relative overflow-hidden shadow-lg">
                    <div className="relative z-10">
                        <Sparkles className="w-12 h-12 text-shade-blue-600 mx-auto mb-6" />
                        <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Ready to Find Your Job?</h2>
                        <p className="mb-8 max-w-xl mx-auto font-medium" style={{ color: 'var(--text-body)' }}>Join thousands of gap candidates who found their dream jobs through our platform.</p>
                        <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4 shadow-xl shadow-shade-blue-500/25">
                            Create Free Account
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 text-center text-sm relative z-10" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <p>© 2026 Career Gap Job Finder. Built for gap professionals.</p>
            </footer>
        </div>
    );
}

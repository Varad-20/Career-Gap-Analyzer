import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sparkles, Target, Shield, TrendingUp, Users, Building2,
    ArrowRight, CheckCircle, Brain, FileSearch, BarChart3, BookOpen, ChevronRight, DollarSign
} from 'lucide-react';

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
        <div className="min-h-screen bg-hero-gradient text-white">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-dark-900/50 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-button-gradient flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg">Career Gap Finder</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/instructor" className="btn-ghost text-sm flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300">
                            <BookOpen className="w-4 h-4" /> Teach on Platform
                        </Link>
                        <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                        <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started Free</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                {/* Background orbs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
                <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent-600/20 rounded-full blur-3xl" />

                <div className="max-w-5xl mx-auto text-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm mb-8">
                            <Sparkles className="w-4 h-4" />
                            <span>AI-Powered Career Gap Solution</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
                            Your Career Gap{' '}
                            <span className="gradient-text">Is Not a Deal-Breaker</span>
                        </h1>

                        <p className="text-xl text-white/60 max-w-3xl mx-auto mb-10">
                            We connect students and gap professionals with companies that actually want to hire them.
                            Upload your resume, get AI analysis, and find your perfect match in minutes.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
                                Start Your Job Search
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/register?type=company" className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-4">
                                <Building2 className="w-5 h-5" />
                                I'm an Employer
                            </Link>
                        </div>
                    </motion.div>

                    {/* Preview card */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-16 glass-card p-6 max-w-2xl mx-auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-white/60 text-sm">AI Resume Analysis</p>
                            <span className="badge-green">Analyzing...</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Resume Score', value: 82, color: 'from-primary-500 to-accent-500' },
                                { label: 'Skill Match', value: 76, color: 'from-emerald-500 to-teal-500' },
                                { label: 'Gap Impact', value: 35, color: 'from-yellow-500 to-orange-500' },
                            ].map(({ label, value, color }) => (
                                <div key={label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white/60">{label}</span>
                                        <span className="text-white font-medium">{value}%</span>
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
                        <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 flex-wrap">
                            {['React', 'Python', 'Machine Learning', 'Node.js', 'SQL'].map(s => (
                                <span key={s} className="badge-blue">{s}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6 border-y border-white/5 bg-dark-800/50">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map(({ label, value }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center"
                        >
                            <p className="text-4xl font-black gradient-text mb-2">{value}</p>
                            <p className="text-white/50 text-sm">{label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Everything You Need to <span className="gradient-text">Get Hired</span></h2>
                        <p className="text-white/50 text-lg">A complete platform built specifically for gap candidates</p>
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
                                <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                                    <Icon className="w-6 h-6 text-primary-400" />
                                </div>
                                <h3 className="text-white font-semibold mb-2">{title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Instructor CTA Section */}
            <section className="py-20 px-6 bg-dark-800/30">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-10 flex flex-col md:flex-row items-center justify-between gap-8"
                    >
                        <div className="flex items-start gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-8 h-8 text-yellow-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Are You an Expert? <span className="text-yellow-400">Teach on Our Platform</span></h2>
                                <p className="text-white/60 max-w-lg">
                                    Share your knowledge with thousands of career-seekers. Upload courses, earn revenue, and help people land their dream jobs. Admin-reviewed for quality.
                                </p>
                                <div className="flex flex-wrap gap-4 mt-4">
                                    {[{ icon: DollarSign, text: 'Earn per enrollment' }, { icon: Users, text: 'Reach 12K+ learners' }, { icon: CheckCircle, text: 'Admin quality seal' }].map(({ icon: Icon, text }) => (
                                        <span key={text} className="flex items-center gap-1.5 text-sm text-white/60">
                                            <Icon className="w-4 h-4 text-yellow-400" /> {text}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Link
                            to="/instructor"
                            className="flex-shrink-0 flex items-center gap-2 px-8 py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-dark-900 font-bold transition-colors text-base"
                        >
                            Start Teaching <ChevronRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto glass-card p-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-button-gradient opacity-5" />
                    <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-6" />
                    <h2 className="text-4xl font-bold mb-4">Ready to Find Your Job?</h2>
                    <p className="text-white/60 mb-8">Join thousands of gap candidates who found their dream jobs through our platform.</p>
                    <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4">
                        Create Free Account
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/5 text-center text-white/30 text-sm">
                <p>© 2024 Career Gap Job Finder. Built with ❤️ for gap professionals.</p>
            </footer>
        </div >
    );
}

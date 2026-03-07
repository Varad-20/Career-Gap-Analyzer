import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { instructorAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { BookOpen, User, Mail, Lock, Lightbulb, ChevronRight, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

export default function InstructorAuth() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'register'>('register');
    const [form, setForm] = useState({ name: '', email: '', password: '', specialization: '' });

    const loginMutation = useMutation({
        mutationFn: () => instructorAPI.login({ email: form.email, password: form.password }),
        onSuccess: (res) => {
            localStorage.setItem('instructorToken', res.data.token);
            localStorage.setItem('instructorUser', JSON.stringify(res.data.user));
            toast.success(`Welcome back, ${res.data.user.name}!`);
            navigate('/instructor/dashboard');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Login failed')
    });

    const registerMutation = useMutation({
        mutationFn: () => instructorAPI.register(form),
        onSuccess: (res) => {
            localStorage.setItem('instructorToken', res.data.token);
            localStorage.setItem('instructorUser', JSON.stringify(res.data.user));
            toast.success('Account created! Welcome to the instructor portal.');
            navigate('/instructor/dashboard');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Registration failed')
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mode === 'login' ? loginMutation.mutate() : registerMutation.mutate();
    };

    const isPending = loginMutation.isPending || registerMutation.isPending;

    return (
        <div className="min-h-screen bg-dark-900 flex">
            {/* Left — Branding */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-900/40 to-dark-900 p-12 flex-col justify-between border-r border-white/5">
                <Link to="/" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Platform
                </Link>
                <div>
                    <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-6">
                        <BookOpen className="w-8 h-8 text-primary-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Become an Instructor</h1>
                    <p className="text-white/60 text-lg leading-relaxed max-w-sm">
                        Share your expertise with thousands of career seekers. Upload courses, track your impact, and earn revenue from your knowledge.
                    </p>
                    <div className="mt-10 space-y-4">
                        {['Create and upload courses', 'Reach thousands of learners', 'Earn revenue per enrollment', 'Admin-verified quality seal'].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                <span className="text-white/70">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-white/50 text-sm">Course Upload Fee</p>
                    <p className="text-2xl font-bold text-white mt-1">₹499 <span className="text-white/40 text-base font-normal">/ course listing</span></p>
                    <p className="text-white/50 text-sm mt-2">One-time fee per course. Admin review included. Full access to analytics.</p>
                </div>
            </div>

            {/* Right — Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-xl">
                        {(['register', 'login'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-primary-600 text-white' : 'text-white/50 hover:text-white'}`}
                            >
                                {m === 'register' ? 'Create Account' : 'Sign In'}
                            </button>
                        ))}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        {mode === 'register' ? 'Create Instructor Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-white/50 mb-8">
                        {mode === 'register'
                            ? 'Join our platform. Pay once per course upload. Admin review within 24 hrs.'
                            : 'Sign in to manage your courses and track your learners.'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <input
                                        type="text"
                                        placeholder="Your full name"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="input-field pl-12 w-full"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Lightbulb className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <input
                                        type="text"
                                        placeholder="Your specialization (e.g., Data Science, UI/UX)"
                                        value={form.specialization}
                                        onChange={e => setForm({ ...form, specialization: e.target.value })}
                                        className="input-field pl-12 w-full"
                                    />
                                </div>
                            </>
                        )}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="input-field pl-12 w-full"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="password"
                                placeholder="Password (min. 6 characters)"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="input-field pl-12 w-full"
                                required
                            />
                        </div>

                        {mode === 'register' && (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                <p className="text-yellow-400 text-sm font-medium">💳 Upload Fee: ₹499/course</p>
                                <p className="text-white/50 text-xs mt-1">Each course submission requires a one-time listing fee. Payment is processed at upload time.</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isPending ? 'Please wait...' : mode === 'register' ? 'Create Account & Continue' : 'Sign In'}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', password: '',
        degree: '', graduationYear: ''
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await authAPI.studentRegister({
                name: form.name,
                email: form.email,
                password: form.password,
                degree: form.degree,
                graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
            });

            const { token, user } = res.data;
            login(token, user);
            toast.success('Account created successfully!');
            navigate('/student/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const benefits = ['AI Resume Analysis', 'Matched job listings', 'Gap justification letter', 'Application tracking'];

    return (
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 relative overflow-hidden text-slate-900">
            {/* Ambient liquid backdrop orbs */}
            <div className="liquid-orb-blue top-20 right-1/4 opacity-40" />
            <div className="liquid-orb-red bottom-20 left-1/4 opacity-30" />

            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center relative z-10">
                {/* Benefits side */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden md:block"
                >
                    <Link to="/" className="inline-flex items-center gap-3 mb-8">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-shade-blue-600 to-shade-blue-700 flex items-center justify-center shadow-md shadow-shade-blue-500/25 border border-shade-blue-500/30">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-slate-900 font-black text-2xl tracking-tight">Career Gap Finder</span>
                    </Link>

                    <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                        Find Jobs That Welcome You
                    </h2>
                    <p className="text-slate-600 mb-8 text-lg leading-relaxed font-semibold">
                        Stop being rejected. Connect with companies that actively seek candidates like you.
                    </p>

                    <div className="space-y-3">
                        {benefits.map(b => (
                            <div key={b} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-shade-blue-600 flex-shrink-0" />
                                <span className="text-slate-800 font-semibold">{b}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Form side */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="text-center mb-6 md:hidden">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-shade-blue-600 to-shade-blue-700 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-slate-900 font-bold text-lg">Career Gap Finder</span>
                        </Link>
                    </div>

                    <div className="glass-card p-8 shadow-xl border-slate-200/80 bg-[#fffdfa]/90">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Create Your Account</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label text-slate-700 font-bold text-sm">Full Name</label>
                                <input id="reg-name" type="text" className="input-field text-slate-900 font-medium" placeholder="John Doe"
                                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label text-slate-700 font-bold text-sm">Degree</label>
                                    <input type="text" className="input-field text-slate-900 font-medium" placeholder="B.Tech CS"
                                        value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label text-slate-700 font-bold text-sm">Graduation Year</label>
                                    <input type="number" className="input-field text-slate-900 font-medium" placeholder="2022"
                                        value={form.graduationYear} onChange={e => setForm(f => ({ ...f, graduationYear: e.target.value }))} />
                                </div>
                            </div>

                            <div>
                                <label className="label text-slate-700 font-bold text-sm">Email Address</label>
                                <input id="reg-email" type="email" className="input-field text-slate-900 font-medium" placeholder="you@example.com"
                                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                            </div>

                            <div>
                                <label className="label text-slate-700 font-bold text-sm">Password</label>
                                <div className="relative">
                                    <input id="reg-password" type={showPassword ? 'text' : 'password'} className="input-field pr-12 text-slate-900 font-medium"
                                        placeholder="Min. 6 characters"
                                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button id="reg-submit" type="submit" disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2 shadow-lg shadow-shade-blue-500/25 font-bold">
                                {isLoading
                                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><ArrowRight className="w-4 h-4" /> Create Account</>
                                }
                            </button>
                        </form>

                        <p className="text-center text-slate-600 text-sm mt-4 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-shade-blue-600 hover:text-shade-blue-700 font-bold">Sign in</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/ThemeToggle';

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
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
            style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            {/* Theme toggle — top right */}
            <div className="absolute top-5 right-5 z-20">
                <ThemeToggle variant="icon" />
            </div>

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
                        <span className="font-black text-2xl tracking-tight" style={{ color: 'var(--text-primary)' }}>Career Gap Finder</span>
                    </Link>

                    <h2 className="text-4xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Find Jobs That Welcome You
                    </h2>
                    <p className="mb-8 text-lg leading-relaxed font-semibold" style={{ color: 'var(--text-body)' }}>
                        Stop being rejected. Connect with companies that actively seek candidates like you.
                    </p>

                    <div className="space-y-3">
                        {benefits.map(b => (
                            <div key={b} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-shade-blue-600 flex-shrink-0" />
                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{b}</span>
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
                            <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Career Gap Finder</span>
                        </Link>
                    </div>

                    <div className="glass-card p-8 shadow-xl">
                        <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Create Your Account</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Full Name</label>
                                <input id="reg-name" type="text" className="input-field font-medium" placeholder="John Doe"
                                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Degree</label>
                                    <input type="text" className="input-field font-medium" placeholder="B.Tech CS"
                                        value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Graduation Year</label>
                                    <input type="number" className="input-field font-medium" placeholder="2022"
                                        value={form.graduationYear} onChange={e => setForm(f => ({ ...f, graduationYear: e.target.value }))} />
                                </div>
                            </div>

                            <div>
                                <label className="label">Email Address</label>
                                <input id="reg-email" type="email" className="input-field font-medium" placeholder="you@example.com"
                                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                            </div>

                            <div>
                                <label className="label">Password</label>
                                <div className="relative">
                                    <input id="reg-password" type={showPassword ? 'text' : 'password'} className="input-field pr-12 font-medium"
                                        placeholder="Min. 6 characters"
                                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                                        style={{ color: 'var(--text-muted)' }}>
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

                        <p className="text-center text-sm mt-4 font-medium" style={{ color: 'var(--text-body)' }}>
                            Already have an account?{' '}
                            <Link to="/login" className="text-shade-blue-600 hover:text-shade-blue-500 font-bold">Sign in</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

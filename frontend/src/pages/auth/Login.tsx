import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let res;
            const isAdminEmail = form.email.toLowerCase() === 'admin@careergap.com';
            if (isAdminEmail) {
                res = await authAPI.adminLogin(form);
            } else {
                res = await authAPI.studentLogin(form);
            }

            const { token, user } = res.data;
            login(token, user);
            toast.success(`Welcome back, ${user.name}!`);

            if (user.role === 'admin') navigate('/admin/dashboard');
            else navigate('/student/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 relative overflow-hidden text-slate-900">
            {/* Ambient liquid backdrop orbs */}
            <div className="liquid-orb-blue top-20 left-1/4 opacity-40" />
            <div className="liquid-orb-red bottom-20 right-1/4 opacity-30" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-shade-blue-600 to-shade-blue-700 flex items-center justify-center shadow-md shadow-shade-blue-500/25 border border-shade-blue-500/30">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-slate-900 font-black text-2xl tracking-tight">Career Gap Finder</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                    <p className="text-slate-600 mt-2 text-sm font-semibold">Sign in to your account</p>
                </div>

                <div className="glass-card p-8 shadow-xl border-slate-200/80 bg-[#fffdfa]/90">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label text-slate-700 font-bold text-sm">Email Address</label>
                            <input
                                id="login-email"
                                type="email"
                                className="input-field text-slate-900 font-medium"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <label className="label text-slate-700 font-bold text-sm">Password</label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field pr-12 text-slate-900 font-medium"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 shadow-lg shadow-shade-blue-500/25 font-bold"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-3">
                        <p className="text-slate-600 text-sm font-medium">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-shade-blue-600 hover:text-shade-blue-700 font-bold">
                                Sign up free
                            </Link>
                        </p>
                        <p className="text-slate-500 text-xs font-semibold">
                            Admin?{' '}
                            <button
                                onClick={() => {
                                    setForm({ email: 'admin@careergap.com', password: 'Admin@123' });
                                    toast.success('Admin credentials filled — click Sign In');
                                }}
                                className="text-shade-red-600 hover:text-shade-red-700 font-bold"
                            >
                                Fill Admin Login
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, EyeOff, User, Building2, ArrowRight } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

type Role = 'student' | 'company';

export default function Login() {
    const [searchParams] = useSearchParams();
    const [role, setRole] = useState<Role>((searchParams.get('type') as Role) || 'student');
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
            if (role === 'student') res = await authAPI.studentLogin(form);
            else if (role === 'company') res = await authAPI.companyLogin(form);
            else res = await authAPI.adminLogin(form);

            const { token, user } = res.data;
            login(token, user);
            toast.success(`Welcome back, ${user.name}!`);

            if (user.role === 'student') navigate('/student/dashboard');
            else if (user.role === 'company') navigate('/company/dashboard');
            else navigate('/admin/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
            {/* Background orbs */}
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-20 right-1/4 w-80 h-80 bg-accent-600/15 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-button-gradient flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white font-bold text-xl">Career Gap Finder</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                    <p className="text-white/50 mt-2">Sign in to your account</p>
                </div>

                <div className="glass-card p-8">
                    {/* Role Tabs */}
                    <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-xl">
                        {(['student', 'company'] as Role[]).map(r => (
                            <button key={r} onClick={() => setRole(r)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${role === r
                                        ? 'bg-primary-500 text-white shadow-lg'
                                        : 'text-white/50 hover:text-white'
                                    }`}
                            >
                                {r === 'student' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                                {r === 'student' ? 'Student' : 'Company'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label">Email Address</label>
                            <input
                                id="login-email"
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field pr-12"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Admin login hint */}
                        <AnimatePresence>
                            {false && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-white/40 text-xs text-center"
                                >
                                    Admin: admin@careergap.com / Admin@123
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-3">
                        <p className="text-white/40 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                                Sign up free
                            </Link>
                        </p>
                        <p className="text-white/30 text-xs">
                            Admin?{' '}
                            <button
                                onClick={async () => {
                                    setForm({ email: 'admin@careergap.com', password: 'Admin@123' });
                                    // trigger admin login
                                    try {
                                        const res = await authAPI.adminLogin({ email: 'admin@careergap.com', password: 'Admin@123' });
                                        login(res.data.token, res.data.user);
                                        navigate('/admin/dashboard');
                                    } catch {
                                        toast.error('Seed admin first: POST /api/admin/seed');
                                    }
                                }}
                                className="text-red-400 hover:text-red-300"
                            >
                                Admin Login
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

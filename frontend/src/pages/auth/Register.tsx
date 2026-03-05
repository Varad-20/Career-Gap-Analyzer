import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Eye, EyeOff, User, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

type Role = 'student' | 'company';

export default function Register() {
    const [searchParams] = useSearchParams();
    const [role, setRole] = useState<Role>((searchParams.get('type') as Role) || 'student');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        name: '', companyName: '', email: '', password: '',
        degree: '', graduationYear: '', industry: '', location: ''
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let res;
            if (role === 'student') {
                res = await authAPI.studentRegister({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    degree: form.degree,
                    graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
                });
            } else {
                res = await authAPI.companyRegister({
                    companyName: form.companyName,
                    email: form.email,
                    password: form.password,
                    industry: form.industry,
                    location: form.location,
                });
            }

            const { token, user } = res.data;
            login(token, user);
            toast.success('Account created successfully! 🎉');

            if (user.role === 'student') navigate('/student/dashboard');
            else navigate('/company/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const benefits = role === 'student'
        ? ['AI Resume Analysis', 'Matched job listings', 'Gap justification letter', 'Application tracking']
        : ['Post unlimited jobs', 'Access gap-candidate pool', 'AI-scored applicants', 'Free approval process'];

    return (
        <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
            <div className="fixed top-20 right-1/4 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-20 left-1/4 w-80 h-80 bg-accent-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
                {/* Benefits side */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden md:block"
                >
                    <Link to="/" className="inline-flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-button-gradient flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white font-bold text-xl">Career Gap Finder</span>
                    </Link>

                    <h2 className="text-4xl font-bold text-white mb-4">
                        {role === 'student' ? 'Find Jobs That Welcome You' : 'Hire Gap-Resilient Talent'}
                    </h2>
                    <p className="text-white/50 mb-8 text-lg">
                        {role === 'student'
                            ? 'Stop being rejected. Connect with companies that actively seek candidates like you.'
                            : 'Access a curated pool of motivated gap candidates who are ready to prove themselves.'}
                    </p>

                    <div className="space-y-3">
                        {benefits.map(b => (
                            <div key={b} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                <span className="text-white/70">{b}</span>
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
                            <div className="w-9 h-9 rounded-xl bg-button-gradient flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white font-bold text-lg">Career Gap Finder</span>
                        </Link>
                    </div>

                    <div className="glass-card p-8">
                        <h3 className="text-xl font-bold text-white mb-6">Create Your Account</h3>

                        {/* Role tabs */}
                        <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl">
                            {(['student', 'company'] as Role[]).map(r => (
                                <button key={r} onClick={() => setRole(r)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${role === r ? 'bg-primary-500 text-white' : 'text-white/50 hover:text-white'
                                        }`}
                                >
                                    {r === 'student' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                                    {r === 'student' ? 'Student' : 'Employer'}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {role === 'student' ? (
                                <>
                                    <div>
                                        <label className="label">Full Name</label>
                                        <input id="reg-name" type="text" className="input-field" placeholder="John Doe"
                                            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Degree</label>
                                            <input type="text" className="input-field" placeholder="B.Tech CS"
                                                value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="label">Graduation Year</label>
                                            <input type="number" className="input-field" placeholder="2022"
                                                value={form.graduationYear} onChange={e => setForm(f => ({ ...f, graduationYear: e.target.value }))} />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="label">Company Name</label>
                                        <input id="reg-company-name" type="text" className="input-field" placeholder="TechCorp Inc."
                                            value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Industry</label>
                                            <input type="text" className="input-field" placeholder="Technology"
                                                value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="label">Location</label>
                                            <input type="text" className="input-field" placeholder="Mumbai"
                                                value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="label">Email Address</label>
                                <input id="reg-email" type="email" className="input-field" placeholder="you@example.com"
                                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                            </div>

                            <div>
                                <label className="label">Password</label>
                                <div className="relative">
                                    <input id="reg-password" type={showPassword ? 'text' : 'password'} className="input-field pr-12"
                                        placeholder="Min. 6 characters"
                                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {role === 'company' && (
                                <p className="text-yellow-400/70 text-xs bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                    ⚠️ Company accounts require admin approval before posting jobs.
                                </p>
                            )}

                            <button id="reg-submit" type="submit" disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2">
                                {isLoading
                                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><ArrowRight className="w-4 h-4" /> Create Account</>
                                }
                            </button>
                        </form>

                        <p className="text-center text-white/40 text-sm mt-4">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

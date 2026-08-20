import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Eye, EyeOff, ArrowRight, GraduationCap, Lock, User } from 'lucide-react';
import { coordinatorAPI, collegeAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type Tab = 'login' | 'register' | 'college';

export default function CoordinatorAuth() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>('login');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [regForm, setRegForm] = useState({ name: '', email: '', password: '', phone: '', designation: 'Training & Placement Officer', department: '', collegeCode: '' });
    const [collegeForm, setCollegeForm] = useState({
        name: '', code: '', email: '', phone: '', address: '', city: '', state: '',
        website: '', affiliatedUniversity: '', currentBatch: new Date().getFullYear() + 1,
        departments: [] as string[]
    });

    const DEPARTMENTS = ['CS', 'IT', 'ECE', 'EE', 'ME', 'Civil', 'Chemical', 'MBA', 'MCA', 'Other'];

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await coordinatorAPI.login(loginForm);
            localStorage.setItem('coordinatorToken', res.data.token);
            localStorage.setItem('coordinatorUser', JSON.stringify(res.data.user));
            toast.success(`Welcome back, ${res.data.user.name}!`);
            navigate('/coordinator/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await coordinatorAPI.register(regForm);
            localStorage.setItem('coordinatorToken', res.data.token);
            localStorage.setItem('coordinatorUser', JSON.stringify(res.data.user));
            toast.success('Account created! Welcome to the Coordinator Portal.');
            navigate('/coordinator/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    const handleCollegeRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await collegeAPI.register(collegeForm);
            toast.success('College registered! Awaiting admin verification. Then register your coordinator account.');
            setTab('register');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    const toggleDept = (d: string) => {
        setCollegeForm(f => ({
            ...f,
            departments: f.departments.includes(d) ? f.departments.filter(x => x !== d) : [...f.departments, d]
        }));
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, #0a0a0f 70%)' }}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Coordinator Portal</h1>
                    <p className="text-white/40 text-sm mt-1">Placement management for training & placement officers</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 rounded-xl p-1 mb-6">
                    {([['login', 'Login'], ['register', 'Register'], ['college', 'Add College']] as [Tab, string][]).map(([t, label]) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6">

                    {/* Login */}
                    {tab === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="label">Email Address</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input type="email" required className="input-field pl-9" placeholder="tpo@college.edu"
                                        value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input type={showPw ? 'text' : 'password'} required className="input-field pl-9 pr-10"
                                        placeholder="••••••••"
                                        value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} />
                                    <button type="button" onClick={() => setShowPw(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                Sign In <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    )}

                    {/* Register Coordinator */}
                    {tab === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="label">Full Name</label>
                                    <input type="text" required className="input-field" placeholder="Dr. Priya Sharma"
                                        value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} />
                                </div>
                                <div className="col-span-2">
                                    <label className="label">Official Email</label>
                                    <input type="email" required className="input-field" placeholder="tpo@college.edu"
                                        value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Phone</label>
                                    <input type="tel" className="input-field" placeholder="9876543210"
                                        value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">College Code</label>
                                    <input type="text" required className="input-field" placeholder="e.g. MIT"
                                        value={regForm.collegeCode} onChange={e => setRegForm(f => ({ ...f, collegeCode: e.target.value.toUpperCase() }))} />
                                </div>
                                <div className="col-span-2">
                                    <label className="label">Designation</label>
                                    <input type="text" className="input-field" placeholder="Training & Placement Officer"
                                        value={regForm.designation} onChange={e => setRegForm(f => ({ ...f, designation: e.target.value }))} />
                                </div>
                                <div className="col-span-2">
                                    <label className="label">Password</label>
                                    <input type="password" required minLength={6} className="input-field"
                                        value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} />
                                </div>
                            </div>
                            <p className="text-white/30 text-xs">Your college must be registered & verified first (use "Add College" tab)</p>
                            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                                {loading ? 'Creating account...' : 'Create Coordinator Account'}
                            </button>
                        </form>
                    )}

                    {/* Register College */}
                    {tab === 'college' && (
                        <form onSubmit={handleCollegeRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="label">College Name</label>
                                    <input type="text" required className="input-field" placeholder="Maharashtra Institute of Technology"
                                        value={collegeForm.name} onChange={e => setCollegeForm(f => ({ ...f, name: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">College Code</label>
                                    <input type="text" required className="input-field" placeholder="MIT"
                                        value={collegeForm.code} onChange={e => setCollegeForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
                                </div>
                                <div>
                                    <label className="label">Official Email</label>
                                    <input type="email" required className="input-field" placeholder="placement@college.edu"
                                        value={collegeForm.email} onChange={e => setCollegeForm(f => ({ ...f, email: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">City</label>
                                    <input type="text" className="input-field" placeholder="Pune"
                                        value={collegeForm.city} onChange={e => setCollegeForm(f => ({ ...f, city: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">State</label>
                                    <input type="text" className="input-field" placeholder="Maharashtra"
                                        value={collegeForm.state} onChange={e => setCollegeForm(f => ({ ...f, state: e.target.value }))} />
                                </div>
                                <div className="col-span-2">
                                    <label className="label">Affiliated University</label>
                                    <input type="text" className="input-field" placeholder="Savitribai Phule Pune University"
                                        value={collegeForm.affiliatedUniversity} onChange={e => setCollegeForm(f => ({ ...f, affiliatedUniversity: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Current Batch (Graduation Year)</label>
                                    <input type="number" className="input-field" min={2024} max={2030}
                                        value={collegeForm.currentBatch} onChange={e => setCollegeForm(f => ({ ...f, currentBatch: parseInt(e.target.value) }))} />
                                </div>
                                <div>
                                    <label className="label">Phone</label>
                                    <input type="tel" className="input-field" placeholder="020-XXXXXXXX"
                                        value={collegeForm.phone} onChange={e => setCollegeForm(f => ({ ...f, phone: e.target.value }))} />
                                </div>
                                <div className="col-span-2">
                                    <label className="label mb-2">Departments</label>
                                    <div className="flex flex-wrap gap-2">
                                        {DEPARTMENTS.map(d => (
                                            <button key={d} type="button" onClick={() => toggleDept(d)}
                                                className={`px-3 py-1 rounded-lg text-sm transition-all ${collegeForm.departments.includes(d) ? 'bg-primary-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                                {loading ? 'Registering...' : 'Register College'}
                            </button>
                        </form>
                    )}
                </motion.div>

                <p className="text-center text-white/30 text-xs mt-4">
                    Students & companies use the main portal at <a href="/login" className="text-primary-400 hover:underline">/login</a>
                </p>
            </div>
        </div>
    );
}

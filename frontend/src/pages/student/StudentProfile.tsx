import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, GraduationCap, Clock, Save, Plus, X } from 'lucide-react';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function StudentProfile() {
    const { user, updateUser } = useAuth();
    const qc = useQueryClient();
    const [newSkill, setNewSkill] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['studentProfile'],
        queryFn: () => studentAPI.getProfile().then(r => r.data.student),
    });

    const [form, setForm] = useState({
        name: user?.name || '',
        degree: '',
        location: '',
        phone: '',
        bio: '',
        graduationYear: '',
        skills: [] as string[],
        suggestedRoles: [] as string[],
    });

    // Sync form with fetched data
    useEffect(() => {
        if (data) {
            setForm(f => ({
                ...f,
                name: data.name || f.name,
                degree: data.degree || f.degree,
                location: data.location || f.location,
                phone: data.phone || f.phone,
                bio: data.bio || f.bio,
                graduationYear: data.graduationYear?.toString() || f.graduationYear,
                skills: data.skills || f.skills,
                suggestedRoles: data.suggestedRoles || f.suggestedRoles,
            }));
        }
    }, [data]);

    const addSkill = () => {
        if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
            setForm(f => ({ ...f, skills: [...f.skills, newSkill.trim()] }));
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
    };

    const [newRole, setNewRole] = useState('');
    const addRole = () => {
        if (newRole.trim() && !form.suggestedRoles.includes(newRole.trim())) {
            setForm(f => ({ ...f, suggestedRoles: [...f.suggestedRoles, newRole.trim()] }));
            setNewRole('');
        }
    };
    const removeRole = (role: string) => {
        setForm(f => ({ ...f, suggestedRoles: f.suggestedRoles.filter(r => r !== role) }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await studentAPI.updateProfile({
                ...form,
                graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
            });
            updateUser({ ...user!, ...res.data.student });
            qc.invalidateQueries({ queryKey: ['studentProfile'] });
            toast.success('Profile updated!');
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8"><div className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" /></div>;
    }

    return (
        <div className="p-8 space-y-6 max-w-3xl text-slate-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-600 mt-1 text-sm font-medium">Keep your profile complete for better job matches</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="btn-primary flex items-center gap-2 shadow-lg shadow-shade-blue-500/25">
                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            {/* Avatar section */}
            <div className="glass-card p-6 flex items-center gap-6 shadow-md border-slate-200/80">
                <div className="w-20 h-20 rounded-2xl bg-shade-blue-500/10 border border-shade-blue-500/25 flex items-center justify-center text-3xl font-black text-shade-blue-600 shadow-sm">
                    {form.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-slate-900 font-bold text-xl">{form.name}</p>
                    <p className="text-slate-600 text-sm font-medium">{user?.email}</p>
                    <span className={`badge mt-2.5 ${data?.isProfileComplete ? 'badge-green' : 'badge-yellow'}`}>
                        {data?.isProfileComplete ? 'Profile Complete' : 'Profile Incomplete'}
                    </span>
                </div>
            </div>

            {/* Personal Info */}
            <div className="glass-card p-6 space-y-5 shadow-md border-slate-200/80">
                <h2 className="text-slate-900 font-bold flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-shade-blue-600" /> Personal Information
                </h2>

                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="label flex items-center gap-2"><User className="w-3.5 h-3.5 text-shade-blue-600" /> Full Name</label>
                        <input type="text" className="input-field text-sm font-medium" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5 text-shade-blue-600" /> Degree</label>
                        <input type="text" className="input-field text-sm font-medium" placeholder="e.g. B.Tech Computer Science"
                            value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-shade-blue-600" /> Graduation Year</label>
                        <input type="number" className="input-field text-sm font-medium" placeholder="2025"
                            value={form.graduationYear} onChange={e => setForm(f => ({ ...f, graduationYear: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-shade-blue-600" /> Phone</label>
                        <input type="tel" className="input-field text-sm font-medium" placeholder="+91 9876543210"
                            value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="label flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-shade-blue-600" /> Location</label>
                        <input type="text" className="input-field text-sm font-medium" placeholder="Mumbai, India"
                            value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                    </div>
                </div>

                <div>
                    <label className="label">Bio</label>
                    <textarea className="input-field h-24 resize-none text-sm font-medium" placeholder="Tell companies about yourself..."
                        value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                </div>
            </div>

            {/* Skills */}
            <div className="glass-card p-6 shadow-md border-slate-200/80">
                <h2 className="text-slate-900 font-bold mb-4 text-lg">Skills</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                    {form.skills.map(skill => (
                        <motion.span
                            key={skill}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="badge-blue flex items-center gap-1.5 font-semibold rounded-full px-3.5 py-1.5"
                        >
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="text-shade-blue-700 hover:text-shade-red-600 ml-1">
                                <X className="w-3 h-3" />
                            </button>
                        </motion.span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="input-field text-sm font-medium"
                        placeholder="Add a skill (e.g. React, Python...)"
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addSkill()}
                    />
                    <button onClick={addSkill} className="btn-secondary px-4">
                        <Plus className="w-5 h-5 text-shade-blue-600" />
                    </button>
                </div>
            </div>

            {/* Target Job Roles */}
            <div className="glass-card p-6 shadow-md border-slate-200/80">
                <h2 className="text-slate-900 font-bold mb-1 text-lg">Target Job Roles</h2>
                <p className="text-slate-600 text-sm mb-4 font-medium">The AI Career Agent uses these roles to search for jobs.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {form.suggestedRoles.map(role => (
                        <motion.span
                            key={role}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="badge flex items-center gap-1.5 bg-shade-blue-500/10 text-shade-blue-700 border border-shade-blue-500/25 font-semibold"
                        >
                            {role}
                            <button onClick={() => removeRole(role)} className="text-shade-blue-700 hover:text-shade-red-600 ml-1">
                                <X className="w-3 h-3" />
                            </button>
                        </motion.span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="input-field text-sm font-medium"
                        placeholder="Add a target role (e.g. Frontend Developer...)"
                        value={newRole}
                        onChange={e => setNewRole(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addRole()}
                    />
                    <button onClick={addRole} className="btn-secondary px-4">
                        <Plus className="w-5 h-5 text-shade-blue-600" />
                    </button>
                </div>
            </div>

            {/* Gap Info (read-only, from AI) */}
            {data?.gapDuration !== undefined && (
                <div className="glass-card p-6 shadow-md border-slate-200/80">
                    <h2 className="text-slate-900 font-bold mb-4 text-lg">Career Gap Information <span className="text-xs text-slate-500 font-normal">(AI detected)</span></h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-slate-100/80 border border-slate-200/80 rounded-xl p-4 text-center">
                            <p className="text-3xl font-black text-shade-red-600 tracking-tight">{data?.gapDuration || 0}</p>
                            <p className="text-slate-600 text-sm mt-1 font-semibold">Gap Duration (months)</p>
                        </div>
                        <div className="bg-slate-100/80 border border-slate-200/80 rounded-xl p-4 text-center">
                            <p className={`text-xl font-bold ${data?.gapRiskLevel === 'Low' ? 'text-emerald-600' : data?.gapRiskLevel === 'Medium' ? 'text-amber-600' : 'text-shade-red-600'}`}>
                                {data?.gapRiskLevel || 'Unknown'}
                            </p>
                            <p className="text-slate-600 text-sm mt-1 font-semibold">Risk Level</p>
                        </div>
                        <div className="bg-slate-100/80 border border-slate-200/80 rounded-xl p-4 text-center">
                            <p className="text-3xl font-black text-shade-blue-600 tracking-tight">{data?.resumeScore || 0}%</p>
                            <p className="text-slate-600 text-sm mt-1 font-semibold">Resume Score</p>
                        </div>
                    </div>
                    {data?.gapJustification && (
                        <div className="mt-4 p-4 bg-shade-blue-500/10 rounded-xl border border-shade-blue-500/20">
                            <p className="text-slate-700 text-sm italic font-medium">"{data.gapJustification}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

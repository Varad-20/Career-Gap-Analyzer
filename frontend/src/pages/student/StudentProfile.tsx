import { useState } from 'react';
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
    });

    // Sync form with fetched data
    if (data && !form.degree && data.degree) {
        setForm({
            name: data.name,
            degree: data.degree || '',
            location: data.location || '',
            phone: data.phone || '',
            bio: data.bio || '',
            graduationYear: data.graduationYear?.toString() || '',
            skills: data.skills || [],
        });
    }

    const addSkill = () => {
        if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
            setForm(f => ({ ...f, skills: [...f.skills, newSkill.trim()] }));
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
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
        return <div className="p-8"><div className="h-64 bg-white/5 rounded-2xl animate-pulse" /></div>;
    }

    return (
        <div className="p-8 space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Profile</h1>
                    <p className="text-white/50 mt-1">Keep your profile complete for better job matches</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="btn-primary flex items-center gap-2">
                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            {/* Avatar section */}
            <div className="glass-card p-6 flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-3xl font-black text-primary-400">
                    {form.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-white font-semibold text-lg">{form.name}</p>
                    <p className="text-white/50">{user?.email}</p>
                    <span className={`badge mt-2 ${data?.isProfileComplete ? 'badge-green' : 'badge-yellow'}`}>
                        {data?.isProfileComplete ? 'Profile Complete' : 'Profile Incomplete'}
                    </span>
                </div>
            </div>

            {/* Personal Info */}
            <div className="glass-card p-6 space-y-5">
                <h2 className="text-white font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-400" /> Personal Information
                </h2>

                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="label flex items-center gap-2"><User className="w-3.5 h-3.5" /> Full Name</label>
                        <input type="text" className="input-field" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5" /> Degree</label>
                        <input type="text" className="input-field" placeholder="e.g. B.Tech Computer Science"
                            value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Graduation Year</label>
                        <input type="number" className="input-field" placeholder="2022"
                            value={form.graduationYear} onChange={e => setForm(f => ({ ...f, graduationYear: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Phone</label>
                        <input type="tel" className="input-field" placeholder="+91 9876543210"
                            value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Location</label>
                        <input type="text" className="input-field" placeholder="Mumbai, India"
                            value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                    </div>
                </div>

                <div>
                    <label className="label">Bio</label>
                    <textarea className="input-field h-24 resize-none" placeholder="Tell companies about yourself..."
                        value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                </div>
            </div>

            {/* Skills */}
            <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                    {form.skills.map(skill => (
                        <motion.span
                            key={skill}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="badge-blue flex items-center gap-1.5"
                        >
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="text-blue-400 hover:text-red-400 ml-1">
                                <X className="w-3 h-3" />
                            </button>
                        </motion.span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Add a skill (e.g. React, Python...)"
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addSkill()}
                    />
                    <button onClick={addSkill} className="btn-secondary px-4">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Gap Info (read-only, from AI) */}
            {data?.gapDuration !== undefined && (
                <div className="glass-card p-6">
                    <h2 className="text-white font-semibold mb-4">Career Gap Information <span className="text-xs text-white/40 font-normal">(AI detected)</span></h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <p className="text-3xl font-black text-yellow-400">{data?.gapDuration || 0}</p>
                            <p className="text-white/50 text-sm mt-1">Gap Duration (months)</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <p className={`text-xl font-bold ${data?.gapRiskLevel === 'Low' ? 'text-emerald-400' : data?.gapRiskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                                {data?.gapRiskLevel || 'Unknown'}
                            </p>
                            <p className="text-white/50 text-sm mt-1">Risk Level</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <p className="text-3xl font-black text-primary-400">{data?.resumeScore || 0}%</p>
                            <p className="text-white/50 text-sm mt-1">Resume Score</p>
                        </div>
                    </div>
                    {data?.gapJustification && (
                        <div className="mt-4 p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
                            <p className="text-white/60 text-sm italic">"{data.gapJustification}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

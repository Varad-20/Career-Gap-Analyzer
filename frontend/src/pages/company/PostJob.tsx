import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Plus, X, Send } from 'lucide-react';
import { companyAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function PostJob() {
    const navigate = useNavigate();
    const [newSkill, setNewSkill] = useState('');
    const [form, setForm] = useState({
        jobRole: '',
        description: '',
        requiredSkills: [] as string[],
        experienceRequired: '',
        location: '',
        salaryMin: '',
        salaryMax: '',
        jobType: 'Full-time',
        acceptGap: false,
        maxGapAllowed: '',
        deadline: '',
    });

    const addSkill = () => {
        if (newSkill.trim() && !form.requiredSkills.includes(newSkill.trim())) {
            setForm(f => ({ ...f, requiredSkills: [...f.requiredSkills, newSkill.trim()] }));
            setNewSkill('');
        }
    };

    const mutation = useMutation({
        mutationFn: (data: object) => companyAPI.createJob(data),
        onSuccess: () => {
            toast.success('Job posted successfully! 🎉');
            navigate('/company/dashboard');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to post job'),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.jobRole || !form.description) {
            toast.error('Please fill in required fields');
            return;
        }
        mutation.mutate({
            ...form,
            experienceRequired: form.experienceRequired ? parseInt(form.experienceRequired) : 0,
            salaryMin: form.salaryMin ? parseInt(form.salaryMin) : 0,
            salaryMax: form.salaryMax ? parseInt(form.salaryMax) : 0,
            maxGapAllowed: form.maxGapAllowed ? parseInt(form.maxGapAllowed) : 0,
        });
    };

    return (
        <div className="p-8 max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Post a New Job</h1>
                <p className="text-white/50 mt-1">Create a job posting to attract gap-friendly candidates</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="glass-card p-6 space-y-5">
                    <h2 className="text-white font-semibold flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary-400" /> Job Details
                    </h2>

                    <div>
                        <label className="label">Job Role / Position *</label>
                        <input type="text" className="input-field" placeholder="e.g. Frontend Developer"
                            value={form.jobRole} onChange={e => setForm(f => ({ ...f, jobRole: e.target.value }))} required />
                    </div>

                    <div>
                        <label className="label">Job Description *</label>
                        <textarea className="input-field h-32 resize-none" placeholder="Describe the role, responsibilities, and requirements..."
                            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="label">Job Type</label>
                            <select className="input-field" value={form.jobType} onChange={e => setForm(f => ({ ...f, jobType: e.target.value }))}>
                                {['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">Experience (years)</label>
                            <input type="number" className="input-field" placeholder="0"
                                value={form.experienceRequired} onChange={e => setForm(f => ({ ...f, experienceRequired: e.target.value }))} />
                        </div>
                    </div>
                </div>

                {/* Location & Salary */}
                <div className="glass-card p-6 space-y-5">
                    <h2 className="text-white font-semibold flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-400" /> Location & Compensation
                    </h2>

                    <div>
                        <label className="label flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Location</label>
                        <input type="text" className="input-field" placeholder="e.g. Mumbai, Remote"
                            value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="label flex items-center gap-2"><DollarSign className="w-3.5 h-3.5" /> Min Salary (₹/year)</label>
                            <input type="number" className="input-field" placeholder="300000"
                                value={form.salaryMin} onChange={e => setForm(f => ({ ...f, salaryMin: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label flex items-center gap-2"><DollarSign className="w-3.5 h-3.5" /> Max Salary (₹/year)</label>
                            <input type="number" className="input-field" placeholder="600000"
                                value={form.salaryMax} onChange={e => setForm(f => ({ ...f, salaryMax: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <label className="label">Application Deadline</label>
                        <input type="date" className="input-field"
                            value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                    </div>
                </div>

                {/* Required Skills */}
                <div className="glass-card p-6 space-y-4">
                    <h2 className="text-white font-semibold">Required Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {form.requiredSkills.map(skill => (
                            <span key={skill} className="badge-blue flex items-center gap-1.5">
                                {skill}
                                <button type="button" onClick={() => setForm(f => ({ ...f, requiredSkills: f.requiredSkills.filter(s => s !== skill) }))}>
                                    <X className="w-3 h-3 text-blue-400 hover:text-red-400" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input type="text" className="input-field" placeholder="Add skill (Enter to add)"
                            value={newSkill} onChange={e => setNewSkill(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
                        <button type="button" onClick={addSkill} className="btn-secondary px-4">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Gap Policy */}
                <div className="glass-card p-6 space-y-4">
                    <h2 className="text-white font-semibold">Career Gap Policy</h2>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                            <p className="text-white font-medium">Accept Career Gap Candidates?</p>
                            <p className="text-white/50 text-sm">Enable to appear in gap candidate matches</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, acceptGap: !f.acceptGap }))}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${form.acceptGap ? 'bg-primary-500' : 'bg-white/20'
                                }`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${form.acceptGap ? 'translate-x-8' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>

                    {form.acceptGap && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <label className="label">Maximum Gap Allowed (months)</label>
                            <input type="number" className="input-field" placeholder="12"
                                value={form.maxGapAllowed} onChange={e => setForm(f => ({ ...f, maxGapAllowed: e.target.value }))} />
                        </motion.div>
                    )}
                </div>

                <button type="submit" disabled={mutation.isPending}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
                    {mutation.isPending
                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><Send className="w-5 h-5" /> Post Job</>
                    }
                </button>
            </form>
        </div>
    );
}

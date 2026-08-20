import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Building2, Calendar, Users, ChevronRight, Trash2, Edit3,
    Clock, CheckCircle, X, Briefcase, DollarSign, Shield, Save, Search
} from 'lucide-react';
import { coordinatorAPI, companyAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BRANCHES = ['CS', 'IT', 'ECE', 'EE', 'ME', 'Civil', 'Chemical', 'MBA', 'MCA', 'Other'];
const ROUND_TYPES = ['aptitude', 'coding', 'gd', 'technical', 'hr', 'assignment', 'other'];

const emptyDrive = {
    title: '', company: '', jobRole: '', jobDescription: '', driveType: 'placement',
    jobLocation: '', workType: 'On-site',
    packageMin: 0, packageMax: 0, packageDisplay: '',
    stipend: 0,
    bond: { hasBond: false, durationMonths: 0, details: '' },
    eligibility: { minCGPA: 0, branches: [] as string[], maxActiveBacklogs: 0, minPercentage10th: 0, minPercentage12th: 0, batchYear: new Date().getFullYear(), gapAllowed: true },
    rounds: [] as { name: string; type: string; scheduledAt: string; durationMinutes: number }[],
    venue: '', driveDate: '', registrationDeadline: '', additionalInfo: '', status: 'upcoming',
};

const statusBadge: Record<string, string> = {
    upcoming: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    ongoing: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
    draft: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

export default function ManageDrives() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...emptyDrive });
    const [search, setSearch] = useState('');

    // Fetch companies for dropdown
    const { data: driveData } = useQuery({
        queryKey: ['coord-drives'],
        queryFn: () => coordinatorAPI.getDrives({ status: 'all' }).then(r => r.data),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => editId ? coordinatorAPI.updateDrive(editId, data) : coordinatorAPI.createDrive(data),
        onSuccess: () => {
            toast.success(editId ? 'Drive updated!' : 'Drive created and students notified! 🎉');
            queryClient.invalidateQueries({ queryKey: ['coord-drives'] });
            setShowForm(false);
            setEditId(null);
            setForm({ ...emptyDrive });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save drive'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => coordinatorAPI.deleteDrive(id),
        onSuccess: () => {
            toast.success('Drive cancelled');
            queryClient.invalidateQueries({ queryKey: ['coord-drives'] });
        },
    });

    const drives = (driveData?.drives || []).filter((d: any) =>
        !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.company?.companyName?.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (drive: any) => {
        setForm({
            title: drive.title, company: drive.company?._id || '', jobRole: drive.jobRole,
            jobDescription: drive.jobDescription, driveType: drive.driveType,
            jobLocation: drive.jobLocation, workType: drive.workType,
            packageMin: drive.packageMin, packageMax: drive.packageMax, packageDisplay: drive.packageDisplay,
            stipend: drive.stipend, bond: drive.bond || emptyDrive.bond,
            eligibility: drive.eligibility || emptyDrive.eligibility,
            rounds: drive.rounds || [], venue: drive.venue,
            driveDate: drive.driveDate?.split('T')[0] || '',
            registrationDeadline: drive.registrationDeadline?.split('T')[0] || '',
            additionalInfo: drive.additionalInfo, status: drive.status,
        });
        setEditId(drive._id);
        setShowForm(true);
    };

    const addRound = () => setForm(f => ({ ...f, rounds: [...f.rounds, { name: '', type: 'aptitude', scheduledAt: '', durationMinutes: 60 }] }));
    const removeRound = (i: number) => setForm(f => ({ ...f, rounds: f.rounds.filter((_, idx) => idx !== i) }));
    const updateRound = (i: number, field: string, val: any) => setForm(f => ({
        ...f, rounds: f.rounds.map((r, idx) => idx === i ? { ...r, [field]: val } : r)
    }));

    const toggleBranch = (b: string) => setForm(f => ({
        ...f,
        eligibility: {
            ...f.eligibility,
            branches: f.eligibility.branches.includes(b)
                ? f.eligibility.branches.filter(x => x !== b)
                : [...f.eligibility.branches, b]
        }
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(form);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Placement Drives</h1>
                    <p className="text-white/40 text-sm mt-1">{drives.length} drives for your college</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyDrive }); }}
                    className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Drive
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" placeholder="Search drives..." className="input-field pl-9 py-2 text-sm"
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Drive List */}
            <div className="space-y-3">
                {drives.length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40">No drives yet. Create your first drive!</p>
                    </div>
                )}
                {drives.map((d: any) => (
                    <motion.div key={d._id} layout className="glass-card p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {d.company?.logo ? <img src={d.company.logo} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-white/40" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-white font-medium truncate">{d.title}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge[d.status]}`}>{d.status}</span>
                            </div>
                            <p className="text-white/40 text-sm">{d.company?.companyName} · {d.jobRole} · {d.packageDisplay || `${d.packageMin}–${d.packageMax} LPA`}</p>
                            <div className="flex gap-4 mt-1 text-xs text-white/30">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(d.driveDate).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {d.totalRegistered} registered</span>
                                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> {d.totalSelected} selected</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => navigate(`/coordinator/drives/${d._id}`)}
                                className="btn-secondary text-xs flex items-center gap-1">
                                Manage <ChevronRight className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleEdit(d)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70">
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => { if (confirm('Cancel this drive?')) deleteMutation.mutate(d._id); }}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create/Edit Drive Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                            className="glass-card w-full max-w-3xl my-6">
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <h2 className="text-lg font-semibold text-white">{editId ? 'Edit Drive' : 'Create Placement Drive'}</h2>
                                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-white/5">
                                    <X className="w-5 h-5 text-white/50" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                                {/* Basic Info */}
                                <div>
                                    <h3 className="text-white/70 text-sm font-medium mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Drive Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="label">Drive Title *</label>
                                            <input required className="input-field" placeholder="TCS NQT 2025 Campus Drive"
                                                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="label">Drive Type</label>
                                            <select className="input-field" value={form.driveType} onChange={e => setForm(f => ({ ...f, driveType: e.target.value }))}>
                                                <option value="placement">Full-time Placement</option>
                                                <option value="internship">Internship</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Work Type</label>
                                            <select className="input-field" value={form.workType} onChange={e => setForm(f => ({ ...f, workType: e.target.value }))}>
                                                <option>On-site</option><option>Remote</option><option>Hybrid</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Job Role *</label>
                                            <input required className="input-field" placeholder="Software Engineer"
                                                value={form.jobRole} onChange={e => setForm(f => ({ ...f, jobRole: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="label">Job Location</label>
                                            <input className="input-field" placeholder="Pune, Mumbai, WFH"
                                                value={form.jobLocation} onChange={e => setForm(f => ({ ...f, jobLocation: e.target.value }))} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label">Company ID (from admin)</label>
                                            <input className="input-field" placeholder="Company ObjectId"
                                                value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label">Job Description *</label>
                                            <textarea required rows={4} className="input-field resize-none" placeholder="Describe the role, responsibilities..."
                                                value={form.jobDescription} onChange={e => setForm(f => ({ ...f, jobDescription: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>

                                {/* Package */}
                                <div>
                                    <h3 className="text-white/70 text-sm font-medium mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Package / Stipend</h3>
                                    {form.driveType === 'placement' ? (
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="label">Min (LPA)</label>
                                                <input type="number" className="input-field" min={0}
                                                    value={form.packageMin} onChange={e => setForm(f => ({ ...f, packageMin: parseFloat(e.target.value) }))} />
                                            </div>
                                            <div>
                                                <label className="label">Max (LPA)</label>
                                                <input type="number" className="input-field" min={0}
                                                    value={form.packageMax} onChange={e => setForm(f => ({ ...f, packageMax: parseFloat(e.target.value) }))} />
                                            </div>
                                            <div>
                                                <label className="label">Display Text</label>
                                                <input className="input-field" placeholder="3.6 - 5 LPA"
                                                    value={form.packageDisplay} onChange={e => setForm(f => ({ ...f, packageDisplay: e.target.value }))} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="label">Stipend (₹/month)</label>
                                            <input type="number" className="input-field w-48" min={0}
                                                value={form.stipend} onChange={e => setForm(f => ({ ...f, stipend: parseFloat(e.target.value) }))} />
                                        </div>
                                    )}
                                    <div className="mt-3 flex items-center gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={form.bond.hasBond}
                                                onChange={e => setForm(f => ({ ...f, bond: { ...f.bond, hasBond: e.target.checked } }))} />
                                            <span className="text-white/60 text-sm">Has bond/service agreement</span>
                                        </label>
                                        {form.bond.hasBond && (
                                            <input type="number" className="input-field w-32 py-1 text-sm" placeholder="Months"
                                                value={form.bond.durationMonths} onChange={e => setForm(f => ({ ...f, bond: { ...f.bond, durationMonths: parseInt(e.target.value) } }))} />
                                        )}
                                    </div>
                                </div>

                                {/* Eligibility */}
                                <div>
                                    <h3 className="text-white/70 text-sm font-medium mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> Eligibility Criteria</h3>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="label">Min CGPA</label>
                                            <input type="number" step="0.1" min={0} max={10} className="input-field"
                                                value={form.eligibility.minCGPA} onChange={e => setForm(f => ({ ...f, eligibility: { ...f.eligibility, minCGPA: parseFloat(e.target.value) } }))} />
                                        </div>
                                        <div>
                                            <label className="label">Max Active Backlogs</label>
                                            <input type="number" min={0} className="input-field"
                                                value={form.eligibility.maxActiveBacklogs} onChange={e => setForm(f => ({ ...f, eligibility: { ...f.eligibility, maxActiveBacklogs: parseInt(e.target.value) } }))} />
                                        </div>
                                        <div>
                                            <label className="label">Batch Year</label>
                                            <input type="number" min={2024} max={2030} className="input-field"
                                                value={form.eligibility.batchYear} onChange={e => setForm(f => ({ ...f, eligibility: { ...f.eligibility, batchYear: parseInt(e.target.value) } }))} />
                                        </div>
                                        <div>
                                            <label className="label">Min 10th %</label>
                                            <input type="number" min={0} max={100} className="input-field"
                                                value={form.eligibility.minPercentage10th} onChange={e => setForm(f => ({ ...f, eligibility: { ...f.eligibility, minPercentage10th: parseFloat(e.target.value) } }))} />
                                        </div>
                                        <div>
                                            <label className="label">Min 12th %</label>
                                            <input type="number" min={0} max={100} className="input-field"
                                                value={form.eligibility.minPercentage12th} onChange={e => setForm(f => ({ ...f, eligibility: { ...f.eligibility, minPercentage12th: parseFloat(e.target.value) } }))} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label mb-2">Allowed Branches (empty = all)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {BRANCHES.map(b => (
                                                <button key={b} type="button" onClick={() => toggleBranch(b)}
                                                    className={`px-3 py-1 rounded-lg text-sm transition-all ${form.eligibility.branches.includes(b) ? 'bg-primary-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                                                    {b}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Rounds */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-white/70 text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Interview Rounds</h3>
                                        <button type="button" onClick={addRound} className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
                                            <Plus className="w-4 h-4" /> Add Round
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {form.rounds.map((r, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                                                <span className="text-white/40 font-bold text-sm w-5 flex-shrink-0">{i + 1}</span>
                                                <input className="input-field flex-1 py-1.5 text-sm" placeholder="Round name"
                                                    value={r.name} onChange={e => updateRound(i, 'name', e.target.value)} />
                                                <select className="input-field py-1.5 text-sm w-36" value={r.type} onChange={e => updateRound(i, 'type', e.target.value)}>
                                                    {ROUND_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                                </select>
                                                <input type="date" className="input-field py-1.5 text-sm w-36"
                                                    value={r.scheduledAt} onChange={e => updateRound(i, 'scheduledAt', e.target.value)} />
                                                <button type="button" onClick={() => removeRound(i)} className="text-red-400/60 hover:text-red-400 flex-shrink-0">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dates */}
                                <div>
                                    <h3 className="text-white/70 text-sm font-medium mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Schedule</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="label">Drive Date *</label>
                                            <input type="date" required className="input-field"
                                                value={form.driveDate} onChange={e => setForm(f => ({ ...f, driveDate: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="label">Registration Deadline *</label>
                                            <input type="date" required className="input-field"
                                                value={form.registrationDeadline} onChange={e => setForm(f => ({ ...f, registrationDeadline: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="label">Venue</label>
                                            <input className="input-field" placeholder="Seminar Hall A / Google Meet"
                                                value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                                    <button type="submit" disabled={createMutation.isPending} className="btn-primary flex items-center gap-2">
                                        <Save className="w-4 h-4" />
                                        {createMutation.isPending ? 'Saving...' : editId ? 'Update Drive' : 'Create Drive'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

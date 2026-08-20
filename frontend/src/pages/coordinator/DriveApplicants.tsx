import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, CheckCircle, XCircle, Clock, ChevronDown, Award, Upload,
    Filter, Search, Eye, Download, Building2, Star, AlertCircle, X
} from 'lucide-react';
import { coordinatorAPI } from '../../services/api';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { label: string; color: string }> = {
    registered: { label: 'Registered', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    shortlisted: { label: 'Shortlisted', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    in_process: { label: 'In Process', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    selected: { label: 'Selected ✓', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    rejected: { label: 'Rejected', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    on_hold: { label: 'On Hold', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
};

export default function DriveApplicants() {
    const { driveId } = useParams<{ driveId: string }>();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [roundForm, setRoundForm] = useState({ roundIndex: 0, roundName: '', status: 'pass', score: '', remarks: '' });
    const [offerForm, setOfferForm] = useState({ offeredPackage: 0, offeredRole: '', offerDeadline: '', offerLetter: '' });
    const [modal, setModal] = useState<'round' | 'offer' | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['drive-applicants', driveId, statusFilter],
        queryFn: () => coordinatorAPI.getApplicants(driveId!, { status: statusFilter !== 'all' ? statusFilter : undefined }).then(r => r.data),
    });

    const roundMutation = useMutation({
        mutationFn: ({ appId, data }: any) => coordinatorAPI.updateRoundResult(driveId!, appId, data),
        onSuccess: () => { toast.success('Round result updated'); queryClient.invalidateQueries({ queryKey: ['drive-applicants'] }); setModal(null); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
    });

    const offerMutation = useMutation({
        mutationFn: ({ appId, data }: any) => coordinatorAPI.issueOffer(driveId!, appId, data),
        onSuccess: () => { toast.success('🎉 Offer issued! Student has been notified.'); queryClient.invalidateQueries({ queryKey: ['drive-applicants'] }); setModal(null); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
    });

    const applicants = (data?.applicants || []).filter((a: any) => {
        if (!search) return true;
        const s = a.student;
        return s?.name?.toLowerCase().includes(search.toLowerCase()) || s?.enrollmentNo?.includes(search) || s?.email?.toLowerCase().includes(search.toLowerCase());
    });

    if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Drive Applicants</h1>
                    <p className="text-white/40 text-sm mt-1">{data?.total || 0} students registered</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="text" placeholder="Search by name, roll no..."
                        className="input-field pl-9 py-2 text-sm w-64"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', ...Object.keys(statusConfig)].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === s ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                            {s === 'all' ? 'All' : statusConfig[s]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-6 gap-3">
                {Object.entries(statusConfig).map(([key, val]) => {
                    const count = data?.applicants?.filter((a: any) => a.status === key).length || 0;
                    return (
                        <div key={key} className={`p-2 rounded-xl border text-center ${val.color}`}>
                            <p className="font-bold">{count}</p>
                            <p className="text-xs opacity-70">{val.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Applicant table */}
            <div className="glass-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5">
                            {['Student', 'Roll No', 'Branch', 'CGPA', 'Backlogs', 'Current Round', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-white/40 font-medium text-xs">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {applicants.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-12 text-white/30">No applicants found</td></tr>
                        ) : applicants.map((app: any) => {
                            const s = app.student;
                            const sc = statusConfig[app.status];
                            return (
                                <tr key={app._id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-white font-medium">{s?.name}</p>
                                            <p className="text-white/40 text-xs">{s?.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-white/60">{s?.enrollmentNo || '–'}</td>
                                    <td className="px-4 py-3 text-white/60">{s?.branch || '–'}</td>
                                    <td className="px-4 py-3 text-white font-medium">{s?.cgpa || '–'}</td>
                                    <td className="px-4 py-3">
                                        <span className={s?.activeBacklogs > 0 ? 'text-red-400' : 'text-white/60'}>{s?.activeBacklogs || 0}</span>
                                    </td>
                                    <td className="px-4 py-3 text-white/60">{app.currentRound + 1}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${sc?.color || ''}`}>
                                            {sc?.label || app.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {s?.resumeURL && (
                                                <a href={s.resumeURL} target="_blank" rel="noreferrer"
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                            {app.status !== 'selected' && app.status !== 'rejected' && (
                                                <button onClick={() => { setSelectedApp(app); setRoundForm(f => ({ ...f, roundIndex: app.currentRound })); setModal('round'); }}
                                                    className="px-2 py-1 rounded-lg bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 text-xs">
                                                    Round Result
                                                </button>
                                            )}
                                            {app.status !== 'selected' && app.status !== 'rejected' && (
                                                <button onClick={() => { setSelectedApp(app); setModal('offer'); }}
                                                    className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs">
                                                    Issue Offer
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Round Result Modal */}
            <AnimatePresence>
                {modal === 'round' && selectedApp && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card w-full max-w-md p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-white font-semibold">Update Round Result</h3>
                                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-white/40" /></button>
                            </div>
                            <p className="text-white/60 text-sm mb-4">Student: <span className="text-white">{selectedApp.student?.name}</span></p>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Round Index (0-based)</label>
                                    <input type="number" min={0} className="input-field" value={roundForm.roundIndex}
                                        onChange={e => setRoundForm(f => ({ ...f, roundIndex: parseInt(e.target.value) }))} />
                                </div>
                                <div>
                                    <label className="label">Round Name</label>
                                    <input className="input-field" placeholder="Aptitude Test" value={roundForm.roundName}
                                        onChange={e => setRoundForm(f => ({ ...f, roundName: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Result</label>
                                    <select className="input-field" value={roundForm.status}
                                        onChange={e => setRoundForm(f => ({ ...f, status: e.target.value }))}>
                                        <option value="pass">Pass ✓</option>
                                        <option value="fail">Fail ✗</option>
                                        <option value="absent">Absent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Score (optional)</label>
                                    <input type="number" className="input-field" placeholder="85"
                                        value={roundForm.score} onChange={e => setRoundForm(f => ({ ...f, score: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Remarks</label>
                                    <input className="input-field" placeholder="Good problem-solving skills"
                                        value={roundForm.remarks} onChange={e => setRoundForm(f => ({ ...f, remarks: e.target.value }))} />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setModal(null)} className="flex-1 btn-secondary">Cancel</button>
                                    <button onClick={() => roundMutation.mutate({ appId: selectedApp._id, data: { ...roundForm, score: roundForm.score ? Number(roundForm.score) : undefined } })}
                                        disabled={roundMutation.isPending} className="flex-1 btn-primary">
                                        {roundMutation.isPending ? 'Saving...' : 'Save Result'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {modal === 'offer' && selectedApp && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card w-full max-w-md p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-white font-semibold flex items-center gap-2"><Award className="w-5 h-5 text-emerald-400" /> Issue Offer</h3>
                                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-white/40" /></button>
                            </div>
                            <p className="text-white/60 text-sm mb-4">Placing: <span className="text-white font-medium">{selectedApp.student?.name}</span></p>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Offered Role</label>
                                    <input className="input-field" placeholder="Software Engineer"
                                        value={offerForm.offeredRole} onChange={e => setOfferForm(f => ({ ...f, offeredRole: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Package (LPA)</label>
                                    <input type="number" step="0.1" className="input-field" placeholder="4.5"
                                        value={offerForm.offeredPackage || ''} onChange={e => setOfferForm(f => ({ ...f, offeredPackage: parseFloat(e.target.value) }))} />
                                </div>
                                <div>
                                    <label className="label">Offer Acceptance Deadline</label>
                                    <input type="date" className="input-field"
                                        value={offerForm.offerDeadline} onChange={e => setOfferForm(f => ({ ...f, offerDeadline: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Offer Letter URL (optional)</label>
                                    <input type="url" className="input-field" placeholder="https://..."
                                        value={offerForm.offerLetter} onChange={e => setOfferForm(f => ({ ...f, offerLetter: e.target.value }))} />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setModal(null)} className="flex-1 btn-secondary">Cancel</button>
                                    <button onClick={() => offerMutation.mutate({ appId: selectedApp._id, data: offerForm })}
                                        disabled={offerMutation.isPending} className="flex-1 btn-primary bg-emerald-600 hover:bg-emerald-500">
                                        {offerMutation.isPending ? 'Issuing...' : '🎉 Issue Offer & Place Student'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

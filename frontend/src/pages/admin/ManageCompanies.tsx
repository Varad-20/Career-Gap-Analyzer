import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Trash2, CheckCircle, Clock, Globe, Search,
    MapPin, Briefcase, Eye, Shield, XCircle, AlertTriangle, Users
} from 'lucide-react';
import { adminAPI } from '../../services/api.ts';
import toast from 'react-hot-toast';

interface Company {
    _id: string;
    companyName: string;
    email: string;
    industry?: string;
    location?: string;
    website?: string;
    description?: string;
    isApproved: boolean;
    isVerified?: boolean;
    createdAt: string;
}

export default function ManageCompanies() {
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['adminCompanies'],
        queryFn: () => adminAPI.getCompanies().then(r => r.data.companies as Company[]),
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => adminAPI.approveCompany(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['adminCompanies'] });
            toast.success('✅ Company approved! They can now post jobs.');
            setSelectedCompany(null);
        },
        onError: () => toast.error('Failed to approve company'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminAPI.deleteCompany(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['adminCompanies'] });
            toast.success('Company removed from platform');
            setSelectedCompany(null);
        },
        onError: () => toast.error('Failed to delete company'),
    });

    const companies: Company[] = data || [];

    const filtered = companies.filter(c => {
        const matchSearch = c.companyName.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' ? true : filter === 'pending' ? !c.isApproved : c.isApproved;
        return matchSearch && matchFilter;
    });

    const pendingCount = companies.filter(c => !c.isApproved).length;
    const approvedCount = companies.filter(c => c.isApproved).length;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-400" />
                        </div>
                        Company Management
                    </h1>
                    <p className="text-white/50 mt-1 ml-13">Review and approve company registrations</p>
                </div>
                {pendingCount > 0 && (
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300 text-sm font-medium">{pendingCount} pending approval</span>
                    </motion.div>
                )}
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Companies', value: companies.length, color: 'text-white', bg: 'bg-white/5' },
                    { label: 'Pending Approval', value: pendingCount, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                    { label: 'Approved', value: approvedCount, color: 'text-green-400', bg: 'bg-green-500/10' },
                ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} border border-white/5 rounded-2xl p-4 text-center`}>
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        <p className="text-white/50 text-xs mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search companies by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input-field pl-10 w-full"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'pending', 'approved'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${filter === f
                                ? 'bg-primary-500 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Companies Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading
                    ? [...Array(6)].map((_, i) => <div key={i} className="h-52 bg-white/5 rounded-2xl animate-pulse" />)
                    : filtered.map((company, i) => (
                        <motion.div key={company._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.04 }}
                            className={`glass-card p-5 border transition-all cursor-pointer hover:border-primary-500/40 ${!company.isApproved ? 'border-yellow-500/20' : 'border-white/5'}`}
                            onClick={() => setSelectedCompany(company)}
                        >
                            {/* Company Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                                        {company.companyName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{company.companyName}</p>
                                        <p className="text-white/40 text-xs truncate max-w-28">{company.email}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1 ${company.isApproved
                                    ? 'bg-green-500/15 text-green-400'
                                    : 'bg-yellow-500/15 text-yellow-400'}`}>
                                    {company.isApproved
                                        ? <><CheckCircle className="w-3 h-3" /> Active</>
                                        : <><Clock className="w-3 h-3" /> Pending</>
                                    }
                                </span>
                            </div>

                            {/* Info */}
                            <div className="space-y-1 text-xs text-white/40 mb-4">
                                {company.industry && <p className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {company.industry}</p>}
                                {company.location && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {company.location}</p>}
                                {company.website && (
                                    <p className="flex items-center gap-1">
                                        <Globe className="w-3 h-3" />
                                        <a href={company.website} target="_blank" rel="noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="text-primary-400 hover:underline truncate max-w-40">
                                            {company.website}
                                        </a>
                                    </p>
                                )}
                                <p className="flex items-center gap-1 text-white/25">
                                    Registered: {new Date(company.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setSelectedCompany(company)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 text-xs transition-colors">
                                    <Eye className="w-3.5 h-3.5" /> View
                                </button>
                                {!company.isApproved && (
                                    <button
                                        onClick={() => approveMutation.mutate(company._id)}
                                        disabled={approveMutation.isPending}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-green-500/15 text-green-400 hover:bg-green-500/25 text-xs transition-colors font-medium">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        {approveMutation.isPending ? 'Approving…' : 'Approve'}
                                    </button>
                                )}
                                <button
                                    onClick={() => { if (confirm(`Remove ${company.companyName}?`)) deleteMutation.mutate(company._id); }}
                                    className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                }
            </div>

            {/* Empty state */}
            {!isLoading && !filtered.length && (
                <div className="glass-card p-16 text-center">
                    <Building2 className="w-16 h-16 text-white/15 mx-auto mb-4" />
                    <p className="text-white/50 text-lg">{search ? 'No companies found' : 'No companies yet'}</p>
                    <p className="text-white/30 text-sm mt-1">Companies will appear here when they register</p>
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedCompany && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedCompany(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
                            onClick={e => e.stopPropagation()}>

                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center text-white font-bold text-xl">
                                        {selectedCompany.companyName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-lg">{selectedCompany.companyName}</h2>
                                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${selectedCompany.isApproved ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                                            {selectedCompany.isApproved ? '✅ Approved' : '⏳ Awaiting Approval'}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCompany(null)} className="text-white/40 hover:text-white">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Details */}
                            <div className="space-y-3 mb-6">
                                {[
                                    { icon: <Users className="w-4 h-4" />, label: 'Email', val: selectedCompany.email },
                                    { icon: <Briefcase className="w-4 h-4" />, label: 'Industry', val: selectedCompany.industry || 'Not specified' },
                                    { icon: <MapPin className="w-4 h-4" />, label: 'Location', val: selectedCompany.location || 'Not specified' },
                                    { icon: <Globe className="w-4 h-4" />, label: 'Website', val: selectedCompany.website || 'Not provided' },
                                ].map(({ icon, label, val }) => (
                                    <div key={label} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                        <span className="text-white/40">{icon}</span>
                                        <div>
                                            <p className="text-white/40 text-xs">{label}</p>
                                            <p className="text-white text-sm">{val}</p>
                                        </div>
                                    </div>
                                ))}
                                {selectedCompany.description && (
                                    <div className="p-3 bg-white/5 rounded-xl">
                                        <p className="text-white/40 text-xs mb-1">Company Description</p>
                                        <p className="text-white/80 text-sm">{selectedCompany.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Actions */}
                            <div className="flex gap-3">
                                {!selectedCompany.isApproved ? (
                                    <button
                                        onClick={() => approveMutation.mutate(selectedCompany._id)}
                                        disabled={approveMutation.isPending}
                                        className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
                                        <Shield className="w-4 h-4" />
                                        {approveMutation.isPending ? 'Approving…' : 'Approve Company'}
                                    </button>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500/10 text-green-400 rounded-xl text-sm font-medium">
                                        <CheckCircle className="w-4 h-4" /> Already Approved
                                    </div>
                                )}
                                <button
                                    onClick={() => { if (confirm(`Permanently delete ${selectedCompany.companyName}?`)) deleteMutation.mutate(selectedCompany._id); }}
                                    className="px-5 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

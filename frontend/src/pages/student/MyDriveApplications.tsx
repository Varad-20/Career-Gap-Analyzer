import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Briefcase, CheckCircle, XCircle, Clock, Building2, Calendar,
    ChevronRight, Award, AlertCircle, TrendingUp, DollarSign
} from 'lucide-react';
import { drivesAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface RoundResult {
    roundIndex: number;
    roundName: string;
    status: 'pending' | 'pass' | 'fail' | 'absent';
    score?: number;
    remarks?: string;
    evaluatedAt?: string;
}

interface DriveApplication {
    _id: string;
    status: string;
    currentRound: number;
    roundResults: RoundResult[];
    offeredPackage: number;
    offeredRole: string;
    offerLetter: string;
    offerAccepted: boolean;
    registeredAt: string;
    placedAt: string;
    drive: {
        _id: string;
        title: string;
        jobRole: string;
        rounds: { name: string; type: string }[];
        driveDate: string;
        packageDisplay: string;
        company: { companyName: string; logo: string };
    };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    registered: { label: 'Registered', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Clock },
    shortlisted: { label: 'Shortlisted', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: TrendingUp },
    in_process: { label: 'In Process', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: ChevronRight },
    selected: { label: '🎉 Selected', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: Award },
    rejected: { label: 'Not Selected', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle },
    on_hold: { label: 'On Hold', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: AlertCircle },
    withdrawn: { label: 'Withdrawn', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', icon: XCircle },
};

const roundResultColor: Record<string, string> = {
    pass: 'border-emerald-500/40 bg-emerald-500/10',
    fail: 'border-red-500/30 bg-red-500/5',
    pending: 'border-white/10 bg-white/5',
    absent: 'border-yellow-500/30 bg-yellow-500/5',
};

export default function MyDriveApplications() {
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['my-drive-applications'],
        queryFn: () => drivesAPI.getMyApplications().then(r => r.data.applications as DriveApplication[]),
    });

    const applications = data || [];

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Drive Applications</h1>
                    <p className="text-white/50 text-sm mt-1">Track your placement journey round by round</p>
                </div>
                <button onClick={() => navigate('/student/drives')} className="btn-secondary text-sm">
                    Browse Drives
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Applied', value: applications.length, color: 'text-blue-400' },
                    { label: 'In Process', value: applications.filter(a => ['shortlisted', 'in_process'].includes(a.status)).length, color: 'text-purple-400' },
                    { label: 'Selected', value: applications.filter(a => a.status === 'selected').length, color: 'text-emerald-400' },
                    { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: 'text-red-400' },
                ].map(s => (
                    <div key={s.label} className="glass-card p-3 text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-white/40 text-xs mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {applications.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/40 text-lg">No applications yet</p>
                    <button onClick={() => navigate('/student/drives')} className="btn-primary mt-4 text-sm">
                        Browse Available Drives
                    </button>
                </div>
            ) : (
                <div className="space-y-5">
                    {applications.map(app => {
                        const sc = statusConfig[app.status] || statusConfig.registered;
                        const totalRounds = app.drive?.rounds?.length || 0;

                        return (
                            <motion.div key={app._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="glass-card overflow-hidden">
                                {/* Header */}
                                <div className="p-5 border-b border-white/5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                                                {app.drive?.company?.logo
                                                    ? <img src={app.drive.company.logo} alt="" className="w-full h-full object-cover" />
                                                    : <Building2 className="w-5 h-5 text-white/40" />
                                                }
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold">{app.drive?.title}</h3>
                                                <p className="text-white/50 text-sm">{app.drive?.company?.companyName} · {app.drive?.jobRole}</p>
                                                <p className="text-white/30 text-xs mt-0.5 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> Applied {new Date(app.registeredAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${sc.color}`}>
                                            {sc.label}
                                        </span>
                                    </div>

                                    {/* Offer details if selected */}
                                    {app.status === 'selected' && (
                                        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                                                <Award className="w-5 h-5" /> 🎉 Congratulations! You've been selected
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-white/40 text-xs">Offered Role</p>
                                                    <p className="text-white font-medium">{app.offeredRole || 'TBD'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/40 text-xs">Package</p>
                                                    <p className="text-emerald-400 font-bold text-lg">{app.offeredPackage} LPA</p>
                                                </div>
                                            </div>
                                            {app.offerLetter && (
                                                <a href={app.offerLetter} target="_blank" rel="noreferrer"
                                                    className="mt-2 flex items-center gap-1 text-emerald-400 text-sm hover:underline">
                                                    <DollarSign className="w-4 h-4" /> View Offer Letter
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Round tracker */}
                                <div className="p-5">
                                    <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-4">Interview Progress</p>

                                    {totalRounds === 0 ? (
                                        <p className="text-white/30 text-sm">Rounds not yet defined</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {app.drive.rounds.map((round, idx) => {
                                                const result = app.roundResults?.find(r => r.roundIndex === idx);
                                                const isCurrent = idx === app.currentRound && app.status === 'in_process';
                                                const isCompleted = result?.status === 'pass';
                                                const isFailed = result?.status === 'fail';

                                                return (
                                                    <div key={idx}
                                                        className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${result ? roundResultColor[result.status] : 'border-white/5 bg-transparent'} ${isCurrent ? 'ring-1 ring-primary-500/40' : ''}`}>
                                                        {/* Round number */}
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : isFailed ? 'bg-red-500/30 text-red-400' : isCurrent ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/40'}`}>
                                                            {isCompleted ? '✓' : isFailed ? '✗' : idx + 1}
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className={`text-sm font-medium ${isCurrent ? 'text-white' : result ? (isCompleted ? 'text-emerald-400' : 'text-red-400') : 'text-white/50'}`}>
                                                                    {round.name}
                                                                </p>
                                                                {result?.score && <span className="text-white/50 text-xs">{result.score} pts</span>}
                                                                {result?.status === 'pass' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                                                                {result?.status === 'fail' && <XCircle className="w-4 h-4 text-red-400" />}
                                                                {isCurrent && <span className="text-primary-400 text-xs animate-pulse">● Current Round</span>}
                                                            </div>
                                                            {result?.remarks && <p className="text-white/40 text-xs mt-0.5">{result.remarks}</p>}
                                                            {result?.evaluatedAt && <p className="text-white/30 text-xs mt-0.5">{new Date(result.evaluatedAt).toLocaleDateString()}</p>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

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
    registered: { label: 'Registered', color: 'text-shade-blue-400 bg-shade-blue-500/10 border-shade-blue-500/20', icon: Clock },
    shortlisted: { label: 'Shortlisted', color: 'text-shade-blue-300 bg-shade-blue-500/15 border-shade-blue-500/30', icon: TrendingUp },
    in_process: { label: 'In Process', color: 'text-shade-blue-400 bg-shade-blue-500/20 border-shade-blue-500/30', icon: ChevronRight },
    selected: { label: 'Selected', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30', icon: Award },
    rejected: { label: 'Not Selected', color: 'text-shade-red-400 bg-shade-red-500/10 border-shade-red-500/20', icon: XCircle },
    on_hold: { label: 'On Hold', color: 'text-shade-red-300 bg-shade-red-500/15 border-shade-red-500/30', icon: AlertCircle },
    withdrawn: { label: 'Withdrawn', color: 'text-ivory-400 bg-ivory-100/10 border-ivory-100/20', icon: XCircle },
};

const roundResultColor: Record<string, string> = {
    pass: 'border-emerald-500/40 bg-emerald-500/10',
    fail: 'border-shade-red-500/30 bg-shade-red-500/10',
    pending: 'border-ivory/10 bg-ivory-100/5',
    absent: 'border-shade-red-500/20 bg-shade-red-500/5',
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
            <div className="w-10 h-10 border-4 border-shade-blue-500/30 border-t-shade-blue-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-ivory-50">My Drive Applications</h1>
                    <p className="text-ivory-400 text-sm mt-1">Track your placement journey round by round</p>
                </div>
                <button onClick={() => navigate('/student/drives')} className="btn-secondary text-sm">
                    Browse Drives
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Applied', value: applications.length, color: 'text-shade-blue-400' },
                    { label: 'In Process', value: applications.filter(a => ['shortlisted', 'in_process'].includes(a.status)).length, color: 'text-shade-blue-300' },
                    { label: 'Selected', value: applications.filter(a => a.status === 'selected').length, color: 'text-emerald-400' },
                    { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: 'text-shade-red-400' },
                ].map(s => (
                    <div key={s.label} className="glass-card p-3 text-center border-ivory/10 shadow-xl">
                        <p className={`text-2xl font-black ${s.color} tracking-tight`}>{s.value}</p>
                        <p className="text-ivory-400 text-xs mt-1 font-medium">{s.label}</p>
                    </div>
                ))}
            </div>

            {applications.length === 0 ? (
                <div className="glass-card p-12 text-center border-ivory/10 shadow-2xl">
                    <Briefcase className="w-12 h-12 text-ivory-400/30 mx-auto mb-4" />
                    <p className="text-ivory-400 text-lg">No applications yet</p>
                    <button onClick={() => navigate('/student/drives')} className="btn-primary mt-4 text-sm shadow-xl shadow-shade-blue-500/25">
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
                                className="glass-card overflow-hidden border-ivory/10 shadow-xl">
                                {/* Header */}
                                <div className="p-5 border-b border-ivory/10">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-shade-blue-500/20 border border-shade-blue-500/30 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                                                {app.drive?.company?.logo
                                                    ? <img src={app.drive.company.logo} alt="" className="w-full h-full object-cover" />
                                                    : <Building2 className="w-5 h-5 text-shade-blue-400" />
                                                }
                                            </div>
                                            <div>
                                                <h3 className="text-ivory-50 font-bold text-lg">{app.drive?.title}</h3>
                                                <p className="text-ivory-400 text-sm font-medium">{app.drive?.company?.companyName} · {app.drive?.jobRole}</p>
                                                <p className="text-ivory-400/70 text-xs mt-0.5 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 text-shade-blue-400" /> Applied {new Date(app.registeredAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${sc.color}`}>
                                            <sc.icon className="w-3.5 h-3.5" /> {sc.label}
                                        </span>
                                    </div>

                                    {/* Offer details if selected */}
                                    {app.status === 'selected' && (
                                        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                                                <Award className="w-5 h-5" /> Congratulations! You've been selected
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-ivory-400 text-xs">Offered Role</p>
                                                    <p className="text-ivory-50 font-semibold">{app.offeredRole || 'TBD'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-ivory-400 text-xs">Package</p>
                                                    <p className="text-emerald-400 font-black text-lg">{app.offeredPackage} LPA</p>
                                                </div>
                                            </div>
                                            {app.offerLetter && (
                                                <a href={app.offerLetter} target="_blank" rel="noreferrer"
                                                    className="mt-2 flex items-center gap-1 text-emerald-400 text-sm hover:underline font-semibold">
                                                    <DollarSign className="w-4 h-4" /> View Offer Letter
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Round tracker */}
                                <div className="p-5">
                                    <p className="text-ivory-400 text-xs font-semibold uppercase tracking-wider mb-4">Interview Progress</p>

                                    {totalRounds === 0 ? (
                                        <p className="text-ivory-400/50 text-sm">Rounds not yet defined</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {app.drive.rounds.map((round, idx) => {
                                                const result = app.roundResults?.find(r => r.roundIndex === idx);
                                                const isCurrent = idx === app.currentRound && app.status === 'in_process';
                                                const isCompleted = result?.status === 'pass';
                                                const isFailed = result?.status === 'fail';

                                                return (
                                                    <div key={idx}
                                                        className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${result ? roundResultColor[result.status] : 'border-ivory/10 bg-transparent'} ${isCurrent ? 'ring-1 ring-shade-blue-500/50' : ''}`}>
                                                        {/* Round number */}
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : isFailed ? 'bg-shade-red-500/40 text-shade-red-300' : isCurrent ? 'bg-shade-blue-500 text-white' : 'bg-ivory-100/10 text-ivory-400'}`}>
                                                            {isCompleted ? <CheckCircle className="w-4 h-4" /> : isFailed ? <XCircle className="w-4 h-4" /> : idx + 1}
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className={`text-sm font-medium ${isCurrent ? 'text-ivory-50 font-bold' : result ? (isCompleted ? 'text-emerald-400' : 'text-shade-red-400') : 'text-ivory-300'}`}>
                                                                    {round.name}
                                                                </p>
                                                                {result?.score && <span className="text-ivory-400 text-xs">{result.score} pts</span>}
                                                                {result?.status === 'pass' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                                                                {result?.status === 'fail' && <XCircle className="w-4 h-4 text-shade-red-400" />}
                                                                {isCurrent && <span className="text-shade-blue-400 text-xs font-semibold animate-pulse">Current Round</span>}
                                                            </div>
                                                            {result?.remarks && <p className="text-ivory-400 text-xs mt-0.5">{result.remarks}</p>}
                                                            {result?.evaluatedAt && <p className="text-ivory-400/60 text-xs mt-0.5">{new Date(result.evaluatedAt).toLocaleDateString()}</p>}
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

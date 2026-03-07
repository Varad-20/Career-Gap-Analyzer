import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { FileText, MapPin, Briefcase } from 'lucide-react';
import { Application } from '../../types';
import { motion } from 'framer-motion';

export default function ManageApplications() {
    const { data: applications, isLoading } = useQuery({
        queryKey: ['adminApplications'],
        queryFn: () => adminAPI.getAllApplications().then(r => r.data.applications),
    });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'text-yellow-400 bg-yellow-400/10',
            reviewed: 'text-blue-400 bg-blue-400/10',
            shortlisted: 'text-purple-400 bg-purple-400/10',
            accepted: 'text-emerald-400 bg-emerald-400/10',
            rejected: 'text-red-400 bg-red-400/10',
        };
        return colors[status] || 'text-white/40 bg-white/5';
    };

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FileText className="w-7 h-7 text-accent-400" /> All Applications
                </h1>
                <p className="text-white/50 mt-1">View and monitor all applications across the platform</p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : !applications || applications.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-white/50">No applications found on the platform.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications?.map((app: Application, i: number) => {
                        // The backend populates student and job and company, we need to handle if they were deleted
                        const studentName = (app.student && typeof app.student === 'object' && 'name' in app.student) ? app.student.name : 'Unknown Student';
                        const jobRole = (app.job && typeof app.job === 'object' && 'jobRole' in app.job) ? app.job.jobRole : 'Unknown Role';
                        const companyName = (app.company && typeof app.company === 'object' && 'companyName' in app.company) ? app.company.companyName : 'Unknown Company';

                        return (
                            <motion.div
                                key={app._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-white font-semibold">{jobRole}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <p className="text-white/60 text-sm mb-3">
                                        Applied by <span className="font-medium text-white/80">{studentName}</span> to <span className="font-medium text-white/80">{companyName}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-xs text-white/40">
                                        <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Gap Compliant: {app.gapCompliant ? 'Yes' : 'No'}</span>
                                        <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Match Score: {app.matchScore}%</span>
                                    </div>
                                </div>

                                <div className="flex flex-col md:items-end gap-1">
                                    <p className="text-xs text-white/40">Applied On</p>
                                    <p className="text-sm text-white/80">{new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Search, Filter, GraduationCap, CheckCircle, Clock, Download } from 'lucide-react';
import { coordinatorAPI } from '../../services/api';

const BRANCHES = ['CS', 'IT', 'ECE', 'EE', 'ME', 'Civil', 'Chemical', 'MBA', 'MCA', 'Other'];

const placementStatusColor: Record<string, string> = {
    placed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    not_placed: 'text-white/40 bg-white/5 border-white/10',
    opted_out: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
};

export default function CollegeStudents() {
    const [filters, setFilters] = useState({ branch: '', placementStatus: '', search: '', page: 1 });

    const { data, isLoading } = useQuery({
        queryKey: ['coord-students', filters],
        queryFn: () => coordinatorAPI.getStudents({
            branch: filters.branch || undefined,
            placementStatus: filters.placementStatus || undefined,
            search: filters.search || undefined,
            page: filters.page,
        }).then(r => r.data),
    });

    const students = data?.students || [];
    const total = data?.total || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">College Students</h1>
                    <p className="text-white/40 text-sm mt-1">{total} students registered</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="text" placeholder="Search by name, roll no, email..."
                        className="input-field pl-9 py-2 text-sm w-full"
                        value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
                </div>
                <select className="input-field py-2 text-sm w-36" value={filters.branch}
                    onChange={e => setFilters(f => ({ ...f, branch: e.target.value, page: 1 }))}>
                    <option value="">All Branches</option>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select className="input-field py-2 text-sm w-40" value={filters.placementStatus}
                    onChange={e => setFilters(f => ({ ...f, placementStatus: e.target.value, page: 1 }))}>
                    <option value="">All Status</option>
                    <option value="placed">Placed</option>
                    <option value="not_placed">Not Placed</option>
                    <option value="opted_out">Opted Out</option>
                </select>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Total', value: total, color: 'text-white' },
                    { label: 'Placed', value: students.filter((s: any) => s.placementStatus === 'placed').length, color: 'text-emerald-400' },
                    { label: 'Not Placed', value: students.filter((s: any) => s.placementStatus === 'not_placed').length, color: 'text-white/50' },
                    { label: 'Opted Out', value: students.filter((s: any) => s.placementStatus === 'opted_out').length, color: 'text-yellow-400' },
                ].map(s => (
                    <div key={s.label} className="glass-card p-3 text-center">
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                {['Name', 'Roll No', 'Branch', 'CGPA', 'Backlogs', 'Batch', 'Placement Status', 'Resume'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-white/40 font-medium text-xs">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-12 text-white/30">No students found</td></tr>
                            ) : students.map((s: any) => (
                                <tr key={s._id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold flex-shrink-0">
                                                {s.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm">{s.name}</p>
                                                <p className="text-white/30 text-xs">{s.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-white/60 text-xs">{s.enrollmentNo || '–'}</td>
                                    <td className="px-4 py-3">
                                        {s.branch ? (
                                            <span className="px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-400 text-xs">{s.branch}</span>
                                        ) : <span className="text-white/30">–</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`font-semibold ${(s.cgpa || 0) >= 8 ? 'text-emerald-400' : (s.cgpa || 0) >= 6.5 ? 'text-white' : 'text-red-400'}`}>
                                            {s.cgpa || '–'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={s.activeBacklogs > 0 ? 'text-red-400' : 'text-white/40'}>{s.activeBacklogs ?? 0}</span>
                                    </td>
                                    <td className="px-4 py-3 text-white/60">{s.batch || '–'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${placementStatusColor[s.placementStatus]}`}>
                                            {s.placementStatus === 'placed' ? '✓ Placed' : s.placementStatus === 'opted_out' ? 'Opted Out' : 'Not Placed'}
                                        </span>
                                        {s.placementStatus === 'placed' && s.placedAt?.company && (
                                            <p className="text-emerald-400/60 text-xs mt-0.5">{s.placedAt.company} · {s.placedAt.package} LPA</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {s.resumeURL ? (
                                            <a href={s.resumeURL} target="_blank" rel="noreferrer"
                                                className="text-primary-400 hover:text-primary-300 text-xs underline">View</a>
                                        ) : <span className="text-white/30 text-xs">–</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {data?.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${filters.page === p ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

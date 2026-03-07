import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Trash2, GraduationCap, MapPin, Star } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { Student } from '../../types';
import toast from 'react-hot-toast';

export default function ManageStudents() {
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['adminStudents'],
        queryFn: () => adminAPI.getStudents().then(r => r.data.students),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminAPI.deleteStudent(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminStudents'] }); toast.success('Student deleted'); },
        onError: () => toast.error('Failed to delete'),
    });

    const students: Student[] = data || [];

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Users className="w-7 h-7 text-primary-400" /> Manage Students
                </h1>
                <p className="text-white/50 mt-1">{students.length} registered students</p>
            </div>

            {isLoading ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}</div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                {['Student', 'Degree', 'Skills', 'Resume Score', 'Gap', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-white/40 text-xs font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {students.map((student, i) => (
                                <motion.tr
                                    key={student._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 font-semibold text-sm flex-shrink-0">
                                                {student.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{student.name}</p>
                                                <p className="text-white/40 text-xs">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-white/60 text-sm flex items-center gap-1">
                                            <GraduationCap className="w-3.5 h-3.5" /> {student.degree || '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 flex-wrap">
                                            {student.skills?.slice(0, 2).map(s => <span key={s} className="badge-blue">{s}</span>)}
                                            {(student.skills?.length || 0) > 2 && <span className="text-white/30 text-xs">+{student.skills.length - 2}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`font-bold ${(student.resumeScore || 0) >= 70 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                            {student.resumeScore || 0}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-sm ${student.gapRiskLevel === 'Low' ? 'text-emerald-400' :
                                            student.gapRiskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                            {student.gapDuration}mo ({student.gapRiskLevel || 'N/A'})
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => { if (confirm('Delete this student?')) deleteMutation.mutate(student._id); }}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {!students.length && (
                        <div className="py-12 text-center text-white/30">No students registered yet</div>
                    )}
                </div>
            )}
        </div>
    );
}

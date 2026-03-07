import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Send, CheckCircle, Clock, User, ArrowLeft, MoreHorizontal, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function InstructorQueries() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const { data: queries = [], isLoading } = useQuery({
        queryKey: ['instructorQueries'],
        queryFn: () => instructorAPI.getQueries().then(r => r.data.queries)
    });

    const replyMutation = useMutation({
        mutationFn: ({ id, text, status }: { id: string; text?: string; status?: string }) =>
            instructorAPI.replyToQuery(id, { text, status }),
        onSuccess: () => {
            toast.success('Reply sent successfully!');
            setReplyText('');
            queryClient.invalidateQueries({ queryKey: ['instructorQueries'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Reply failed')
    });

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId || !replyText.trim()) return;
        replyMutation.mutate({ id: selectedId, text: replyText });
    };

    const toggleStatus = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'open' ? 'resolved' : 'open';
        replyMutation.mutate({ id, status: newStatus });
    };

    const selectedQuery = queries.find((q: any) => q._id === selectedId);

    if (isLoading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">Loading queries...</div>;

    return (
        <div className="min-h-screen bg-dark-900 pb-20 flex flex-col">
            {/* Header */}
            <header className="border-b border-white/5 bg-dark-800/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/instructor/dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Dashboard</span>
                    </button>
                    <h1 className="text-white font-bold">Student Queries</h1>
                    <div className="flex items-center gap-2 bg-accent-500/10 px-3 py-1 rounded-full border border-accent-500/20">
                        <MessageSquare className="w-3 h-3 text-accent-400" />
                        <span className="text-accent-400 font-bold text-xs">{queries.filter((q: any) => q.status === 'open').length} Unresolved</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-8 flex gap-6 overflow-hidden max-h-[calc(100vh-64px-80px)]">
                {/* List of Queries */}
                <div className="w-1/3 glass-card p-0 flex flex-col border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="text-white font-bold text-sm">Active Conversations</h3>
                    </div>
                    {queries.length === 0 ? (
                        <div className="p-8 text-center text-white/30 text-sm">No queries yet.</div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {queries.map((query: any) => (
                                <button
                                    key={query._id}
                                    onClick={() => setSelectedId(query._id)}
                                    className={`w-full p-5 flex flex-col items-start gap-1 border-b border-white/5 transition-colors text-left hover:bg-white/5 ${selectedId === query._id ? 'bg-primary-500/10 border-l-4 border-l-primary-500' : ''}`}
                                >
                                    <div className="flex justify-between w-full items-center mb-1">
                                        <p className="text-white font-bold text-sm truncate">{query.student?.name}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${query.status === 'resolved' ? 'text-emerald-400 bg-emerald-500/10' : 'text-primary-400 bg-primary-500/10'}`}>
                                            {query.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-white/60 font-medium text-xs truncate max-w-full">Sub: {query.subject}</p>
                                    <p className="text-white/30 text-[10px] mt-1 italic truncate max-w-full">
                                        In: {query.course?.title}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Panel */}
                <div className="flex-1 glass-card p-0 flex flex-col border-white/5 overflow-hidden bg-white/5 relative">
                    <AnimatePresence mode="wait">
                        {selectedQuery ? (
                            <motion.div
                                key={selectedId}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col h-full"
                            >
                                {/* Chat Header */}
                                <div className="p-4 px-6 border-b border-white/5 flex items-center justify-between bg-dark-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold border border-primary-500/30">
                                            {selectedQuery.student?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-sm leading-tight flex items-center gap-2">
                                                {selectedQuery.student?.name}
                                                <span className="text-[10px] text-white/30 font-medium font-normal">• {selectedQuery.student?.email}</span>
                                            </h3>
                                            <p className="text-white/40 text-xs font-medium">Course: {selectedQuery.course?.title}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleStatus(selectedQuery._id, selectedQuery.status)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${selectedQuery.status === 'resolved' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-white/10 text-white/40 hover:text-white'}`}
                                    >
                                        <Check className="w-3 h-3" />
                                        {selectedQuery.status === 'resolved' ? 'Resolved' : 'Mark as Resolved'}
                                    </button>
                                </div>

                                {/* Subject Line */}
                                <div className="px-6 py-2 bg-white/5 border-b border-white/5">
                                    <p className="text-primary-400 font-bold text-[10px] uppercase tracking-widest">Query Subject</p>
                                    <p className="text-white font-medium text-sm mt-1">{selectedQuery.subject}</p>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                    {selectedQuery.messages.map((m: any, i: number) => (
                                        <div key={i} className={`flex ${m.senderModel === 'Instructor' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-4 rounded-3xl ${m.senderModel === 'Instructor' ? 'bg-primary-600 text-white rounded-tr-none shadow-xl' : 'bg-white/5 text-white/80 rounded-tl-none border border-white/10'}`}>
                                                <p className="text-sm leading-relaxed">{m.text}</p>
                                                <div className="flex items-center gap-2 justify-end mt-2 opacity-40">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    <span className="text-[9px]">{new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Input */}
                                <div className="p-6 border-t border-white/5 bg-dark-800">
                                    <form onSubmit={handleReply} className="relative">
                                        <input
                                            type="text"
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder="Type your response here..."
                                            className="input-field w-full pr-16 py-4 rounded-3xl shadow-lg border-white/10 focus:border-primary-500 transition-all duration-300"
                                            disabled={selectedQuery.status === 'resolved'}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!replyText.trim() || replyMutation.isPending || selectedQuery.status === 'resolved'}
                                            className="absolute right-2 top-2 bottom-2 w-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white disabled:opacity-30 transition-all hover:bg-primary-400 disabled:scale-95 active:scale-90"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                    {selectedQuery.status === 'resolved' && (
                                        <p className="text-center text-[10px] text-white/30 mt-3 font-medium flex items-center justify-center gap-1.5 uppercase tracking-widest">
                                            <CheckCircle className="w-3 h-3 text-emerald-400" /> This query has been resolved
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                                <MessageSquare className="w-20 h-20 mb-6 drop-shadow-[0_10px_30px_rgba(255,255,255,0.2)]" />
                                <h3 className="text-xl font-bold text-white mb-2">Selective Focus</h3>
                                <p className="text-sm text-white/60">Choose a student query from the list to start the conversation.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}


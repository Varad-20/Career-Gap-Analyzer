import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Send, CheckCircle, Clock, User, ArrowLeft, SendHorizonal, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function StudentQueries() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const { data: queries = [], isLoading } = useQuery({
        queryKey: ['studentQueries'],
        queryFn: () => skillAPI.getQueries().then(r => r.data.queries)
    });

    const replyMutation = useMutation({
        mutationFn: ({ id, text }: { id: string; text: string }) =>
            skillAPI.replyToQuery(id, text),
        onSuccess: () => {
            toast.success('Reply sent!');
            setReplyText('');
            queryClient.invalidateQueries({ queryKey: ['studentQueries'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Reply failed')
    });

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId || !replyText.trim()) return;
        replyMutation.mutate({ id: selectedId, text: replyText });
    };

    const selectedQuery = queries.find((q: any) => q._id === selectedId);

    if (isLoading) return <div className="p-8 flex items-center justify-center min-h-screen text-white">Loading your queries...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-40px)] flex flex-col">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Queries</h1>
                    <p className="text-white/40 mt-1">Chat sessions with your course instructors.</p>
                </div>
                <div className="flex items-center gap-2 bg-primary-500/10 px-4 py-2 rounded-2xl border border-primary-500/20">
                    <MessageSquare className="w-4 h-4 text-primary-400" />
                    <span className="text-primary-400 font-bold text-sm">{queries.length} Total Cases</span>
                </div>
            </header>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* List of Queries */}
                <div className="w-80 glass-card p-0 flex flex-col border-white/5 overflow-hidden shrink-0">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <h3 className="text-white/60 font-bold text-[10px] uppercase tracking-widest px-2">Conversations</h3>
                    </div>
                    {queries.length === 0 ? (
                        <div className="p-12 text-center">
                            <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-4" />
                            <p className="text-white/30 text-xs">No active queries.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {queries.map((query: any) => (
                                <button
                                    key={query._id}
                                    onClick={() => setSelectedId(query._id)}
                                    className={`w-full p-4 flex flex-col items-start gap-1 border-b border-white/5 transition-all text-left group ${selectedId === query._id ? 'bg-primary-500/10 border-l-4 border-l-primary-500' : 'hover:bg-white/5'}`}
                                >
                                    <div className="flex justify-between w-full items-center mb-1">
                                        <p className="text-white font-bold text-xs truncate max-w-[120px]">{query.instructor?.name}</p>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${query.status === 'resolved' ? 'text-emerald-400 bg-emerald-500/10' : 'text-primary-400 bg-primary-500/10'}`}>
                                            {query.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-white/60 text-[11px] font-medium line-clamp-1">{query.subject}</p>
                                    <p className="text-white/20 text-[9px] mt-1 italic line-clamp-1">{query.course?.title}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Panel */}
                <div className="flex-1 glass-card p-0 flex flex-col border-white/5 overflow-hidden bg-white/[0.02] relative rounded-[2rem]">
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
                                <div className="p-5 px-8 border-b border-white/5 flex items-center justify-between bg-dark-800/50 backdrop-blur-md">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 font-bold border border-primary-500/20 shadow-lg">
                                            {selectedQuery.instructor?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-base leading-tight">
                                                Instructor: {selectedQuery.instructor?.name}
                                            </h3>
                                            <p className="text-primary-400/60 text-xs font-medium mt-0.5">{selectedQuery.course?.title}</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${selectedQuery.status === 'resolved' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-primary-500/30 text-primary-400 bg-primary-500/10'}`}>
                                        {selectedQuery.status === 'resolved' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {selectedQuery.status}
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                                    {selectedQuery.messages.map((m: any, i: number) => (
                                        <div key={i} className={`flex ${m.senderModel === 'Student' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] p-4 rounded-[1.5rem] ${m.senderModel === 'Student' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white/10 text-white/90 rounded-tl-none border border-white/5'}`}>
                                                <p className="text-sm leading-relaxed">{m.text}</p>
                                                <div className="flex items-center gap-2 justify-end mt-2 opacity-30">
                                                    <span className="text-[9px] font-bold">{new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Area */}
                                <div className="p-6 border-t border-white/5">
                                    <form onSubmit={handleReply} className="relative">
                                        <input
                                            type="text"
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder={selectedQuery.status === 'resolved' ? 'Conversation closed' : 'Type your message...'}
                                            className="input-field w-full pr-16 py-4 rounded-[1.5rem] bg-white/5 transition-all text-sm"
                                            disabled={selectedQuery.status === 'resolved'}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!replyText.trim() || replyMutation.isPending || selectedQuery.status === 'resolved'}
                                            className="absolute right-2 top-2 bottom-2 w-12 bg-primary-500 rounded-[1.2rem] flex items-center justify-center text-white transition-all hover:bg-primary-400 disabled:opacity-30 disabled:pointer-events-none active:scale-90"
                                        >
                                            <SendHorizonal className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/10">
                                    <MessageSquare className="w-10 h-10 text-white/20" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Select a Query</h3>
                                <p className="text-sm text-white/40 max-w-xs mx-auto">Select any conversation from the left to view your doubts and instructor replies.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}


import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, Sparkles, Rocket, Zap, Shield, Star,
    ArrowRight, CreditCard, Lock, CheckCircle2,
    Globe, Users, MessageSquare, BookOpen
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { skillAPI, authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PLANS = [
    {
        id: 'premium_1_month',
        name: 'Monthly',
        price: '₹599',
        period: '/mo',
        desc: 'Perfect for quick skill-ups',
        features: ['All Premium Courses', 'AI Resume Scoring', 'Priority Instructor Chat'],
        color: 'from-blue-500 to-indigo-600',
        popular: false
    },
    {
        id: 'premium_3_month',
        name: 'Quarterly',
        price: '₹1499',
        period: '/3mo',
        desc: 'Most popular for job seekers',
        features: ['All Premium Courses', 'Unlimited AI Analysis', 'Direct Chat Access', 'Job Match Priority'],
        color: 'from-primary-500 to-purple-600',
        popular: true
    },
    {
        id: 'premium_12_month',
        name: 'Yearly',
        price: '₹4999',
        period: '/yr',
        desc: 'Best value for long-term growth',
        features: ['Everything in Quarterly', '1-on-1 Mentorship Session', 'Personalized Roadmap', 'Beta Access to Jobs'],
        color: 'from-emerald-500 to-teal-600',
        popular: false
    }
];

export default function PremiumSession() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { updateUser } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });

    const upgradeMutation = useMutation({
        mutationFn: (planId: string) => skillAPI.upgradeSubscription({ planId }),
        onSuccess: async () => {
            try {
                // Fetch fresh user data including subscription
                const res = await authAPI.getMe();
                updateUser(res.data.user);

                toast.success('Welcome to Premium! Your journey begins now.');
                queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
                setShowPayment(false);
                setSuccess(true);
            } catch (err) {
                console.error("Failed to sync user data", err);
                toast.success('Upgraded! Please refresh to see changes.');
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Transaction failed');
        }
    });

    const [success, setSuccess] = useState(false);

    if (success) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-8"
                >
                    <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-white mb-4"
                >
                    Upgrade Successful!
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/60 max-w-md mb-8"
                >
                    You are now a Premium member. All courses, AI features, and mentorship tools are unlocked for you.
                </motion.p>
                <button
                    onClick={() => navigate('/student/dashboard')}
                    className="btn-primary"
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-20 pb-24">
            {/* Hero Section */}
            <section className="text-center space-y-6 relative py-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/10 blur-[120px] rounded-full -z-10" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-bold uppercase tracking-widest"
                >
                    <Sparkles className="w-4 h-4" /> Go Premium
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-6xl font-black text-white leading-tight"
                >
                    Unlock Your Career <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-500">Without Boundaries</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/50 text-xl max-w-2xl mx-auto"
                >
                    Join 10,000+ students who accelerated their career with our AI-powered premium toolkit.
                </motion.p>
            </section>

            {/* Benefits Grid */}
            <section className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: Zap, title: 'AI Resume Power', desc: 'Instant AI-driven feedback and score enhancement for every job application.' },
                    { icon: Shield, title: 'Premium Courses', desc: 'Full access to industry-grade courses approved by top companies.' },
                    { icon: MessageSquare, title: 'Direct Mentor Chat', desc: 'Ask doubts anytime and get answers from verified instructors.' },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        className="glass-card p-8 group hover:border-primary-500/30 transition-all duration-500"
                    >
                        <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-400 mb-6 group-hover:scale-110 group-hover:bg-primary-500/20 transition-all">
                            <item.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                        <p className="text-white/40 leading-relaxed font-medium">{item.desc}</p>
                    </motion.div>
                ))}
            </section>

            {/* Pricing Cards */}
            <section className="space-y-12">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">Choose Your Plan</h2>
                    <p className="text-white/40 mt-2">Transparent pricing. No hidden fees. Cancel anytime.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, x: i === 0 ? -20 : i === 2 ? 20 : 0, scale: plan.popular ? 1.05 : 1 }}
                            animate={{ opacity: 1, x: 0, scale: plan.popular ? 1.05 : 1 }}
                            transition={{ delay: 0.5 }}
                            className={`glass-card p-8 flex flex-col relative ${plan.popular ? 'border-primary-500/50 shadow-[0_20px_50px_rgba(var(--primary-rgb),0.2)]' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h4 className="text-white/40 font-bold uppercase tracking-wider text-xs mb-1">{plan.name}</h4>
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl font-black text-white">{plan.price}</span>
                                    <span className="text-white/40 font-medium mb-1">{plan.period}</span>
                                </div>
                                <p className="text-white/60 text-sm mt-3">{plan.desc}</p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map(feat => (
                                    <li key={feat} className="flex items-start gap-3 text-sm text-white/80">
                                        <div className="w-5 h-5 rounded-full bg-primary-500/10 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-primary-400" />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => { setSelectedPlan(plan); setShowPayment(true); }}
                                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group ${plan.popular ? 'btn-primary' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                            >
                                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-dark-800 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-primary-500/10 to-transparent">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-primary-400 font-bold text-xs uppercase tracking-widest mb-1">Upgrade Plan</p>
                                        <h3 className="text-2xl font-bold text-white">{selectedPlan?.name} Access</h3>
                                    </div>
                                    <button onClick={() => setShowPayment(false)} className="text-white/30 hover:text-white transition-colors">&times;</button>
                                </div>
                                <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <span className="text-white/60">Total Amount</span>
                                    <span className="text-white font-black text-xl">{selectedPlan?.price}</span>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Card Number</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                            <input
                                                type="text"
                                                placeholder="XXXX XXXX XXXX XXXX"
                                                value={cardDetails.number}
                                                onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                                                className="input-field w-full pl-12"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Expiry</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                value={cardDetails.expiry}
                                                onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                                className="input-field w-full"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">CVC</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                <input
                                                    type="password"
                                                    placeholder="***"
                                                    value={cardDetails.cvc}
                                                    onChange={e => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                                                    className="input-field w-full pl-12"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => upgradeMutation.mutate(selectedPlan.id)}
                                    disabled={upgradeMutation.isPending}
                                    className="w-full py-4 bg-primary-500 text-white rounded-2xl font-bold shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] hover:bg-primary-400 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {upgradeMutation.isPending ? 'Processing...' : (
                                        <>
                                            <Shield className="w-5 h-5" /> Pay {selectedPlan?.price}
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-white/30 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Lock className="w-3 h-3" /> Secure 256-bit encrypted payment
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

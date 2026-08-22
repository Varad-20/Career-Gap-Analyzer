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
        color: 'from-shade-blue-500 to-indigo-600',
        popular: false
    },
    {
        id: 'premium_3_month',
        name: 'Quarterly',
        price: '₹1499',
        period: '/3mo',
        desc: 'Most popular for job seekers',
        features: ['All Premium Courses', 'Unlimited AI Analysis', 'Direct Chat Access', 'Job Match Priority'],
        color: 'from-shade-blue-600 to-purple-600',
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
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center text-slate-900">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-600 mb-8 border border-emerald-500/30 shadow-md"
                >
                    <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-slate-900 mb-4"
                >
                    Upgrade Successful!
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-600 max-w-md mb-8 text-sm font-semibold"
                >
                    You are now a Premium member. All courses, AI features, and mentorship tools are unlocked for you.
                </motion.p>
                <button
                    onClick={() => navigate('/student/dashboard')}
                    className="btn-primary shadow-lg shadow-shade-blue-500/25 py-3 px-8"
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-20 pb-24 text-slate-900">
            {/* Hero Section */}
            <section className="text-center space-y-6 relative py-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-shade-blue-500/10 blur-[120px] rounded-full -z-10" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-shade-blue-500/10 border border-shade-blue-500/25 text-shade-blue-700 text-xs font-bold uppercase tracking-widest"
                >
                    <Sparkles className="w-4 h-4 text-shade-blue-600" /> Go Premium
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight"
                >
                    Unlock Your Career <br /> <span className="text-shade-blue-600">Without Boundaries</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-600 text-lg max-w-2xl mx-auto font-semibold"
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
                        className="glass-card p-8 group hover:border-shade-blue-500/40 transition-all duration-300 shadow-sm border-slate-200/80"
                    >
                        <div className="w-14 h-14 bg-shade-blue-500/10 border border-shade-blue-500/25 rounded-2xl flex items-center justify-center text-shade-blue-600 mb-6 group-hover:scale-110 group-hover:bg-shade-blue-500/20 transition-all shadow-sm">
                            <item.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                        <p className="text-slate-600 leading-relaxed font-medium text-sm">{item.desc}</p>
                    </motion.div>
                ))}
            </section>

            {/* Pricing Cards */}
            <section className="space-y-12">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900">Choose Your Plan</h2>
                    <p className="text-slate-600 mt-2 text-sm font-semibold">Transparent pricing. No hidden fees. Cancel anytime.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, x: i === 0 ? -20 : i === 2 ? 20 : 0, scale: plan.popular ? 1.05 : 1 }}
                            animate={{ opacity: 1, x: 0, scale: plan.popular ? 1.05 : 1 }}
                            transition={{ delay: 0.5 }}
                            className={`glass-card p-8 flex flex-col relative shadow-md ${plan.popular ? 'border-shade-blue-500/50 shadow-shade-blue-500/15' : 'border-slate-200/80'}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-shade-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h4 className="text-slate-600 font-bold uppercase tracking-wider text-xs mb-1">{plan.name}</h4>
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                    <span className="text-slate-600 font-bold mb-1">{plan.period}</span>
                                </div>
                                <p className="text-slate-600 text-sm mt-3 font-semibold">{plan.desc}</p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map(feat => (
                                    <li key={feat} className="flex items-start gap-3 text-sm text-slate-800 font-semibold">
                                        <div className="w-5 h-5 rounded-full bg-shade-blue-500/10 flex items-center justify-center shrink-0 border border-shade-blue-500/25">
                                            <Check className="w-3 h-3 text-shade-blue-600" />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => { setSelectedPlan(plan); setShowPayment(true); }}
                                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group ${plan.popular ? 'btn-primary shadow-lg shadow-shade-blue-500/25' : 'btn-secondary'}`}
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-200/80 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl text-slate-900"
                        >
                            <div className="p-8 border-b border-slate-200/80 bg-shade-blue-500/10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-shade-blue-700 font-bold text-xs uppercase tracking-widest mb-1">Upgrade Plan</p>
                                        <h3 className="text-2xl font-bold text-slate-900">{selectedPlan?.name} Access</h3>
                                    </div>
                                    <button onClick={() => setShowPayment(false)} className="text-slate-500 hover:text-slate-900 text-xl font-bold transition-colors">&times;</button>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                    <span className="text-slate-600 text-sm font-bold">Total Amount</span>
                                    <span className="text-slate-900 font-black text-xl">{selectedPlan?.price}</span>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Card Number</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="XXXX XXXX XXXX XXXX"
                                                value={cardDetails.number}
                                                onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                                                className="input-field w-full pl-12 font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Expiry</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                value={cardDetails.expiry}
                                                onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                                className="input-field w-full font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">CVC</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="password"
                                                    placeholder="***"
                                                    value={cardDetails.cvc}
                                                    onChange={e => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                                                    className="input-field w-full pl-12 font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => upgradeMutation.mutate(selectedPlan.id)}
                                    disabled={upgradeMutation.isPending}
                                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 shadow-lg shadow-shade-blue-500/25 text-base font-bold"
                                >
                                    {upgradeMutation.isPending ? 'Processing...' : (
                                        <>
                                            <Shield className="w-5 h-5" /> Pay {selectedPlan?.price}
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest flex items-center justify-center gap-2 font-bold">
                                    <Lock className="w-3 h-3 text-shade-blue-600" /> Secure 256-bit encrypted payment
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

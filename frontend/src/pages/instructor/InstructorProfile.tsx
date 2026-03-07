import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorAPI } from '../../services/api';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, Globe, MapPin, Briefcase,
    CreditCard, Building, Landmark, Hash, CheckCircle, Save, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function InstructorProfile() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        bio: '',
        specialization: '',
        website: '',
        contactNumber: '',
        location: '',
        paymentDetails: {
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            upiId: '',
            accountHolderName: ''
        }
    });

    const { data: profile, isLoading } = useQuery({
        queryKey: ['instructorProfile'],
        queryFn: () => instructorAPI.getProfile().then(r => r.data.instructor)
    });

    useEffect(() => {
        if (profile) {
            setForm({
                bio: profile.bio || '',
                specialization: profile.specialization || '',
                website: profile.website || '',
                contactNumber: profile.contactNumber || '',
                location: profile.location || '',
                paymentDetails: {
                    bankName: profile.paymentDetails?.bankName || '',
                    accountNumber: profile.paymentDetails?.accountNumber || '',
                    ifscCode: profile.paymentDetails?.ifscCode || '',
                    upiId: profile.paymentDetails?.upiId || '',
                    accountHolderName: profile.paymentDetails?.accountHolderName || ''
                }
            });
        }
    }, [profile]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => instructorAPI.updateProfile(data),
        onSuccess: () => {
            toast.success('Profile and payment details updated!');
            queryClient.invalidateQueries({ queryKey: ['instructorProfile'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed')
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(form);
    };

    if (isLoading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-dark-900 pb-20">
            {/* Header */}
            <header className="border-b border-white/5 bg-dark-800/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/instructor/dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Dashboard</span>
                    </button>
                    <h1 className="text-white font-bold">Edit Profile & Payments</h1>
                    <div className="w-24" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-8 py-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <User className="w-5 h-5 text-primary-400" />
                            <h2 className="text-xl font-bold text-white">Public Profile</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Full Name</label>
                                <input type="text" value={profile?.name} disabled className="input-field w-full opacity-50 cursor-not-allowed" />
                                <p className="text-[10px] text-white/30">Name can't be changed after registration.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Email Address</label>
                                <input type="email" value={profile?.email} disabled className="input-field w-full opacity-50 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Specialization</label>
                                <input
                                    type="text"
                                    value={form.specialization}
                                    onChange={e => setForm({ ...form, specialization: e.target.value })}
                                    placeholder="e.g. Senior Frontend Developer"
                                    className="input-field w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={e => setForm({ ...form, location: e.target.value })}
                                        placeholder="City, Country"
                                        className="input-field w-full pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60">Bio</label>
                            <textarea
                                value={form.bio}
                                onChange={e => setForm({ ...form, bio: e.target.value })}
                                placeholder="Tell learners about your experience and teaching style..."
                                className="input-field w-full min-h-[120px] py-3"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Website / Portfolio</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                                    <input
                                        type="url"
                                        value={form.website}
                                        onChange={e => setForm({ ...form, website: e.target.value })}
                                        placeholder="https://yourportfolio.com"
                                        className="input-field w-full pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Contact Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                                    <input
                                        type="text"
                                        value={form.contactNumber}
                                        onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                                        placeholder="+91 XXXXX XXXXX"
                                        className="input-field w-full pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Payment Details */}
                    <section className="space-y-6 pt-4">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <CreditCard className="w-5 h-5 text-accent-400" />
                            <h2 className="text-xl font-bold text-white">Payment & Revenue Details</h2>
                        </div>
                        <p className="text-sm text-white/40 bg-white/5 p-4 rounded-xl border border-white/10">
                            Enter the details where you'd like to receive your monthly course revenue share.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Account Holder Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                                    <input
                                        type="text"
                                        value={form.paymentDetails.accountHolderName}
                                        onChange={e => setForm({
                                            ...form,
                                            paymentDetails: { ...form.paymentDetails, accountHolderName: e.target.value }
                                        })}
                                        placeholder="Name on bank account"
                                        className="input-field w-full pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">UPI ID</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                                    <input
                                        type="text"
                                        value={form.paymentDetails.upiId}
                                        onChange={e => setForm({
                                            ...form,
                                            paymentDetails: { ...form.paymentDetails, upiId: e.target.value }
                                        })}
                                        placeholder="yourname@upi"
                                        className="input-field w-full pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Bank Name</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                                    <input
                                        type="text"
                                        value={form.paymentDetails.bankName}
                                        onChange={e => setForm({
                                            ...form,
                                            paymentDetails: { ...form.paymentDetails, bankName: e.target.value }
                                        })}
                                        placeholder="e.g. HDFC Bank"
                                        className="input-field w-full pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">IFSC Code</label>
                                <div className="relative">
                                    <Landmark className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                                    <input
                                        type="text"
                                        value={form.paymentDetails.ifscCode}
                                        onChange={e => setForm({
                                            ...form,
                                            paymentDetails: { ...form.paymentDetails, ifscCode: e.target.value }
                                        })}
                                        placeholder="HDFC000XXXX"
                                        className="input-field w-full pl-10 uppercase"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-white/60">Account Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                                    <input
                                        type="password"
                                        value={form.paymentDetails.accountNumber}
                                        onChange={e => setForm({
                                            ...form,
                                            paymentDetails: { ...form.paymentDetails, accountNumber: e.target.value }
                                        })}
                                        placeholder="XXXX-XXXX-XXXX-XXXX"
                                        className="input-field w-full pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Submit Btn */}
                    <div className="pt-8 w-full">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-lg"
                        >
                            {updateMutation.isPending ? 'Updating...' : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Save All Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Verification Status */}
                <div className="mt-12 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold">Verification Status</h4>
                            <p className="text-white/40 text-sm">
                                {profile?.isVerified ? 'Your account is verified by Admin.' : 'Account verification pending.'}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

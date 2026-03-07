import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Save, Globe, MapPin, Phone, Briefcase, FileText } from 'lucide-react';
import { companyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function CompanyProfile() {
    const { user, updateUser } = useAuth();
    const qc = useQueryClient();
    const [isSaving, setIsSaving] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['companyProfile'],
        queryFn: () => companyAPI.getProfile().then(r => r.data.company),
    });

    const [form, setForm] = useState({
        companyName: user?.name || '',
        industry: '',
        website: '',
        location: '',
        phone: '',
        description: '',
    });

    // Sync form with fetched data
    if (data && !form.industry && data.industry !== undefined) {
        setForm({
            companyName: data.companyName || '',
            industry: data.industry || '',
            website: data.website || '',
            location: data.location || '',
            phone: data.phone || '',
            description: data.description || '',
        });
    }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await companyAPI.updateProfile(form);
            updateUser({ ...user!, name: res.data.company.companyName, ...res.data.company });
            qc.invalidateQueries({ queryKey: ['companyProfile'] });
            toast.success('Company profile updated successfully!');
        } catch {
            toast.error('Failed to update company profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8"><div className="h-64 bg-white/5 rounded-2xl animate-pulse" /></div>;
    }

    return (
        <div className="p-8 space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-primary-400" />
                        Company Profile
                    </h1>
                    <p className="text-white/50 mt-1">Keep your company details updated to attract better candidates</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="btn-primary flex items-center gap-2">
                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            <div className="glass-card p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500/20 to-blue-500/20 border border-primary-500/30 flex items-center justify-center text-4xl font-black text-primary-400 flex-shrink-0">
                    {form.companyName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <p className="text-white font-bold text-xl">{form.companyName}</p>
                    <p className="text-white/50">{user?.email}</p>
                    <span className={`badge mt-3 ${data?.isApproved ? 'badge-green' : 'badge-yellow'}`}>
                        {data?.isApproved ? 'Platform Verified ✓' : 'Pending Verification'}
                    </span>
                </div>
            </div>

            <div className="glass-card p-6 space-y-5">
                <h2 className="text-lg text-white font-semibold flex items-center gap-2 border-b border-white/5 pb-4">
                    Company Information
                </h2>

                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="label flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-white/40" /> Company Name</label>
                        <input type="text" className="input-field" value={form.companyName}
                            onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-white/40" /> Industry</label>
                        <input type="text" className="input-field" placeholder="e.g. Information Technology"
                            value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-white/40" /> Website URL</label>
                        <input type="url" className="input-field" placeholder="https://example.com"
                            value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-white/40" /> Phone Number</label>
                        <input type="tel" className="input-field" placeholder="+1 234 567 890"
                            value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="label flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-white/40" /> Headquarters Location</label>
                        <input type="text" className="input-field" placeholder="e.g. San Francisco, CA"
                            value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                    </div>
                </div>

                <div className="pt-2">
                    <label className="label flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-white/40" /> About the Company</label>
                    <textarea className="input-field min-h-32 resize-y" placeholder="Describe your company's mission, culture, and what you do..."
                        value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
            </div>
        </div>
    );
}

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, User, FileText, Target, Briefcase, Bookmark,
    LogOut, Bell, ChevronRight, Sparkles, BookOpen, MessageSquare, Bot, GraduationCap, ClipboardList
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { Student } from '../../types';
import ThemeToggle from '../ThemeToggle';

const navItems = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard', highlight: false },
    { to: '/student/profile', icon: User, label: 'My Profile', highlight: false },
    { to: '/student/resume', icon: FileText, label: 'Resume & AI', highlight: false },
    { to: '/student/agent', icon: Bot, label: 'AI Career Agent', highlight: true },
    { to: '/student/skill-gap', icon: Target, label: 'Skill Gap Report', highlight: false },
    { to: '/student/skill-up', icon: BookOpen, label: 'Skill Up', highlight: false },
    { to: '/student/queries', icon: MessageSquare, label: 'My Queries', highlight: false },
];

const placementNavItems = [
    { to: '/student/drives', icon: GraduationCap, label: 'Campus Drives', highlight: false },
    { to: '/student/my-drives', icon: ClipboardList, label: 'My Applications', highlight: false },
];


export default function StudentLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const student = user as Student;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            {/* Ambient backdrop liquid glows */}
            <div className="liquid-orb-blue top-0 -left-20" />
            <div className="liquid-orb-red bottom-0 right-20" />

            {/* Sidebar */}
            <aside className="w-64 backdrop-blur-2xl flex flex-col fixed h-full z-40 shadow-sm"
                style={{
                    backgroundColor: 'var(--bg-sidebar)',
                    borderRight: '1px solid var(--border-sidebar)',
                }}>
                {/* Logo + ThemeToggle */}
                <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-sidebar)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-shade-blue-600 to-shade-blue-700 flex items-center justify-center shadow-md shadow-shade-blue-500/20 border border-white/40">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-sm leading-tight tracking-wide" style={{ color: 'var(--text-primary)' }}>Career Gap</h1>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Job Finder</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Student info */}
                <div className="p-4" style={{ borderBottom: '1px solid var(--border-sidebar)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-shade-blue-500/10 border border-shade-blue-500/25 flex items-center justify-center text-shade-blue-600 font-bold shadow-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                                {student?.subscription?.plan === 'premium' && (
                                    <Sparkles className="w-3.5 h-3.5 text-shade-blue-600 fill-shade-blue-600" />
                                )}
                            </div>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map(({ to, icon: Icon, label, highlight }) => (
                        <NavLink key={to} to={to}
                            className={({ isActive }) =>
                                isActive
                                    ? 'sidebar-item-active'
                                    : highlight
                                        ? 'sidebar-item relative bg-shade-blue-500/10 border border-shade-blue-500/20 text-shade-blue-600 hover:border-shade-blue-500/40'
                                        : 'sidebar-item'
                            }
                        >
                            {highlight ? (
                                <div className="w-5 h-5 flex-shrink-0 relative">
                                    <Icon className="w-5 h-5 text-shade-blue-600" />
                                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-shade-blue-600 rounded-full animate-pulse" />
                                </div>
                            ) : (
                                <Icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-body)' }} />
                            )}
                            <span className="text-sm font-medium">{label}</span>
                            {highlight && (
                                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-shade-blue-500/15 text-shade-blue-700 font-bold uppercase tracking-wider border border-shade-blue-500/25">AI</span>
                            )}
                        </NavLink>
                    ))}

                    {/* Placement section */}
                    <div className="pt-5 pb-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest px-2 mb-1 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                            <GraduationCap className="w-3.5 h-3.5 text-shade-blue-600" /> Placement
                        </p>
                    </div>
                    {placementNavItems.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to}
                            className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}>
                            <Icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-body)' }} />
                            <span className="text-sm font-medium">{label}</span>
                        </NavLink>
                    ))}

                    {/* Go Premium CTA */}
                    {student?.subscription?.plan !== 'premium' && (
                        <div className="mt-6 mx-1 p-4 rounded-2xl relative overflow-hidden group shadow-sm"
                            style={{
                                background: 'linear-gradient(135deg, rgba(29,78,216,0.08) 0%, var(--bg-secondary) 100%)',
                                border: '1px solid rgba(29,78,216,0.20)',
                            }}>
                            <div className="absolute -top-6 -right-6 w-20 h-20 bg-shade-blue-500/10 rounded-full blur-xl group-hover:scale-125 transition-all duration-500" />
                            <div className="relative z-10">
                                <p className="font-black text-xs uppercase tracking-widest mb-1 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                                    <Sparkles className="w-3.5 h-3.5 text-shade-blue-600" /> Pro Access
                                </p>
                                <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--text-body)' }}>Unlock full AI agent capabilities & premium drives.</p>
                                <button
                                    onClick={() => navigate('/student/premium')}
                                    className="w-full py-2 bg-gradient-to-r from-shade-blue-600 to-shade-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-95 transition-all shadow-md shadow-shade-blue-500/20 active:scale-95 border border-white/30"
                                >
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Logout */}
                <div className="p-4" style={{ borderTop: '1px solid var(--border-sidebar)' }}>
                    <button onClick={handleLogout}
                        className="sidebar-item w-full text-shade-red-600 hover:text-shade-red-700 hover:bg-shade-red-500/10 border border-transparent hover:border-shade-red-500/20"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-64 min-h-screen relative z-10">
                <Outlet />
            </main>
        </div>
    );
}

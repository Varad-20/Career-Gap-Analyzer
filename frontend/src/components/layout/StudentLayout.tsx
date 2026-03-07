import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, User, FileText, Target, Briefcase, Bookmark,
    LogOut, Bell, ChevronRight, Sparkles, BookOpen, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Student } from '../../types';

const navItems = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/profile', icon: User, label: 'My Profile' },
    { to: '/student/resume', icon: FileText, label: 'Resume & AI' },
    { to: '/student/matches', icon: Target, label: 'Job Matches' },
    { to: '/student/applications', icon: Briefcase, label: 'Applications' },
    { to: '/student/saved', icon: Bookmark, label: 'Saved Jobs' },
    { to: '/student/skill-up', icon: BookOpen, label: 'Skill Up' },
    { to: '/student/queries', icon: MessageSquare, label: 'My Queries' },
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
        <div className="min-h-screen bg-dark-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-dark-800 border-r border-white/5 flex flex-col fixed h-full z-40">
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-button-gradient flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-sm leading-tight">Career Gap</h1>
                            <p className="text-white/40 text-xs">Job Finder</p>
                        </div>
                    </div>
                </div>

                {/* Student info */}
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-semibold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                                {student?.subscription?.plan === 'premium' && (
                                    <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                )}
                            </div>
                            <p className="text-white/40 text-xs truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to}
                            className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium">{label}</span>
                        </NavLink>
                    ))}

                    {/* Go Premium CTA */}
                    {student?.subscription?.plan !== 'premium' && (
                        <div className="mt-6 mx-2 p-4 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-700 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                            <div className="relative z-10">
                                <p className="text-white font-black text-xs uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> Pro
                                </p>
                                <p className="text-white/80 text-[10px] leading-tight mb-3">Unlock all AI features & premium courses.</p>
                                <button
                                    onClick={() => navigate('/student/premium')}
                                    className="w-full py-2 bg-white text-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-dark-900 hover:text-white transition-all shadow-lg active:scale-95"
                                >
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-white/5">
                    <button onClick={handleLogout}
                        className="sidebar-item w-full text-red-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-64 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}

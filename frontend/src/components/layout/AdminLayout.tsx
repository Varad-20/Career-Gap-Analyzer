import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, LogOut, BarChart3, AlertTriangle, Briefcase, FileText, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems: { to: string; icon: any; label: string; badge?: number }[] = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Analytics' },
        { to: '/admin/students', icon: Users, label: 'Students' },
        { to: '/admin/course-review', icon: BookOpen, label: 'Course Review' },
    ];

    return (
        <div className="min-h-screen bg-charcoal-950 flex relative overflow-hidden">
            {/* Ambient liquid backdrop glows */}
            <div className="liquid-orb-red top-0 -left-20" />
            <div className="liquid-orb-ivory bottom-0 left-40" />

            {/* Sidebar */}
            <aside className="w-64 bg-charcoal-900/80 backdrop-blur-2xl border-r border-ivory/10 flex flex-col fixed h-full z-40 shadow-2xl">
                {/* Logo */}
                <div className="p-6 border-b border-ivory/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-shade-red-500 to-shade-red-600 flex items-center justify-center shadow-lg shadow-shade-red-500/20 border border-ivory/20">
                            <BarChart3 className="w-5 h-5 text-ivory-50" />
                        </div>
                        <div>
                            <h1 className="text-ivory-50 font-bold text-sm tracking-wide">Admin Panel</h1>
                            <p className="text-ivory-400 text-xs font-medium">Career Gap Finder</p>
                        </div>
                    </div>
                </div>

                {/* Admin Info */}
                <div className="p-4 border-b border-ivory/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-shade-red-500/15 border border-shade-red-500/30 flex items-center justify-center text-shade-red-400 font-semibold text-sm shadow-inner">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <p className="text-ivory-50 text-sm font-medium">{user?.name || 'Admin'}</p>
                            <p className="text-ivory-400 text-xs">Super Admin</p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label, badge }) => (
                        <NavLink key={to} to={to}
                            className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}>
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium flex-1">{label}</span>
                            {badge !== undefined && badge > 0 && (
                                <span className="ml-auto bg-shade-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-ivory/20">
                                    {badge}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-ivory/10">
                    <button onClick={() => { logout(); navigate('/login'); }}
                        className="sidebar-item w-full text-shade-red-400 hover:text-shade-red-300 hover:bg-shade-red-500/10 border border-transparent hover:border-shade-red-500/20">
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

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, LogOut, BarChart3, AlertTriangle, Briefcase, FileText, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import ThemeToggle from '../ThemeToggle';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems: { to: string; icon: any; label: string; badge?: number }[] = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Analytics' },
        { to: '/admin/students', icon: Users, label: 'Students' },
        { to: '/admin/course-review', icon: BookOpen, label: 'Course Review' },
    ];

    return (
        <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            {/* Ambient liquid backdrop glows */}
            <div className="liquid-orb-red top-0 -left-20" />
            <div className="liquid-orb-ivory bottom-0 left-40" />

            {/* Sidebar */}
            <aside className="w-64 backdrop-blur-2xl flex flex-col fixed h-full z-40 shadow-2xl"
                style={{
                    backgroundColor: 'var(--bg-sidebar)',
                    borderRight: '1px solid var(--border-sidebar)',
                }}>
                {/* Logo + ThemeToggle */}
                <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-sidebar)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-shade-red-500 to-shade-red-600 flex items-center justify-center shadow-lg shadow-shade-red-500/20 border border-white/20">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-sm tracking-wide" style={{ color: 'var(--text-primary)' }}>Admin Panel</h1>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Career Gap Finder</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Admin Info */}
                <div className="p-4" style={{ borderBottom: '1px solid var(--border-sidebar)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-shade-red-500/15 border border-shade-red-500/30 flex items-center justify-center text-shade-red-500 font-semibold text-sm shadow-inner">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Admin'}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Super Admin</p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label, badge }) => (
                        <NavLink key={to} to={to}
                            className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}>
                            <Icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-body)' }} />
                            <span className="text-sm font-medium flex-1">{label}</span>
                            {badge !== undefined && badge > 0 && (
                                <span className="ml-auto bg-shade-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {badge}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4" style={{ borderTop: '1px solid var(--border-sidebar)' }}>
                    <button onClick={() => { logout(); navigate('/login'); }}
                        className="sidebar-item w-full text-shade-red-500 hover:text-shade-red-400 hover:bg-shade-red-500/10 border border-transparent hover:border-shade-red-500/20">
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

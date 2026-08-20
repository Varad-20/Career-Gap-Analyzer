import { ReactNode } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
    GraduationCap, LayoutDashboard, Briefcase, Users, BarChart3,
    LogOut, Settings, Bell, ChevronRight
} from 'lucide-react';

const navItems = [
    { to: '/coordinator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/coordinator/drives', icon: Briefcase, label: 'Placement Drives' },
    { to: '/coordinator/students', icon: Users, label: 'Students' },
    { to: '/coordinator/stats', icon: BarChart3, label: 'Analytics' },
];

export default function CoordinatorLayout() {
    const navigate = useNavigate();
    const raw = localStorage.getItem('coordinatorUser');
    const user = raw ? JSON.parse(raw) : null;

    const handleLogout = () => {
        localStorage.removeItem('coordinatorToken');
        localStorage.removeItem('coordinatorUser');
        navigate('/coordinator');
    };

    return (
        <div className="min-h-screen bg-dark-900 flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col sticky top-0 h-screen"
                style={{ background: 'rgba(10,10,20,0.95)' }}>
                {/* Logo */}
                <div className="p-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm leading-tight">Coordinator</p>
                            <p className="text-white/40 text-xs">{user?.college?.name || 'Portal'}</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map(item => (
                        <NavLink key={item.to} to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`
                            }>
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User + Logout */}
                <div className="p-3 border-t border-white/5">
                    <div className="flex items-center gap-3 px-3 py-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">
                            {user?.name?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{user?.name || 'Coordinator'}</p>
                            <p className="text-white/40 text-xs truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

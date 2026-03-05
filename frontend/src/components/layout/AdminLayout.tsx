import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, LogOut, BarChart3, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api.ts';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Fetch pending companies count for the badge
    const { data: companiesData } = useQuery({
        queryKey: ['adminCompanies'],
        queryFn: () => adminAPI.getCompanies().then(r => r.data.companies),
        refetchInterval: 30000, // auto-refresh every 30s
    });
    const pendingCount = (companiesData || []).filter((c: { isApproved: boolean }) => !c.isApproved).length;

    const navItems = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Analytics' },
        { to: '/admin/companies', icon: Building2, label: 'Companies', badge: pendingCount },
        { to: '/admin/students', icon: Users, label: 'Students' },
    ];

    return (
        <div className="min-h-screen bg-dark-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-dark-800 border-r border-white/5 flex flex-col fixed h-full z-40">
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-sm">Admin Panel</h1>
                            <p className="text-white/40 text-xs">Career Gap Finder</p>
                        </div>
                    </div>
                </div>

                {/* Admin Info */}
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-semibold text-sm">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">{user?.name || 'Admin'}</p>
                            <p className="text-white/40 text-xs">Super Admin</p>
                        </div>
                    </div>
                </div>

                {/* Pending alert in sidebar */}
                {pendingCount > 0 && (
                    <div className="mx-3 mt-3 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/admin/companies')}>
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <p className="text-yellow-300 text-xs">
                            <span className="font-bold">{pendingCount}</span> {pendingCount === 1 ? 'company' : 'companies'} pending
                        </p>
                    </div>
                )}

                {/* Nav Links */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label, badge }) => (
                        <NavLink key={to} to={to}
                            className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}>
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium flex-1">{label}</span>
                            {badge !== undefined && badge > 0 && (
                                <span className="ml-auto bg-yellow-500 text-dark-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {badge}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-white/5">
                    <button onClick={() => { logout(); navigate('/login'); }}
                        className="sidebar-item w-full text-red-400 hover:text-red-400 hover:bg-red-500/10">
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

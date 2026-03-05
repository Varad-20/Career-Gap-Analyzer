import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Briefcase, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { to: '/company/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/company/post-job', icon: PlusCircle, label: 'Post a Job' },
    { to: '/company/profile', icon: User, label: 'Company Profile' },
];

export default function CompanyLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-dark-900 flex">
            <aside className="w-64 bg-dark-800 border-r border-white/5 flex flex-col fixed h-full z-40">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-button-gradient flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-sm">Career Gap</h1>
                            <p className="text-white/40 text-xs">Employer Portal</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-600/20 flex items-center justify-center text-accent-400 font-semibold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-white/40 text-xs">Employer</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to}
                            className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium">{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button onClick={() => { logout(); navigate('/login'); }}
                        className="sidebar-item w-full text-red-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 ml-64 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}

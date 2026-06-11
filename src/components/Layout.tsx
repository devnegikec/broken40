import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  PiggyBank,
  Wallet,
  LogOut,
  User,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/investments', icon: TrendingUp, label: 'Investments' },
  { to: '/savings', icon: PiggyBank, label: 'Savings' },
];

export default function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">MoneyBox</h1>
              <p className="text-xs text-gray-500">Personal Finance</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-linear-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-300 truncate">{user?.email}</p>
              <p className="text-xs text-gray-600">Signed in</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

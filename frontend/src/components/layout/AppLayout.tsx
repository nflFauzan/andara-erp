import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Receipt,
  CreditCard,
  Wallet,
  FileSpreadsheet,
  Activity,
  Hash,
  Menu,
  X,
  ShieldCheck,
  Building2,
  LogOut,
  Database,
  Package,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isMasterDataActive =
    location.pathname.startsWith('/customers') ||
    location.pathname.startsWith('/items') ||
    location.pathname.startsWith('/master');

  const [masterDataOpen, setMasterDataOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const otherNavigation = [
    { name: 'Kegiatan & Item', href: '/kegiatan', icon: Briefcase },
    { name: 'Penawaran', href: '/penawaran', icon: FileText },
    { name: 'Faktur Penjualan', href: '/faktur', icon: Receipt },
    { 
      name: 'Pembayaran & Alokasi', 
      href: '/pembayaran', 
      icon: CreditCard,
      operatorOnly: true
    },
    { 
      name: 'Deposit Customer', 
      href: '/deposits', 
      icon: Wallet 
    },
    { name: 'Kwitansi', href: '/kwitansi', icon: Receipt },
    { name: 'Penomoran', href: '/numbering', icon: Hash },
    { name: 'Rekap & Laporan', href: '/rekap', icon: FileSpreadsheet },
    { name: 'Koneksi & Status', href: '/status', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-canvas flex text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Solid Deep Slate Navy for high contrast and readability */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-white flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 border-r border-slate-800 shadow-xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-0 max-lg:-translate-x-full"
      )}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-[#0b1324]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white">CV. ANDARA</h1>
              <p className="text-[10.5px] text-slate-400 font-medium">ERP & Keuangan</p>
            </div>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {/* Dashboard */}
          <NavLink
            to="/"
            end
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
              isActive 
                ? "bg-blue-600 text-white shadow-sm font-semibold" 
                : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
            )}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </NavLink>

          {/* Master Data Collapsible Menu */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setMasterDataOpen(!masterDataOpen)}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                isMasterDataActive 
                  ? "text-blue-400 font-semibold bg-blue-950/40" 
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 shrink-0" />
                <span>Master Data</span>
              </div>
              <ChevronDown 
                className={cn(
                  "w-4 h-4 text-slate-400 transition-transform duration-200",
                  masterDataOpen ? "transform rotate-180" : ""
                )} 
              />
            </button>

            {masterDataOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 border-l border-slate-800 ml-4 my-1">
                <NavLink
                  to="/customers"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                    isActive 
                      ? "bg-blue-600 text-white font-semibold shadow-xs" 
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  )}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>Data Customer</span>
                </NavLink>

                <NavLink
                  to="/items"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                    isActive 
                      ? "bg-blue-600 text-white font-semibold shadow-xs" 
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  )}
                >
                  <Package className="w-3.5 h-3.5 shrink-0" />
                  <span>Data Item</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="pt-1 border-t border-slate-800/80 my-1.5" />

          {/* Operational & Transaction Modules */}
          {otherNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive 
                  ? "bg-blue-600 text-white shadow-sm font-semibold" 
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
              {item.operatorOnly && (
                <span className="ml-auto text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Operator
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Role Info with Logout Button */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0b1324]">
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.fullName || user?.username || 'Pengguna'}
                </p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                  {user?.role || 'USER'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Keluar (Logout)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar - Clean White in Light Mode, Sleek Deep Slate in Dark Mode */}
        <header className="h-16 bg-white dark:bg-[#0f172a] border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 transition-colors duration-150 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Sistem Manajemen Operasional & Transaksi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                CV. ANDARA &bull; Keuangan & Operasional Terpadu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition shadow-xs"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-semibold">Mode Gelap</span>
                </>
              )}
            </button>

            {/* Active Session Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sesi: {user?.role}
            </span>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  HardHat,
  FileText,
  Receipt,
  CreditCard,
  Wallet,
  FileSpreadsheet,
  Activity,
  Hash,
  LogOut,
  Package,
  Sun,
  Moon,
  FileCheck,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { MobileBottomNavbar } from './MobileBottomNavbar';
import { MobileMenuDrawer } from './MobileMenuDrawer';

interface NavigationGroup {
  groupName: string;
  items: {
    name: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    operatorOnly?: boolean;
  }[];
}

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navGroups: NavigationGroup[] = [
    {
      groupName: 'RINGKASAN',
      items: [
        {
          name: 'Dashboard Utama',
          description: 'Ringkasan kas, piutang & performa',
          href: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupName: 'PENJUALAN & PROYEK',
      items: [
        {
          name: 'Kegiatan & Proyek',
          description: 'Rencana kerja & rincian biaya proyek',
          href: '/kegiatan',
          icon: HardHat,
        },
        {
          name: 'Penawaran (SPH)',
          description: 'Estimasi harga ke calon pelanggan',
          href: '/penawaran',
          icon: FileText,
        },
        {
          name: 'Faktur Penjualan',
          description: 'Surat tagihan pembayaran (Invoice)',
          href: '/faktur',
          icon: Receipt,
        },
      ],
    },
    {
      groupName: 'KAS & KEUANGAN',
      items: [
        {
          name: 'Pembayaran Masuk',
          description: 'Pencatatan kas & pelunasan tagihan',
          href: '/pembayaran',
          icon: CreditCard,
          operatorOnly: true,
        },
        {
          name: 'Deposit Customer',
          description: 'Buku saldo titipan & lebih bayar',
          href: '/deposits',
          icon: Wallet,
        },
        {
          name: 'Kwitansi Resmi',
          description: 'Bukti tanda terima pembayaran sah',
          href: '/kwitansi',
          icon: FileCheck,
        },
      ],
    },
    {
      groupName: 'DATA MASTER',
      items: [
        {
          name: 'Data Pelanggan',
          description: 'Buku mitra & kontak pelanggan',
          href: '/customers',
          icon: Users,
        },
        {
          name: 'Katalog Item & Tarif',
          description: 'Daftar harga bahan baku & jasa',
          href: '/items',
          icon: Package,
        },
      ],
    },
    {
      groupName: 'LAPORAN & SISTEM',
      items: [
        {
          name: 'Rekap Keuangan',
          description: 'Laporan omset, laba & perpajakan',
          href: '/rekap',
          icon: FileSpreadsheet,
        },
        {
          name: 'Format Nomor Surat',
          description: 'Pola nomor otomatis dokumen resmi',
          href: '/numbering',
          icon: Hash,
        },
        {
          name: 'Status Koneksi Server',
          description: 'Kesehatan database & REST API',
          href: '/status',
          icon: Activity,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* 
        💎 Semi-Floating Glass Sidebar (Desktop Only)
        Follows Reference Design: Rounded, frosted glass, blue pills for active state
      */}
      <aside className={cn(
        "hidden lg:flex flex-col w-76 shrink-0 my-3 ml-4 mb-3",
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl",
        "border border-white/70 dark:border-white/10",
        "shadow-[0_12px_40px_rgba(20,40,80,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]",
        "rounded-3xl"
      )}>
        {/* Header Branding */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center p-1.5 shadow-[0_4px_16px_rgba(14,59,36,0.15)] border border-slate-200/70 dark:border-slate-700/70 shrink-0">
              <img src="/logo-drr.svg" alt="CV. ANDARA" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-sm tracking-wide text-slate-900 dark:text-white leading-tight">
                CV. ANDARA
              </h1>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black tracking-wider uppercase mt-0.5">
                Operasional & Keuangan
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-3.5 py-4 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.groupName} className="space-y-1.5">
              <div className="px-3.5 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.groupName}
              </div>

              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/'}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-[0_6px_20px_rgba(37,99,235,0.35)] border border-white/20" 
                      : "text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-white hover:border-slate-200/50"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        "p-2 rounded-xl shrink-0 transition-transform duration-200",
                        isActive 
                          ? "bg-white/20 text-white shadow-xs" 
                          : "bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-blue-600 dark:text-blue-400 group-hover:scale-105"
                      )}>
                        <item.icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={cn(
                            "text-xs tracking-tight truncate",
                            isActive 
                              ? "font-extrabold text-white" 
                              : "font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-white"
                          )}>
                            {item.name}
                          </span>
                          {item.operatorOnly && (
                            <span className={cn(
                              "text-[8.5px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-full border shrink-0",
                              isActive
                                ? "bg-white/25 text-white border-white/30"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                            )}>
                              Operator
                            </span>
                          )}
                        </div>
                        <p className={cn(
                          "text-[10px] line-clamp-1 mt-0.5",
                          isActive 
                            ? "text-blue-100/90 font-medium" 
                            : "text-slate-400 dark:text-slate-400 group-hover:text-slate-500 font-medium"
                        )}>
                          {item.description}
                        </p>
                      </div>

                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer Area: Dark Mode Switch + User Profile */}
        <div className="p-3.5 border-t border-slate-200/50 dark:border-slate-800/60 space-y-2.5 shrink-0">
          {/* iOS-style Glass Dark Mode Toggle */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-blue-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mode Gelap
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(
                "w-11 h-6 rounded-full transition-colors duration-200 flex items-center p-0.5 relative cursor-pointer",
                theme === 'dark' ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
              )}
              aria-label="Toggle Mode Gelap"
            >
              <div className={cn(
                "w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200",
                theme === 'dark' ? "translate-x-5" : "translate-x-0"
              )} />
            </button>
          </div>

          {/* Active User Card & Quick Logout */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.fullName || user?.username || 'Pengguna'}
                </p>
                <span className="text-[9px] font-black uppercase text-blue-600 dark:text-emerald-400 tracking-wider">
                  Role: {user?.role || 'USER'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Keluar dari Sistem (Logout)"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
              aria-label="Keluar dari Sistem"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 
          💎 Floating Glass Topbar (Capsule Design)
          Margin from viewport, sticky, rounded pill, translucent backdrop-blur
        */}
        <header className="sticky top-2 sm:top-3 z-30 mx-3 sm:mx-6 lg:mx-8 my-1.5 sm:my-2">
          <div className="glass-topbar px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-4">
            {/* Left: System Branding */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center p-1 shadow-xs border border-slate-200/70 dark:border-slate-700/70 shrink-0">
                <img src="/logo-drr.svg" alt="CV. ANDARA" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs sm:text-sm tracking-wide text-slate-900 dark:text-white whitespace-nowrap">
                    CV. ANDARA
                  </span>
                  <span className="text-slate-300 dark:text-slate-700 hidden md:inline">|</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline truncate">
                    Sistem Manajemen Operasional & Transaksi
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden lg:block leading-tight">
                  CV. ANDARA &bull; Keuangan & Operasional Terpadu
                </p>
              </div>
            </div>

            {/* Right: Actions, Operator Pill & Logout */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Dark Mode Icon Button */}
              <button
                type="button"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                className="glass-btn-icon"
                aria-label="Toggle Tema"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-600" />
                )}
              </button>

              {/* Active Operator Session Pill */}
              <div className="glass-pill text-blue-700 dark:text-emerald-400 border-blue-500/20 dark:border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                  <span className="hidden sm:inline">Sesi: </span>{user?.role || 'OPERATOR'}
                </span>
              </div>

              {/* Compact Logout Icon Button */}
              <button
                onClick={handleLogout}
                title="Keluar dari Sistem"
                className="glass-btn-icon hover:text-rose-600 dark:hover:text-rose-400"
                aria-label="Keluar dari Sistem"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Viewport with pb-28 on mobile for bottom navigation clearance */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* 💎 Mobile Floating Curved Bottom Navigation Bar (Ref: User Reference) */}
      <MobileBottomNavbar
        onOpenMenu={() => setMobileMenuOpen((prev) => !prev)}
        isMenuOpen={mobileMenuOpen}
      />

      {/* 💎 Mobile All Modules Bottom Sheet Drawer */}
      <MobileMenuDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
};

export default AppLayout;

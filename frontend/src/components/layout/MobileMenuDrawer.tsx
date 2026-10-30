import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  Users,
  Package,
  FileSpreadsheet,
  FileCheck,
  Wallet,
  Hash,
  Activity,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  ChevronRight,
  FileText,
  HardHat
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      onClose();
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const menuSections = [
    {
      title: 'MASTER DATA & DOKUMEN',
      items: [
        {
          name: 'Data Pelanggan',
          description: 'Buku kontak & saldo deposit mitra',
          href: '/customers',
          icon: Users,
          color: 'from-blue-500 to-cyan-500',
        },
        {
          name: 'Katalog Item & Tarif',
          description: 'Daftar harga bahan dan jasa',
          href: '/items',
          icon: Package,
          color: 'from-amber-500 to-orange-500',
        },
        {
          name: 'Penawaran (SPH)',
          description: 'Estimasi biaya & addendum SPH',
          href: '/penawaran',
          icon: FileText,
          color: 'from-indigo-500 to-blue-500',
        },
        {
          name: 'Kegiatan & Proyek',
          description: 'Rincian volume & operasional proyek',
          href: '/kegiatan',
          icon: HardHat,
          color: 'from-emerald-500 to-teal-500',
        },
      ],
    },
    {
      title: 'KEUANGAN & KAS',
      items: [
        {
          name: 'Deposit Customer',
          description: 'Buku saldo titipan & lebih bayar',
          href: '/deposits',
          icon: Wallet,
          color: 'from-violet-500 to-purple-500',
        },
        {
          name: 'Kwitansi Resmi',
          description: 'Tanda terima pembayaran sah',
          href: '/kwitansi',
          icon: FileCheck,
          color: 'from-teal-500 to-emerald-500',
        },
        {
          name: 'Rekap Keuangan',
          description: 'Laporan omset, laba & perpajakan',
          href: '/rekap',
          icon: FileSpreadsheet,
          color: 'from-rose-500 to-pink-500',
        },
      ],
    },
    {
      title: 'PENGATURAN & SISTEM',
      items: [
        {
          name: 'Format Nomor Surat',
          description: 'Pola nomor otomatis dokumen',
          href: '/numbering',
          icon: Hash,
          color: 'from-slate-600 to-slate-800',
        },
        {
          name: 'Status Koneksi Server',
          description: 'Kesehatan database & REST API',
          href: '/status',
          icon: Activity,
          color: 'from-emerald-600 to-teal-700',
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Modal */}
      <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-[32px] border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-12px_40px_rgba(0,0,0,0.25)] flex flex-col max-h-[88vh] z-10 animate-in slide-in-from-bottom duration-300">
        {/* Drag Pill Handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Drawer Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm">
              CA
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Menu & Modul Selengkapnya
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                CV. ANDARA &bull; Sistem Terpadu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Menu Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Active User Card & Quick Logout */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/70 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {user?.fullName || user?.username || 'Pengguna'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-emerald-400">
                    Role: {user?.role || 'OPERATOR'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>

          {/* Theme Switcher Quick Card */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center",
                theme === 'dark' ? "bg-indigo-500/15 text-indigo-400" : "bg-amber-500/15 text-amber-600"
              )}>
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Mode Tampilan
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {theme === 'dark' ? 'Tema Gelap Aktif' : 'Tema Terang Aktif'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={cn(
                "w-12 h-6 rounded-full transition-colors duration-200 flex items-center p-0.5 relative cursor-pointer",
                theme === 'dark' ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
              )}
              aria-label="Ganti Tema Tampilan"
            >
              <div className={cn(
                "w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200",
                theme === 'dark' ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>

          {/* Grouped Modules */}
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500 px-1">
                {section.title}
              </h3>

              <div className="space-y-1.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-150 border",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 font-bold"
                        : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs bg-gradient-to-br",
                          item.color
                        )}>
                          <item.icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-xs truncate",
                            isActive ? "font-black text-blue-900 dark:text-blue-100" : "font-bold text-slate-800 dark:text-slate-200"
                          )}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-400 line-clamp-1">
                            {item.description}
                          </p>
                        </div>

                        <ChevronRight className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-300 dark:text-slate-600"
                        )} />
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info & Safe area spacer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-center shrink-0">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            CV. ANDARA &bull; Sistem Operasional v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileMenuDrawer;


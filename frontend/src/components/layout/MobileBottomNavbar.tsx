import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  HardHat,
  Receipt,
  CreditCard,
  Grid
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavbarProps {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}

export const MobileBottomNavbar: React.FC<MobileBottomNavbarProps> = ({ onOpenMenu, isMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: LayoutDashboard,
      path: '/',
      isActive: location.pathname === '/' && !isMenuOpen,
    },
    {
      id: 'proyek',
      label: 'Proyek',
      icon: HardHat,
      path: '/kegiatan',
      isActive: (location.pathname.startsWith('/kegiatan') || location.pathname.startsWith('/penawaran')) && !isMenuOpen,
    },
    {
      id: 'faktur',
      label: 'Faktur',
      icon: Receipt,
      path: '/faktur',
      isActive: location.pathname.startsWith('/faktur') && !isMenuOpen,
    },
    {
      id: 'kas',
      label: 'Kas',
      icon: CreditCard,
      path: '/pembayaran',
      isActive: (location.pathname.startsWith('/pembayaran') || location.pathname.startsWith('/deposits') || location.pathname.startsWith('/kwitansi')) && !isMenuOpen,
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: Grid,
      path: null,
      isActive: isMenuOpen,
    },
  ];

  const handleTabClick = (item: typeof navItems[0]) => {
    if (item.path) {
      navigate(item.path);
    } else {
      onOpenMenu();
    }
  };

  return (
    <div className="fixed bottom-3 inset-x-3 sm:inset-x-8 z-40 lg:hidden pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <nav
          aria-label="Navigasi Utama Mobile"
          className={cn(
            "relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
            "rounded-[28px] border border-slate-200/80 dark:border-slate-800/80",
            "shadow-[0_12px_36px_rgba(15,23,42,0.14)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)]",
            "px-2 pt-2 pb-1.5 transition-all duration-300"
          )}
        >
          <div className="grid grid-cols-5 items-end relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item)}
                  className="flex flex-col items-center justify-end relative py-1 focus:outline-hidden group cursor-pointer transition-transform active:scale-95"
                  aria-label={item.label}
                  aria-current={item.isActive ? 'page' : undefined}
                >
                  {item.isActive ? (
                    <>
                      {/* 💎 Smooth Wave Crest SVG Cutout (Matching Reference Design) */}
                      <div className="absolute -top-[23px] left-1/2 -translate-x-1/2 w-20 h-6 pointer-events-none overflow-visible">
                        <svg
                          viewBox="0 0 80 24"
                          className="w-full h-full fill-white/95 dark:fill-slate-900/95 drop-shadow-[0_-4px_6px_rgba(0,0,0,0.03)]"
                        >
                          <path d="M 0 24 C 18 24 22 2 40 2 C 58 2 62 24 80 24 Z" />
                        </svg>
                      </div>

                      {/* 💎 Elevated Floating Active Circle Bubble */}
                      <div className="absolute -top-[28px] left-1/2 -translate-x-1/2 w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.45)] border-[3.5px] border-white dark:border-slate-900 flex items-center justify-center transition-all duration-300 transform scale-100 animate-in zoom-in-75">
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>

                      {/* Active Label */}
                      <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 tracking-tight mt-5 transition-colors">
                        {item.label}
                      </span>
                    </>
                  ) : (
                    <>
                      {/* Inactive Icon & Label */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                        <Icon className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-tight transition-colors">
                        {item.label}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* 💎 Mobile Home Indicator Bar (Referencing bottom bar in user's image) */}
          <div className="pt-1.5 pb-0.5 flex justify-center">
            <div className="w-24 h-1 rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileBottomNavbar;


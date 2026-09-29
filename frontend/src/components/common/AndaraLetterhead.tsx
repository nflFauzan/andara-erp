import React from 'react';

interface AndaraLetterheadProps {
  /**
   * Jika true, tampilkan strip pita divisi baja ringan (format resmi Invoice/Faktur)
   */
  showDivisiStrip?: boolean;
  className?: string;
}

export const AndaraLetterhead: React.FC<AndaraLetterheadProps> = ({
  showDivisiStrip = false,
  className = '',
}) => {
  return (
    <div className={`w-full font-sans select-none ${className}`}>
      {/* Main Kop: Logo DRR + Company Info */}
      <div className="flex items-center gap-4 sm:gap-6 pb-2">
        {/* DRR Emblem / Logo */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="w-16 h-12 sm:w-20 sm:h-14 border-2 border-slate-700 rounded-[50%] flex items-center justify-center bg-white shadow-sm">
            <span className="font-extrabold text-slate-800 text-lg sm:text-xl tracking-tighter italic font-serif">
              DRR
            </span>
          </div>
        </div>

        {/* Text Details */}
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1d4ed8] font-serif leading-none">
            CV. ANDARA
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#1e3a8a] tracking-wide mt-1">
            General Contractor – Supplier – Perdagangan Umum – Aplikator
          </p>
          <p className="text-[10px] sm:text-xs text-slate-700 leading-tight mt-0.5">
            Laladon Gede Gg. IV No. 255 Desa Laladon – Ciomas – Bogor
          </p>
          <p className="text-[10px] sm:text-xs text-slate-700 leading-tight">
            <span className="font-medium">Telp.</span> 0878-7044-5159 &nbsp;&nbsp;|&nbsp;&nbsp;{' '}
            <span className="font-medium">E_mail:</span>{' '}
            <span className="text-blue-700 underline underline-offset-1">andarateknik@yahoo.com</span>
          </p>
        </div>
      </div>

      {/* Double Separator Line */}
      <div className="border-t-2 border-slate-900 mt-1 mb-0.5" />
      <div className="border-t border-slate-900" />

      {/* Optional Strip: Divisi Baja Ringan, Genteng, Plafon dan Alumunium */}
      {showDivisiStrip && (
        <div className="mt-1.5 py-1 px-3 bg-[#38bdf8]/20 border border-[#0284c7]/40 rounded-sm text-center">
          <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#0369a1]">
            DIVISI : BAJA RINGAN , GENTENG , PLAFON DAN ALUMUNIUM
          </p>
        </div>
      )}
    </div>
  );
};

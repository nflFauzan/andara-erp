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
      {/* Kop Surat Resmi CV. ANDARA (Ekstraksi 100% dari dokumen asli) */}
      <div className="w-full">
        <img
          src="/header-andara.jpg"
          alt="Kop Resmi CV. ANDARA"
          className="w-full h-auto object-contain block"
        />
      </div>

      {/* Pita Divisi: Baja Ringan, Genteng, Plavon dan Alumunium (Background Biru #0070c0 & Teks Kuning #ffff00) */}
      {showDivisiStrip && (
        <div className="mt-1 py-0.5 px-3 bg-[#0070c0] text-center">
          <p className="text-[10px] sm:text-[11.5px] font-black uppercase tracking-wider text-[#ffff00] font-sans">
            DIVISI : BAJA RINGAN , GENTENG , PLAVON DAN ALUMUNIUM
          </p>
        </div>
      )}
    </div>
  );
};

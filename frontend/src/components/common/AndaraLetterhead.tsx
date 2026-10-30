import React, { useState } from 'react';
import { ANDARA_LETTERHEAD_BASE64 } from '@/assets/letterheadBase64';

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
  const [imgSrc, setImgSrc] = useState<string>(ANDARA_LETTERHEAD_BASE64);

  return (
    <div className={`w-full font-sans select-none ${className}`}>
      {/* Kop Surat Resmi CV. ANDARA (Ekstraksi 100% dari dokumen asli, embedded base64 anti-pecah di Android/mobile print) */}
      <div className="w-full">
        <img
          src={imgSrc}
          onError={() => setImgSrc('/header-andara.jpg')}
          alt="Kop Resmi CV. ANDARA"
          className="w-full h-auto object-contain block"
          style={{ maxHeight: '120px' }}
          loading="eager"
        />
      </div>

      {/* Pita Divisi: Baja Ringan, Genteng, Plavon dan Alumunium (Background Biru #0070c0 ~58% dari kiri sesuai dokumen real user) */}
      {showDivisiStrip && (
        <div
          className="mt-1 py-0.5 px-3 bg-[#0070c0] w-[58%] max-w-[430px] text-center"
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#0070c0' }}
        >
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#ffff00] font-sans whitespace-nowrap">
            DIVISI : BAJA RINGAN , GENTENG , PLAVON DAN ALUMUNIUM
          </p>
        </div>
      )}
    </div>
  );
};

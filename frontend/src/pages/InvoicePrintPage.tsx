import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, AlertCircle } from 'lucide-react';
import { invoiceApi } from '../api/invoiceApi';
import { customerApi } from '../api/customerApi';
import { Invoice, InvoiceDetail } from '../types/invoice';
import { Customer } from '../types/customer';
import { AndaraLetterhead } from '../components/common/AndaraLetterhead';
import { angkaTerbilang } from '../lib/utils';

interface GroupedKegiatan {
  groupName: string;
  letter: string;
  items: InvoiceDetail[];
  subtotal: number;
}

export const InvoicePrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    invoiceApi
      .getInvoiceById(Number(id))
      .then(async (data) => {
        setInvoice(data);
        if (data.customerId) {
          try {
            const cust = await customerApi.getCustomerById(data.customerId);
            setCustomer(cust);
          } catch {
            // ignore
          }
        }
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.message || 'Gagal memuat dokumen faktur.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const formatTanggalResmi = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format angka ribuan sesuai contoh fisik Excel (pemisah koma ribuan, titik desimal)
  const formatNumber = (val?: number | string | null) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatQuantity = (val?: number | string | null) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-US', {
      minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    });
  };

  const formatDecimalCurrency = (val?: number | string | null) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Grouping item berdasarkan kegiatan/ruang jika ada
  const groupedData = useMemo(() => {
    if (!invoice?.details || invoice.details.length === 0) {
      return { groups: [], hasGrouping: false };
    }

    const groupMap = new Map<string, InvoiceDetail[]>();
    let hasNamedGroup = false;

    invoice.details.forEach((item) => {
      const gName = (item.sphKegiatanName || item.sourceKegiatanName || '').trim();
      if (gName) hasNamedGroup = true;
      const key = gName || '__default__';
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(item);
    });

    if (!hasNamedGroup && groupMap.size === 1) {
      return { groups: [], hasGrouping: false };
    }

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const groups: GroupedKegiatan[] = [];
    let idx = 0;

    groupMap.forEach((items, gName) => {
      const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      groups.push({
        groupName: gName === '__default__' ? 'Pekerjaan Lainnya' : gName,
        letter: letters[idx % letters.length],
        items,
        subtotal,
      });
      idx++;
    });

    return { groups, hasGrouping: true };
  }, [invoice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-700">Mempersiapkan dokumen cetak faktur...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Dokumen Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">{errorMsg || 'Faktur penjualan tidak ditemukan.'}</p>
          <button
            onClick={() => navigate('/faktur')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Faktur
          </button>
        </div>
      </div>
    );
  }

  // Nominal terbilang dihitung dari sisa tagihan jika ada sisa, atau net/total tagihan
  const billableAmount = invoice.outstanding > 0
    ? invoice.outstanding
    : (invoice.netTotalAmount && invoice.netTotalAmount > 0 ? invoice.netTotalAmount : invoice.totalAmount);
  const nominalTerbilang = angkaTerbilang(billableAmount);

  // Keterangan pembayaran — prioritas: notes > deskripsi pekerjaan dari detail > fallback
  const paymentDescription = invoice.notes
    || (invoice.details?.length > 0
      ? invoice.details.map(d => d.description).join(', ')
      : 'Pengadaan dan Pemasangan Material');

  const { groups, hasGrouping } = groupedData;
  const lastGroupLetter = groups.length > 0 ? groups[groups.length - 1].letter : 'A';

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 print:bg-white print:py-0 print:m-0">
      {/* Top Floating Control Toolbar (Hidden in Print) */}
      <div className="max-w-4xl mx-auto px-4 mb-6 print:hidden">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/faktur/${invoice.id}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Detail
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-sans hidden sm:inline">
              Format Resmi Cetak Faktur CV. ANDARA (100% Sesuai Contoh Fisik)
            </span>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <Printer className="w-4 h-4" /> Cetak Dokumen / PDF (Ctrl+P)
            </button>
          </div>
        </div>
      </div>

      {/* Sheet Dokumen Resmi Cetak Faktur (Ukuran Kertas Standar A4) */}
      <div
        className="w-full max-w-[210mm] mx-auto bg-white shadow-xl rounded-none border border-slate-300 p-6 sm:p-8 text-black font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-[8.5pt] sm:text-[9pt] leading-normal"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        
        {/* Kop Surat Resmi CV. ANDARA */}
        <AndaraLetterhead showDivisiStrip={false} className="mb-1" />

        {/* Pita Divisi: Baja Ringan, Genteng, Plavon dan Alumunium dengan Garis Horizontal ke Kanan Sesuai Reference */}
        <div className="flex items-center my-1.5">
          <div
            className="py-0.5 px-3 bg-[#0070c0] text-center whitespace-nowrap"
            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#0070c0' }}
          >
            <span className="text-[8.5pt] font-black uppercase tracking-wide text-[#ffff00] font-sans">
              DIVISI : BAJA RINGAN , GENTENG , PLAVON DAN ALUMUNIUM
            </span>
          </div>
          <div className="flex-1 border-b border-black"></div>
        </div>

        {/* Badge INVOICE — Kotak Kuning dengan Teks Merah sesuai Dokumen Real CV. ANDARA */}
        <div className="flex justify-center my-2">
          <div
            className="w-[50%] max-w-[380px] bg-[#ffff00] border border-black py-0.5 text-center"
            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#ffff00' }}
          >
            <span className="font-black italic text-[11pt] tracking-[0.25em] text-[#ff0000] uppercase font-sans">
              INVOICE
            </span>
          </div>
        </div>

        {/* Kotak Dokumen Faktur (SATU OUTER FRAME DOUBLE-LINE Mengelilingi Metadata, Rincian, dan Footer/Tanda Tangan) */}
        <div className="bg-white" style={{ border: '3.5px double #000' }}>

          {/* Section Informasi Atas (Restrukturisasi Total: Alignment Kolom Konsisten, Bukan Spreadsheet Grid) */}
          <div className="text-[8.5pt] text-black">
            {/* Baris 1: No. */}
            <div className="flex items-baseline px-3 pt-2 pb-0.5">
              <span className="w-[150px] shrink-0 font-bold">No.</span>
              <span className="w-[18px] shrink-0 font-bold text-center">:</span>
              <span className="flex-1 font-bold text-black">{invoice.number}</span>
            </div>

            {/* Baris Referensi Dokumen Klien (Jika Ada) */}
            {invoice.clientPoNumber && (
              <div className="flex items-baseline px-3 py-0.5">
                <span className="w-[150px] shrink-0 font-bold">No. PO Klien</span>
                <span className="w-[18px] shrink-0 font-bold text-center">:</span>
                <span className="flex-1 font-mono font-bold text-black">{invoice.clientPoNumber}</span>
              </div>
            )}

            {invoice.clientSpkNumber && (
              <div className="flex items-baseline px-3 py-0.5">
                <span className="w-[150px] shrink-0 font-bold">No. SPK / Kontrak</span>
                <span className="w-[18px] shrink-0 font-bold text-center">:</span>
                <span className="flex-1 font-mono font-bold text-black">{invoice.clientSpkNumber}</span>
              </div>
            )}

            {invoice.bastNumber && (
              <div className="flex items-baseline px-3 py-0.5">
                <span className="w-[150px] shrink-0 font-bold">No. BAST</span>
                <span className="w-[18px] shrink-0 font-bold text-center">:</span>
                <span className="flex-1 font-mono font-bold text-black">{invoice.bastNumber}</span>
              </div>
            )}

            {invoice.billingMode === 'PERCENTAGE_TERMIN' && (
              <div className="flex items-baseline px-3 py-0.5">
                <span className="w-[150px] shrink-0 font-bold">Termin Penagihan</span>
                <span className="w-[18px] shrink-0 font-bold text-center">:</span>
                <span className="flex-1 font-bold text-black">
                  {invoice.terminPercentage}% {invoice.terminName ? `(${invoice.terminName})` : ''}
                </span>
              </div>
            )}

            {invoice.previousDpInvoiceNumber && (
              <div className="flex items-baseline px-3 py-0.5">
                <span className="w-[150px] shrink-0 font-bold">Kompensasi DP</span>
                <span className="w-[18px] shrink-0 font-bold text-center">:</span>
                <span className="flex-1 font-mono font-bold text-black">
                  Dipotong dari Faktur DP {invoice.previousDpInvoiceNumber}
                </span>
              </div>
            )}

            {/* Baris 2: Diajukan Kepada Yth */}
            <div className="flex items-baseline px-3 py-0.5">
              <span className="w-[150px] shrink-0 font-bold">Diajukan Kepada Yth</span>
              <span className="w-[18px] shrink-0 font-bold text-center">:</span>
              <span className="flex-1 font-bold text-black">
                <span className="inline-block border-b border-black pb-0.5">
                  {customer?.companyName || customer?.name || invoice.customerName}
                  {customer?.picName && (
                    <span className="font-normal text-slate-800 ml-1"> (U.p.: {customer.picName})</span>
                  )}
                </span>
              </span>
            </div>

            {/* Baris 3: Uang sejumlah (Times New Roman Serif, Bold, Italic dengan Underline sesuai Master Reference) */}
            <div className="flex items-baseline px-3 py-0.5">
              <span className="w-[150px] shrink-0 font-bold">Uang sejumlah</span>
              <span className="w-[18px] shrink-0 font-bold text-center">:</span>
              <span className="flex-1">
                <span className="inline-block border-b border-black pb-0.5 font-serif font-bold italic text-black text-[9.5pt]">
                  {nominalTerbilang}
                </span>
              </span>
            </div>

            {/* Garis Pembatas Horizontal Antar Bagian Sesuai Master Reference */}
            <div className="border-b border-black my-1"></div>

            {/* Baris 4: Untuk Pembayaran (Mendukung multiline secara rapi dengan hanging indent) */}
            <div className="flex items-start px-3 py-0.5">
              <span className="w-[150px] shrink-0 font-bold">Untuk Pembayaran</span>
              <span className="w-[18px] shrink-0 font-bold text-center">:</span>
              <span className="flex-1 text-black font-normal leading-snug">
                {paymentDescription}
              </span>
            </div>

            {/* Baris 5: Lokasi Pekerjaan (Kapital Tebal dengan Underline sesuai Master Reference) */}
            <div className="flex items-baseline px-3 py-0.5">
              <span className="w-[150px] shrink-0 font-bold">Lokasi Pekerjaan</span>
              <span className="w-[18px] shrink-0 font-bold text-center">:</span>
              <span className="flex-1 font-bold text-black uppercase">
                <span className="inline-block border-b border-black pb-0.5">
                  {invoice.workLocation || customer?.address || '-'}
                </span>
              </span>
            </div>

            {/* Garis Pembatas Horizontal Menuju Header Rincian */}
            <div className="border-b border-black mt-1.5"></div>

            {/* Sub-header Rincian Tabel */}
            <div className="py-1 text-center font-bold text-[8.5pt] border-b border-black bg-white">
              Dengan Rincian Sebagai berikut:
            </div>
          </div>

          {/* Tabel Utama Rincian Pekerjaan */}
          <table className="w-full text-left border-collapse text-[8.5pt]">
            <thead>
              <tr className="border-b border-black text-center font-bold bg-white">
                <th className="border-r border-black py-1 px-2 text-center" style={{ width: '51%' }}>Keterangan</th>
                <th className="border-r border-black py-1 px-1 text-center" style={{ width: '9%' }}>Vol</th>
                <th className="border-r border-black py-1 px-1 text-center" style={{ width: '7%' }}>Sat</th>
                <th className="border-r border-black py-1 px-2 text-center" style={{ width: '16%' }}>Harga Satuan</th>
                <th className="py-1 px-2 text-center" style={{ width: '17%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {/* JIKA MEMILIKI GROUPING KEGIATAN / RUANGAN */}
              {hasGrouping ? (
                groups.map((group) => (
                  <React.Fragment key={group.groupName}>
                    {/* Header Group (Contoh: Rehab Ruang LAB) */}
                    <tr className="border-b border-black bg-white">
                      <td colSpan={5} className="py-1 px-2 font-bold text-left text-black">
                        {group.groupName}
                      </td>
                    </tr>

                    {/* Item-item di dalam group */}
                    {group.items.map((detail, dIdx) => {
                      const isDed = detail.isDeduction || detail.itemType === 'DP_DEDUCTION' || detail.itemType === 'RETENTION_DEDUCTION';
                      return (
                        <tr key={detail.id || dIdx} className="border-b border-black">
                          <td className="border-r border-black py-0.5 px-2 text-left">
                            <span className={isDed ? 'font-bold' : ''}>{detail.description}</span>
                          </td>
                          <td className="border-r border-black py-0.5 px-1.5 text-right font-sans">
                            {formatQuantity(detail.quantity)}
                          </td>
                          <td className="border-r border-black py-0.5 px-1 text-center">
                            {detail.unit}
                          </td>
                          <td className="border-r border-black py-0.5 px-1">
                            <div className="flex justify-between items-center w-full px-1">
                              <span>Rp</span>
                              <span>{formatNumber(detail.unitPrice)}</span>
                            </div>
                          </td>
                          <td className="py-0.5 px-1">
                            <div className="flex justify-between items-center w-full px-1">
                              {isDed ? (
                                <>
                                  <span>(Rp</span>
                                  <span>{formatNumber(Math.abs(Number(detail.amount) || 0))})</span>
                                </>
                              ) : (
                                <>
                                  <span>Rp</span>
                                  <span>{formatNumber(detail.amount)}</span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Baris Subtotal Group: TOTAL A / TOTAL B / TOTAL C (Sesuai Master Reference: Col 1-3 merged, Col 4 Rp, Col 5 subtotal) */}
                    <tr
                      className="border-b border-black font-bold bg-[#b4c6e7]"
                      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#b4c6e7' }}
                    >
                      <td
                        colSpan={3}
                        className="border-r border-black py-0.5 px-3 text-right font-bold text-black"
                        style={{ backgroundColor: '#b4c6e7' }}
                      >
                        TOTAL {group.letter}
                      </td>
                      <td
                        className="border-r border-black py-0.5 px-1 text-center font-bold text-black"
                        style={{ backgroundColor: '#b4c6e7' }}
                      >
                        Rp
                      </td>
                      <td
                        className="py-0.5 px-2 text-right font-bold text-black"
                        style={{ backgroundColor: '#b4c6e7' }}
                      >
                        {formatNumber(group.subtotal)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                /* JIKA TIDAK ADA GROUPING (FLAT ITEM) */
                invoice.details?.map((detail, dIdx) => {
                  const isDed = detail.isDeduction || detail.itemType === 'DP_DEDUCTION' || detail.itemType === 'RETENTION_DEDUCTION';
                  return (
                    <tr key={detail.id || dIdx} className="border-b border-black">
                      <td className="border-r border-black py-0.5 px-2 text-left">
                        <span className={isDed ? 'font-bold' : ''}>{detail.description}</span>
                      </td>
                      <td className="border-r border-black py-0.5 px-1.5 text-right font-sans">
                        {formatQuantity(detail.quantity)}
                      </td>
                      <td className="border-r border-black py-0.5 px-1 text-center">
                        {detail.unit}
                      </td>
                      <td className="border-r border-black py-0.5 px-1">
                        <div className="flex justify-between items-center w-full px-1">
                          <span>Rp</span>
                          <span>{formatNumber(detail.unitPrice)}</span>
                        </div>
                      </td>
                      <td className="py-0.5 px-1">
                        <div className="flex justify-between items-center w-full px-1">
                          {isDed ? (
                            <>
                              <span>(Rp</span>
                              <span>{formatNumber(Math.abs(Number(detail.amount) || 0))})</span>
                            </>
                          ) : (
                            <>
                              <span>Rp</span>
                              <span>{formatNumber(detail.amount)}</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Baris DPP / Subtotal jika ada PPN */}
              {invoice.taxPpnType && invoice.taxPpnType !== 'NONE' && (
                <>
                  <tr className="border-b border-black font-bold bg-white">
                    <td
                      colSpan={3}
                      className="border-r border-black py-0.5 px-3 text-right font-bold text-black bg-white"
                    >
                      {hasGrouping && groups.length > 1 ? `JUMLAH A s/d ${lastGroupLetter} (DPP)` : 'JUMLAH (DPP)'}
                    </td>
                    <td className="border-r border-black py-0.5 px-1 text-center font-bold text-black bg-white">
                      Rp
                    </td>
                    <td className="py-0.5 px-2 text-right font-bold text-black bg-white">
                      {formatNumber(invoice.subtotalDpp || invoice.totalAmount)}
                    </td>
                  </tr>
                  <tr className="border-b border-black font-bold bg-white">
                    <td
                      colSpan={3}
                      className="border-r border-black py-0.5 px-3 text-right font-bold text-black bg-white"
                    >
                      PPN {invoice.taxPpnRate}%{invoice.taxPpnType === 'INCLUDE' ? ' (Termasuk)' : ''}
                    </td>
                    <td className="border-r border-black py-0.5 px-1 text-center font-bold text-black bg-white">
                      Rp
                    </td>
                    <td className="py-0.5 px-2 text-right font-bold text-black bg-white">
                      {formatNumber(invoice.taxPpnAmount)}
                    </td>
                  </tr>
                </>
              )}

              {/* Baris TOTAL Nilai Faktur (Gross) */}
              <tr className="border-b border-black font-bold bg-white">
                <td
                  colSpan={3}
                  className="border-r border-black py-0.5 px-3 text-right font-bold text-black bg-white"
                >
                  {invoice.taxPpnType && invoice.taxPpnType !== 'NONE'
                    ? 'TOTAL NILAI FAKTUR'
                    : hasGrouping && groups.length > 1
                    ? `TOTAL A s/d ${lastGroupLetter}`
                    : 'TOTAL'}
                </td>
                <td className="border-r border-black py-0.5 px-1 text-center font-bold text-black bg-white">
                  Rp
                </td>
                <td className="py-0.5 px-2 text-right font-bold text-black bg-white">
                  {formatNumber(invoice.totalAmount)}
                </td>
              </tr>

              {/* Baris Potongan PPh jika ada */}
              {invoice.taxPphType && invoice.taxPphType !== 'NONE' && (
                <>
                  <tr className="border-b border-black font-bold bg-white">
                    <td
                      colSpan={3}
                      className="border-r border-black py-0.5 px-3 text-right font-bold text-black bg-white"
                    >
                      Potongan PPh ({invoice.taxPphRate}%)
                    </td>
                    <td className="border-r border-black py-0.5 px-1 text-center font-bold text-black bg-white">
                      Rp
                    </td>
                    <td className="py-0.5 px-2 text-right font-bold text-black bg-white">
                      ({formatNumber(invoice.taxPphAmount)})
                    </td>
                  </tr>
                  <tr className="border-b border-black font-bold bg-white">
                    <td
                      colSpan={3}
                      className="border-r border-black py-0.5 px-3 text-right font-black text-black bg-white"
                    >
                      NET DITRANSFER KLIEN
                    </td>
                    <td className="border-r border-black py-0.5 px-1 text-center font-black text-black bg-white">
                      Rp
                    </td>
                    <td className="py-0.5 px-2 text-right font-black text-black bg-white">
                      {formatNumber(invoice.netTotalAmount || invoice.totalAmount)}
                    </td>
                  </tr>
                </>
              )}

              {/* Rincian Riwayat Pembayaran (Pembayaran ke-1, ke-2, dll) */}
              {invoice.payments && invoice.payments.length > 0 ? (
                invoice.payments.map((p, pIdx) => (
                  <tr key={p.id || pIdx} className="border-b border-black font-bold bg-white">
                    <td colSpan={3} className="border-r border-black py-0.5 px-3 text-right font-bold text-black bg-white">
                      Pembayaran ke-{pIdx + 1} {p.paymentMethodLabel || p.paymentMethod || 'Transfer'} Tgl. {formatTanggalResmi(p.paymentDate)}
                    </td>
                    <td className="border-r border-black py-0.5 px-1 text-center font-bold text-black bg-white">
                      Rp
                    </td>
                    <td className="py-0.5 px-2 text-right font-bold text-black bg-white">
                      {formatNumber(p.amount)}
                    </td>
                  </tr>
                ))
              ) : invoice.paidAmount > 0 ? (
                <tr className="border-b border-black font-bold bg-white">
                  <td colSpan={3} className="border-r border-black py-0.5 px-3 text-right font-bold text-black bg-white">
                    Pembayaran Sebelumnya
                  </td>
                  <td className="border-r border-black py-0.5 px-1 text-center font-bold text-black bg-white">
                    Rp
                  </td>
                  <td className="py-0.5 px-2 text-right font-bold text-black bg-white">
                    {formatNumber(invoice.paidAmount)}
                  </td>
                </tr>
              ) : null}

              {/* Baris SISA Tagihan */}
              <tr className="font-bold bg-white">
                <td colSpan={3} className="border-r border-black py-0.5 px-3 text-right font-black text-black bg-white">
                  SISA
                </td>
                <td className="border-r border-black py-0.5 px-1 text-center font-black text-black bg-white">
                  Rp
                </td>
                <td className="py-0.5 px-2 text-right font-black text-black bg-white">
                  {formatNumber(invoice.outstanding)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Bagian Bawah: Informasi Rekening Bank & Tanda Tangan dalam Satu Outer Frame */}
          <div className="pt-3 pb-3 px-3.5 flex justify-between items-start text-[8.5pt]">
            {/* Sisi Kiri: Rekening Bank & Kotak Nominal Rp (Double Border) */}
            <div className="w-[58%] space-y-1">
              <p className="text-black font-normal">
                Pembayaran dapat di transfer ke rekening:
              </p>
              <div className="space-y-0.5 leading-snug">
                <p>
                  <strong className="font-bold">0012239254001</strong> Rek. Bank BJB Cab. Cibinong a/n CV. ANDARA
                </p>
                <p>
                  <strong className="font-bold">0952821367</strong> Rek. Bank BCA a/n Eko Sudaryanto
                </p>
                <p>
                  <strong className="font-bold">2080794232</strong> Rek. Bank BNI a/n CV. Andara
                </p>
              </div>

              {/* Kotak Nominal Kiri Bawah (DOUBLE BORDER BOX) Sesuai Dokumen Asli Client */}
              <div className="pt-3">
                <div
                  className="inline-flex items-center justify-between w-[240px] px-3 py-1 font-bold text-[9.5pt]"
                  style={{ border: '3.5px double #000' }}
                >
                  <span className="font-bold">Rp</span>
                  <span className="font-bold tracking-tight">
                    {formatDecimalCurrency(billableAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Tanggal & Tanda Tangan Direktur */}
            <div className="w-[38%] text-center space-y-0.5 pr-2">
              <p className="italic font-normal">
                Bogor,&nbsp;&nbsp;{formatTanggalResmi(invoice.date)}
              </p>
              <p
                className="font-bold italic text-[#0070c0] tracking-wide"
                style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', color: '#0070c0' }}
              >
                CV. ANDARA
              </p>
              <div className="h-14 flex items-center justify-center">
                {/* Tempat tanda tangan & cap stempel fisik */}
              </div>
              <p className="font-bold underline text-black">
                Eko Sudaryanto
              </p>
              <p className="font-bold text-black text-[8.5pt]">
                Direktur
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

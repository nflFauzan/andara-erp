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

  // Nominal terbilang dihitung dari sisa tagihan jika ada sisa, atau total tagihan
  const billableAmount = invoice.outstanding > 0 ? invoice.outstanding : invoice.totalAmount;
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

      {/* Sheet Dokumen Resmi Cetak Faktur */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-none border border-slate-300 p-6 sm:p-10 text-black font-sans print:shadow-none print:border-none print:p-0 print:m-0 text-[9pt] leading-normal">
        
        {/* Kop Surat Resmi CV. ANDARA dengan Pita Divisi Baja Ringan */}
        <AndaraLetterhead showDivisiStrip={true} className="mb-2" />

        {/* Badge INVOICE — Kuning cerah dengan font Arial Black / Sans tebal berjarak huruf lebar */}
        <div className="flex justify-center my-2">
          <div className="bg-[#ffff00] border border-black px-12 py-0.5">
            <span className="font-black text-xs sm:text-[10.5pt] tracking-[0.25em] text-black uppercase font-sans">
              I N V O I C E
            </span>
          </div>
        </div>

        {/* Kotak Dokumen Faktur (Mengelilingi Metadata, Rincian, dan Tanda Tangan) */}
        <div className="border border-black">

          {/* Tabel Grid Metadata Atas */}
          <table className="w-full text-left border-collapse text-[8.5pt] sm:text-[9pt]">
            <tbody>
              {/* Baris No. */}
              <tr className="border-b border-black">
                <td className="w-44 py-1 px-3 font-bold align-top">No.</td>
                <td className="w-4 py-1 text-center font-bold align-top">:</td>
                <td className="py-1 px-2 font-bold text-black align-top">{invoice.number}</td>
              </tr>

              {/* Baris Diajukan Kepada Yth */}
              <tr className="border-b border-black">
                <td className="w-44 py-1 px-3 font-bold align-top">Diajukan Kepada Yth</td>
                <td className="w-4 py-1 text-center font-bold align-top">:</td>
                <td className="py-1 px-2 font-bold text-black align-top">
                  {customer?.companyName || customer?.name || invoice.customerName}
                  {customer?.picName && (
                    <span className="font-normal text-slate-800 ml-1"> (U.p.: {customer.picName})</span>
                  )}
                </td>
              </tr>

              {/* Baris Uang Sejumlah (Times New Roman Bold Italic sesuai contoh fisik) */}
              <tr className="border-b border-black">
                <td className="w-44 py-1 px-3 font-bold align-top">Uang sejumlah</td>
                <td className="w-4 py-1 text-center font-bold align-top">:</td>
                <td className="py-1 px-2 font-serif italic font-bold text-black align-top text-[9pt] sm:text-[9.5pt]">
                  {nominalTerbilang}
                </td>
              </tr>

              {/* Baris Untuk Pembayaran */}
              <tr className="border-b border-black">
                <td className="w-44 py-1 px-3 font-bold align-top">Untuk Pembayaran</td>
                <td className="w-4 py-1 text-center font-bold align-top">:</td>
                <td className="py-1 px-2 text-black align-top font-normal leading-snug">
                  {paymentDescription}
                </td>
              </tr>

              {/* Baris Lokasi Pekerjaan */}
              <tr>
                <td className="w-44 py-1 px-3 font-bold align-top">Lokasi Pekerjaan</td>
                <td className="w-4 py-1 text-center font-bold align-top">:</td>
                <td className="py-1 px-2 font-bold text-black align-top uppercase">
                  {invoice.workLocation || customer?.address || '-'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Baris Judul Header Rincian */}
          <div className="border-t border-b border-black text-center py-1 font-bold text-[8.5pt] sm:text-[9pt] bg-white">
            Dengan Rincian Sebagai berikut:
          </div>

          {/* Tabel Utama Rincian Pekerjaan */}
          <table className="w-full text-left border-collapse text-[8pt] sm:text-[8.5pt]">
            <thead>
              <tr className="border-b border-black text-center font-bold bg-white">
                <th className="border-r border-black py-1 px-2 text-center w-auto">Keterangan</th>
                <th className="border-r border-black py-1 px-1 w-16 text-center">Vol</th>
                <th className="border-r border-black py-1 px-1 w-12 text-center">Sat</th>
                <th className="border-r border-black py-1 px-2 w-28 text-center">Harga Satuan</th>
                <th className="py-1 px-2 w-32 text-center">Total</th>
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
                    {group.items.map((detail, dIdx) => (
                      <tr key={detail.id || dIdx} className="border-b border-black">
                        <td className="border-r border-black py-0.5 px-2 text-left">
                          {detail.description}
                        </td>
                        <td className="border-r border-black py-0.5 px-1 text-center">
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
                            <span>Rp</span>
                            <span>{formatNumber(detail.amount)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Baris Subtotal Group: TOTAL A / TOTAL B / TOTAL C (Sesuai Contoh Target) */}
                    <tr
                      className="border-b border-black font-bold"
                      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                    >
                      <td
                        colSpan={2}
                        className="border-r border-black py-0.5 px-2 text-right font-bold bg-[#b4c6e7]"
                        style={{ backgroundColor: '#b4c6e7' }}
                      >
                        TOTAL
                      </td>
                      <td
                        className="border-r border-black py-0.5 px-1 text-center font-black bg-[#0070c0] text-white"
                        style={{ backgroundColor: '#0070c0', color: '#ffffff' }}
                      >
                        {group.letter}
                      </td>
                      <td
                        className="border-r border-black py-0.5 px-1 text-center font-bold bg-[#b4c6e7]"
                        style={{ backgroundColor: '#b4c6e7' }}
                      >
                        Rp
                      </td>
                      <td
                        className="py-0.5 px-2 text-right font-bold bg-[#b4c6e7]"
                        style={{ backgroundColor: '#b4c6e7' }}
                      >
                        {formatNumber(group.subtotal)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                /* JIKA TIDAK ADA GROUPING (FLAT ITEM) */
                invoice.details?.map((detail, dIdx) => (
                  <tr key={detail.id || dIdx} className="border-b border-black">
                    <td className="border-r border-black py-0.5 px-2 text-left">
                      {detail.description}
                    </td>
                    <td className="border-r border-black py-0.5 px-1 text-center">
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
                        <span>Rp</span>
                        <span>{formatNumber(detail.amount)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {/* Baris TOTAL Akumulasi (TOTAL A s/d C jika multi-group, atau TOTAL jika flat) */}
              <tr
                className="border-b border-black font-bold"
                style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
              >
                <td
                  colSpan={3}
                  className="border-r border-black py-0.5 px-2 text-right bg-[#b4c6e7]"
                  style={{ backgroundColor: '#b4c6e7' }}
                >
                  {hasGrouping && groups.length > 1 ? `TOTAL A s/d ${lastGroupLetter}` : 'TOTAL'}
                </td>
                <td
                  className="border-r border-black py-0.5 px-1 text-center font-bold bg-[#b4c6e7]"
                  style={{ backgroundColor: '#b4c6e7' }}
                >
                  Rp
                </td>
                <td
                  className="py-0.5 px-2 text-right font-bold bg-[#b4c6e7]"
                  style={{ backgroundColor: '#b4c6e7' }}
                >
                  {formatNumber(invoice.totalAmount)}
                </td>
              </tr>

              {/* Rincian Riwayat Pembayaran (Pembayaran ke-1, ke-2, dll) */}
              {invoice.payments && invoice.payments.length > 0 ? (
                invoice.payments.map((p, pIdx) => (
                  <tr key={p.id || pIdx} className="border-b border-black font-bold">
                    <td colSpan={3} className="border-r border-black py-0.5 px-2 text-right">
                      Pembayaran ke-{pIdx + 1} {p.paymentMethodLabel || p.paymentMethod || 'Transfer'} Tgl. {formatTanggalResmi(p.paymentDate)}
                    </td>
                    <td className="border-r border-black py-0.5 px-1 text-center font-bold">
                      Rp
                    </td>
                    <td className="py-0.5 px-2 text-right font-bold">
                      {formatNumber(p.amount)}
                    </td>
                  </tr>
                ))
              ) : invoice.paidAmount > 0 ? (
                <tr className="border-b border-black font-bold">
                  <td colSpan={3} className="border-r border-black py-0.5 px-2 text-right">
                    Pembayaran Sebelumnya
                  </td>
                  <td className="border-r border-black py-0.5 px-1 text-center font-bold">
                    Rp
                  </td>
                  <td className="py-0.5 px-2 text-right font-bold">
                    {formatNumber(invoice.paidAmount)}
                  </td>
                </tr>
              ) : null}

              {/* Baris SISA Tagihan */}
              <tr className="font-bold">
                <td colSpan={3} className="border-r border-black py-0.5 px-2 text-right font-black">
                  SISA
                </td>
                <td className="border-r border-black py-0.5 px-1 text-center font-black">
                  Rp
                </td>
                <td className="py-0.5 px-2 text-right font-black">
                  {formatNumber(invoice.outstanding)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Bagian Bawah: Informasi Rekening Bank & Tanda Tangan */}
          <div className="border-t border-black pt-3 pb-3 px-3 grid grid-cols-12 gap-2 text-[8pt] sm:text-[8.5pt]">
            {/* Sisi Kiri: Rekening Bank & Kotak Nominal Rp */}
            <div className="col-span-7 space-y-1">
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

              {/* Kotak Nominal Kiri Bawah Sesuai Format Fisik */}
              <div className="pt-2">
                <div className="inline-flex items-center border border-black font-bold text-xs sm:text-[9.5pt]">
                  <span className="px-3 py-1 border-r border-black font-bold">Rp</span>
                  <span className="px-6 py-1 text-right font-bold tracking-tight">
                    {formatDecimalCurrency(billableAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Tanggal & Tanda Tangan Direktur */}
            <div className="col-span-5 text-center space-y-0.5">
              <p className="italic">
                Bogor, {formatTanggalResmi(invoice.date)}
              </p>
              <p className="font-bold text-[#0070c0] tracking-wide">
                CV. ANDARA
              </p>
              <div className="h-16 flex items-center justify-center">
                {/* Tempat tanda tangan & cap stempel */}
              </div>
              <p className="font-bold underline text-black">
                Eko Sudaryanto
              </p>
              <p className="text-[8pt] text-black">
                Direktur
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

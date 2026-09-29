import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, AlertCircle } from 'lucide-react';
import { invoiceApi } from '../api/invoiceApi';
import { customerApi } from '../api/customerApi';
import { Invoice } from '../types/invoice';
import { Customer } from '../types/customer';
import { AndaraLetterhead } from '../components/common/AndaraLetterhead';
import { formatCurrency, angkaTerbilang } from '../lib/utils';

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

  // Keterangan pembayaran
  const paymentDescription = invoice.notes || (invoice.sourcePenawaranNumber
    ? `Pekerjaan Berdasarkan SPH No. ${invoice.sourcePenawaranNumber}`
    : 'Pekerjaan Pengadaan dan Pemasangan');

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 print:bg-white print:py-0">
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
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Format Resmi Cetak Faktur CV. ANDARA
            </span>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <Printer className="w-4 h-4" /> Cetak Dokumen / PDF (Ctrl+P)
            </button>
          </div>
        </div>
      </div>

      {/* Sheet Dokumen Resmi Cetak Faktur */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-none sm:rounded-sm border border-slate-300 p-8 sm:p-14 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 print:m-0 text-[10pt] leading-relaxed">
        {/* Kop Surat Resmi CV. ANDARA dengan Pita Divisi Baja Ringan */}
        <AndaraLetterhead showDivisiStrip={true} className="mb-4" />

        {/* Kotak Dokumen Faktur (Sesuai Contoh Format Fisik) */}
        <div className="border border-slate-900 p-4 sm:p-6 space-y-4">
          {/* Header INVOICE Badge */}
          <div className="flex justify-center -mt-8 sm:-mt-10 mb-3">
            <div className="bg-[#facc15] border-2 border-slate-900 px-8 py-1 rounded-sm shadow-sm">
              <span className="font-black text-sm sm:text-base tracking-widest text-slate-950 uppercase font-sans">
                INVOICE
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="text-xs sm:text-[9.5pt] space-y-2 border-b border-slate-900 pb-4">
            <div className="grid grid-cols-12 gap-1 items-baseline">
              <span className="col-span-3 font-bold">No.</span>
              <span className="col-span-1 text-center">:</span>
              <span className="col-span-8 font-mono font-bold text-slate-950">{invoice.number}</span>
            </div>

            <div className="grid grid-cols-12 gap-1 items-baseline">
              <span className="col-span-3 font-bold">Diajukan Kepada Yth</span>
              <span className="col-span-1 text-center">:</span>
              <span className="col-span-8 font-bold text-slate-950">
                {customer?.companyName || customer?.name || invoice.customerName}
                {customer?.picName && (
                  <span className="font-normal text-slate-700 ml-1">(U.p.: {customer.picName})</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-1 items-baseline">
              <span className="col-span-3 font-bold">Uang sejumlah</span>
              <span className="col-span-1 text-center">:</span>
              <span className="col-span-8 italic font-serif font-medium text-slate-900">
                {nominalTerbilang}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-1 items-baseline">
              <span className="col-span-3 font-bold">Untuk Pembayaran</span>
              <span className="col-span-1 text-center">:</span>
              <span className="col-span-8 text-slate-900 font-medium">
                {paymentDescription}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-1 items-baseline">
              <span className="col-span-3 font-bold">Lokasi Pekerjaan</span>
              <span className="col-span-1 text-center">:</span>
              <span className="col-span-8 font-bold text-slate-900 uppercase">
                {invoice.workLocation || customer?.address || '-'}
              </span>
            </div>
          </div>

          {/* Rincian Pekerjaan */}
          <div className="space-y-2">
            <p className="text-xs sm:text-[9pt] font-semibold text-slate-800">
              Dengan Rincian Sebagai berikut:
            </p>

            <table className="w-full text-left border-collapse border border-slate-900 text-[8.5pt] sm:text-[9pt]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                  <th className="border border-slate-900 py-1.5 px-3">Keterangan</th>
                  <th className="border border-slate-900 py-1.5 px-2 w-20">Vol</th>
                  <th className="border border-slate-900 py-1.5 px-2 w-14">Sat</th>
                  <th className="border border-slate-900 py-1.5 px-3 w-32">Harga Satuan</th>
                  <th className="border border-slate-900 py-1.5 px-3 w-36">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.details && invoice.details.length > 0 ? (
                  invoice.details.map((detail, idx) => (
                    <tr key={detail.id || idx} className="hover:bg-slate-50/50">
                      <td className="border border-slate-900 py-1.5 px-3">
                        <span className="font-medium text-slate-950">{detail.description}</span>
                        {detail.sphKegiatanName && (
                          <span className="block text-[8pt] text-slate-500 italic mt-0.5">
                            Kegiatan: {detail.sphKegiatanName}
                          </span>
                        )}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 text-right font-mono">
                        {Number(detail.quantity).toLocaleString('id-ID', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 text-center">
                        {detail.unit}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-3 text-right font-mono">
                        {formatCurrency(detail.unitPrice)}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-3 text-right font-mono font-medium">
                        {formatCurrency(detail.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="border border-slate-900 py-3 text-center text-slate-400 italic">
                      (Tidak ada rincian item faktur)
                    </td>
                  </tr>
                )}

                {/* Subtotal TOTAL */}
                <tr className="font-bold border-t border-slate-900 bg-slate-50">
                  <td colSpan={4} className="border border-slate-900 py-1.5 px-3 text-right uppercase tracking-wider">
                    TOTAL
                  </td>
                  <td className="border border-slate-900 py-1.5 px-3 text-right font-mono font-bold">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                </tr>

                {/* Baris Pembayaran / Uang Muka / Deposit Sebelumnya jika ada */}
                {invoice.paidAmount > 0 && (
                  <tr className="font-semibold text-slate-700 bg-slate-50/50">
                    <td colSpan={4} className="border border-slate-900 py-1 px-3 text-right text-[8.5pt]">
                      BAYAR (Pembayaran / Alokasi Terverifikasi)
                    </td>
                    <td className="border border-slate-900 py-1 px-3 text-right font-mono font-semibold text-slate-800">
                      {formatCurrency(invoice.paidAmount)}
                    </td>
                  </tr>
                )}

                {/* Baris SISA Tagihan */}
                <tr className="font-black border-t-2 border-slate-900 bg-slate-100 text-[9.5pt]">
                  <td colSpan={4} className="border border-slate-900 py-1.5 px-3 text-right uppercase tracking-wider">
                    SISA
                  </td>
                  <td className="border border-slate-900 py-1.5 px-3 text-right font-mono font-black">
                    {formatCurrency(invoice.outstanding)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Dokumen: Rekening Bank & Tanda Tangan */}
          <div className="pt-4 grid grid-cols-12 gap-4 items-start text-xs sm:text-[9pt]">
            {/* Sisi Kiri: Rekening Bank Resmi + Box Nominal */}
            <div className="col-span-7 space-y-2">
              <p className="font-medium text-slate-800">
                Pembayaran dapat di transfer ke rekening:
              </p>
              <div className="space-y-0.5 font-mono text-[8.5pt]">
                <p>
                  <strong className="text-slate-950 font-bold">0012239254001</strong> Rek. Bank BJB Cab. Cibinong a/n CV. ANDARA
                </p>
                <p>
                  <strong className="text-slate-950 font-bold">0952821367</strong> Rek. Bank BCA a/n Eko Sudaryanto
                </p>
                <p>
                  <strong className="text-slate-950 font-bold">2080794232</strong> Rek. Bank BNI a/n CV. Andara
                </p>
              </div>

              {/* Kotak Nominal Tebal Sesuai Format Fisik */}
              <div className="pt-2">
                <div className="inline-block border-2 border-slate-900 px-4 py-1.5 bg-slate-50 font-mono text-sm sm:text-base font-black tracking-wide">
                  {formatCurrency(billableAmount)}
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Tanggal & Tanda Tangan Direktur */}
            <div className="col-span-5 text-center space-y-1">
              <p className="italic">
                Bogor, {formatTanggalResmi(invoice.date)}
              </p>
              <p className="font-bold text-[#1d4ed8]">CV. ANDARA</p>
              <div className="h-16 sm:h-20 flex items-center justify-center">
                {/* Tempat tanda tangan & stempel fisik */}
              </div>
              <p className="font-bold underline text-slate-950">
                Eko Sudaryanto
              </p>
              <p className="text-[8.5pt] text-slate-700">Direktur</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

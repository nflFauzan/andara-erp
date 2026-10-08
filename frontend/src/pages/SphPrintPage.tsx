import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, AlertCircle } from 'lucide-react';
import { penawaranApi } from '../api/penawaranApi';
import { customerApi } from '../api/customerApi';
import { Penawaran } from '../types/penawaran';
import { Customer } from '../types/customer';
import { AndaraLetterhead } from '../components/common/AndaraLetterhead';
import { formatCurrency } from '../lib/utils';

export const SphPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [penawaran, setPenawaran] = useState<Penawaran | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    penawaranApi
      .getPenawaranById(Number(id))
      .then(async (data) => {
        setPenawaran(data);
        if (data.customerId) {
          try {
            const cust = await customerApi.getCustomerById(data.customerId);
            setCustomer(cust);
          } catch {
            // ignore customer load failure
          }
        }
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.message || 'Gagal memuat surat penawaran harga.');
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
          <span className="text-sm font-medium text-slate-700">Mempersiapkan dokumen cetak SPH...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !penawaran) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Dokumen Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">{errorMsg || 'Surat penawaran harga tidak ditemukan.'}</p>
          <button
            onClick={() => navigate('/penawaran')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Penawaran
          </button>
        </div>
      </div>
    );
  }

  // Determine grouped kegiatan
  const kegiatanList = penawaran.kegiatanList && penawaran.kegiatanList.length > 0
    ? penawaran.kegiatanList
    : [
        {
          id: 0,
          penawaranId: penawaran.id,
          name: 'Pekerjaan Utama',
          sortOrder: 1,
          subtotal: penawaran.totalAmount,
          items: penawaran.details || [],
        },
      ];

  const firstLetter = 'A';
  const lastLetter = String.fromCharCode(65 + Math.max(0, kegiatanList.length - 1));
  const grandTotalLabel = kegiatanList.length > 1 ? `TOTAL ${firstLetter} s/d ${lastLetter}` : 'TOTAL';

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 print:bg-white print:py-0">
      {/* Top Floating Control Toolbar (Hidden in Print) */}
      <div className="max-w-4xl mx-auto px-4 mb-6 print:hidden">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/penawaran/${penawaran.id}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Detail
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Format Resmi Cetak SPH CV. ANDARA
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

      {/* Sheet Dokumen Resmi Cetak SPH */}
      <div
        className="max-w-4xl mx-auto bg-white shadow-xl rounded-none sm:rounded-sm border border-slate-300 p-8 sm:p-14 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 print:m-0 text-[11pt] leading-relaxed"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        {/* Kop Surat Resmi CV. ANDARA */}
        <AndaraLetterhead showDivisiStrip={false} className="mb-6" />

        {/* Info Surat: Nomor, Lampiran, Tanggal, Tujuan, Perihal */}
        <div className="flex justify-between items-start text-xs sm:text-[10pt] mb-4">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-28 font-medium">Nomor</span>
              <span className="w-4">:</span>
              <span className="font-semibold font-mono">{penawaran.number}</span>
            </div>
            {penawaran.isAddendum && (
              <div className="flex">
                <span className="w-28 font-medium">Addendum Ke</span>
                <span className="w-4">:</span>
                <span className="font-semibold font-mono">
                  {penawaran.addendumNumberIndex || 1} (Ref Induk: {penawaran.parentPenawaranNumber})
                </span>
              </div>
            )}
            <div className="flex">
              <span className="w-28 font-medium">Lampiran</span>
              <span className="w-4">:</span>
              <span>1 (satu) berkas</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">
              Bogor, {formatTanggalResmi(penawaran.date)}
            </p>
          </div>
        </div>

        {/* Tujuan Surat */}
        <div className="text-xs sm:text-[10pt] space-y-0.5 mb-4">
          <p className="font-medium">Kepada Yth.,</p>
          <p className="font-bold">
            {customer?.picName ? `Bapak/Ibu ${customer.picName}` : (customer?.name || penawaran.customerName)}
          </p>
          {customer?.companyName && (
            <p className="font-semibold">{customer.companyName}</p>
          )}
          <p>di</p>
          <p className="font-medium pl-4">Tempat</p>
        </div>

        {/* Perihal */}
        <div className="text-xs sm:text-[10pt] flex mb-4">
          <span className="w-28 font-medium shrink-0">Perihal</span>
          <span className="w-4 shrink-0">:</span>
          <span className="font-bold underline">
            {penawaran.isAddendum
              ? `ADDENDUM SURAT PENAWARAN HARGA (PEKERJAAN TAMBAH) - ${penawaran.notes || 'Pekerjaan Tambah'}`
              : (penawaran.notes || 'Perkiraan Harga Pengadaan dan Pemasangan Rangka Atap Baja Ringan')}
          </span>
        </div>

        {/* Paragraf Pembuka Resmi CV. ANDARA */}
        <div className="text-xs sm:text-[9.5pt] text-justify space-y-2 mb-4 leading-normal">
          <p className="font-medium">Dengan Hormat,</p>
          {penawaran.isAddendum ? (
            <p>
              Sehubungan dengan pelaksanaan kontrak Surat Penawaran Harga Induk Nomor:{' '}
              <strong className="font-mono">{penawaran.parentPenawaranNumber}</strong> serta adanya penyesuaian kebutuhan
              pekerjaan di lapangan, bersama ini kami sampaikan <strong>ADDENDUM SURAT PENAWARAN HARGA</strong> atas
              pekerjaan tambah/kurang sebagai bagian yang tidak terpisahkan dari kesepakatan induk. Adapun rincian perkiraan
              harga penambahan pekerjaan adalah sebagai berikut:
            </p>
          ) : (
            <p>
              Kami CV. ANDARA Adalah sebagai Aplikator/Distributor resmi untuk pengadaan dan pemasangan Rangka Atap Baja Ringan Merk <strong>"KCMP TRUSS"</strong>, berdasarkan Surat dukungan / penunjukan PT. KARYA CIPTA METALINDO PERKASA serta Surat dari Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Bogor perihal Pemberitahuan Hasil Verifikasi Produk Baja Ringan Nomor : <strong>600.2.10.4/5.308-DPUPR Tanggal 17 April 2025</strong>. Dengan ini bermaksud mengajukan Surat Penawaran Harga untuk Pemasangan Rangka Atap Baja Ringan, Atap Onduline Tile, Nok Atas Onduline, Nok Samping Onduline, Listplang Tumpangsari dan Listplang Capit Gunting. Adapun Perkiraan Harga Pengadaan dan Pemasangan Atap adalah Sebagai Berikut:
            </p>
          )}
        </div>

        {/* Tabel Pekerjaan Per Kegiatan (Grouped Format Resmi) */}
        <div className="mb-2">
          <table className="w-full text-left border-collapse border border-slate-900 text-[9pt] sm:text-[9.5pt]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                <th className="border border-slate-900 py-1.5 px-3">Nama Pekerjaan</th>
                <th className="border border-slate-900 py-1.5 px-2 w-24">Perkiraan Volume</th>
                <th className="border border-slate-900 py-1.5 px-2 w-14">Sat</th>
                <th className="border border-slate-900 py-1.5 px-3 w-32">Harga satuan</th>
                <th className="border border-slate-900 py-1.5 px-3 w-36">Total</th>
              </tr>
            </thead>
            <tbody>
              {kegiatanList.map((kegiatan, kIdx) => {
                const letter = String.fromCharCode(65 + kIdx);
                return (
                  <React.Fragment key={kegiatan.id || kIdx}>
                    {/* Header Kegiatan (e.g. "Pembangunan Ruang Kelas Baru") */}
                    <tr className="bg-slate-50 font-bold border-t border-b border-slate-900">
                      <td colSpan={5} className="border border-slate-900 py-1.5 px-3">
                        <span className="font-extrabold">{letter}. {kegiatan.name}</span>
                      </td>
                    </tr>

                    {/* Baris-baris Item dalam Kegiatan */}
                    {kegiatan.items && kegiatan.items.length > 0 ? (
                      kegiatan.items.map((item, itemIdx) => (
                        <tr key={item.id || itemIdx} className="hover:bg-slate-50/50">
                          <td className="border border-slate-900 py-1 px-3">
                            <span className="pl-3">{item.description}</span>
                          </td>
                          <td className="border border-slate-900 py-1 px-2 text-right font-mono">
                            {Number(item.volume).toLocaleString('id-ID', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="border border-slate-900 py-1 px-2 text-center">
                            {item.unit}
                          </td>
                          <td className="border border-slate-900 py-1 px-3 text-right font-mono">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="border border-slate-900 py-1 px-3 text-right font-mono font-medium">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="border border-slate-900 py-1 px-3 text-center text-slate-400 italic">
                          (Tidak ada rincian item)
                        </td>
                      </tr>
                    )}

                    {/* Subtotal Kegiatan (e.g. "TOTAL A") */}
                    <tr className="font-bold border-t border-b border-slate-900 bg-slate-50/80">
                      <td colSpan={4} className="border border-slate-900 py-1.5 px-3 text-right uppercase tracking-wider">
                        TOTAL {letter}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-3 text-right font-mono font-bold">
                        {formatCurrency(kegiatan.subtotal)}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {/* Grand Total Baris Terakhir */}
              <tr className="font-extrabold border-t-2 border-b-2 border-slate-900 bg-slate-100">
                <td colSpan={4} className="border border-slate-900 py-2 px-3 text-right uppercase tracking-wider text-[10pt]">
                  {grandTotalLabel}
                </td>
                <td className="border border-slate-900 py-2 px-3 text-right font-mono text-[10pt] font-extrabold">
                  {formatCurrency(penawaran.totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Klausul Volume Ukur Lapangan */}
        <p className="text-[8pt] sm:text-[8.5pt] italic text-slate-700 mb-4 pl-1">
          * Volume Tidak mengikat, yang dibayarkan sesuai hasil ukur dilapangan
        </p>

        {/* Paragraf Penutup Resmi CV. ANDARA */}
        <div className="text-xs sm:text-[9.5pt] text-justify space-y-2 mb-8 leading-normal">
          <p>
            Demikian Perkiraan Harga Pengadaan dan Pemasangan Atap, bahan -bahan disesuaikan dengan kesepakatan dan apabila ada informasi yang perlu diketahui mengenai penawaran ini lebih lanjut maka Bapak/Ibu dapat menghubungi kami di Tlp/WA <strong>0812-8011-0053 a/n Eko Sudaryanto (Direktur)</strong> atau <strong>0812-9221-1334 a/n Asep Adung (Komanditer)</strong>. Atas Perhatiannya kami ucapkan terimakasih.
          </p>
        </div>

        {/* Tanda Tangan Resmi Direktur CV. ANDARA */}
        <div className="flex justify-end text-xs sm:text-[10pt]">
          <div className="text-center w-64 space-y-1">
            <p>Yang mengajukan,</p>
            <p className="font-bold">CV. ANDARA</p>
            <div className="h-20 sm:h-24 flex items-center justify-center">
              {/* Tempat tanda tangan & stempel fisik */}
            </div>
            <p className="font-bold underline uppercase tracking-wide">
              EKO SUDARYANTO
            </p>
            <p className="text-xs text-slate-700">Direktur</p>
          </div>
        </div>
      </div>
    </div>
  );
};

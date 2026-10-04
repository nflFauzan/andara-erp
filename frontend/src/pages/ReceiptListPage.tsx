import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ReceiptText,
  Search,
  CheckCircle2,
  Ban,
  Printer,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  FileCheck2,
  CreditCard,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { receiptApi } from '../api/receiptApi';
import { customerApi } from '../api/customerApi';
import { Receipt, ReceiptStatus } from '../types/receipt';
import { Customer } from '../types/customer';
import { formatRupiah } from '../lib/utils';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';

export const ReceiptListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [receiptList, setReceiptList] = useState<Receipt[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCustomer, setSelectedCustomer] = useState<number | undefined>(
    searchParams.get('customerId') ? Number(searchParams.get('customerId')) : undefined
  );
  const [selectedStatus, setSelectedStatus] = useState<ReceiptStatus | undefined>(
    (searchParams.get('status') as ReceiptStatus) || undefined
  );
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Stat metrics
  const [totalAmountValid, setTotalAmountValid] = useState(0);
  const [validCount, setValidCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadReceipts();
  }, [search, selectedCustomer, selectedStatus, startDate, endDate, currentPage]);

  const loadCustomers = async () => {
    try {
      const data = await customerApi.getActiveCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Gagal memuat daftar customer:', err);
    }
  };

  const loadReceipts = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await receiptApi.getReceiptList({
        search: search.trim() || undefined,
        customerId: selectedCustomer,
        status: selectedStatus,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        size: pageSize,
        sortBy: 'date',
        sortDir: 'desc',
      });

      setReceiptList(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);

      // Aggregates for valid vs cancelled on this page view
      let sum = 0;
      let valids = 0;
      let cancels = 0;
      res.content.forEach((r) => {
        if (r.status === 'VALID') {
          sum += Number(r.amount);
          valids++;
        } else {
          cancels++;
        }
      });
      setTotalAmountValid(sum);
      setValidCount(valids);
      setCancelledCount(cancels);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal memuat data kwitansi.');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCustomer(undefined);
    setSelectedStatus(undefined);
    setStartDate('');
    setEndDate('');
    setCurrentPage(0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        icon={ReceiptText}
        title="Daftar Kwitansi (Official Receipt)"
        subtitle="Tanda bukti penerimaan pembayaran sah CV. ANDARA dengan penomoran resmi & format cetak A4/Voucher."
        badge={
          <span className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Bukti Sah
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadReceipts()}
              disabled={loading}
              className="p-2 text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition shadow-xs disabled:opacity-50"
              title="Muat ulang data"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Admin & Operator Siap Cetak</span>
            </div>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoCard className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Total Kwitansi
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
              {totalElements}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Total dokumen terdaftar
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-700">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Total Nilai Sah (Halaman)
            </span>
            <div className="mt-2 text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatRupiah(totalAmountValid)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Nominal dari {validCount} kwitansi
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Kwitansi Sah (Valid)
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {validCount}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              Dapat dicetak & digunakan resmi
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Dibatalkan (Void)
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
              {cancelledCount}
            </div>
            <div className="text-[11px] text-rose-500 font-bold mt-1">
              Status dibatalkan
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <Ban className="w-6 h-6" />
          </div>
        </BentoCard>
      </div>

      {/* Filter Toolbar with Defined 1.5px Outlines */}
      <BentoCard className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Bar */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nomor kwitansi, nama, pembayaran..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border-[1.5px] border-blue-200/90 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs transition"
            />
          </div>

          {/* Customer Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCustomer || ''}
              onChange={(e) => {
                setSelectedCustomer(e.target.value ? Number(e.target.value) : undefined);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 text-xs font-semibold border-[1.5px] border-blue-200/90 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs transition truncate"
            >
              <option value="">Semua Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} {c.companyName ? `(${c.companyName})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus || ''}
              onChange={(e) => {
                setSelectedStatus((e.target.value as ReceiptStatus) || undefined);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 text-xs font-semibold border-[1.5px] border-blue-200/90 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs transition"
            >
              <option value="">Semua Status</option>
              <option value="VALID">Valid / Sah</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>

          {/* Date range inputs */}
          <div className="md:col-span-3 flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(0);
              }}
              className="w-1/2 px-2.5 py-2 text-xs border-[1.5px] border-blue-200/90 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium shadow-xs transition"
              title="Tanggal Awal"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(0);
              }}
              className="w-1/2 px-2.5 py-2 text-xs border-[1.5px] border-blue-200/90 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium shadow-xs transition"
              title="Tanggal Akhir"
            />
          </div>
        </div>

        {(search || selectedCustomer || selectedStatus || startDate || endDate) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Filter aktif diterapkan</span>
            <button
              onClick={resetFilters}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </BentoCard>

      {/* Main Table */}
      <BentoCard className="overflow-hidden p-0">
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold">Memuat daftar kwitansi...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center text-rose-500">
            <p className="font-bold text-sm">{errorMsg}</p>
            <button
              onClick={loadReceipts}
              className="mt-3 px-4 py-1.5 text-xs bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-xl border border-rose-500/20 font-semibold"
            >
              Coba Lagi
            </button>
          </div>
        ) : receiptList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <ReceiptText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">Belum ada dokumen kwitansi</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Kwitansi diterbitkan dari halaman detail pembayaran setelah transaksi pembayaran dicatat oleh Operator.
            </p>
            <button
              onClick={() => navigate('/pembayaran')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              Ke Halaman Pembayaran
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/90 dark:bg-slate-900/90 border-b-[1.5px] border-blue-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">No. Kwitansi</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Diterima Dari</th>
                  <th className="py-3 px-4">Jumlah (Rp)</th>
                  <th className="py-3 px-4">Referensi Pembayaran</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {receiptList.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => navigate(`/kwitansi/${item.id}`)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {item.number}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Oleh: {item.createdBy || 'Sistem'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {item.date}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{item.receivedFrom}</div>
                        <div className="text-xs text-slate-400 font-mono">{item.customerCode}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {formatRupiah(item.amount)}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                        {item.paymentNumber}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/kwitansi/${item.id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-blue-50/80 dark:bg-slate-800 dark:hover:bg-slate-700 border-[1.5px] border-blue-200 dark:border-slate-700 text-blue-600 dark:text-slate-200 rounded-xl text-xs font-bold transition shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-brand-500" />
                            Detail
                          </button>
                          <button
                            onClick={() => navigate(`/kwitansi/${item.id}/print`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-[1.5px] border-emerald-300 dark:border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-500" />
                            Cetak
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-5 py-4 bg-white/40 dark:bg-slate-900/40 border-t-[1.5px] border-blue-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Menampilkan {receiptList.length} dari {totalElements} data kwitansi
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs font-semibold bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                Sebelumnya
              </button>
              <span className="text-xs font-medium px-2">
                Halaman {currentPage + 1} dari {totalPages}
              </span>
              <button
                disabled={currentPage + 1 >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs font-semibold bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition"
              >
                Selanjutnya
                <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </BentoCard>
    </div>
  );
};

export default ReceiptListPage;

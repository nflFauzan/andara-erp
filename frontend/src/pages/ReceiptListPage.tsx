import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ReceiptText,
  Search,
  CheckCircle2,
  Ban,
  Calendar,
  Building2,
  Printer,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  FileCheck2,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { receiptApi } from '../api/receiptApi';
import { customerApi } from '../api/customerApi';
import { Receipt, ReceiptStatus } from '../types/receipt';
import { Customer } from '../types/customer';
import { formatRupiah } from '../lib/utils';

const STATUS_CONFIG: Record<ReceiptStatus, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  VALID: {
    label: 'Valid / Sah',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-600',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Dibatalkan',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-600',
    icon: Ban,
  },
};

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

      // Compute simple stats for current view
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shadow-sm">
                <ReceiptText className="w-6 h-6" />
              </span>
              Daftar Kwitansi (Official Receipt)
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Tanda bukti pembayaran sah CV. ANDARA dengan penomoran resmi & format cetak A4/Voucher.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadReceipts()}
            disabled={loading}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm disabled:opacity-50"
            title="Muat ulang data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin & Operator Siap Cetak</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Kwitansi
            </span>
            <span className="p-2 bg-slate-100 text-slate-600 rounded-lg">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {totalElements}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Total dokumen terdaftar di sistem
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Diterima (Halaman Ini)
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-xl font-bold text-emerald-600">
            {formatRupiah(totalAmountValid)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Nominal sah dari {validCount} kwitansi aktif
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kwitansi Sah (Valid)
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {validCount}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Dapat dicetak & digunakan resmi
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kwitansi Dibatalkan
            </span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Ban className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {cancelledCount}
          </div>
          <div className="text-xs text-rose-500 font-medium mt-1">
            Void / Dibatalkan
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
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
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-slate-700"
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
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-slate-700"
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
              className="w-1/2 px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-slate-700"
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
              className="w-1/2 px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-slate-700"
              title="Tanggal Akhir"
            />
          </div>
        </div>

        {(search || selectedCustomer || selectedStatus || startDate || endDate) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Filter aktif diterapkan</span>
            <button
              onClick={resetFilters}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-emerald-600 mb-3" />
            <p className="text-sm">Memuat daftar kwitansi...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center text-rose-500">
            <p className="font-semibold text-sm">{errorMsg}</p>
            <button
              onClick={loadReceipts}
              className="mt-3 px-4 py-1.5 text-xs bg-rose-50 text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-100"
            >
              Coba Lagi
            </button>
          </div>
        ) : receiptList.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ReceiptText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-medium text-slate-700">Belum ada dokumen kwitansi</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Kwitansi diterbitkan dari halaman detail pembayaran setelah transaksi pembayaran dicatat oleh Operator.
            </p>
            <button
              onClick={() => navigate('/pembayaran')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Ke Halaman Pembayaran
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">No. Kwitansi</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Diterima Dari</th>
                  <th className="py-3 px-4">Jumlah (Rp)</th>
                  <th className="py-3 px-4">Referensi Pembayaran</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receiptList.map((item) => {
                  const statusConf = STATUS_CONFIG[item.status];
                  const StatusIcon = statusConf.icon;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/kwitansi/${item.id}`)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                          <span>{item.number}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Oleh: {item.createdBy || 'Sistem'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.date}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 line-clamp-1">
                          {item.receivedFrom}
                        </div>
                        {item.customerCompanyName && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{item.customerCompanyName}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 whitespace-nowrap">
                          {formatRupiah(item.amount)}
                        </div>
                        <div className="text-[11px] text-slate-400 italic line-clamp-1 max-w-xs" title={item.spelledOut}>
                          "{item.spelledOut}"
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-slate-700">
                          {item.paymentNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Metode: {item.paymentMethod}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConf.bg}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConf.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/kwitansi/${item.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors shadow-xs"
                          title="Lihat & Cetak Kwitansi"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Lihat / Cetak</span>
                        </button>
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan {receiptList.length} dari {totalElements} data
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-slate-700">
                Halaman {currentPage + 1} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ReceiptListPage;

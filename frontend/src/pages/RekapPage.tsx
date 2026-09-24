import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  Users,
  Receipt,
  CreditCard,
  Briefcase,
  Search,
  Printer,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  getRekapCustomers,
  getRekapInvoices,
  getRekapPayments,
  getRekapKegiatan,
} from '@/api/rekapApi';
import { customerApi } from '@/api/customerApi';
import { Customer } from '@/types/customer';

const formatCurrency = (val: number | null | undefined): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

type RekapTab = 'CUSTOMERS' | 'INVOICES' | 'PAYMENTS' | 'KEGIATAN';

export const RekapPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RekapTab>('CUSTOMERS');

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(0);
  const pageSize = 15;

  // Active customers list
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['activeCustomers'],
    queryFn: () => customerApi.getActiveCustomers(),
  });

  // Query 1: Rekap Customers
  const { data: customerRekap, isLoading: loadingCustomers } = useQuery({
    queryKey: ['rekapCustomers', search, page],
    queryFn: () => getRekapCustomers({ search, page, size: pageSize }),
    enabled: activeTab === 'CUSTOMERS',
  });

  // Query 2: Rekap Invoices
  const { data: invoiceRekap, isLoading: loadingInvoices } = useQuery({
    queryKey: ['rekapInvoices', search, selectedCustomerId, startDate, endDate, page],
    queryFn: () =>
      getRekapInvoices({
        search,
        customerId: selectedCustomerId ? Number(selectedCustomerId) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        size: pageSize,
      }),
    enabled: activeTab === 'INVOICES',
  });

  // Query 3: Rekap Payments
  const { data: paymentRekap, isLoading: loadingPayments } = useQuery({
    queryKey: ['rekapPayments', search, selectedCustomerId, startDate, endDate, page],
    queryFn: () =>
      getRekapPayments({
        search,
        customerId: selectedCustomerId ? Number(selectedCustomerId) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        size: pageSize,
      }),
    enabled: activeTab === 'PAYMENTS',
  });

  // Query 4: Rekap Kegiatan
  const { data: kegiatanRekap, isLoading: loadingKegiatan } = useQuery({
    queryKey: ['rekapKegiatan', search, selectedCustomerId, page],
    queryFn: () =>
      getRekapKegiatan({
        search,
        customerId: selectedCustomerId ? Number(selectedCustomerId) : undefined,
        page,
        size: pageSize,
      }),
    enabled: activeTab === 'KEGIATAN',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleTabChange = (tab: RekapTab) => {
    setActiveTab(tab);
    setPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 print:border-none print:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Laporan Keuangan & Rekapitulasi
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Rekap Transaksi & Operasional</h1>
            <p className="text-xs text-slate-500">
              Monitoring data teragregasi per customer, faktur penjualan, realisasi kas, dan kegiatan proyek.
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Cetak / PDF
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-100 print:hidden">
          <button
            type="button"
            onClick={() => handleTabChange('CUSTOMERS')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'CUSTOMERS'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Rekap Customer
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('INVOICES')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'INVOICES'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Rekap Faktur Penjualan
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('PAYMENTS')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'PAYMENTS'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Rekap Pembayaran Kas
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('KEGIATAN')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'KEGIATAN'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Rekap Kegiatan Proyek
          </button>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 print:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode / nama / no dok..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>

          <div>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50/50 text-slate-700"
            >
              <option value="">Semua Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {(activeTab === 'INVOICES' || activeTab === 'PAYMENTS') && (
            <>
              <div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50/50 text-slate-700"
                  placeholder="Tanggal Mulai"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50/50 text-slate-700"
                  placeholder="Tanggal Akhir"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* TAB 1: REKAP CUSTOMER */}
      {activeTab === 'CUSTOMERS' && (
        <div className="space-y-4">
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Tagihan</span>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {formatCurrency(customerRekap?.grandTotalInvoiceAmount || 0)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Dibayar</span>
              <div className="text-lg font-bold text-emerald-600 mt-1">
                {formatCurrency(customerRekap?.grandTotalPaidAmount || 0)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Piutang</span>
              <div className="text-lg font-bold text-amber-600 mt-1">
                {formatCurrency(customerRekap?.grandTotalOutstanding || 0)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Saldo Deposit Mengendap</span>
              <div className="text-lg font-bold text-purple-600 mt-1">
                {formatCurrency(customerRekap?.grandTotalDepositBalance || 0)}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Kode & Customer</th>
                    <th className="py-3.5 px-4">Kontak / Telp</th>
                    <th className="py-3.5 px-4 text-center">Kegiatan</th>
                    <th className="py-3.5 px-4 text-center">Faktur</th>
                    <th className="py-3.5 px-4 text-right">Total Faktur</th>
                    <th className="py-3.5 px-4 text-right">Total Bayar</th>
                    <th className="py-3.5 px-4 text-right">Outstanding</th>
                    <th className="py-3.5 px-4 text-right">Deposit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingCustomers ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Memuat data rekap customer...
                      </td>
                    </tr>
                  ) : customerRekap?.page.content && customerRekap.page.content.length > 0 ? (
                    customerRekap.page.content.map((row) => (
                      <tr key={row.customerId} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{row.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {row.customerCode} {row.companyName ? `• ${row.companyName}` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{row.phone || '-'}</td>
                        <td className="py-3 px-4 text-center font-medium text-slate-700">
                          {row.totalKegiatan}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-slate-700">
                          {row.totalInvoices}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(row.totalInvoiceAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600">
                          {formatCurrency(row.totalPaidAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-600">
                          {formatCurrency(row.totalOutstanding)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-purple-600">
                          {formatCurrency(row.depositBalance)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Tidak ada data customer yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {customerRekap?.page && customerRekap.page.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Halaman {customerRekap.page.number + 1} dari {customerRekap.page.totalPages} (Total{' '}
                  {customerRekap.page.totalElements} mitra)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= customerRekap.page.totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REKAP FAKTUR PENJUALAN */}
      {activeTab === 'INVOICES' && (
        <div className="space-y-4">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Grand Total Nilai Faktur</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {formatCurrency(invoiceRekap?.grandTotalAmount || 0)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Grand Total Pelunasan</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {formatCurrency(invoiceRekap?.grandTotalPaidAmount || 0)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Grand Total Sisa Piutang</span>
              <div className="text-xl font-bold text-amber-600 mt-1">
                {formatCurrency(invoiceRekap?.grandTotalOutstanding || 0)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">No. Faktur</th>
                    <th className="py-3.5 px-4">Tanggal & Jatuh Tempo</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Status Bayar</th>
                    <th className="py-3.5 px-4 text-right">Nilai Faktur</th>
                    <th className="py-3.5 px-4 text-right">Dibayar</th>
                    <th className="py-3.5 px-4 text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingInvoices ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Memuat data rekap faktur...
                      </td>
                    </tr>
                  ) : invoiceRekap?.page.content && invoiceRekap.page.content.length > 0 ? (
                    invoiceRekap.page.content.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-brand-600">{row.number}</td>
                        <td className="py-3 px-4">
                          <div>{formatDate(row.date)}</div>
                          <div className="text-[11px] text-slate-400">
                            JT: {row.dueDate ? formatDate(row.dueDate) : '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{row.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{row.customerCode}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            row.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700'
                              : row.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {row.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(row.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600">
                          {formatCurrency(row.paidAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-600">
                          {formatCurrency(row.outstanding)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada data faktur penjualan yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {invoiceRekap?.page && invoiceRekap.page.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Halaman {invoiceRekap.page.number + 1} dari {invoiceRekap.page.totalPages} (Total{' '}
                  {invoiceRekap.page.totalElements} faktur)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= invoiceRekap.page.totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REKAP PEMBAYARAN */}
      {activeTab === 'PAYMENTS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-w-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Grand Total Realisasi Kas</span>
            <div className="text-xl font-bold text-emerald-600 mt-1">
              {formatCurrency(paymentRekap?.grandTotalAmount || 0)}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">No. Bukti Bayar</th>
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Metode & Rekening</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Nominal Diterima</th>
                    <th className="py-3.5 px-4 text-right">Alokasi Faktur</th>
                    <th className="py-3.5 px-4 text-right">Deposit Terbentuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingPayments ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Memuat data pembayaran...
                      </td>
                    </tr>
                  ) : paymentRekap?.page.content && paymentRekap.page.content.length > 0 ? (
                    paymentRekap.page.content.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-brand-600">{row.number}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(row.date)}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{row.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{row.customerCode}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{row.paymentMethod}</span>
                          {row.destinationAccount && (
                            <div className="text-[11px] text-slate-400">{row.destinationAccount}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-emerald-600">
                          {formatCurrency(row.amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">
                          {formatCurrency(row.allocatedAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-purple-600">
                          {formatCurrency(row.excessDeposit)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Tidak ada riwayat pembayaran yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paymentRekap?.page && paymentRekap.page.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Halaman {paymentRekap.page.number + 1} dari {paymentRekap.page.totalPages} (Total{' '}
                  {paymentRekap.page.totalElements} pembayaran)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= paymentRekap.page.totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REKAP KEGIATAN */}
      {activeTab === 'KEGIATAN' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-w-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Grand Total Nilai Kegiatan Proyek</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {formatCurrency(kegiatanRekap?.grandTotalValue || 0)}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Kode & Nama Kegiatan</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Lokasi</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Rincian Item</th>
                    <th className="py-3.5 px-4 text-right">Nilai Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingKegiatan ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Memuat data kegiatan...
                      </td>
                    </tr>
                  ) : kegiatanRekap?.page.content && kegiatanRekap.page.content.length > 0 ? (
                    kegiatanRekap.page.content.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{row.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{row.code}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{row.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{row.customerCode}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{row.location || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            row.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : row.status === 'ACTIVE'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-slate-700">
                          {row.itemCount} item
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(row.totalValue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Tidak ada kegiatan proyek yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {kegiatanRekap?.page && kegiatanRekap.page.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Halaman {kegiatanRekap.page.number + 1} dari {kegiatanRekap.page.totalPages} (Total{' '}
                  {kegiatanRekap.page.totalElements} kegiatan)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= kegiatanRekap.page.totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

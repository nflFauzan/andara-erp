import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Building,
  User as UserIcon,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { customerApi, CustomerQueryParams } from '../api/customerApi';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '../types/customer';
import { CustomerModal } from '../components/customer/CustomerModal';
import { formatRupiah } from '../lib/utils';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';

export const CustomerListPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Prepare query params
  const queryParams: CustomerQueryParams = {
    search: searchTerm.trim() || undefined,
    active: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
    page,
    size: pageSize,
    sortBy: 'name',
    direction: 'ASC',
  };

  // Fetch customers
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', queryParams],
    queryFn: () => customerApi.getCustomers(queryParams),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newCust: CreateCustomerInput) => customerApi.createCustomer(newCust),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsModalOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `Customer '${data.name}' (${data.code}) berhasil ditambahkan.`,
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menambahkan customer.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateCustomerInput }) =>
      customerApi.updateCustomer(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsModalOpen(false);
      setSelectedCustomer(null);
      setFeedbackMessage({
        type: 'success',
        text: `Perubahan data customer '${data.name}' berhasil disimpan.`,
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal memperbarui data customer.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      customerApi.toggleCustomerStatus(id, active),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setFeedbackMessage({
        type: 'success',
        text: `Status customer '${data.name}' berhasil diubah menjadi ${
          data.active ? 'Aktif' : 'Nonaktif'
        }.`,
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal mengubah status customer.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  const handleOpenCreateModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setSelectedCustomer(cust);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: CreateCustomerInput | UpdateCustomerInput) => {
    if (selectedCustomer) {
      await updateMutation.mutateAsync({ id: selectedCustomer.id, input: formData });
    } else {
      await createMutation.mutateAsync(formData as CreateCustomerInput);
    }
  };

  const customers = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        icon={Users}
        title="Master Data Customer"
        subtitle="Kelola data mitra kerja, instansi, kontak PIC, dan monitoring saldo deposit pelanggan CV. ANDARA."
        badge={
          <span className="text-[11px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold px-2.5 py-0.5 rounded-full border border-brand-500/20">
            Database Mitra
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition shadow-xs"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Customer</span>
            </button>
          </div>
        }
      />

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-bold underline ml-4 hover:opacity-80"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter and Search Bar with Defined 1.5px Outlines */}
      <BentoCard className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            placeholder="Cari kode, nama, perusahaan, atau PIC..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border-[1.5px] border-blue-200/90 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-brand-500" />
            <span>Status:</span>
          </div>
          <div className="inline-flex p-1 bg-white/80 dark:bg-slate-800/80 rounded-xl text-xs font-bold border-[1.5px] border-blue-200/90 dark:border-slate-700 shadow-2xs">
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'ALL'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => {
                setStatusFilter('ACTIVE');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => {
                setStatusFilter('INACTIVE');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'INACTIVE'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Nonaktif
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Customer Data Table */}
      <BentoCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-600 dark:text-slate-300">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-900/90 border-b-[1.5px] border-blue-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Customer & Perusahaan</th>
                <th className="py-3.5 px-4">Kontak & PIC</th>
                <th className="py-3.5 px-4 text-right">Saldo Deposit</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                      <p className="text-xs font-semibold">Memuat data customer...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-rose-500 text-sm font-semibold">
                    Terjadi kesalahan saat memuat data customer. Silakan refresh halaman.
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                      <p className="font-bold text-slate-700 dark:text-slate-300">Tidak ada customer ditemukan</p>
                      <p className="text-xs text-slate-400">
                        {searchTerm ? 'Coba ubah kata kunci pencarian Anda.' : 'Klik "Tambah Customer" untuk mendaftarkan pelanggan pertama.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Kode */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-md border border-brand-500/20">
                        {cust.code}
                      </span>
                    </td>

                    {/* Customer & Perusahaan */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        <Link
                          to={`/customers/${cust.id}`}
                          className="hover:text-brand-600 dark:hover:text-brand-400 transition hover:underline"
                        >
                          {cust.name}
                        </Link>
                      </div>
                      {cust.companyName && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{cust.companyName}</span>
                        </div>
                      )}
                    </td>

                    {/* Kontak & PIC */}
                    <td className="py-3.5 px-4">
                      {cust.picName && (
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <UserIcon className="w-3 h-3 text-slate-400" />
                          <span>{cust.picName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {cust.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {cust.phone}
                          </span>
                        )}
                        {cust.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {cust.email}
                          </span>
                        )}
                        {!cust.phone && !cust.email && !cust.picName && (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Saldo Deposit */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-mono">
                        <span
                          className={`font-bold text-xs px-2.5 py-1 rounded-full ${
                            cust.depositBalance > 0
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {formatRupiah(cust.depositBalance)}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          cust.active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {cust.active ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Nonaktif
                          </>
                        )}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <Link
                          to={`/customers/${cust.id}`}
                          className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition"
                          title="Lihat Detail & Lampiran"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(cust)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            toggleStatusMutation.mutate({ id: cust.id, active: !cust.active })
                          }
                          className={`p-1.5 rounded-lg transition ${
                            cust.active
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-500/10'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10'
                          }`}
                          title={cust.active ? 'Nonaktifkan Customer' : 'Aktifkan Customer'}
                        >
                          {cust.active ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40">
          <div>
            Menampilkan{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {totalElements === 0 ? 0 : page * pageSize + 1}
            </span>{' '}
            -{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {Math.min((page + 1) * pageSize, totalElements)}
            </span>{' '}
            dari <span className="font-bold text-slate-800 dark:text-slate-200">{totalElements}</span> customer
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
              Halaman {totalPages === 0 ? 0 : page + 1} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Customer Modal Component */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleModalSubmit}
        customer={selectedCustomer}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default CustomerListPage;

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
        text: `Status customer '${data.name}' diubah menjadi ${data.active ? 'Aktif' : 'Nonaktif'}.`,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600" />
            Master Data Customer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data mitra kerja, instansi, kontak PIC, dan monitoring saldo deposit pelanggan CV. Andara.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Customer</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2.5 text-sm font-medium">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-semibold underline ml-4 hover:opacity-80"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
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
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Status:</span>
          </div>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'ALL'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
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
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
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
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nonaktif
            </button>
          </div>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Customer & Perusahaan</th>
                <th className="py-3.5 px-4">Kontak & PIC</th>
                <th className="py-3.5 px-4 text-right">Saldo Deposit</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                      <p className="text-xs">Memuat data customer...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-rose-500 text-sm">
                    Terjadi kesalahan saat memuat data customer. Silakan refresh halaman.
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                      <p className="font-medium text-slate-600">Tidak ada customer ditemukan</p>
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
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Kode */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        {cust.code}
                      </span>
                    </td>

                    {/* Customer & Perusahaan */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        <Link
                          to={`/customers/${cust.id}`}
                          className="hover:text-indigo-600 transition hover:underline"
                        >
                          {cust.name}
                        </Link>
                      </div>
                      {cust.companyName && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{cust.companyName}</span>
                        </div>
                      )}
                    </td>

                    {/* Kontak & PIC */}
                    <td className="py-3.5 px-4">
                      {cust.picName && (
                        <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                          <UserIcon className="w-3 h-3 text-slate-400" />
                          <span>{cust.picName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        {cust.phone && (
                          <span className="flex items-center gap-1">
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
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`font-semibold text-xs px-2.5 py-1 rounded-full ${
                            cust.depositBalance > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'text-slate-600 bg-slate-50'
                          }`}
                        >
                          {formatRupiah(cust.depositBalance)}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cust.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
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
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Lihat Detail & Lampiran"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(cust)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
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
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
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
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
          <div>
            Menampilkan{' '}
            <span className="font-semibold text-slate-700">
              {totalElements === 0 ? 0 : page * pageSize + 1}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-slate-700">
              {Math.min((page + 1) * pageSize, totalElements)}
            </span>{' '}
            dari <span className="font-semibold text-slate-700">{totalElements}</span> customer
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              Halaman {totalPages === 0 ? 0 : page + 1} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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

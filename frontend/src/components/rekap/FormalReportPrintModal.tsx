import React, { useState } from 'react';
import {
  Printer,
  X,
  Settings,
} from 'lucide-react';
import { AndaraLetterhead } from '@/components/common/AndaraLetterhead';
import { FilterState, RekapTab } from './UniversalPeriodFilter';

interface FormalReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: RekapTab;
  tabLabel: string;
  data: any;
  filters: FilterState;
  customerName?: string;
}

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

export const FormalReportPrintModal: React.FC<FormalReportPrintModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  tabLabel,
  data,
  filters,
  customerName,
}) => {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [showKop, setShowKop] = useState<boolean>(true);
  const [showKpi, setShowKpi] = useState<boolean>(true);
  const [showSignatures, setShowSignatures] = useState<boolean>(true);

  if (!isOpen) return null;

  const now = new Date();
  const printDateStr = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const printTimeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  // Helper to extract rows and totals based on activeTab
  const getTableRowsAndTotals = () => {
    switch (activeTab) {
      case 'CUSTOMERS': {
        const list = data?.page?.content || [];
        return {
          list,
          totals: {
            totalInvoiceAmount: data?.grandTotalInvoiceAmount || 0,
            totalPaidAmount: data?.grandTotalPaidAmount || 0,
            totalOutstanding: data?.grandTotalOutstanding || 0,
            depositBalance: data?.grandTotalDepositBalance || 0,
          },
          kpis: [
            { label: 'Total Customer', val: data?.totalCustomers || list.length, isCur: false },
            { label: 'Total Faktur', val: data?.grandTotalInvoiceAmount || 0, isCur: true },
            { label: 'Total Terbayar', val: data?.grandTotalPaidAmount || 0, isCur: true },
            { label: 'Sisa Piutang', val: data?.grandTotalOutstanding || 0, isCur: true },
          ],
        };
      }
      case 'KEGIATAN': {
        const list = data?.page?.content || [];
        return {
          list,
          totals: {
            totalValue: data?.grandTotalValue || 0,
          },
          kpis: [
            { label: 'Total Kegiatan', val: data?.totalKegiatan || list.length, isCur: false },
            { label: 'Grand Total Nilai', val: data?.grandTotalValue || 0, isCur: true },
          ],
        };
      }
      case 'SPH': {
        const list = data?.page?.content || [];
        return {
          list,
          totals: {
            totalAmount: data?.grandTotalAmount || 0,
            invoicedAmount: data?.grandTotalInvoicedAmount || 0,
            unbilledAmount: data?.grandTotalUnbilledAmount || 0,
          },
          kpis: [
            { label: 'Total SPH', val: data?.totalPenawaran || list.length, isCur: false },
            { label: 'Nilai SPH Disetujui', val: data?.approvedTotalAmount || 0, isCur: true },
            { label: 'Telah Difakturkan', val: data?.grandTotalInvoicedAmount || 0, isCur: true },
            { label: 'Sisa Belum Ditagih', val: data?.grandTotalUnbilledAmount || 0, isCur: true },
          ],
        };
      }
      case 'INVOICES': {
        const list = data?.page?.content || [];
        return {
          list,
          totals: {
            totalAmount: data?.grandTotalAmount || 0,
            paidAmount: data?.grandTotalPaidAmount || 0,
            outstanding: data?.grandTotalOutstanding || 0,
          },
          kpis: [
            { label: 'Total Faktur', val: data?.totalInvoices || list.length, isCur: false },
            { label: 'Grand Total Tagihan', val: data?.grandTotalAmount || 0, isCur: true },
            { label: 'Total Terbayar', val: data?.grandTotalPaidAmount || 0, isCur: true },
            { label: 'Total Sisa Piutang', val: data?.grandTotalOutstanding || 0, isCur: true },
          ],
        };
      }
      case 'PIUTANG': {
        const list = data?.page?.content || [];
        return {
          list,
          totals: {
            totalAmount: list.reduce((acc: number, r: any) => acc + (r.totalAmount || 0), 0),
            paidAmount: list.reduce((acc: number, r: any) => acc + (r.paidAmount || 0), 0),
            outstanding: data?.grandTotalOutstanding || 0,
          },
          kpis: [
            { label: 'Faktur Berpiutang', val: data?.totalInvoicesWithOutstanding || list.length, isCur: false },
            { label: 'Total Sisa Piutang', val: data?.grandTotalOutstanding || 0, isCur: true },
            { label: 'Piutang Lancar', val: data?.currentAmount || 0, isCur: true },
            { label: 'Tunggakan Kritis (>60h)', val: (data?.bucket61To90Amount || 0) + (data?.bucketOver90Amount || 0), isCur: true },
          ],
        };
      }
      case 'PAYMENTS': {
        const list = data?.page?.content || [];
        return {
          list,
          totals: {
            amount: data?.grandTotalAmount || 0,
            allocatedAmount: data?.grandTotalAllocatedAmount || 0,
            excessDeposit: data?.grandTotalExcessDeposit || 0,
          },
          kpis: [
            { label: 'Total Bukti Kas', val: data?.totalPayments || list.length, isCur: false },
            { label: 'Total Kas Masuk', val: data?.grandTotalAmount || 0, isCur: true },
            { label: 'Alokasi ke Faktur', val: data?.grandTotalAllocatedAmount || 0, isCur: true },
            { label: 'Masuk Saldo Deposit', val: data?.grandTotalExcessDeposit || 0, isCur: true },
          ],
        };
      }
      case 'UNBILLED': {
        const list = data?.page?.content || [];
        return {
          list,
          totals: {
            totalAmount: data?.totalSphAmount || 0,
            invoicedAmount: data?.totalInvoicedAmount || 0,
            unbilledAmount: data?.totalUnbilledAmount || 0,
          },
          kpis: [
            { label: 'Total SPH Disetujui', val: data?.totalSph || list.length, isCur: false },
            { label: 'Total Nilai SPH', val: data?.totalSphAmount || 0, isCur: true },
            { label: 'Telah Difakturkan', val: data?.totalInvoicedAmount || 0, isCur: true },
            { label: 'Belum Ditagih (Leakage)', val: data?.totalUnbilledAmount || 0, isCur: true },
          ],
        };
      }
      case 'SETTLEMENTS': {
        const list = data?.page?.content || [];
        return {
          list,
          totals: {
            totalAmount: data?.grandTotalAmount || 0,
            paidAmount: data?.grandTotalPaidAmount || 0,
            outstanding: data?.grandTotalOutstanding || 0,
          },
          kpis: [
            { label: 'Total Faktur', val: data?.totalInvoices || list.length, isCur: false },
            { label: 'Nilai Total Faktur', val: data?.grandTotalAmount || 0, isCur: true },
            { label: 'Total Kas Masuk', val: data?.grandTotalPaidAmount || 0, isCur: true },
            { label: 'Sisa Piutang', val: data?.grandTotalOutstanding || 0, isCur: true },
          ],
        };
      }
      case 'TREND': {
        const list = data?.months || [];
        return {
          list,
          totals: {
            sphAmount: data?.totalSphAmount || 0,
            invoicedAmount: data?.totalInvoicedAmount || 0,
            paymentAmount: data?.totalPaymentAmount || 0,
            outstandingAmount: data?.totalOutstandingAmount || 0,
          },
          kpis: [
            { label: 'Omzet Faktur Tahunan', val: data?.totalInvoicedAmount || 0, isCur: true },
            { label: 'Realisasi Kas Masuk', val: data?.totalPaymentAmount || 0, isCur: true },
            { label: 'Rata-rata Collection Rate', val: `${Number(data?.averageCollectionRate || 0).toFixed(1)}%`, isCur: false },
            { label: 'Sisa Piutang Berjalan', val: data?.totalOutstandingAmount || 0, isCur: true },
          ],
        };
      }
      default:
        return { list: [], totals: {}, kpis: [] };
    }
  };

  const { list, totals, kpis } = getTableRowsAndTotals();

  // Render the specific table rows based on activeTab
  const renderTableContent = () => {
    switch (activeTab) {
      case 'CUSTOMERS':
        return (
          <>
            <thead>
              <tr className="bg-slate-800 text-white text-[9pt]">
                <th className="py-2 px-2 text-center w-8">No</th>
                <th className="py-2 px-2 text-left">Kode</th>
                <th className="py-2 px-3 text-left">Nama Customer</th>
                <th className="py-2 px-3 text-left">Perusahaan</th>
                <th className="py-2 px-2 text-center">Kegiatan</th>
                <th className="py-2 px-2 text-center">Faktur</th>
                <th className="py-2 px-3 text-right">Total Faktur</th>
                <th className="py-2 px-3 text-right">Terbayar</th>
                <th className="py-2 px-3 text-right">Sisa Piutang</th>
                <th className="py-2 px-3 text-right">Deposit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-[8.5pt]">
              {list.map((row: any, i: number) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                  <td className="py-1.5 px-2 text-center">{i + 1}</td>
                  <td className="py-1.5 px-2 font-mono font-semibold">{row.customerCode}</td>
                  <td className="py-1.5 px-3 font-semibold">{row.customerName}</td>
                  <td className="py-1.5 px-3 text-slate-600">{row.companyName || '-'}</td>
                  <td className="py-1.5 px-2 text-center">{row.totalKegiatan}</td>
                  <td className="py-1.5 px-2 text-center">{row.totalInvoices}</td>
                  <td className="py-1.5 px-3 text-right font-medium">{formatCurrency(row.totalInvoiceAmount)}</td>
                  <td className="py-1.5 px-3 text-right text-emerald-700 font-medium">{formatCurrency(row.totalPaidAmount)}</td>
                  <td className="py-1.5 px-3 text-right font-semibold text-rose-700">{formatCurrency(row.totalOutstanding)}</td>
                  <td className="py-1.5 px-3 text-right text-indigo-700">{formatCurrency(row.depositBalance)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-[9pt] border-t-2 border-b-2 border-black">
                <td colSpan={6} className="py-2 px-3 text-left">TOTAL KESELURUHAN</td>
                <td className="py-2 px-3 text-right">{formatCurrency(totals.totalInvoiceAmount)}</td>
                <td className="py-2 px-3 text-right text-emerald-800">{formatCurrency(totals.totalPaidAmount)}</td>
                <td className="py-2 px-3 text-right text-rose-800">{formatCurrency(totals.totalOutstanding)}</td>
                <td className="py-2 px-3 text-right text-indigo-800">{formatCurrency(totals.depositBalance)}</td>
              </tr>
            </tfoot>
          </>
        );

      case 'INVOICES':
        return (
          <>
            <thead>
              <tr className="bg-slate-800 text-white text-[9pt]">
                <th className="py-2 px-2 text-center w-8">No</th>
                <th className="py-2 px-2 text-left">No. Faktur</th>
                <th className="py-2 px-2 text-center">Tgl Faktur</th>
                <th className="py-2 px-2 text-center">Jatuh Tempo</th>
                <th className="py-2 px-3 text-left">Customer / Perusahaan</th>
                <th className="py-2 px-3 text-right">Nilai Faktur</th>
                <th className="py-2 px-3 text-right">Telah Dibayar</th>
                <th className="py-2 px-3 text-right">Sisa Piutang</th>
                <th className="py-2 px-2 text-center">Status Bayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-[8.5pt]">
              {list.map((row: any, i: number) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                  <td className="py-1.5 px-2 text-center">{i + 1}</td>
                  <td className="py-1.5 px-2 font-mono font-semibold">{row.number}</td>
                  <td className="py-1.5 px-2 text-center">{formatDate(row.date)}</td>
                  <td className="py-1.5 px-2 text-center">{formatDate(row.dueDate)}</td>
                  <td className="py-1.5 px-3">
                    <span className="font-semibold">{row.customerName}</span>
                    {row.companyName && <span className="text-slate-500 text-[8pt] block">{row.companyName}</span>}
                  </td>
                  <td className="py-1.5 px-3 text-right font-medium">{formatCurrency(row.totalAmount)}</td>
                  <td className="py-1.5 px-3 text-right text-emerald-700 font-medium">{formatCurrency(row.paidAmount)}</td>
                  <td className="py-1.5 px-3 text-right font-semibold text-rose-700">{formatCurrency(row.outstanding)}</td>
                  <td className="py-1.5 px-2 text-center font-bold text-[8pt]">{row.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-[9pt] border-t-2 border-b-2 border-black">
                <td colSpan={5} className="py-2 px-3 text-left">TOTAL KESELURUHAN</td>
                <td className="py-2 px-3 text-right">{formatCurrency(totals.totalAmount)}</td>
                <td className="py-2 px-3 text-right text-emerald-800">{formatCurrency(totals.paidAmount)}</td>
                <td className="py-2 px-3 text-right text-rose-800">{formatCurrency(totals.outstanding)}</td>
                <td></td>
              </tr>
            </tfoot>
          </>
        );

      case 'PIUTANG':
        return (
          <>
            <thead>
              <tr className="bg-slate-800 text-white text-[9pt]">
                <th className="py-2 px-2 text-center w-8">No</th>
                <th className="py-2 px-2 text-left">No. Faktur</th>
                <th className="py-2 px-2 text-center">Tgl Faktur</th>
                <th className="py-2 px-2 text-center">Jatuh Tempo</th>
                <th className="py-2 px-3 text-left">Customer</th>
                <th className="py-2 px-2 text-center">Aging Bucket</th>
                <th className="py-2 px-2 text-center">Overdue</th>
                <th className="py-2 px-3 text-right">Nilai Faktur</th>
                <th className="py-2 px-3 text-right">Terbayar</th>
                <th className="py-2 px-3 text-right">Sisa Piutang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-[8.5pt]">
              {list.map((row: any, i: number) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                  <td className="py-1.5 px-2 text-center">{i + 1}</td>
                  <td className="py-1.5 px-2 font-mono font-semibold">{row.invoiceNumber}</td>
                  <td className="py-1.5 px-2 text-center">{formatDate(row.invoiceDate)}</td>
                  <td className="py-1.5 px-2 text-center">{formatDate(row.dueDate)}</td>
                  <td className="py-1.5 px-3 font-semibold">{row.customerName}</td>
                  <td className="py-1.5 px-2 text-center font-medium">{row.agingBucket}</td>
                  <td className="py-1.5 px-2 text-center font-bold text-rose-600">+{row.daysOverdue}h</td>
                  <td className="py-1.5 px-3 text-right">{formatCurrency(row.totalAmount)}</td>
                  <td className="py-1.5 px-3 text-right text-emerald-700">{formatCurrency(row.paidAmount)}</td>
                  <td className="py-1.5 px-3 text-right font-bold text-rose-700">{formatCurrency(row.outstanding)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-[9pt] border-t-2 border-b-2 border-black">
                <td colSpan={7} className="py-2 px-3 text-left">TOTAL SISA PIUTANG</td>
                <td className="py-2 px-3 text-right">{formatCurrency(totals.totalAmount)}</td>
                <td className="py-2 px-3 text-right text-emerald-800">{formatCurrency(totals.paidAmount)}</td>
                <td className="py-2 px-3 text-right text-rose-800">{formatCurrency(totals.outstanding)}</td>
              </tr>
            </tfoot>
          </>
        );

      case 'SPH':
      case 'UNBILLED':
        return (
          <>
            <thead>
              <tr className="bg-slate-800 text-white text-[9pt]">
                <th className="py-2 px-2 text-center w-8">No</th>
                <th className="py-2 px-2 text-left">No. SPH</th>
                <th className="py-2 px-2 text-center">Tgl SPH</th>
                <th className="py-2 px-3 text-left">Customer</th>
                <th className="py-2 px-3 text-right">Nilai SPH</th>
                <th className="py-2 px-3 text-right">Telah Difakturkan</th>
                <th className="py-2 px-3 text-right">Sisa Belum Ditagih</th>
                <th className="py-2 px-2 text-center">Status</th>
                <th className="py-2 px-3 text-left">Faktur Terbit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-[8.5pt]">
              {list.map((row: any, i: number) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                  <td className="py-1.5 px-2 text-center">{i + 1}</td>
                  <td className="py-1.5 px-2 font-mono font-semibold">{row.number}</td>
                  <td className="py-1.5 px-2 text-center">{formatDate(row.date)}</td>
                  <td className="py-1.5 px-3 font-semibold">{row.customerName}</td>
                  <td className="py-1.5 px-3 text-right font-medium">{formatCurrency(row.totalAmount)}</td>
                  <td className="py-1.5 px-3 text-right text-emerald-700 font-semibold">{formatCurrency(row.invoicedAmount)}</td>
                  <td className="py-1.5 px-3 text-right font-bold text-rose-700">{formatCurrency(row.unbilledAmount)}</td>
                  <td className="py-1.5 px-2 text-center font-bold text-[8pt]">{row.billingStatus || row.status}</td>
                  <td className="py-1.5 px-3 text-[8pt] font-mono">
                    {row.invoices && row.invoices.length > 0 ? row.invoices.map((inv: any) => inv.number).join(', ') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-[9pt] border-t-2 border-b-2 border-black">
                <td colSpan={4} className="py-2 px-3 text-left">TOTAL KESELURUHAN</td>
                <td className="py-2 px-3 text-right">{formatCurrency(totals.totalAmount)}</td>
                <td className="py-2 px-3 text-right text-emerald-800">{formatCurrency(totals.invoicedAmount)}</td>
                <td className="py-2 px-3 text-right text-rose-800">{formatCurrency(totals.unbilledAmount)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </>
        );

      case 'PAYMENTS':
        return (
          <>
            <thead>
              <tr className="bg-slate-800 text-white text-[9pt]">
                <th className="py-2 px-2 text-center w-8">No</th>
                <th className="py-2 px-2 text-left">No. Bukti Kas</th>
                <th className="py-2 px-2 text-center">Tgl Kas</th>
                <th className="py-2 px-3 text-left">Customer</th>
                <th className="py-2 px-3 text-right">Nominal Kas</th>
                <th className="py-2 px-3 text-right">Alokasi Faktur</th>
                <th className="py-2 px-3 text-right">Masuk Deposit</th>
                <th className="py-2 px-2 text-center">Metode</th>
                <th className="py-2 px-3 text-left">Rekening Tujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-[8.5pt]">
              {list.map((row: any, i: number) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                  <td className="py-1.5 px-2 text-center">{i + 1}</td>
                  <td className="py-1.5 px-2 font-mono font-semibold">{row.number}</td>
                  <td className="py-1.5 px-2 text-center">{formatDate(row.date)}</td>
                  <td className="py-1.5 px-3 font-semibold">{row.customerName}</td>
                  <td className="py-1.5 px-3 text-right font-bold text-emerald-700">{formatCurrency(row.amount)}</td>
                  <td className="py-1.5 px-3 text-right font-medium">{formatCurrency(row.allocatedAmount)}</td>
                  <td className="py-1.5 px-3 text-right text-indigo-700 font-medium">{formatCurrency(row.excessDeposit)}</td>
                  <td className="py-1.5 px-2 text-center font-medium">{row.paymentMethod}</td>
                  <td className="py-1.5 px-3 text-[8pt] text-slate-600">{row.destinationAccount || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-[9pt] border-t-2 border-b-2 border-black">
                <td colSpan={4} className="py-2 px-3 text-left">TOTAL KESELURUHAN</td>
                <td className="py-2 px-3 text-right text-emerald-800">{formatCurrency(totals.amount)}</td>
                <td className="py-2 px-3 text-right">{formatCurrency(totals.allocatedAmount)}</td>
                <td className="py-2 px-3 text-right text-indigo-800">{formatCurrency(totals.excessDeposit)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </>
        );

      case 'SETTLEMENTS':
        return (
          <>
            <thead>
              <tr className="bg-slate-800 text-white text-[9pt]">
                <th className="py-2 px-2 text-center w-8">No</th>
                <th className="py-2 px-2 text-left">No. Faktur</th>
                <th className="py-2 px-2 text-center">Tgl</th>
                <th className="py-2 px-3 text-left">Customer</th>
                <th className="py-2 px-3 text-right">Nilai Faktur</th>
                <th className="py-2 px-3 text-right">Terbayar</th>
                <th className="py-2 px-3 text-right">Sisa Piutang</th>
                <th className="py-2 px-2 text-center">Status</th>
                <th className="py-2 px-3 text-left">Rincian Pelunasan Kas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-[8.5pt]">
              {list.map((row: any, i: number) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                  <td className="py-1.5 px-2 text-center">{i + 1}</td>
                  <td className="py-1.5 px-2 font-mono font-semibold">{row.invoiceNumber}</td>
                  <td className="py-1.5 px-2 text-center">{formatDate(row.invoiceDate)}</td>
                  <td className="py-1.5 px-3 font-semibold">{row.customerName}</td>
                  <td className="py-1.5 px-3 text-right font-medium">{formatCurrency(row.totalAmount)}</td>
                  <td className="py-1.5 px-3 text-right text-emerald-700 font-semibold">{formatCurrency(row.paidAmount)}</td>
                  <td className="py-1.5 px-3 text-right font-bold text-rose-700">{formatCurrency(row.outstanding)}</td>
                  <td className="py-1.5 px-2 text-center font-bold text-[8pt]">{row.paymentStatus}</td>
                  <td className="py-1.5 px-3 text-[8pt]">
                    {row.allocations && row.allocations.length > 0 ? (
                      row.allocations.map((a: any, idx: number) => (
                        <div key={idx} className="font-mono text-slate-700">
                          &bull; {a.paymentNumber} ({formatDate(a.paymentDate)}): {formatCurrency(a.allocatedAmount)} [{a.paymentMethod}]
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">Belum Ada Kas Masuk</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-[9pt] border-t-2 border-b-2 border-black">
                <td colSpan={4} className="py-2 px-3 text-left">TOTAL KESELURUHAN</td>
                <td className="py-2 px-3 text-right">{formatCurrency(totals.totalAmount)}</td>
                <td className="py-2 px-3 text-right text-emerald-800">{formatCurrency(totals.paidAmount)}</td>
                <td className="py-2 px-3 text-right text-rose-800">{formatCurrency(totals.outstanding)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </>
        );

      case 'TREND':
        return (
          <>
            <thead>
              <tr className="bg-slate-800 text-white text-[9pt]">
                <th className="py-2 px-2 text-center w-8">No</th>
                <th className="py-2 px-3 text-left">Bulan</th>
                <th className="py-2 px-3 text-right">SPH Diterbitkan</th>
                <th className="py-2 px-3 text-right">Faktur Terbit (Omzet)</th>
                <th className="py-2 px-2 text-center">MoM Growth</th>
                <th className="py-2 px-3 text-right">Realisasi Kas Masuk</th>
                <th className="py-2 px-3 text-right">Sisa Piutang</th>
                <th className="py-2 px-2 text-right">Collection Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-[8.5pt]">
              {list.map((row: any, i: number) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                  <td className="py-1.5 px-2 text-center">{i + 1}</td>
                  <td className="py-1.5 px-3 font-bold">{row.monthName}</td>
                  <td className="py-1.5 px-3 text-right font-medium">{formatCurrency(row.sphAmount)} ({row.sphCount})</td>
                  <td className="py-1.5 px-3 text-right font-bold text-slate-900">{formatCurrency(row.invoicedAmount)} ({row.invoicedCount})</td>
                  <td className="py-1.5 px-2 text-center font-semibold">
                    {row.momRevenueGrowth !== null && row.momRevenueGrowth !== undefined
                      ? `${row.momRevenueGrowth > 0 ? '+' : ''}${row.momRevenueGrowth.toFixed(1)}%`
                      : '-'}
                  </td>
                  <td className="py-1.5 px-3 text-right text-emerald-700 font-bold">{formatCurrency(row.paymentAmount)} ({row.paymentCount})</td>
                  <td className="py-1.5 px-3 text-right font-semibold text-rose-700">{formatCurrency(row.outstandingAmount)}</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold text-sky-700">{row.collectionRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-[9pt] border-t-2 border-b-2 border-black">
                <td colSpan={2} className="py-2 px-3 text-left">TOTAL TAHUNAN</td>
                <td className="py-2 px-3 text-right">{formatCurrency(totals.sphAmount)}</td>
                <td className="py-2 px-3 text-right">{formatCurrency(totals.invoicedAmount)}</td>
                <td></td>
                <td className="py-2 px-3 text-right text-emerald-800">{formatCurrency(totals.paymentAmount)}</td>
                <td className="py-2 px-3 text-right text-rose-800">{formatCurrency(totals.outstandingAmount)}</td>
                <td className="py-2 px-2 text-right font-mono">{Number(data?.averageCollectionRate || 0).toFixed(1)}%</td>
              </tr>
            </tfoot>
          </>
        );

      case 'KEGIATAN':
      default:
        return (
          <>
            <thead>
              <tr className="bg-slate-800 text-white text-[9pt]">
                <th className="py-2 px-2 text-center w-8">No</th>
                <th className="py-2 px-2 text-left">Kode</th>
                <th className="py-2 px-3 text-left">Nama Proyek</th>
                <th className="py-2 px-3 text-left">Customer</th>
                <th className="py-2 px-3 text-left">Lokasi</th>
                <th className="py-2 px-2 text-center">Status</th>
                <th className="py-2 px-2 text-center">SPH</th>
                <th className="py-2 px-2 text-center">Faktur</th>
                <th className="py-2 px-3 text-right">Nilai Total Proyek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-[8.5pt]">
              {list.map((row: any, i: number) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                  <td className="py-1.5 px-2 text-center">{i + 1}</td>
                  <td className="py-1.5 px-2 font-mono font-semibold">{row.code}</td>
                  <td className="py-1.5 px-3 font-semibold">{row.name}</td>
                  <td className="py-1.5 px-3">{row.customerName}</td>
                  <td className="py-1.5 px-3 text-slate-600">{row.location || '-'}</td>
                  <td className="py-1.5 px-2 text-center font-bold text-[8pt]">{row.status}</td>
                  <td className="py-1.5 px-2 text-center">{row.penawaranCount}</td>
                  <td className="py-1.5 px-2 text-center">{row.invoiceCount}</td>
                  <td className="py-1.5 px-3 text-right font-bold text-slate-900">{formatCurrency(row.totalValue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-[9pt] border-t-2 border-b-2 border-black">
                <td colSpan={8} className="py-2 px-3 text-left">TOTAL NILAI PROYEK</td>
                <td className="py-2 px-3 text-right">{formatCurrency(totals.totalValue)}</td>
              </tr>
            </tfoot>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
        
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="print:hidden p-4 border-b border-slate-200 dark:border-navy-700 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-navy-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Pratinjau Format Cetak / PDF Formal Berstandar Surat Resmi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Laporan siap cetak fisik atau diekspor ke PDF berstandar kop dan tanda tangan CV. ANDARA.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Print Action Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Ctrl+P)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Print Configuration Strip (Hidden in Print) */}
        <div className="print:hidden px-4 py-2.5 bg-slate-100/70 dark:bg-navy-950/40 border-b border-slate-200/80 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" /> Konfigurasi Cetak:
            </span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showKop}
                onChange={(e) => setShowKop(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Kop Surat Resmi</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showKpi}
                onChange={(e) => setShowKpi(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Ringkasan KPI</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={(e) => setShowSignatures(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Blok Tanda Tangan</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Orientasi Kertas:</span>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                orientation === 'landscape'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700'
              }`}
            >
              Landscape (A4)
            </button>
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                orientation === 'portrait'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700'
              }`}
            >
              Portrait (A4)
            </button>
          </div>
        </div>

        {/* Formal Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/60 dark:bg-navy-950/70 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          <div
            className={`bg-white text-black p-6 sm:p-8 shadow-xl print:shadow-none print:p-0 w-full font-sans print:w-full ${
              orientation === 'landscape' ? 'max-w-[1050px]' : 'max-w-[800px]'
            }`}
            style={{
              minHeight: '297mm',
              backgroundColor: '#ffffff',
              color: '#000000',
            }}
          >
            {/* 1. Kop Surat Resmi CV. ANDARA */}
            {showKop && (
              <div className="mb-4">
                <AndaraLetterhead showDivisiStrip={true} />
                <div className="border-b-2 border-black mt-2 mb-0.5"></div>
                <div className="border-b border-black mb-3"></div>
              </div>
            )}

            {/* 2. Metadata Judul Laporan */}
            <div className="text-center mb-5">
              <h2 className="text-[14pt] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 inline-block">
                LAPORAN {tabLabel.toUpperCase()}
              </h2>
              <div className="mt-1 text-[9pt] text-slate-600">
                Sistem Manajemen Operasional &amp; Transaksi CV. ANDARA
              </div>
            </div>

            {/* 3. Parameter Informasi Filter Dokumen */}
            <div className="grid grid-cols-2 gap-4 p-3 rounded-lg border border-slate-300 bg-slate-50/75 text-[8.5pt] mb-4">
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Periode Data:</span>
                  <span className="font-semibold text-slate-800">
                    {filters.startDate && filters.endDate
                      ? `${formatDate(filters.startDate)} s/d ${formatDate(filters.endDate)}`
                      : 'Semua Waktu (All Time)'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Customer:</span>
                  <span className="font-semibold text-slate-800">{customerName || 'Semua Customer'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Filter Status:</span>
                  <span className="font-semibold text-slate-800">{filters.status || 'Semua Status'}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Tanggal Cetak:</span>
                  <span className="font-semibold text-slate-800">{printDateStr}, Pukul {printTimeStr} WIB</span>
                </div>
              </div>
            </div>

            {/* 4. Ringkasan Indikator Kinerja (KPI) Box */}
            {showKpi && kpis.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {kpis.map((kpi: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-300 bg-white text-center"
                  >
                    <div className="text-[7.5pt] font-bold text-slate-500 uppercase tracking-wide">
                      {kpi.label}
                    </div>
                    <div className="text-[11pt] font-black text-slate-900 mt-0.5">
                      {kpi.isCur ? formatCurrency(kpi.val) : kpi.val}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. Tabel Data Transaksi Resmi */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300 print:text-[8pt]">
                {renderTableContent()}
              </table>
            </div>

            {/* 6. Catatan Legal & Integritas Dokumen */}
            <div className="text-[7.5pt] text-slate-500 italic mb-8">
              * Dokumen ini digenerate secara resmi melalui Sistem Manajemen Operasional &amp; Transaksi CV. ANDARA. Seluruh perhitungan nilai nominal dan tanggal transaksi tercatat secara otomatis pada database perusahaan.
            </div>

            {/* 7. Blok Pengesahan & Tanda Tangan Resmi */}
            {showSignatures && (
              <div className="pt-2 text-[9pt] break-inside-avoid">
                <div className="text-right text-slate-700 mb-2 font-medium">
                  Bogor / Bandung, {printDateStr}
                </div>
                <div className="grid grid-cols-2 gap-12 text-center mt-3">
                  <div>
                    <p className="font-bold text-slate-800">Disiapkan Oleh,</p>
                    <p className="text-[8pt] text-slate-500">Staf Administrasi &amp; Keuangan</p>
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-[8pt] text-slate-300 italic">[ Tanda Tangan &amp; Cap ]</span>
                    </div>
                    <p className="font-bold text-slate-900 underline underline-offset-4">
                      ( .................................................... )
                    </p>
                    <p className="text-[8pt] text-slate-600 mt-0.5">Operator Keuangan</p>
                  </div>

                  <div>
                    <p className="font-bold text-slate-800">Mengetahui &amp; Menyetujui,</p>
                    <p className="text-[8pt] text-slate-500 font-bold">CV. ANDARA</p>
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-[8pt] text-slate-300 italic">[ Tanda Tangan &amp; Cap ]</span>
                    </div>
                    <p className="font-bold text-slate-900 underline underline-offset-4">
                      ( .................................................... )
                    </p>
                    <p className="text-[8pt] text-slate-600 mt-0.5">Pimpinan / Direktur Utama</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

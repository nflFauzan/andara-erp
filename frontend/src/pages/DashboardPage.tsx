import React from 'react';
import { 
  Database, 
  Server, 
  Shield, 
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const modules = [
    { title: 'Customer & Kontak', desc: 'Manajemen data mitra & master customer', status: 'Ready for Phase 2', ready: false },
    { title: 'Kegiatan & Item', desc: 'Volume × Satuan Harga dengan kalkulasi backend', status: 'Ready for Phase 3', ready: false },
    { title: 'Penawaran (Quotation)', desc: 'Penyusunan penawaran operasional multi-item', status: 'Ready for Phase 5', ready: false },
    { title: 'Faktur Penjualan', desc: 'Invoicing parsial/penuh & pelacakan status bayar', status: 'Ready for Phase 6', ready: false },
    { title: 'Pembayaran & Deposit', desc: 'Payment allocation engine & ledger deposit', status: 'Ready for Phase 7-8', ready: false },
    { title: 'Kwitansi Resmi', desc: 'Penerbitan kwitansi tanda terima pembayaran', status: 'Ready for Phase 9', ready: false },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              Sistem Aktif • Baseline v1.0
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Sistem Manajemen Keuangan & Operasional
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Selamat datang di portal operasional CV. ANDARA. Seluruh perhitungan finansial, alokasi pembayaran, dan mutasi saldo deposit dilindungi oleh validasi server-side dan database transaction guard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/status"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition shadow-md shadow-brand-500/20"
            >
              <Server className="w-4 h-4" />
              Cek Koneksi API
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Architecture Guardrails Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Spring Boot 3.3.4 (Java 21+)</h3>
            <p className="text-xs text-slate-500 mt-1">Modular monolith backend dengan JPA Hibernate, Flyway migration, dan Jakarta Validation.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">PostgreSQL 16 (Ledger Driven)</h3>
            <p className="text-xs text-slate-500 mt-1">Tipe NUMERIC untuk uang, audit log, locking finansial, dan ledger transaksi deposit.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Role-Based Guard (RBAC)</h3>
            <p className="text-xs text-slate-500 mt-1">Operator (Akses Penuh Finansial) & Admin (Operasional non-pembayaran).</p>
          </div>
        </div>
      </div>

      {/* Core Business Modules Roadmap */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Modul Transaksi & Operasional</h2>
            <p className="text-xs text-slate-500">Status kesiapan dan tahapan implementasi modul bisnis CV. ANDARA</p>
          </div>
          <span className="text-xs font-medium text-slate-400">Total 6 Modul Utama</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {modules.map((m) => (
            <div key={m.title} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">{m.title}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {m.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

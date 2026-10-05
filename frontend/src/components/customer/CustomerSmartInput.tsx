import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Building2, Plus, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Customer } from '../../types/customer';

export interface CustomerSmartInputProps {
  selectedCustomerId: number | '';
  onSelectCustomer: (customer: Customer | null) => void;
  onCreateNewCustomer: (typedQuery: string) => void;
  customers: Customer[];
  placeholder?: string;
  disabled?: boolean;
}

export const CustomerSmartInput: React.FC<CustomerSmartInputProps> = ({
  selectedCustomerId,
  onSelectCustomer,
  onCreateNewCustomer,
  customers,
  placeholder = 'Ketik nama, kode, atau instansi customer...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [inputValue, setInputValue] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find currently selected customer object
  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find((c) => c.id === Number(selectedCustomerId)) || null;
  }, [customers, selectedCustomerId]);

  // Sync display text when selectedCustomer changes from outside
  useEffect(() => {
    if (selectedCustomer) {
      setInputValue(`${selectedCustomer.name} (${selectedCustomer.code})`);
    } else {
      setInputValue('');
    }
  }, [selectedCustomer]);

  // Filter customers in real-time
  const query = inputValue.trim().toLowerCase();
  const filteredCustomers = useMemo(() => {
    // If input is exactly matching the selected customer display name and not focused, or empty query
    if (!query) {
      return customers.slice(0, 10);
    }

    // Check if query matches selected customer name exactly (when just opened without typing new search)
    const isExactSelected = selectedCustomer && `${selectedCustomer.name} (${selectedCustomer.code})`.toLowerCase() === query;
    if (isExactSelected) {
      return customers.slice(0, 10);
    }

    return customers
      .filter((c) => {
        const nameMatch = c.name?.toLowerCase().includes(query);
        const codeMatch = c.code?.toLowerCase().includes(query);
        const companyMatch = c.companyName?.toLowerCase().includes(query);
        const picMatch = c.picName?.toLowerCase().includes(query);
        const phoneMatch = c.phone?.toLowerCase().includes(query);
        return nameMatch || codeMatch || companyMatch || picMatch || phoneMatch;
      })
      .slice(0, 15);
  }, [customers, query, selectedCustomer]);

  // Total selectable items = filteredCustomers.length + 1 (the "+ Tambah Customer Baru" action)
  const totalSelectable = filteredCustomers.length + 1;
  const createActionIndex = filteredCustomers.length;

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        // Reset input value to selected customer name if user clicked away without picking
        if (selectedCustomer) {
          setInputValue(`${selectedCustomer.name} (${selectedCustomer.code})`);
        } else {
          setInputValue('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCustomer]);

  // Scroll active item into view when navigating via keyboard
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (customer: Customer) => {
    onSelectCustomer(customer);
    setInputValue(`${customer.name} (${customer.code})`);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    // If input is not the selected customer's full label, pass it as prefill name
    const isCurrentLabel = selectedCustomer && `${selectedCustomer.name} (${selectedCustomer.code})` === inputValue;
    const typedName = isCurrentLabel ? '' : inputValue.trim();
    onCreateNewCustomer(typedName);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectCustomer(null);
    setInputValue('');
    setIsOpen(true);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setIsOpen((prev) => !prev);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) => (prev < totalSelectable - 1 ? prev + 1 : 0));
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(totalSelectable - 1);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalSelectable - 1));
      }
      return;
    }

    if (e.key === 'Enter') {
      if (isOpen) {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCustomers.length) {
          handleSelect(filteredCustomers[highlightedIndex]);
        } else if (highlightedIndex === createActionIndex) {
          handleCreateNew();
        } else if (filteredCustomers.length === 1) {
          handleSelect(filteredCustomers[0]);
        }
      }
      return;
    }

    if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        if (selectedCustomer) {
          setInputValue(`${selectedCustomer.name} (${selectedCustomer.code})`);
        } else {
          setInputValue('');
        }
      }
      return;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field Container */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <Building2 className="w-4 h-4 text-brand-500/80" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
            // Optional: select text on focus for easy replacement
            inputRef.current?.select();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-16 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500/30 outline-none font-semibold bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-xs"
        />

        {/* Action Controls inside the input (Clear and Toggle Chevron) */}
        <div className="absolute right-2 flex items-center gap-1 text-slate-400">
          {(inputValue || selectedCustomerId) && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Bersihkan pilihan customer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleDropdown}
            className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isOpen ? 'Tutup daftar' : 'Buka daftar customer'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Suggestion Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-150 min-w-[320px]"
        >
          {filteredCustomers.length > 0 ? (
            <div className="max-h-64 overflow-y-auto space-y-0.5">
              {filteredCustomers.map((cust, idx) => {
                const isHighlighted = highlightedIndex === idx;
                const isSelected = selectedCustomer?.id === cust.id;

                return (
                  <button
                    key={cust.id}
                    type="button"
                    data-index={idx}
                    onClick={() => handleSelect(cust)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left cursor-pointer transition-colors ${
                      isHighlighted
                        ? 'bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : isSelected
                        ? 'bg-blue-50/40 dark:bg-blue-950/20 text-slate-800 dark:text-slate-100'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                        <Building2 className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold truncate text-slate-900 dark:text-white">
                            {cust.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                            {cust.code}
                          </span>
                        </div>

                        {(cust.companyName || cust.picName || cust.phone) && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-2">
                            {cust.companyName && <span>{cust.companyName}</span>}
                            {cust.companyName && cust.picName && <span>•</span>}
                            {cust.picName && <span>PIC: {cust.picName}</span>}
                            {(cust.companyName || cust.picName) && cust.phone && <span>•</span>}
                            {cust.phone && <span>{cust.phone}</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-3 text-xs text-slate-400 dark:text-slate-500 text-center italic">
              Tidak ada customer yang cocok
            </div>
          )}

          {/* Visual Divider */}
          <div className="my-1 border-t border-slate-100 dark:border-slate-800/80" />

          {/* Trigger B: Action "+ Tambah Customer Baru" at the bottom */}
          <button
            type="button"
            data-index={createActionIndex}
            onClick={handleCreateNew}
            onMouseEnter={() => setHighlightedIndex(createActionIndex)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-colors text-xs font-bold ${
              highlightedIndex === createActionIndex
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
            }`}
          >
            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>+ Tambah Customer Baru</span>
          </button>
        </div>
      )}
    </div>
  );
};

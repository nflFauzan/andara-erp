import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FileText, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ItemCatalog } from '../../types/itemCatalog';
import { formatRupiah } from '../../lib/utils';

export interface ItemSmartInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectMasterItem: (item: ItemCatalog) => void;
  onCreateNewMasterItem: (typedQuery: string) => void;
  masterItems: ItemCatalog[];
  placeholder?: string;
  disabled?: boolean;
}

export const ItemSmartInput: React.FC<ItemSmartInputProps> = ({
  value,
  onChange,
  onSelectMasterItem,
  onCreateNewMasterItem,
  masterItems,
  placeholder = 'Ketikan nama pekerjaan / material...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items in real-time (case-insensitive substring match)
  const query = value.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    if (!query) {
      // When empty query, return top 8 items for fast picking
      return masterItems.slice(0, 8);
    }
    return masterItems
      .filter(
        (it) =>
          it.name.toLowerCase().includes(query) ||
          (it.category && it.category.toLowerCase().includes(query)) ||
          (it.code && it.code.toLowerCase().includes(query))
      )
      .slice(0, 15);
  }, [masterItems, query]);

  // Total selectable items = filteredItems.length + 1 (the "+ Buat item baru ke Master" action)
  const totalSelectable = filteredItems.length + 1;
  const createActionIndex = filteredItems.length;

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll active item into view when navigating via keyboard
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (item: ItemCatalog) => {
    onSelectMasterItem(item);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    onCreateNewMasterItem(value.trim());
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
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
        if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
          handleSelect(filteredItems[highlightedIndex]);
        } else if (highlightedIndex === createActionIndex) {
          handleCreateNew();
        } else if (filteredItems.length === 1) {
          // If user hit enter and there's exactly 1 match
          handleSelect(filteredItems[0]);
        }
      }
      return;
    }

    if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
      return;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field Container */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            // Dropdown opens on focus
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-3 pr-16 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none font-medium bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-xs"
        />

        {/* Action Controls inside the input (Clear and Toggle Chevron) */}
        <div className="absolute right-2 flex items-center gap-1 text-slate-400">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Bersihkan input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleDropdown}
            className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isOpen ? 'Tutup daftar' : 'Buka daftar master item'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Suggestion Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-150 w-full min-w-0 sm:min-w-[280px] max-w-[calc(100vw-2rem)]"
        >
          {filteredItems.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-0.5">
              {filteredItems.map((item, idx) => {
                const isHighlighted = highlightedIndex === idx;

                return (
                  <button
                    key={item.id}
                    type="button"
                    data-index={idx}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                      isHighlighted
                        ? 'bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isHighlighted
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      <span className="text-xs truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0 ml-2">
                      <span className="uppercase font-semibold">{item.defaultUnit}</span>
                      <span>·</span>
                      <span>{formatRupiah(item.defaultPrice)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-2.5 text-xs text-slate-400 dark:text-slate-500 text-center italic">
              Tidak ada item yang cocok
            </div>
          )}

          {/* Visual Divider */}
          <div className="my-1 border-t border-slate-100 dark:border-slate-800/80" />

          {/* Bottom Action: "+ Buat item baru ke Master" */}
          <button
            type="button"
            data-index={createActionIndex}
            onClick={handleCreateNew}
            onMouseEnter={() => setHighlightedIndex(createActionIndex)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left cursor-pointer transition-colors text-xs font-bold ${
              highlightedIndex === createActionIndex
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Buat item baru ke Master</span>
          </button>
        </div>
      )}
    </div>
  );
};

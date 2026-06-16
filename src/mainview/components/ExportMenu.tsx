import { useState, useRef, useEffect, useCallback } from "react";
import type { ExportMode } from "./SettingsModal";
import { Printer, FileDown, FileCode } from "lucide-react";

type Props = {
  onSelect: (mode: ExportMode) => void;
  disabled: boolean;
};

const ITEMS = [
  { mode: "print" as ExportMode, label: "Print", icon: Printer },
  { mode: "save-pdf" as ExportMode, label: "Save as PDF", icon: FileDown },
  { mode: "save-html" as ExportMode, label: "Export HTML", icon: FileCode },
];

export default function ExportMenu({ onSelect, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activeIndexRef = useRef(0);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const handleItemClick = useCallback((mode: ExportMode) => {
    onSelect(mode);
    setOpen(false);
    triggerRef.current?.focus();
  }, [onSelect]);

  useEffect(() => {
    if (!open) return;
    activeIndexRef.current = 0;
    itemsRef.current[0]?.focus();
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      const next = (activeIndexRef.current + dir + ITEMS.length) % ITEMS.length;
      activeIndexRef.current = next;
      itemsRef.current[next]?.focus();
    }
  }, [close]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        onClick={() => !disabled && setOpen((p) => !p)}
        disabled={disabled}
        aria-label="Print / Export"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`p-2 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 active:scale-95 ${
          disabled
            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
        }`}
      >
        <Printer className="w-4 h-4" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Export options"
          className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 py-1"
          onKeyDown={handleKeyDown}
        >
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.mode}
                ref={(el) => { itemsRef.current[i] = el; }}
                role="menuitem"
                onClick={() => handleItemClick(item.mode)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

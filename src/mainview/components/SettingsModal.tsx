import { useState } from "react";
import Modal from "./Modal";
import type { PrintOptions } from "../utils/print";
import { DEFAULT_PRINT_OPTIONS } from "../utils/print";

export type ExportMode = "print" | "save-pdf" | "save-html";

type Props = {
  open: boolean;
  onClose: () => void;
  onPrint: (options: PrintOptions) => void;
  onSavePdf: (options: PrintOptions) => void;
  mode: ExportMode;
  filename: string | null;
};

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-[var(--border-main)] bg-[var(--bg-editor)] px-3 py-1.5 text-sm text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-[var(--border-main)] bg-[var(--bg-editor)] text-[var(--accent-blue)] focus:ring-[var(--accent-blue)]"
      />
      <span className="text-sm text-[var(--text-main)]">{label}</span>
    </label>
  );
}

export default function SettingsModal({
  open,
  onClose,
  onPrint,
  onSavePdf,
  mode,
  filename,
}: Props) {
  const [options, setOptions] = useState<PrintOptions>({
    ...DEFAULT_PRINT_OPTIONS,
  });

  const update = <K extends keyof PrintOptions>(
    key: K,
    value: PrintOptions[K],
  ) => {
    setOptions((prev: PrintOptions) => ({ ...prev, [key]: value }));
  };

  const handleAction = () => {
    if (mode === "print") {
      onPrint(options);
    } else {
      onSavePdf(options);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={mode === "print" ? "Print" : "Save as PDF"}>
      <div className="space-y-4">
        {filename && (
          <div className="text-xs text-[var(--text-muted)] truncate">
            {filename}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Page size"
            value={options.pageSize}
            onChange={(v) => update("pageSize", v as PrintOptions["pageSize"])}
            options={[
              { value: "a4", label: "A4" },
              { value: "letter", label: "Letter" },
              { value: "legal", label: "Legal" },
            ]}
          />
          <Select
            label="Orientation"
            value={options.orientation}
            onChange={(v) =>
              update("orientation", v as PrintOptions["orientation"])
            }
            options={[
              { value: "portrait", label: "Portrait" },
              { value: "landscape", label: "Landscape" },
            ]}
          />
        </div>

        <Select
          label="Margins"
          value={options.margins}
          onChange={(v) => update("margins", v as PrintOptions["margins"])}
          options={[
            { value: "none", label: "None" },
            { value: "narrow", label: "Narrow (0.5 in)" },
            { value: "normal", label: "Normal (1 in)" },
            { value: "wide", label: "Wide (1.5 in)" },
          ]}
        />

        <div className="space-y-2">
          <Checkbox
            label="Show line numbers"
            checked={options.lineNumbers}
            onChange={(v) => update("lineNumbers", v)}
          />
          <Checkbox
            label="Include table of contents"
            checked={options.tableOfContents}
            onChange={(v) => update("tableOfContents", v)}
          />
        </div>

        <div className="bg-[var(--bg-editor)] border border-[var(--border-main)] rounded-md px-3 py-2 text-xs text-[var(--text-muted)]">
          In the print dialog, uncheck <strong>"Headers and Footers"</strong> to hide date, title, and page number.
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md hover:bg-[var(--accent-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            className="px-3 py-1.5 text-sm rounded-md bg-[var(--accent-blue)] text-white dark:text-[var(--bg-sidebar)] hover:opacity-90 transition-colors font-medium shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
          >
            {mode === "print" ? "Print" : "Save as PDF"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

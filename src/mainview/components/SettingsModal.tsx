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
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
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
        className="rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-400"
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
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
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
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

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
          In the print dialog, uncheck <strong>"Headers and Footers"</strong> to hide date, title, and page number.
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors font-medium"
          >
            {mode === "print" ? "Print" : "Save as PDF"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

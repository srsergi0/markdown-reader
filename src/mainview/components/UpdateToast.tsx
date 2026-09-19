import { useState } from "react";
import { Sparkles, Download, X, ArrowRight, RotateCw, Check } from "lucide-react";
import type { UpdateStatus } from "../desktop";

type ActiveStatus = Extract<
  UpdateStatus,
  { state: "available" | "downloading" | "downloaded" }
>;

type Props = {
  status: ActiveStatus;
  onDownload: () => void;
  onInstall: () => void;
  onClose: () => void;
};

export default function UpdateToast({ status, onDownload, onInstall, onClose }: Props) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
    }, 300); // match animation duration
  };

  const percent = status.state === "downloading" ? Math.round(status.percent) : 0;

  return (
    <div
      className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[100] sm:w-full max-w-sm bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] overflow-hidden backdrop-blur-md bg-opacity-95 ${
        isAnimatingOut ? "animate-slide-out-right" : "animate-slide-in-right"
      }`}
    >
      {/* Top accent line with animated gradient */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="p-4 flex gap-3.5">
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/15 to-purple-500/15 text-[var(--accent-blue)] border border-blue-500/20">
          {status.state === "downloaded" ? (
            <Check className="w-5 h-5 text-emerald-500" />
          ) : (
            <Sparkles className="w-5 h-5 animate-pulse text-blue-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[var(--text-main)] tracking-tight">
              {status.state === "available" && "¡Actualización Disponible!"}
              {status.state === "downloading" && "Descargando actualización…"}
              {status.state === "downloaded" && "Actualización lista"}
            </h4>
            <button
              onClick={handleClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-0.5 rounded-lg hover:bg-[var(--accent-hover)]"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {status.state === "available" && (
            <p className="mt-1 text-xs text-[var(--text-muted)] leading-normal">
              La versión{" "}
              <span className="font-semibold text-[var(--text-main)]">
                v{status.version}
              </span>{" "}
              de Markdown Reader ya está disponible. Descárgala para disfrutar de las
              últimas mejoras.
            </p>
          )}

          {status.state === "downloading" && (
            <div className="mt-2">
              <div className="h-1.5 w-full rounded-full bg-[var(--accent-hover)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                {percent}% completado
              </p>
            </div>
          )}

          {status.state === "downloaded" && (
            <p className="mt-1 text-xs text-[var(--text-muted)] leading-normal">
              La versión{" "}
              <span className="font-semibold text-[var(--text-main)]">
                v{status.version}
              </span>{" "}
              se descargó correctamente. Reinicia para aplicar los cambios.
            </p>
          )}

          <div className="mt-4 flex gap-2 justify-end items-center">
            {status.state === "downloading" ? (
              <button
                onClick={handleClose}
                className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors rounded-md hover:bg-[var(--accent-hover)]"
              >
                Ocultar
              </button>
            ) : (
              <>
                <button
                  onClick={handleClose}
                  className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors rounded-md hover:bg-[var(--accent-hover)]"
                >
                  Más tarde
                </button>
                {status.state === "available" && (
                  <button
                    onClick={onDownload}
                    className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all group overflow-hidden"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar ahora</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
                {status.state === "downloaded" && (
                  <button
                    onClick={onInstall}
                    className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg shadow-md hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all group overflow-hidden"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Reiniciar e instalar</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

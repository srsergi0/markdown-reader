import { Minus, Square, X } from "lucide-react";

type Props = {
  electroview: any;
  onMaximizedChange: (maximized: boolean) => void;
  isMaximized: boolean;
  theme: "light" | "dark";
};

const winBtn = "flex items-center justify-center w-[46px] h-full transition-colors active:scale-95";

export default function TitleBar({ electroview, isMaximized, onMaximizedChange, theme }: Props) {
  const isDark = theme === "dark";
  const bg = isDark ? "bg-[#1a1a1a]" : "bg-white";
  const border = isDark ? "border-b border-[#2a2a2a]" : "border-b border-gray-200";
  const text = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-white/80" : "text-gray-500";
  const hoverBg = isDark ? "hover:bg-white/10" : "hover:bg-gray-100";
  const closeHover = isDark ? "hover:bg-red-500/90" : "hover:bg-red-500";
  const closeText = isDark ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-white";

  const handleMinimize = () => electroview?.proxy?.request?.minimizeWindow?.({});
  const handleMaximize = async () => {
    const res = await electroview?.proxy?.request?.toggleMaximizeWindow?.({});
    if (res) onMaximizedChange(res.isMaximized);
  };
  const handleClose = () => electroview?.proxy?.request?.closeWindow?.({});

  return (
    <div
      className={`flex items-center h-[38px] ${bg} ${border} ${text} select-none`}
      style={{ appRegion: "drag" } as any}
    >
      <div
        className="flex items-center gap-2 px-4 flex-1 min-w-0"
        style={{ appRegion: "drag" } as any}
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-[13px] font-medium tracking-tight">Markdown Reader</span>
      </div>
      <div className="flex h-full" style={{ appRegion: "no-drag" } as any}>
        <button
          onClick={handleMinimize}
          aria-label="Minimize"
          className={`${winBtn} ${hoverBg} ${textMuted} hover:text-inherit`}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          aria-label={isMaximized ? "Restore" : "Maximize"}
          className={`${winBtn} ${hoverBg} ${textMuted} hover:text-inherit`}
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          aria-label="Close"
          className={`${winBtn} ${closeHover} ${closeText}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

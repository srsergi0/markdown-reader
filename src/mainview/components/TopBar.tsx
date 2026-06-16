import { Minus, Square, X, SidebarClose, SidebarOpen, File, FolderOpen, Eye, PenSquare, Sun, Moon } from "lucide-react";
import ExportMenu from "./ExportMenu";
import type { ExportMode } from "./SettingsModal";

type Props = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  activeFile: string | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onExportSelect: (mode: ExportMode) => void;
  electroview: any;
  onMaximizedChange: (maximized: boolean) => void;
  isMaximized: boolean;
};

const btn = "p-2 rounded-md transition-colors active:scale-95";
const winBtn = "flex items-center justify-center w-[46px] h-full transition-colors active:scale-95";

export default function TopBar({
  theme,
  onToggleTheme,
  onOpenFile,
  onOpenFolder,
  isEditing,
  onToggleEdit,
  activeFile,
  sidebarOpen,
  onToggleSidebar,
  onExportSelect,
  electroview,
  isMaximized,
  onMaximizedChange,
}: Props) {
  const isDark = theme === "dark";
  const bg = isDark ? "bg-[#1a1a1a]" : "bg-white";
  const border = isDark ? "border-b border-[#2a2a2a]" : "border-b border-gray-200";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const iconColor = isDark ? "text-gray-400" : "text-gray-500";
  const iconHover = isDark ? "hover:bg-white/10 hover:text-white" : "hover:bg-gray-100 hover:text-gray-900";
  const activeBg = isDark ? "bg-white/10" : "bg-gray-100";
  const winIcon = isDark ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-gray-900";
  const winHover = isDark ? "hover:bg-white/10" : "hover:bg-gray-100";
  const closeHover = isDark ? "hover:bg-red-500/90" : "hover:bg-red-500";
  const closeText = isDark ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-white";

  const handleMinimize = () => electroview?.proxy?.request?.minimizeWindow?.({});
  const handleMaximize = async () => {
    const res = await electroview?.proxy?.request?.toggleMaximizeWindow?.({});
    if (res) onMaximizedChange(res.isMaximized);
  };
  const handleClose = () => electroview?.proxy?.request?.closeWindow?.({});

  return (
    <div className={`flex items-center h-[38px] ${bg} ${border} ${textColor} select-none`} style={{ appRegion: "drag" } as any}>
      <div className="flex items-center gap-1 px-2 flex-1 min-w-0" style={{ appRegion: "drag" } as any}>
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          className={`${btn} ${sidebarOpen ? activeBg : iconHover} ${sidebarOpen ? textColor : iconColor}`}
          style={{ appRegion: "no-drag" } as any}
        >
          {sidebarOpen ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
        </button>
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5" aria-hidden="true" />
        <button
          onClick={onOpenFile}
          aria-label="Open file"
          className={`${btn} ${iconHover} ${iconColor}`}
          style={{ appRegion: "no-drag" } as any}
        >
          <File className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenFolder}
          aria-label="Open folder"
          className={`${btn} ${iconHover} ${iconColor}`}
          style={{ appRegion: "no-drag" } as any}
        >
          <FolderOpen className="w-4 h-4" />
        </button>
        {activeFile && (
          <>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5" aria-hidden="true" />
            <button
              onClick={onToggleEdit}
              aria-label={isEditing ? "View rendered" : "Edit source"}
              className={`${btn} ${isEditing ? activeBg : iconHover} ${isEditing ? textColor : iconColor}`}
              style={{ appRegion: "no-drag" } as any}
            >
              {isEditing ? <Eye className="w-4 h-4" /> : <PenSquare className="w-4 h-4" />}
            </button>
          </>
        )}
      </div>
      <div className="flex items-center h-full" style={{ appRegion: "no-drag" } as any}>
        <ExportMenu onSelect={onExportSelect} disabled={!activeFile} />
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" aria-hidden="true" />
        <button
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className={`${btn} ${iconHover} ${iconColor}`}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" aria-hidden="true" />
        <button
          onClick={handleMinimize}
          aria-label="Minimize"
          className={`${winBtn} ${winHover} ${winIcon}`}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          aria-label={isMaximized ? "Restore" : "Maximize"}
          className={`${winBtn} ${winHover} ${winIcon}`}
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

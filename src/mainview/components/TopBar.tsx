import { Minus, Square, X, PanelLeft, PanelLeftClose, PanelLeftOpen, File, FolderOpen, Eye, PenSquare } from "lucide-react";
import ExportMenu from "./ExportMenu";
import type { ExportMode } from "./SettingsModal";
import ThemeMenu from "./ThemeMenu";

type Props = {
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
  const bg = "bg-[var(--bg-header)]";
  const border = "border-b border-[var(--border-main)]";
  const textColor = "text-[var(--text-main)]";
  const iconColor = "text-[var(--text-muted)]";
  const iconHover = "hover:bg-[var(--accent-hover)] hover:text-[var(--text-main)]";
  const activeBg = "bg-[var(--accent-hover)]";
  const winIcon = "text-[var(--text-muted)] hover:text-[var(--text-main)]";
  const winHover = "hover:bg-[var(--accent-hover)]";
  const closeHover = "hover:bg-red-500/95";
  const closeText = "text-[var(--text-muted)] hover:text-white";

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
          className={`group ${btn} ${sidebarOpen ? activeBg : iconHover} ${sidebarOpen ? textColor : iconColor}`}
          style={{ appRegion: "no-drag" } as any}
        >
          {sidebarOpen ? (
            <>
              <PanelLeft className="w-4 h-4 group-hover:hidden" />
              <PanelLeftClose className="w-4 h-4 hidden group-hover:block" />
            </>
          ) : (
            <>
              <PanelLeft className="w-4 h-4 group-hover:hidden" />
              <PanelLeftOpen className="w-4 h-4 hidden group-hover:block" />
            </>
          )}
        </button>
        <div className="w-px h-4 bg-[var(--border-main)] mx-0.5" aria-hidden="true" />
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
            <div className="w-px h-4 bg-[var(--border-main)] mx-0.5" aria-hidden="true" />
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
        <div className="w-px h-4 bg-[var(--border-main)] mx-1" aria-hidden="true" />
        <ThemeMenu />
        <div className="w-px h-4 bg-[var(--border-main)] mx-1" aria-hidden="true" />
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

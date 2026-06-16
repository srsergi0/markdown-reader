import ExportMenu from "./ExportMenu";
import type { ExportMode } from "./SettingsModal";
import { SidebarClose, SidebarOpen, File, FolderOpen, Eye, PenSquare } from "lucide-react";
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
};

const btn = "p-2 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 active:scale-95";

export default function Toolbar({
  onOpenFile,
  onOpenFolder,
  isEditing,
  onToggleEdit,
  activeFile,
  sidebarOpen,
  onToggleSidebar,
  onExportSelect,
}: Props) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-header)] border-b border-[var(--border-main)] select-none">
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          className={`${btn} ${
            sidebarOpen
              ? "bg-[var(--accent-hover)] text-[var(--accent-blue)]"
              : "hover:bg-[var(--accent-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          {sidebarOpen ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
        </button>
        <div className="w-px h-5 bg-[var(--border-main)] mx-1" aria-hidden="true" />
        <button
          onClick={onOpenFile}
          aria-label="Open file"
          className={`${btn} hover:bg-[var(--accent-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]`}
        >
          <File className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenFolder}
          aria-label="Open folder"
          className={`${btn} hover:bg-[var(--accent-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]`}
        >
          <FolderOpen className="w-4 h-4" />
        </button>
        {activeFile && (
          <>
            <div className="w-px h-5 bg-[var(--border-main)] mx-1" aria-hidden="true" />
            <button
              onClick={onToggleEdit}
              aria-label={isEditing ? "View rendered" : "Edit source"}
              className={`${btn} ${
                isEditing
                  ? "bg-[var(--accent-hover)] text-[var(--accent-blue)]"
                  : "hover:bg-[var(--accent-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              {isEditing ? <Eye className="w-4 h-4" /> : <PenSquare className="w-4 h-4" />}
            </button>
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        <ExportMenu
          onSelect={onExportSelect}
          disabled={!activeFile}
        />
        <div className="w-px h-5 bg-[var(--border-main)]" aria-hidden="true" />
        <ThemeMenu />
      </div>
    </div>
  );
}

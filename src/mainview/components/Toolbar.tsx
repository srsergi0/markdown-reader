import ExportMenu from "./ExportMenu";
import type { ExportMode } from "./SettingsModal";
import { SidebarClose, SidebarOpen, File, FolderOpen, Eye, PenSquare, Sun, Moon } from "lucide-react";

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
};

const btn = "p-2 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 active:scale-95";

export default function Toolbar({
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
}: Props) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-[#191919] border-b border-gray-200 dark:border-gray-800 select-none">
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          className={`${btn} ${
            sidebarOpen
              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          }`}
        >
          {sidebarOpen ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
        </button>
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" aria-hidden="true" />
        <button
          onClick={onOpenFile}
          aria-label="Open file"
          className={`${btn} hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400`}
        >
          <File className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenFolder}
          aria-label="Open folder"
          className={`${btn} hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400`}
        >
          <FolderOpen className="w-4 h-4" />
        </button>
        {activeFile && (
          <>
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" aria-hidden="true" />
            <button
              onClick={onToggleEdit}
              aria-label={isEditing ? "View rendered" : "Edit source"}
              className={`${btn} ${
                isEditing
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
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
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
        <button
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className={`${btn} hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400`}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

import { useState, useCallback } from "react";
import type { FileEntry } from "../../shared/types";
import { ChevronRight, Folder, File, X } from "lucide-react";

type Props = {
  files: FileEntry[];
  activePath: string | null;
  onSelectFile: (entry: FileEntry) => void;
  onClose: () => void;
};

function TreeItem({
  entry,
  activePath,
  onSelectFile,
  depth,
}: {
  entry: FileEntry;
  activePath: string | null;
  onSelectFile: (entry: FileEntry) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleDirKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); setExpanded(true); }
    if (e.key === "ArrowLeft") { e.preventDefault(); setExpanded(false); }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded((p) => !p); }
  }, []);

  if (entry.isDirectory) {
    return (
      <div role="treeitem" aria-expanded={expanded}>
        <button
          onClick={() => setExpanded((p) => !p)}
          onKeyDown={handleDirKeyDown}
          className="w-full text-left px-2 py-0.5 rounded text-[13px] flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 active:bg-gray-200 dark:active:bg-gray-700"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <ChevronRight className={`w-3 h-3 flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${expanded ? "rotate-90" : ""}`} />
          <Folder className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
          <span className="truncate">{entry.name}</span>
        </button>
        {expanded && entry.children && (
          <div role="group">
            {entry.children.map((child) => (
              <TreeItem
                key={child.path}
                entry={child}
                activePath={activePath}
                onSelectFile={onSelectFile}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      role="treeitem"
      onClick={() => onSelectFile(entry)}
      className={`w-full text-left px-2 py-0.5 rounded text-[13px] flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 active:bg-gray-200 dark:active:bg-gray-700 ${
        activePath === entry.path
          ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
      style={{ paddingLeft: `${depth * 12 + 26}px` }}
    >
      <File className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
      <span className="truncate">{entry.name}</span>
    </button>
  );
}

export default function Sidebar({ files, activePath, onSelectFile, onClose }: Props) {
  return (
    <div
      role="tree"
      aria-label="File explorer"
      className="w-64 flex-shrink-0 h-full bg-[#f7f7f5] dark:bg-[#191919] border-r border-gray-200 dark:border-gray-800 flex flex-col select-none"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Workspace
        </span>
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500 gap-1">
            <Folder className="w-8 h-8" />
            <p className="text-xs">Open a folder to start</p>
          </div>
        ) : (
          files.map((entry) => (
            <TreeItem
              key={entry.path}
              entry={entry}
              activePath={activePath}
              onSelectFile={onSelectFile}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  );
}

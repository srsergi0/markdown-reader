import { useRef, useCallback, useEffect, useState } from "react";
import { File, X } from "lucide-react";

export type Tab = {
  id: string;
  path: string;
  filename: string;
};

type Props = {
  tabs: Tab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onReorderTabs?: (fromIndex: number, toIndex: number) => void;
};

export default function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onReorderTabs,
}: Props) {
  const tabListRef = useRef<HTMLDivElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const focusTab = useCallback((index: number) => {
    const el = tabListRef.current?.querySelector<HTMLElement>(`[data-tab-index="${index}"]`);
    el?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let newIndex = -1;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      newIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      newIndex = tabs.length - 1;
    }
    if (newIndex >= 0) {
      onSelectTab(tabs[newIndex].id);
      focusTab(newIndex);
    }
  }, [tabs, onSelectTab, focusTab]);

  useEffect(() => {
    const activeEl = tabListRef.current?.querySelector<HTMLElement>(
      `[data-tab-id="${activeTabId}"]`,
    );
    if (activeEl && document.activeElement?.closest('[role="tablist"]')) {
      activeEl.focus();
    }
  }, [activeTabId]);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex !== null && dragIndex !== index) {
      onReorderTabs?.(dragIndex, index);
      setDragIndex(index);
    }
  }, [dragIndex, onReorderTabs]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
  }, []);

  if (tabs.length === 0) return null;

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-label="Open files"
      className="flex items-center bg-[#f7f7f5] dark:bg-[#191919] border-b border-gray-200 dark:border-gray-800 overflow-x-auto"
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            role="tab"
            data-tab-id={tab.id}
            data-tab-index={index}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            draggable
            onClick={() => onSelectTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`group flex items-center gap-1.5 px-3 py-1.5 text-[13px] cursor-pointer border-r border-gray-200 dark:border-gray-800 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-[-2px] relative select-none ${
              isActive
                ? "bg-white dark:bg-[#252525] text-gray-900 dark:text-gray-100"
                : "bg-[#f7f7f5] dark:bg-[#191919] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            } ${dragIndex === index ? "opacity-50" : ""}`}
            style={isActive ? { boxShadow: "inset 0 -2px 0 #3b82f6" } : undefined}
          >
            <File className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="max-w-32 truncate">{tab.filename}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              aria-label={`Close ${tab.filename}`}
              className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-opacity opacity-0 group-hover:opacity-100 focus-visible:opacity-100 active:scale-90"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

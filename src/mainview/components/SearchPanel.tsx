import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";

type SearchResult = {
  path: string;
  filename: string;
  line: number;
  content: string;
};

type Props = {
  folderPath: string;
  electroview: any;
  onSelectFile: (path: string) => void;
  onClose: () => void;
};

export default function SearchPanel({ folderPath, electroview, onSelectFile, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [grouped, setGrouped] = useState<Record<string, SearchResult[]>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (!q.trim() || !folderPath || !electroview) {
      setGrouped({});
      return;
    }
    setLoading(true);
    try {
      const res = await electroview.proxy.request.searchInFolder({ path: folderPath, query: q });
      const items: SearchResult[] = res || [];
      const g: Record<string, SearchResult[]> = {};
      for (const r of items) {
        if (!g[r.filename]) g[r.filename] = [];
        g[r.filename].push(r);
      }
      setGrouped(g);
    } catch {
      setGrouped({});
    }
    setLoading(false);
  }, [folderPath, electroview]);

  const groupedKeys = Object.keys(grouped);

  return (
    <div className="w-72 flex-shrink-0 h-full bg-[#f7f7f5] dark:bg-[#191919] border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Search</span>
        <button onClick={onClose} aria-label="Close search" className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search files..."
            value={query}
            onChange={(e) => doSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            className="w-full pl-7 pr-2 py-1 text-[13px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1 text-[13px]">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-gray-400 dark:text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Searching...</span>
          </div>
        )}
        {!loading && query && groupedKeys.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">No results</div>
        )}
        {!loading && groupedKeys.map((filename) => (
          <div key={filename}>
            <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
              {filename} ({grouped[filename].length})
            </div>
            {grouped[filename].map((r, i) => (
              <button
                key={`${r.path}-${r.line}-${i}`}
                onClick={() => onSelectFile(r.path)}
                className="w-full text-left px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">L{r.line}</span>
                  <span className="truncate text-xs">{r.content}</span>
                </div>
              </button>
            ))}
          </div>
        ))}
        {!query && !loading && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-xs">
            Type to search across all files
          </div>
        )}
      </div>
    </div>
  );
}

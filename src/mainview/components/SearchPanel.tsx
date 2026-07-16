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
  onSelectFile: (path: string, line: number) => void;
  onClose: () => void;
};

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <span>{text}</span>;
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-amber-500/25 text-[var(--text-main)] rounded-sm px-0.5 font-medium border border-amber-500/10">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function SearchPanel({ folderPath, electroview, onSelectFile, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [grouped, setGrouped] = useState<Record<string, SearchResult[]>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const lastQueryRef = useRef("");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    setQuery(q);
    lastQueryRef.current = q;
    if (!q.trim() || !folderPath || !electroview) {
      setGrouped({});
      return;
    }
    setLoading(true);
    try {
      const res = await electroview.proxy.request.searchInFolder({ path: folderPath, query: q });
      if (lastQueryRef.current !== q) {
        return;
      }
      const items: SearchResult[] = res || [];
      const g: Record<string, SearchResult[]> = {};
      for (const r of items) {
        if (!g[r.filename]) g[r.filename] = [];
        g[r.filename].push(r);
      }
      setGrouped(g);
    } catch {
      if (lastQueryRef.current === q) {
        setGrouped({});
      }
    } finally {
      if (lastQueryRef.current === q) {
        setLoading(false);
      }
    }
  }, [folderPath, electroview]);

  const groupedKeys = Object.keys(grouped);

  return (
    <div className="w-72 flex-shrink-0 h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-main)] flex flex-col select-none">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-main)]">
        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Search in Workspace</span>
        <button onClick={onClose} aria-label="Close search" className="p-1 rounded hover:bg-[var(--accent-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus-visible:outline-2 focus-visible:outline-blue-500">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-3 py-2 border-b border-[var(--border-main)]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search files..."
            value={query}
            onChange={(e) => doSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            className="w-full pl-8 pr-2 py-1.5 text-[13px] bg-[var(--bg-editor)] border border-[var(--border-main)] rounded-md text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-all duration-200"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-[var(--text-muted)] animate-fade-in">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-blue)]" />
            <span className="text-xs">Searching...</span>
          </div>
        )}
        {!loading && query && groupedKeys.length === 0 && (
          <div className="text-center py-8 text-[var(--text-muted)] text-xs animate-fade-in">No results found</div>
        )}
        {!loading && groupedKeys.map((filename) => (
          <div key={filename} className="mb-3 px-2 animate-fade-in">
            <div className="px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)] truncate flex items-center gap-2 bg-[var(--accent-hover)]/30 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] shrink-0" />
              <span className="truncate">{filename}</span>
              <span className="ml-auto text-[10px] font-normal text-[var(--text-muted)] bg-[var(--bg-editor)] px-1.5 py-0.5 rounded border border-[var(--border-main)]">
                {grouped[filename].length}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
              {grouped[filename].map((r, i) => (
                <button
                  key={`${r.path}-${r.line}-${i}`}
                  onClick={() => onSelectFile(r.path, r.line)}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[var(--accent-hover)] text-[var(--text-main)] transition-all duration-150 hover:translate-x-0.5 rounded-md flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-blue-500 active:scale-[0.98]"
                >
                  <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-editor)] border border-[var(--border-main)] px-1 py-0.5 rounded shrink-0 font-mono">
                    L{r.line}
                  </span>
                  <span className="truncate text-xs text-[var(--text-main)] w-full">
                    <HighlightedText text={r.content} highlight={query} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {!query && !loading && (
          <div className="text-center py-8 text-[var(--text-muted)] text-xs animate-fade-in">
            Type to search across all files
          </div>
        )}
      </div>
    </div>
  );
}


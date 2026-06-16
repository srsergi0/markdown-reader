import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    background: "transparent",
    primaryColor: "#3b82f6",
    primaryBorderColor: "#2563eb",
    primaryTextColor: "#1f2937",
    lineColor: "#9ca3af",
    secondaryColor: "#e5e7eb",
    tertiaryColor: "#f3f4f6",
    fontSize: "14px",
  },
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
});

type Props = {
  code: string;
};

export default function MermaidRenderer({ code }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        setError(null);
        const id = "mermaid-" + Math.random().toString(36).slice(2, 9);
        const { svg: result } = await mermaid.render(id, code);
        if (!cancelled) setSvg(result);
      } catch (err) {
        if (!cancelled) setError(String(err));
      }
    }
    render();
    return () => { cancelled = true; };
  }, [code]);

  useEffect(() => {
    if (!containerRef.current || !svg) return;
    const wrapper = containerRef.current.querySelector(".mermaid-svg-wrapper") as HTMLElement;
    if (!wrapper) return;
    const svgEl = wrapper.querySelector("svg") as SVGSVGElement | null;
    if (svgEl) {
      svgRef.current = svgEl;
      svgEl.style.maxWidth = "none";
      svgEl.style.cursor = "grab";
    }
  }, [svg]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((z) => Math.max(0.1, Math.min(10, z * delta)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { x: pan.x, y: pan.y };
    if (svgRef.current) svgRef.current.style.cursor = "grabbing";
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  }, []);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
    if (svgRef.current) svgRef.current.style.cursor = "grab";
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(10, z * 1.3)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.1, z / 1.3)), []);

  if (error) {
    return (
      <div role="alert" className="my-3 p-3 border border-red-300 dark:border-red-700 rounded bg-red-50 dark:bg-red-900/20">
        <p className="text-xs text-red-600 dark:text-red-400 font-mono mb-1">Mermaid error:</p>
        <pre className="text-xs text-red-500 dark:text-red-300 whitespace-pre-wrap font-mono">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div role="status" aria-live="polite" className="my-3 flex items-center justify-center min-h-[100px] text-gray-400 dark:text-gray-500 text-sm">
        Rendering diagram...
      </div>
    );
  }

  return (
    <div className="my-3">
      <div className="flex items-center gap-1 mb-1 px-1">
        <button onClick={zoomIn} aria-label="Zoom in" title="Zoom in" className="p-2 rounded hover:bg-[var(--accent-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] focus-visible:outline-2 focus-visible:outline-blue-500 active:scale-90">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={zoomOut} aria-label="Zoom out" title="Zoom out" className="p-2 rounded hover:bg-[var(--accent-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] focus-visible:outline-2 focus-visible:outline-blue-500 active:scale-90">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={resetView} aria-label="Reset view" title="Reset view" className="p-2 rounded hover:bg-[var(--accent-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] focus-visible:outline-2 focus-visible:outline-blue-500 active:scale-90">
          <RotateCcw className="w-4 h-4" />
        </button>
        <span className="text-xs text-[var(--text-muted)] ml-auto">{Math.round(zoom * 100)}%</span>
      </div>
      <div
        ref={containerRef}
        className="relative overflow-hidden border border-[var(--border-main)] rounded-lg bg-[var(--bg-editor)]"
        style={{ minHeight: "100px", userSelect: dragging.current ? "none" : undefined }}
      >
        <div
          className="mermaid-svg-wrapper"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            transition: dragging.current ? "none" : "transform 0.1s",
            cursor: dragging.current ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={resetView}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}

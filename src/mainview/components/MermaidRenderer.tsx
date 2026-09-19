import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useTheme } from "../App";

const APP_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif";

type MermaidPalette = {
  text: string;
  textMuted: string;
  bg: string;
  bgAlt: string;
  border: string;
  accent: string;
};

function readPalette(): MermaidPalette {
  const fallback: MermaidPalette = {
    text: "#24292f",
    textMuted: "#57606a",
    bg: "#ffffff",
    bgAlt: "#f6f8fa",
    border: "#d0d7de",
    accent: "#0969da",
  };
  try {
    const cs = getComputedStyle(document.documentElement);
    const get = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb;
    return {
      text: get("--text-main", fallback.text),
      textMuted: get("--text-muted", fallback.textMuted),
      bg: get("--bg-editor", fallback.bg),
      bgAlt: get("--bg-sidebar", fallback.bgAlt),
      border: get("--border-main", fallback.border),
      accent: get("--accent-blue", fallback.accent),
    };
  } catch {
    return fallback;
  }
}

// Build Mermaid colors from the active app theme so diagrams always match
// (all 16 themes) and keep contrast in both light and dark modes.
function configureMermaid(isDark: boolean) {
  const p = readPalette();
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    fontFamily: APP_FONT,
    themeVariables: {
      darkMode: isDark,
      background: "transparent",
      fontSize: "14px",
      primaryColor: p.bgAlt,
      primaryBorderColor: p.accent,
      primaryTextColor: p.text,
      secondaryColor: p.bg,
      secondaryBorderColor: p.border,
      secondaryTextColor: p.text,
      tertiaryColor: p.bg,
      tertiaryBorderColor: p.border,
      tertiaryTextColor: p.textMuted,
      lineColor: p.textMuted,
      textColor: p.text,
      mainBkg: p.bg,
      nodeBorder: p.accent,
      clusterBkg: p.bgAlt,
      clusterBorder: p.border,
      defaultLinkColor: p.textMuted,
      titleColor: p.text,
      edgeLabelBackground: p.bg,
      labelColor: p.text,
      errorBkgColor: isDark ? "#5a1f1f" : "#f8d7da",
      errorTextColor: isDark ? "#f5c6cb" : "#721c24",
      // Sequence diagrams
      actorBorder: p.border,
      actorBkg: p.bgAlt,
      actorTextColor: p.text,
      actorLineColor: p.textMuted,
      signalColor: p.text,
      signalTextColor: p.text,
      labelBoxBkgColor: p.bgAlt,
      labelBoxBorderColor: p.border,
      labelTextColor: p.text,
      loopTextColor: p.text,
      activationBorderColor: p.accent,
      activationBkgColor: p.bgAlt,
      sequenceNumberColor: p.text,
      // Notes
      noteBkgColor: p.bgAlt,
      noteTextColor: p.text,
      noteBorderColor: p.border,
      // Class diagrams
      classText: p.text,
      // Gantt
      taskTextColor: p.text,
      taskTextOutsideColor: p.textMuted,
      // Pie
      pieTitleTextColor: p.text,
      pieSectionTextColor: p.textMuted,
      pieLegendTextColor: p.text,
    },
    themeCSS: `
      .edgeLabel { background-color: ${p.bg}; }
      .edgeLabel span, .edgeLabel p { color: ${p.text}; }
    `,
    flowchart: { htmlLabels: true, curve: "basis" },
  });
}

type Props = {
  code: string;
};

type Rgb = { r: number; g: number; b: number };

function parseColorToRgb(color: string): Rgb | null {
  const c = color.trim().toLowerCase();
  if (!c || c === "none" || c === "transparent") return null;
  let m = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(c);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split("").map((ch) => ch + ch).join("");
    if (h.length === 8) h = h.slice(0, 6);
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  m = /^rgba?\(\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)/.exec(c);
  if (m) {
    const ch = (v: string) =>
      v.endsWith("%") ? Math.round((parseFloat(v) / 100) * 255) : Math.round(parseFloat(v));
    return { r: ch(m[1]), g: ch(m[2]), b: ch(m[3]) };
  }
  const named: Record<string, string> = {
    black: "#000000",
    white: "#ffffff",
    red: "#ff0000",
    green: "#008000",
    blue: "#0000ff",
    yellow: "#ffff00",
    gray: "#808080",
    grey: "#808080",
    pink: "#ffc0cb",
    orange: "#ffa500",
    purple: "#800080",
  };
  if (named[c]) return parseColorToRgb(named[c]);
  return null;
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(fg: string, bg: string): number | null {
  const a = parseColorToRgb(fg);
  const b = parseColorToRgb(bg);
  if (!a || !b) return null;
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function readableTextColor(bg: string, preferred: string): string {
  const cPref = contrastRatio(preferred, bg);
  const cWhite = contrastRatio("#ffffff", bg) ?? 0;
  const cBlack = contrastRatio("#000000", bg) ?? 0;
  if (cPref !== null && cPref >= 4.5) return preferred;
  if (cPref !== null && cPref >= Math.max(cWhite, cBlack)) return preferred;
  return cWhite >= cBlack ? "#ffffff" : "#000000";
}

// Documents can force light fills via `style ... fill:#...`, which then clash
// with dark theme text (or vice versa). Once the SVG is in the live DOM, walk
// it using computed styles and force any low-contrast label back to readable.
function fixLiveContrast(root: HTMLElement, palette: MermaidPalette) {
  const computedFill = (el: Element): string | null => {
    try {
      const f = getComputedStyle(el).fill;
      if (f && f !== "none") return f;
    } catch {}
    return null;
  };

  const computedColor = (el: Element): string | null => {
    try {
      return getComputedStyle(el).color || null;
    } catch {}
    return null;
  };

  const backgroundFor = (el: Element): string => {
    const node = el.closest(".node, .cluster, .actor, .note");
    if (node) {
      const shapes = node.querySelectorAll("rect, polygon, circle, ellipse, path");
      for (const s of Array.from(shapes)) {
        const f = computedFill(s);
        if (f && parseColorToRgb(f)) return f;
      }
    }
    return palette.bg;
  };

  root.querySelectorAll("text").forEach((t) => {
    const current = computedFill(t) || palette.text;
    const bg = backgroundFor(t);
    const ratio = contrastRatio(current, bg);
    if (ratio !== null && ratio >= 4.5) return;
    const fixed = readableTextColor(bg, palette.text);
    (t as unknown as SVGElement).style.fill = fixed;
    t.setAttribute("fill", fixed);
  });

  root
    .querySelectorAll("foreignObject div, .edgeLabel span, .nodeLabel, .label span")
    .forEach((d) => {
      const el = d as unknown as Element;
      const current = computedColor(el);
      if (!current) return;
      const bg = backgroundFor(el);
      const ratio = contrastRatio(current, bg);
      if (ratio !== null && ratio >= 4.5) return;
      (d as HTMLElement).style.color = readableTextColor(bg, palette.text);
    });
}

export default function MermaidRenderer({ code }: Props) {
  const { theme, themeId } = useTheme();
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
    let raf = 0;
    async function render() {
      try {
        setError(null);
        configureMermaid(theme === "dark");
        const id = "mermaid-" + Math.random().toString(36).slice(2, 9);
        const { svg: result } = await mermaid.render(id, code);
        if (!cancelled) setSvg(result);
      } catch (err) {
        if (!cancelled) setError(String(err));
      }
    }
    // Defer a frame so the new theme classes are applied before reading CSS vars.
    raf = requestAnimationFrame(() => {
      render();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [code, theme, themeId]);

  useEffect(() => {
    if (!containerRef.current || !svg) return;
    const wrapper = containerRef.current.querySelector(".mermaid-svg-wrapper") as HTMLElement;
    if (!wrapper) return;
    const svgEl = wrapper.querySelector("svg") as SVGSVGElement | null;
    if (svgEl) {
      svgRef.current = svgEl;
      // Keep Mermaid's own max-width so diagrams render at a readable
      // natural size instead of stretching to the container width.
      svgEl.style.display = "block";
      svgEl.style.margin = "0 auto";
      svgEl.style.cursor = "grab";
    }
    fixLiveContrast(wrapper, readPalette());
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
        className="relative overflow-hidden border border-[var(--border-main)] rounded-lg bg-[var(--bg-editor)] p-2"
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

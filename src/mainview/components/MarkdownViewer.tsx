import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "../App";
import MermaidRenderer from "./MermaidRenderer";
import { FileText, ChevronRight, Check } from "lucide-react";

type Props = {
  content: string;
  onOpenLink?: (href: string) => void;
};

type HeadingItem = {
  text: string;
  level: number;
  id: string;
  parentId: string | null;
};

// Helper to extract text content from react-markdown children recursively
const getHeadingText = (children: React.ReactNode): string => {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map(getHeadingText).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    return getHeadingText((children as any).props.children);
  }
  return "";
};

// Helper to generate a clean anchor ID from text
const getHeadingId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Helper to parse headings directly from raw markdown string
const extractHeadings = (markdown: string) => {
  const lines = markdown.split("\n");
  const list: HeadingItem[] = [];
  let inCodeBlock = false;
  
  const levelParents: Record<number, string | null> = {
    1: null, 2: null, 3: null, 4: null, 5: null, 6: null
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      const cleanText = rawText
        .replace(/[*_`[\]]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      const id = getHeadingId(cleanText);
      
      const parentId = level > 1 ? levelParents[level - 1] : null;
      levelParents[level] = id;
      for (let l = level + 1; l <= 6; l++) {
        levelParents[l] = null;
      }
      
      list.push({ text: cleanText, level, id, parentId });
    }
  }
  return list;
};

function BreadcrumbSegment({
  item,
  headings,
  onSelect,
}: {
  item: HeadingItem;
  headings: HeadingItem[];
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 250);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const siblings = useMemo(() => {
    return headings.filter(
      (h) => h.level === item.level && h.parentId === item.parentId
    );
  }, [headings, item]);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center h-full"
    >
      <button
        onClick={() => onSelect(item.id)}
        className={`px-2 py-0.5 rounded transition-all text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100/50 dark:hover:bg-white/5 font-medium truncate max-w-[140px] text-xs ${
          open ? "text-blue-500 dark:text-blue-400 bg-gray-100/50 dark:bg-white/5" : ""
        }`}
      >
        {item.text}
      </button>

      {/* Segment Sibling Dropdown Menu */}
      {open && siblings.length > 1 && (
        <div 
          className="absolute left-0 mt-1 min-w-[200px] max-w-[280px] bg-white/85 dark:bg-[#121214]/90 backdrop-blur-xl border border-gray-200/50 dark:border-white/5 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-1 z-50 animate-scale-in max-h-60 overflow-y-auto custom-scrollbar select-none flex flex-col gap-0.5"
          style={{ top: "100%" }}
        >
          {siblings.map((sibling) => {
            const isSelf = sibling.id === item.id;
            return (
              <button
                key={sibling.id}
                onClick={() => {
                  onSelect(sibling.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs truncate rounded-lg transition-all duration-150 flex items-center justify-between hover:translate-x-0.5 ${
                  isSelf 
                    ? "text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/10 font-semibold" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="truncate">{sibling.text}</span>
                {isSelf && <Check className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CodeBlock({
  className,
  children,
  style,
}: {
  className?: string;
  children?: React.ReactNode;
  style: Record<string, React.CSSProperties>;
}) {
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");
  if (match) {
    if (match[1] === "mermaid") {
      return <MermaidRenderer code={code} />;
    }
    return (
      <SyntaxHighlighter
        style={style}
        language={match[1]}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: "6px", fontSize: "13px" }}
      >
        {code}
      </SyntaxHighlighter>
    );
  }
  return (
    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[13px]">
      {children}
    </code>
  );
}

export default function MarkdownViewer({ content, onOpenLink }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const highlighterStyle = isDark ? oneDark : oneLight;

  const headings = useMemo(() => extractHeadings(content), [content]);

  const [activeId, setActiveId] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Ref to lock scroll spy during smooth scroll navigation
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const headers = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
    if (headers.length === 0) return;

    // Boundary check: if scrolled to the very bottom, activate the last heading
    const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 15;
    if (isAtBottom) {
      setActiveId(headers[headers.length - 1].id);
      return;
    }

    let currentActive = headers[0].id;
    const containerRect = container.getBoundingClientRect();
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const rect = header.getBoundingClientRect();
      if (rect.top - containerRect.top <= 140) {
        currentActive = header.id;
      } else {
        break;
      }
    }
    
    setActiveId(currentActive);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    handleScroll();
    
    const timer = setTimeout(() => {
      handleScroll();
    }, 150);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [content, handleScroll]);

  // Compute active hierarchy path (e.g. H1 > H2 > H3)
  const activePath = useMemo(() => {
    if (!activeId || headings.length === 0) return [];
    
    const path: HeadingItem[] = [];
    let current = headings.find(h => h.id === activeId);
    
    while (current) {
      path.push(current);
      if (current.parentId) {
        current = headings.find(h => h.id === current.parentId);
      } else {
        break;
      }
    }
    
    return path.reverse();
  }, [activeId, headings]);

  const handleSegmentSelect = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Lock the scroll spy to prevent intermediate segment jumping during smooth scrolling
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    // Instantly set the active ID so breadcrumbs update immediately
    setActiveId(id);

    el.scrollIntoView({ behavior: "smooth" });

    // Unlock scroll spy after smooth scroll completes (typically ~800ms)
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  }, []);

  const components: Components = {
    h1: ({ children, ...props }) => {
      const text = getHeadingText(children);
      const id = getHeadingId(text);
      return (
        <h1
          id={id}
          className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-100 dark:border-gray-800 scroll-mt-20"
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }) => {
      const text = getHeadingText(children);
      const id = getHeadingId(text);
      return (
        <h2
          id={id}
          className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100 pb-1 scroll-mt-20"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }) => {
      const text = getHeadingText(children);
      const id = getHeadingId(text);
      return (
        <h3
          id={id}
          className="text-xl font-semibold mt-5 mb-2 text-gray-900 dark:text-gray-100 scroll-mt-20"
          {...props}
        >
          {children}
        </h3>
      );
    },
    h4: ({ children, ...props }) => {
      const text = getHeadingText(children);
      const id = getHeadingId(text);
      return (
        <h4
          id={id}
          className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100 scroll-mt-20"
          {...props}
        >
          {children}
        </h4>
      );
    },
    h5: ({ children, ...props }) => {
      const text = getHeadingText(children);
      const id = getHeadingId(text);
      return (
        <h5
          id={id}
          className="text-base font-semibold mt-3 mb-1 text-gray-900 dark:text-gray-100 scroll-mt-20"
          {...props}
        >
          {children}
        </h5>
      );
    },
    h6: ({ children, ...props }) => {
      const text = getHeadingText(children);
      const id = getHeadingId(text);
      return (
        <h6
          id={id}
          className="text-sm font-semibold mt-3 mb-1 text-gray-500 dark:text-gray-400 scroll-mt-20"
          {...props}
        >
          {children}
        </h6>
      );
    },
    p: ({ children, ...props }) => (
      <p className="mb-3 leading-[1.7] text-gray-800 dark:text-gray-200" {...props}>
        {children}
      </p>
    ),
    a: ({ children, href, ...props }) => {
      const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (
          href &&
          (href.toLowerCase().endsWith(".md") || href.toLowerCase().endsWith(".markdown")) &&
          !/^https?:\/\//i.test(href) &&
          onOpenLink
        ) {
          e.preventDefault();
          onOpenLink(href);
        }
      };
      return (
        <a
          href={href}
          onClick={handleClick}
          className="text-gray-900 dark:text-gray-100 underline decoration-gray-300 dark:decoration-gray-600 underline-offset-2 hover:decoration-gray-900 dark:hover:decoration-gray-100"
          target={href && /^https?:\/\//i.test(href) ? "_blank" : undefined}
          rel="noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    ul: ({ children, ...props }) => (
      <ul className="list-disc pl-6 mb-3 space-y-1 text-gray-800 dark:text-gray-200" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal pl-6 mb-3 space-y-1 text-gray-800 dark:text-gray-200" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="leading-[1.7]" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-2 border-gray-300 dark:border-gray-600 pl-4 py-1 mb-3 text-gray-600 dark:text-gray-400"
        {...props}
      >
        {children}
      </blockquote>
    ),
    code: ({ className, children, ...props }) => {
      if (className) {
        return (
          <CodeBlock className={className} style={highlighterStyle}>
            {children}
          </CodeBlock>
        );
      }
      return (
        <code
          className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[13px] text-gray-900 dark:text-gray-100"
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <pre className="mb-3 rounded-lg overflow-x-auto" {...props}>
        {children}
      </pre>
    ),
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto mb-3">
        <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => (
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }) => (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th className="border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-left font-medium text-gray-900 dark:text-gray-100" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-gray-800 dark:text-gray-200" {...props}>
        {children}
      </td>
    ),
    hr: (props) => (
      <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />
    ),
    img: ({ src, alt, ...props }) => (
      <img
        src={src}
        alt={alt || ""}
        className="max-w-full h-auto rounded my-4 mx-auto"
        loading="lazy"
        {...props}
      />
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),
    del: ({ children, ...props }) => (
      <del className="line-through text-gray-500 dark:text-gray-400" {...props}>
        {children}
      </del>
    ),
    input: ({ type, checked, ...props }) => {
      if (type === "checkbox") {
        return (
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mr-1.5"
            {...props}
          />
        );
      }
      return <input type={type} {...props} />;
    },
    details: ({ children, ...props }) => (
      <details className="mb-3" {...props}>
        {children}
      </details>
    ),
    summary: ({ children, ...props }) => (
      <summary className="cursor-pointer font-medium text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300" {...props}>
        {children}
      </summary>
    ),
  };

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-4">
        <FileText className="w-12 h-12" strokeWidth={1.5} />
        <div className="text-center">
          <p className="text-sm">Drop a Markdown file here</p>
          <p className="text-xs mt-1">or use the toolbar to open a file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden relative bg-white dark:bg-[#191919]">
      {/* Floating Glass Breadcrumbs Bar */}
      {activePath.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-white/75 dark:bg-[#18181a]/80 backdrop-blur-md border border-gray-200 dark:border-gray-800/80 rounded-full px-4 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.45)] select-none">
          {activePath.map((item, index) => (
            <div key={item.id} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-450 dark:text-gray-600 shrink-0" />
              )}
              <BreadcrumbSegment
                item={item}
                headings={headings}
                onSelect={handleSegmentSelect}
              />
            </div>
          ))}
        </div>
      )}

      {/* Main content scroll area */}
      <div 
        ref={scrollContainerRef}
        className="h-full overflow-y-auto px-8 py-8 relative custom-scrollbar scroll-smooth" 
        id="markdown-content-scroll"
      >
        <div className="max-w-3xl mx-auto pt-14">
          <Markdown remarkPlugins={[remarkGfm]} components={components}>
            {content}
          </Markdown>
        </div>
      </div>
    </div>
  );
}

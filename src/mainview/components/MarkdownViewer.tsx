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
import { FileText } from "lucide-react";

type Props = {
  content: string;
};

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

export default function MarkdownViewer({ content }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const highlighterStyle = isDark ? oneDark : oneLight;

  const components: Components = {
    h1: ({ children, ...props }) => (
      <h1
        className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100 pb-2"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100 pb-1"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-900 dark:text-gray-100" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100" {...props}>
        {children}
      </h4>
    ),
    h5: ({ children, ...props }) => (
      <h5 className="text-base font-semibold mt-3 mb-1 text-gray-900 dark:text-gray-100" {...props}>
        {children}
      </h5>
    ),
    h6: ({ children, ...props }) => (
      <h6 className="text-sm font-semibold mt-3 mb-1 text-gray-500 dark:text-gray-400" {...props}>
        {children}
      </h6>
    ),
    p: ({ children, ...props }) => (
      <p className="mb-3 leading-[1.7] text-gray-800 dark:text-gray-200" {...props}>
        {children}
      </p>
    ),
    a: ({ children, href, ...props }) => (
      <a
        href={href}
        className="text-gray-900 dark:text-gray-100 underline decoration-gray-300 dark:decoration-gray-600 underline-offset-2 hover:decoration-gray-900 dark:hover:decoration-gray-100"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
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
    <div className="p-8 max-w-4xl mx-auto">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
}

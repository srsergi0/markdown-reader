import { useEffect, useCallback, useRef, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "../App";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

const editorStyles = `
  .md-editor .bn-editor {
    padding-inline: 54px;
    padding-block: 32px;
  }
  .md-editor .bn-block-content[data-content-type="heading"][data-level="1"] {
    font-size: 1.875rem !important;
    font-weight: 700 !important;
    margin-top: 2rem !important;
    margin-bottom: 1rem !important;
    padding-bottom: 0.5rem !important;
  }
  .md-editor .bn-block-content[data-content-type="heading"][data-level="2"] {
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    margin-top: 1.5rem !important;
    margin-bottom: 0.75rem !important;
    padding-bottom: 0.25rem !important;
  }
  .md-editor .bn-block-content[data-content-type="heading"][data-level="3"] {
    font-size: 1.25rem !important;
    font-weight: 600 !important;
    margin-top: 1.25rem !important;
    margin-bottom: 0.5rem !important;
  }
  .md-editor .bn-block-content[data-content-type="heading"][data-level="4"] {
    font-size: 1.125rem !important;
    font-weight: 600 !important;
    margin-top: 1rem !important;
    margin-bottom: 0.5rem !important;
  }
  .md-editor .bn-block-content[data-content-type="heading"][data-level="5"] {
    font-size: 1rem !important;
    font-weight: 600 !important;
    margin-top: 0.75rem !important;
    margin-bottom: 0.25rem !important;
  }
  .md-editor .bn-block-content[data-content-type="heading"][data-level="6"] {
    font-size: 0.875rem !important;
    font-weight: 600 !important;
    margin-top: 0.75rem !important;
    margin-bottom: 0.25rem !important;
    color: #6b7280 !important;
  }
  .md-editor .bn-block-content[data-content-type="paragraph"] {
    line-height: 1.7 !important;
  }
  .md-editor .bn-block-content[data-content-type="paragraph"] .bn-inline-content {
    margin-bottom: 0.75rem !important;
  }
  .md-editor .bn-block-content[data-content-type="bulletListItem"],
  .md-editor .bn-block-content[data-content-type="numberedListItem"] {
    line-height: 1.7 !important;
  }
  .md-editor .bn-block-content[data-content-type="quote"] blockquote {
    border-left: 2px solid #d1d5db !important;
    padding-left: 1rem !important;
    padding-block: 0.25rem !important;
    margin-bottom: 0.75rem !important;
    color: #6b7280 !important;
  }
  .md-editor .bn-block-content[data-content-type="codeBlock"] {
    border-radius: 0.5rem !important;
    margin-bottom: 0.75rem !important;
  }
  .md-editor .bn-block-content[data-content-type="table"] table {
    border-collapse: collapse !important;
    width: 100% !important;
    margin-bottom: 0.75rem !important;
  }
  .md-editor .bn-block-content[data-content-type="table"] th,
  .md-editor .bn-block-content[data-content-type="table"] td {
    border: 1px solid #d1d5db !important;
    padding: 0.375rem 0.75rem !important;
  }
  .md-editor .bn-block-content[data-content-type="table"] th {
    font-weight: 500 !important;
  }
  .md-editor .bn-block-content[data-content-type="checkListItem"] {
    line-height: 1.7 !important;
  }
  .md-editor .bn-block-content[data-content-type="divider"] hr {
    margin-block: 1.5rem !important;
  }
  .dark.md-editor .bn-block-content[data-content-type="quote"] blockquote {
    border-left-color: #4b5563 !important;
    color: #9ca3af !important;
  }
  .dark.md-editor .bn-block-content[data-content-type="table"] th,
  .dark.md-editor .bn-block-content[data-content-type="table"] td {
    border-color: #374151 !important;
  }
`;

type Props = {
  content: string;
  onSave: (content: string) => void;
};

export default function MarkdownEditor({ content, onSave }: Props) {
  const { theme } = useTheme();
  const [hasChanges, setHasChanges] = useState(false);
  const contentRef = useRef(content);
  const loadedRef = useRef(false);
  const programmaticUpdate = useRef(false);

  const editor = useCreateBlockNote();

  useEffect(() => {
    if (loadedRef.current && contentRef.current === content) return;
    loadedRef.current = true;
    programmaticUpdate.current = true;
    try {
      const blocks = editor.tryParseMarkdownToBlocks(content);
      editor.replaceBlocks(editor.document, blocks);
      contentRef.current = content;
      setHasChanges(false);
    } finally {
      programmaticUpdate.current = false;
    }
  }, [content, editor]);

  const handleChange = useCallback(() => {
    if (programmaticUpdate.current) return;
    const md = editor.blocksToMarkdownLossy(editor.document);
    setHasChanges(md !== contentRef.current);
  }, [editor]);

  const handleSave = useCallback(() => {
    if (!hasChanges) return;
    const md = editor.blocksToMarkdownLossy(editor.document);
    onSave(md);
    contentRef.current = md;
    setHasChanges(false);
  }, [hasChanges, onSave, editor]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 z-10">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Editing
        </span>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <style>{editorStyles}</style>
        <div className={`md-editor max-w-4xl mx-auto ${theme === "dark" ? "dark" : ""}`}>
          <BlockNoteView
            editor={editor}
            theme={theme === "dark" ? "dark" : "light"}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}

import { BrowserWindow, BrowserView, Utils } from "electrobun/bun";
import { watch, type FSWatcher } from "fs";
import { readdir, readFile, access } from "fs/promises";
import { join, basename, extname, relative } from "path";
import { tmpdir } from "os";
import puppeteer from "puppeteer-core";
import { buildPrintHTML } from "../shared/buildPrintHTML";
import type { MarkdownReaderRPC, FileEntry } from "../shared/types";

async function findChrome(): Promise<string | null> {
  const candidates = [
    // Chrome
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    // Edge
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  for (const p of candidates) {
    try {
      await access(p);
      return p;
    } catch {}
  }
  return null;
}

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

async function getMainViewUrl(): Promise<string> {
  try {
    await fetch(DEV_SERVER_URL, { method: "HEAD" });
    console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
    return DEV_SERVER_URL;
  } catch {
    console.log("Using bundled assets.");
  }
  return "views://mainview/index.html";
}

let currentWatcher: FSWatcher | null = null;
let currentWatchedPath: string | null = null;

let currentFolderWatcher: FSWatcher | null = null;
let currentWatchedFolder: string | null = null;
let folderRescanTimeout: ReturnType<typeof setTimeout> | null = null;

async function scanDir(dir: string): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];
  try {
    const items = await readdir(dir, { withFileTypes: true });
    const sorted = items.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });
    for (const item of sorted) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        const children = await scanDir(fullPath);
        if (children.length > 0) {
          entries.push({ name: item.name, path: fullPath, isDirectory: true, children });
        }
      } else if (item.name.endsWith(".md") || item.name.endsWith(".markdown")) {
        entries.push({ name: item.name, path: fullPath, isDirectory: false });
      }
    }
  } catch {}
  return entries;
}

function getInitialFilePath(): string | null {
  for (let i = 1; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.endsWith(".md") || arg.endsWith(".markdown")) {
      return arg;
    }
  }
  return null;
}

const rpc = BrowserView.defineRPC<MarkdownReaderRPC>({
  handlers: {
    requests: {
      openFileDialog: async () => {
        const paths = await Utils.openFileDialog({
          canChooseFiles: true,
          canChooseDirectory: false,
          allowsMultipleSelection: false,
          allowedFileTypes: "*",
        });
        if (!paths || paths.length === 0 || !paths[0]) return null;
        const filePath = paths[0];
        const file = Bun.file(filePath);
        const exists = await file.exists();
        if (!exists) return null;
        const content = await file.text();
        return { content, path: filePath, filename: basename(filePath) };
      },
      openFolderDialog: async () => {
        const paths = await Utils.openFileDialog({
          canChooseFiles: false,
          canChooseDirectory: true,
          allowsMultipleSelection: false,
        });
        if (!paths || paths.length === 0 || !paths[0]) return null;
        return paths;
      },
      getFileContent: async ({ path: filePath }) => {
        const file = Bun.file(filePath);
        const content = await file.text();
        return { content, filename: basename(filePath) };
      },
      startWatching: async ({ path: filePath }) => {
        if (currentWatchedPath === filePath && currentWatcher) return {};
        if (currentWatcher) {
          currentWatcher.close();
          currentWatcher = null;
        }
        currentWatchedPath = filePath;
        const onChange = async () => {
          try {
            const file = Bun.file(filePath);
            const exists = await file.exists();
            if (!exists) return;
            const content = await file.text();
            win?.webview.rpc?.send.fileChanged({ path: filePath, content });
          } catch {
            // file might not be readable at the moment
          }
        };
        currentWatcher = watch(filePath, {} as any, (eventType: string) => {
          if (eventType === "change") onChange();
        }) as unknown as FSWatcher;
        return {};
      },
      stopWatching: async () => {
        if (currentWatcher) {
          currentWatcher.close();
          currentWatcher = null;
        }
        currentWatchedPath = null;
        return {};
      },
      saveFile: async ({ path: filePath, content }) => {
        if (currentWatcher) {
          currentWatcher.close();
          currentWatcher = null;
          currentWatchedPath = null;
        }
        await Bun.write(filePath, content);
        return {};
      },
      readFolder: async ({ path: folderPath }) => {
        return scanDir(folderPath);
      },
      startWatchingFolder: async ({ path: folderPath }) => {
        if (currentFolderWatcher && currentWatchedFolder === folderPath) return {};
        if (currentFolderWatcher) {
          currentFolderWatcher.close();
          currentFolderWatcher = null;
        }
        currentWatchedFolder = folderPath;

        const rescan = async () => {
          if (folderRescanTimeout) clearTimeout(folderRescanTimeout);
          folderRescanTimeout = setTimeout(async () => {
            try {
              const files = await scanDir(folderPath);
              win?.webview.rpc?.send.folderChanged({ files });
            } catch {}
          }, 400);
        };

        try {
          currentFolderWatcher = watch(
            folderPath,
            { recursive: true },
            (eventType: string, filename: string | null) => {
              if (!filename) return;
              const name = filename.toLowerCase();
              if (name.endsWith(".md") || name.endsWith(".markdown") || eventType === "rename") {
                rescan();
              }
            },
          ) as unknown as FSWatcher;
        } catch (err) {
          console.error("Failed to watch folder:", err);
        }
        return {};
      },
      stopWatchingFolder: async () => {
        if (folderRescanTimeout) {
          clearTimeout(folderRescanTimeout);
          folderRescanTimeout = null;
        }
        if (currentFolderWatcher) {
          currentFolderWatcher.close();
          currentFolderWatcher = null;
        }
        currentWatchedFolder = null;
        return {};
      },
      minimizeWindow: async () => {
        win?.minimize();
        return {};
      },
      toggleMaximizeWindow: async () => {
        if (!win) return { isMaximized: false };
        const maximized = win.isMaximized();
        if (maximized) win.unmaximize();
        else win.maximize();
        return { isMaximized: !maximized };
      },
      closeWindow: async () => {
        win?.close();
        return {};
      },
      savePdf: async ({ markdown, filename, options }) => {
        let browser;
        try {
          const chromePath = await findChrome();
          if (!chromePath) {
            console.error("Chrome or Edge not found. Install Google Chrome or Microsoft Edge to use PDF export.");
            return null;
          }

          const html = await buildPrintHTML(markdown, options);

          browser = await puppeteer.launch({ headless: true, executablePath: chromePath });
          const page = await browser.newPage();
          await page.setContent(html, { waitUntil: "load" });

          const pdfName = filename.replace(/\.(md|markdown)$/i, "") + ".pdf";
          const format = options.pageSize === "letter" ? "letter" : options.pageSize === "legal" ? "legal" : "a4";
          const landscape = options.orientation === "landscape";
          const marginMap = { none: "0mm", narrow: "12.7mm", normal: "25.4mm", wide: "38.1mm" };
          const marginVal = marginMap[options.margins];

          const pdfPath = join(tmpdir(), pdfName);
          await page.pdf({
            path: pdfPath,
            format,
            landscape,
            printBackground: true,
            margin: { top: marginVal, bottom: marginVal, left: marginVal, right: marginVal },
          });

          await browser.close();
          browser = null;

          Utils.openPath(pdfPath);
          return { path: pdfPath };
        } catch (err) {
          console.error("Failed to generate PDF:", err);
          if (browser) await browser.close();
          return null;
        }
      },
      searchInFolder: async ({ path: folderPath, query }) => {
        const results: { path: string; filename: string; line: number; content: string }[] = [];
        const lowerQ = query.toLowerCase();
        async function walk(dir: string) {
          try {
            const items = await readdir(dir, { withFileTypes: true });
            for (const item of items) {
              const fullPath = join(dir, item.name);
              if (item.isDirectory()) {
                if (!item.name.startsWith(".")) await walk(fullPath);
              } else if (item.name.endsWith(".md") || item.name.endsWith(".markdown")) {
                const content = await readFile(fullPath, "utf-8");
                const lines = content.split("\n");
                for (let i = 0; i < lines.length; i++) {
                  if (lines[i].toLowerCase().includes(lowerQ)) {
                    results.push({ path: fullPath, filename: item.name, line: i + 1, content: lines[i].trim() });
                  }
                }
              }
            }
          } catch {}
        }
        await walk(folderPath);
        return results;
      },
      saveHtml: async ({ markdown, filename }) => {
        try {
          const { buildStandaloneHTML } = await import("../shared/buildPrintHTML");
          const html = await buildStandaloneHTML(markdown);
          const htmlName = filename.replace(/\.(md|markdown)$/i, "") + ".html";
          const htmlPath = join(tmpdir(), htmlName);
          await Bun.write(htmlPath, html);
          Utils.openPath(htmlPath);
          return { path: htmlPath };
        } catch (err) {
          console.error("Failed to save HTML:", err);
          return null;
        }
      },
    },
    messages: {
      log: ({ msg }) => console.log("[View]", msg),
    },
  },
});

const initialFilePath = getInitialFilePath();
const url = await getMainViewUrl();

const win = new BrowserWindow({
  title: "Markdown Reader",
  url,
  titleBarStyle: "hidden",
  frame: {
    width: 1000,
    height: 750,
    x: 200,
    y: 200,
  },
  rpc,
});

win.on("maximize", () => {
  win.webview.rpc?.send.windowMaximized({ isMaximized: true });
});
win.on("unmaximize", () => {
  win.webview.rpc?.send.windowMaximized({ isMaximized: false });
});

win.webview.on("dom-ready", async () => {
  if (initialFilePath) {
    try {
      const file = Bun.file(initialFilePath);
      const exists = await file.exists();
      if (exists) {
        const content = await file.text();
        const filename = basename(initialFilePath);
        win.webview.rpc?.send.initialFile({
          path: initialFilePath,
          content,
          filename,
        });
      }
    } catch (err) {
      console.error("Failed to read initial file:", err);
    }
  }
});

console.log("Markdown Reader started!");

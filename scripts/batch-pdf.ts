import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join, basename, relative } from "path";
import { tmpdir } from "os";
import puppeteer from "puppeteer-core";
import { buildPrintHTML } from "../src/shared/buildPrintHTML";
import { access } from "fs/promises";

async function findChrome(): Promise<string | null> {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  for (const p of candidates) {
    try { await access(p); return p; } catch {}
  }
  return null;
}

async function findMarkdownFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  const items = await readdir(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...await findMarkdownFiles(fullPath));
    } else if (item.name.endsWith(".md") || item.name.endsWith(".markdown")) {
      results.push(fullPath);
    }
  }
  return results;
}

const inputDir = process.argv[2];
if (!inputDir) {
  console.error("Usage: bun run scripts/batch-pdf.ts <folder>");
  process.exit(1);
}

const chromePath = await findChrome();
if (!chromePath) {
  console.error("Chrome or Edge not found.");
  process.exit(1);
}

const outputDir = join(inputDir, "pdf_output");
await mkdir(outputDir, { recursive: true });

const files = await findMarkdownFiles(inputDir);
console.log(`Found ${files.length} markdown files. Converting to PDF...`);

const browser = await puppeteer.launch({ headless: true, executablePath: chromePath });

for (const filePath of files) {
  const relPath = relative(inputDir, filePath);
  const pdfName = relPath.replace(/\.md$/i, ".pdf").replace(/\.markdown$/i, ".pdf");
  const pdfPath = join(outputDir, pdfName);
  const pdfDir = pdfPath.substring(0, pdfPath.lastIndexOf("\\"));
  if (pdfDir) await mkdir(pdfDir, { recursive: true });

  const content = await readFile(filePath, "utf-8");
  const html = await buildPrintHTML(content, {
    pageSize: "a4",
    orientation: "portrait",
    margins: "normal",
    lineNumbers: false,
    tableOfContents: false,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "25.4mm", bottom: "25.4mm", left: "25.4mm", right: "25.4mm" },
  });
  await page.close();
  console.log(`  ✓ ${pdfName}`);
}

await browser.close();
console.log(`\nDone! ${files.length} PDFs saved to: ${outputDir}`);

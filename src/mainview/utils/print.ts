export type { PrintOptions } from "../../shared/buildPrintHTML";
export { DEFAULT_PRINT_OPTIONS } from "../../shared/buildPrintHTML";
import { buildPrintHTML, type PrintOptions } from "../../shared/buildPrintHTML";

export async function printMarkdown(
  markdown: string,
  options: PrintOptions,
): Promise<void> {
  const fullHTML = await buildPrintHTML(markdown, options);

  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) {
    throw new Error("Could not open print window. Check popup blocker settings.");
  }

  printWindow.document.write(fullHTML);
  printWindow.document.close();

  printWindow.focus();
  printWindow.print();
}

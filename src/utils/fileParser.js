import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import { cleanText } from "./textParser";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function parseFile(file) {
  if (file.type === "application/pdf") {
    return await parsePDF(file);
  }

  if (file.type === "text/plain") {
    return cleanText(await file.text());
  }

  throw new Error("Unsupported file type");
}

async function parsePDF(file) {
  const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const pageText = content.items.map((item) => item.str).join(" ");
    text += pageText + " ";
  }

  text = text.replace(/\s+/g, " ").trim(); // Clean up whitespace

  return cleanText(text);
}
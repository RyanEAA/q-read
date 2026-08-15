import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import { extractPdfTextIndex } from "./pdfTextExtractor";
import { cleanText } from "./textParser";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function parseFile(file) {
  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  const isText =
    file.type === "text/plain" ||
    file.name.toLowerCase().endsWith(".txt");

  if (isPdf) {
    return await parsePDF(file);
  }

  if (isText) {
    return {
      text: cleanText(await file.text()),
      pdfDoc: null,
      pageWordStarts: [],
    };
  }

  throw new Error("Unsupported file type");
}

async function parsePDF(file) {
  // Load the bytes into PDF.js directly. This keeps later page rendering safe
  // after parseFile returns; a revoked blob URL can break lazy page access.
  const data = new Uint8Array(await file.arrayBuffer());
  const pdfDoc = await pdfjsLib.getDocument({ data }).promise;
  const { text, pageWordStarts } = await extractPdfTextIndex(pdfDoc);

  return {
    text: cleanText(text),
    pdfDoc,
    pageWordStarts,
  };
}

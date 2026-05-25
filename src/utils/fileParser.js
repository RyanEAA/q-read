import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import { extractWordsFromPdf } from "./pdfTextExtractor";
import { cleanText } from "./textParser";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function parseFile(file) {
  if (file.type === "application/pdf") {
    return await parsePDF(file);
  }

  if (file.type === "text/plain") {
    return {
      text: cleanText(await file.text()),
      pdfDoc: null,
      pdfWords: [],
    };
  }

  throw new Error("Unsupported file type");
}

async function parsePDF(file) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const pdfDoc = await pdfjsLib.getDocument(objectUrl).promise;
    const pdfWords = await extractWordsFromPdf(pdfDoc);

    return {
      text: cleanText(pdfWords.map((word) => word.text).join(" ")),
      pdfDoc,
      pdfWords,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
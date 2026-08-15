import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
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
      text: cleanText(await readFileAsText(file)),
      pdfDoc: null,
      pageWordStarts: [],
    };
  }

  throw new Error("Unsupported file type");
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(reader.error || new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(reader.error || new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

async function parsePDF(file) {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const data = new Uint8Array(arrayBuffer);

  const pdfDoc = await pdfjsLib.getDocument({
    data,
  }).promise;

  const { text, pageWordStarts } =
    await extractPdfTextIndex(pdfDoc);

  return {
    text: cleanText(text),
    pdfDoc,
    pageWordStarts,
  };
}
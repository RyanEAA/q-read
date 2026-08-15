export const SCALE = 1.5;

function splitTextItems(textContent) {
  const words = [];

  for (const item of textContent.items) {
    if (!item.str?.trim()) continue;
    words.push(...item.str.split(/\s+/).filter(Boolean));
  }

  return words;
}

// Build only the lightweight reading index up front.
// We keep the document text plus one start offset per page, rather than
// keeping x/y/width/height objects for every word in the whole PDF.
export async function extractPdfTextIndex(pdfDoc) {
  const words = [];
  const pageWordStarts = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    pageWordStarts.push(words.length);

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    words.push(...splitTextItems(textContent));

    // Let PDF.js release page-specific resources as soon as possible.
    page.cleanup();
  }

  // Sentinel offset: pageWordStarts[pageNumber] is the first word after
  // pageNumber. This makes page range math simple.
  pageWordStarts.push(words.length);

  return {
    text: words.join(" "),
    pageWordStarts,
  };
}

// Positional word data is intentionally extracted one page at a time.
// PDFViewer only mounts a small window of pages, so these heavier objects
// never exist for the entire document at once.
export async function extractWordsFromPdfPage(pdfDoc, pageNum) {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: SCALE });
  const textContent = await page.getTextContent();
  const words = [];

  for (const item of textContent.items) {
    if (!item.str?.trim()) continue;

    // item.transform = [scaleX, skewY, skewX, scaleY, originX, originY]
    const [, , , scaleY, originX, originY] = item.transform;
    const [canvasX, canvasY] = viewport.convertToViewportPoint(
      originX,
      originY
    );

    const width = Math.abs(item.width * viewport.scale);
    const height = Math.abs(scaleY * viewport.scale);
    const top = canvasY - height;

    const rawWords = item.str.split(/\s+/).filter(Boolean);
    const charWidth = width / (item.str.length || 1);

    let charOffset = 0;
    for (const word of rawWords) {
      const wordX = canvasX + charOffset * charWidth;

      words.push({
        text: word,
        page: pageNum,
        x: wordX,
        y: top,
        width: word.length * charWidth,
        height,
      });

      charOffset += word.length + 1;
    }
  }

  return {
    words,
    viewport,
  };
}

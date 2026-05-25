export const SCALE = 1.5;

export async function extractWordsFromPdf(pdfDoc) {
  const words = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: SCALE }); // must match SCALE in PDFViewer
    const textContent = await page.getTextContent();

    for (const item of textContent.items) {
      if (!item.str.trim()) continue;

      // item.transform = [scaleX, skewY, skewX, scaleY, originX, originY]
      // originX/Y are in PDF user space (bottom-left origin)
      const [, , , scaleY, originX, originY] = item.transform;

      // Convert the PDF-space point to viewport (canvas) space
      // viewport.convertToViewportPoint handles the y-flip for us
      const [canvasX, canvasY] = viewport.convertToViewportPoint(
        originX,
        originY
      );

      const width = Math.abs(item.width * (viewport.scale));
      const height = Math.abs(scaleY * viewport.scale);

      // canvasY from convertToViewportPoint is the baseline (bottom of text box)
      // subtract height to get the top of the bounding box
      const top = canvasY - height;

      // Split multi-word items into individual words
      const rawWords = item.str.split(/\s+/).filter(Boolean);
      const charWidth = width / (item.str.length || 1);

      let charOffset = 0;
      for (const w of rawWords) {
        const wordX = canvasX + charOffset * charWidth;
        words.push({
          text: w,
          page: pageNum,
          x: wordX,
          y: top,
          width: w.length * charWidth,
          height,
        });
        charOffset += w.length + 1; // +1 for the space
      }
    }
  }

  return words;
}
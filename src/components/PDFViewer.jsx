import { useEffect, useRef, useState } from "react";
import {
  SCALE,
  extractWordsFromPdfPage,
} from "../utils/pdfTextExtractor";

const PAGE_WINDOW_RADIUS = 1;

function PDFPage({
  pdfDoc,
  pageNumber,
  activePage,
  activeGlobalIndex,
  pageWordStart,
  onWordClick,
}) {
  const canvasRef = useRef(null);
  const pageRef = useRef(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [pageWords, setPageWords] = useState([]);

  useEffect(() => {
    let cancelled = false;
    let renderTask = null;

    async function renderPage() {
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: SCALE });

      if (cancelled) return;

      setPageSize({
        width: viewport.width,
        height: viewport.height,
      });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      renderTask = page.render({
        canvasContext: context,
        viewport,
      });

      const [{ words }] = await Promise.all([
        extractWordsFromPdfPage(pdfDoc, pageNumber),
        renderTask.promise,
      ]);

      if (!cancelled) {
        setPageWords(words);
      }
    }

    renderPage().catch((error) => {
      if (error?.name !== "RenderingCancelledException") {
        console.error(`Failed to render PDF page ${pageNumber}:`, error);
      }
    });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdfDoc, pageNumber]);

  useEffect(() => {
    if (pageNumber !== activePage) return;

    pageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activePage, pageNumber]);

  const activeLocalIndex =
    pageNumber === activePage ? activeGlobalIndex - pageWordStart : -1;

  const activeWord =
    activeLocalIndex >= 0 ? pageWords[activeLocalIndex] : null;

  return (
    <div
      ref={pageRef}
      className="pdf-page"
      style={{
        width: `${pageSize.width}px`,
        height: `${pageSize.height}px`,
      }}
    >
      <canvas ref={canvasRef} />

      {activeWord && (
        <div
          className="word-highlight"
          style={{
            left: `${activeWord.x}px`,
            top: `${activeWord.y}px`,
            width: `${activeWord.width}px`,
            height: `${activeWord.height}px`,
          }}
        />
      )}

      {pageWords.map((word, localIndex) => {
        const globalIndex = pageWordStart + localIndex;

        return (
          <button
            key={`${pageNumber}-${localIndex}`}
            type="button"
            className="pdf-word-hitbox"
            style={{
              left: `${word.x}px`,
              top: `${word.y}px`,
              width: `${word.width}px`,
              height: `${word.height}px`,
            }}
            aria-label={`Select word ${word.text}`}
            onClick={() => onWordClick(globalIndex)}
          />
        );
      })}
    </div>
  );
}

export default function PDFViewer({
  pdfDoc,
  activePage,
  activeGlobalIndex,
  pageWordStarts = [],
  onWordClick,
  focusMode = false,
}) {
  if (!pdfDoc) {
    return <div className="pdf-empty">Upload a PDF</div>;
  }

  const firstPage = Math.max(1, activePage - PAGE_WINDOW_RADIUS);
  const lastPage = Math.min(
    pdfDoc.numPages,
    activePage + PAGE_WINDOW_RADIUS
  );

  const pages = [];
  for (let pageNumber = firstPage; pageNumber <= lastPage; pageNumber++) {
    pages.push(pageNumber);
  }

  return (
    <section className={`pdf-viewer ${focusMode ? "is-hidden" : ""}`.trim()}>
      {pages.map((pageNumber) => (
        <PDFPage
          key={pageNumber}
          pdfDoc={pdfDoc}
          pageNumber={pageNumber}
          activePage={activePage}
          activeGlobalIndex={activeGlobalIndex}
          pageWordStart={pageWordStarts[pageNumber - 1] ?? 0}
          onWordClick={onWordClick}
        />
      ))}
    </section>
  );
}
